import { Injectable, UnauthorizedException } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { get, isNil, replace, some } from 'lodash';

import { GrpcUnauthorizedException } from '@ecom-co/grpc';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthRedisService } from '@/modules/auth/services/auth-redis.service';
import { ConfigServiceApp } from '@/modules/config/config.service';

interface GrpcRequest {
    headers?: {
        authorization?: string;
    };
    metadata?: {
        internalRepr?: {
            get: (key: string) => string[] | undefined;
        };
    };
}

interface JwtPayload {
    [key: string]: unknown;
    jti: string;
    ssid: string;
    sub: string;
}

@Injectable()
export class GrpcRefreshTokenStrategy extends PassportStrategy(Strategy, 'refresh-token') {
    constructor(
        private readonly configService: ConfigServiceApp,
        private readonly authRedisService: AuthRedisService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: GrpcRequest) => {
                    if (request.metadata) {
                        const auth = request.metadata.internalRepr?.get('authorization')?.[0];

                        return auth ? replace(auth, 'Bearer ', '') : null;
                    }

                    return null;
                },
            ]),
            secretOrKey: configService.jwtRefreshTokenPublicKey,
        });
    }

    async validate(payload: JwtPayload) {
        try {
            // Extract ssid from JWT payload
            const { jti, ssid, sub: userId } = payload;

            if (some([ssid, jti, userId], isNil)) {
                throw new GrpcUnauthorizedException('Invalid token');
            }

            // Get session from Redis
            const session = await this.authRedisService.getSession(ssid);

            if (!session) {
                // Session not found, token is invalid
                throw new GrpcUnauthorizedException('Invalid token');
            }

            // Verify JTI matches the session refresh token
            if (session.refreshJti !== jti) {
                // JTI mismatch, revoke the session and throw error
                await this.authRedisService.logout(userId, ssid);
                throw new GrpcUnauthorizedException('Invalid token');
            }

            // Verify user ID matches
            if (get(session.user, 'id') !== userId) {
                // User ID mismatch, revoke the session and throw error
                await this.authRedisService.logout(userId, ssid);
                throw new GrpcUnauthorizedException('Invalid token');
            }

            // Return the user data from session with SSID
            return {
                ...session.user,
                ssid,
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new GrpcUnauthorizedException('Invalid token');
        }
    }
}
