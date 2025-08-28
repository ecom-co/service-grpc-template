import { Injectable } from '@nestjs/common';

import { JwtService as NestJwtService } from '@nestjs/jwt';

import { get, isEmpty } from 'lodash';

import { User } from '@ecom-co/orm';
import { DateTime } from 'luxon';
import { v4 as generateUuidV4 } from 'uuid';

import { ConfigServiceApp } from '@/modules/config/config.service';

export interface JwtPayload {
    email: string;
    exp: number;
    iat: number;
    jti: string;
    ssid: string;
    sub: string;
}

export interface TokenPair {
    accessToken: TokenResponse;
    refreshToken: TokenResponse;
    ssid: string;
}

export interface TokenResponse {
    metadata: {
        exp: number;
        iat: number;
        jti: string;
        ssid: string;
    };
    token: string;
}

export interface TokenSignPayload extends Partial<User> {
    ssid?: string;
}

@Injectable()
export class JwtService {
    constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigServiceApp,
    ) {}

    async verifyAccessToken(token: string): Promise<JwtPayload> {
        return await this.jwtService.verifyAsync(token, {
            algorithms: ['ES256'],
            publicKey: this.configService.jwtAccessTokenPublicKey,
        });
    }

    async verifyRefreshToken(token: string): Promise<JwtPayload> {
        return await this.jwtService.verifyAsync(token, {
            algorithms: ['ES256'],
            publicKey: this.configService.jwtRefreshTokenPublicKey,
        });
    }

    async signAccessToken(payload: TokenSignPayload): Promise<TokenResponse> {
        const jti = generateUuidV4();
        const token = await this.jwtService.signAsync(
            {
                ...payload,
                sub: payload.id,
            },
            {
                algorithm: 'ES256',
                expiresIn: this.configService.jwtAccessTokenExpirationTime,
                jwtid: jti,
                privateKey: this.configService.jwtAccessTokenPrivateKey,
            },
        );

        const decoded = this.jwtService.decode<{ exp?: number; iat?: number; jti?: string }>(token);

        return {
            metadata: {
                exp: get(
                    decoded,
                    'exp',
                    DateTime.now().plus(this.configService.jwtAccessTokenExpirationTime).toMillis(),
                ),
                iat: get(decoded, 'iat', DateTime.now().toMillis()),
                jti: get(decoded, 'jti', jti),
                ssid: payload.ssid,
            },
            token,
        };
    }

    async signRefreshToken(payload: TokenSignPayload): Promise<TokenResponse> {
        const jti = generateUuidV4();
        const token = await this.jwtService.signAsync(
            {
                ...payload,
                sub: payload.id,
            },
            {
                algorithm: 'ES256',
                expiresIn: this.configService.jwtRefreshTokenExpirationTime,
                jwtid: jti,
                privateKey: this.configService.jwtRefreshTokenPrivateKey,
            },
        );

        const decoded = this.jwtService.decode<{ exp?: number; iat?: number; jti?: string }>(token);

        return {
            metadata: {
                exp: get(
                    decoded,
                    'exp',
                    DateTime.now().plus(this.configService.jwtRefreshTokenExpirationTime).toMillis(),
                ),
                iat: get(decoded, 'iat', DateTime.now().toMillis()),
                jti: get(decoded, 'jti', jti),
                ssid: payload.ssid,
            },
            token,
        };
    }

    async signTokenPair(payload: TokenSignPayload): Promise<TokenPair> {
        if (isEmpty(get(payload, 'ssid'))) payload.ssid = generateUuidV4();

        return {
            accessToken: await this.signAccessToken(payload),
            refreshToken: await this.signRefreshToken(payload),
            ssid: payload.ssid,
        };
    }
}
