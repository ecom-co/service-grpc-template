import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';

import { get } from 'lodash';

import { DateTime } from 'luxon';

import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { AuthRedisService } from '@/modules/auth/services/auth-redis.service';
import { JwtService, TokenPair } from '@/modules/auth/services/jwt.service';
import { UserResponseDto } from '@/modules/user/dto/user-response.dto';
import { UserService } from '@/modules/user/user.service';

export const RedisGenerateKey = {
    authUser: (userId: string) => `auth:user:${userId}`,
    sessionUser: (ssid: string) => `session:user:${ssid}`,
};

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService,
        private readonly authRedis: AuthRedisService,
    ) {}

    async getProfile(userId: string): Promise<{
        message: string;
        user: UserResponseDto;
    }> {
        try {
            const user = await this.userService.findById(userId);

            if (!user) {
                this.logger.warn(`Profile not found for user ID: ${userId}`);
                throw new UnauthorizedException('User not found');
            }

            const userDto = new UserResponseDto(user);

            this.logger.debug(`Profile retrieved successfully for user: ${userId}`);

            return {
                message: 'Profile retrieved successfully',
                user: userDto,
            };
        } catch (error) {
            this.logger.error(`Get profile error: ${(error as Error).message}`, (error as Error).stack);
            throw error;
        }
    }

    async login(dto: LoginDto): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        const user = await this.userService.login(dto);

        const tokenPair = await this.jwtService.signTokenPair({
            id: user.id,
            email: user.email,
        });
        const { accessToken, refreshToken, ssid } = tokenPair;

        const ttlSeconds = Math.max(0, get(refreshToken, 'metadata.exp', 0) - DateTime.now().toUnixInteger());

        await this.authRedis.saveUserSession({
            ssid,
            ttlSeconds,
            value: {
                accessJti: accessToken.metadata.jti,
                meta: dto.metadata,
                refreshJti: refreshToken.metadata.jti,
                user,
            },
            userId: user.id,
        });

        const userDto = new UserResponseDto(user);

        return { accessToken, refreshToken, ssid, user: userDto };
    }

    async refreshTokenBySsid(ssid: string): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        try {
            // Get session from Redis
            const session = await this.authRedis.getSession(ssid);

            if (!session) {
                this.logger.warn(`Refresh token failed: session not found for ssid ${ssid}`);
                throw new UnauthorizedException('Invalid token');
            }

            // Get user data from database
            const user = await this.userService.findById(session.user.id);

            if (!user) {
                this.logger.warn(`Refresh token failed: user not found ${session.user.id}`);
                await this.authRedis.deleteSession(ssid);
                throw new UnauthorizedException('Invalid token');
            }

            // Generate new token pair
            const newTokenPair = await this.jwtService.signTokenPair({
                id: user.id,
                email: user.email,
            });
            const { accessToken: newAccessToken, refreshToken: newRefreshToken, ssid: newSsid } = newTokenPair;

            // Calculate TTL
            const ttlSeconds = Math.max(0, get(newRefreshToken, 'metadata.exp', 0) - DateTime.now().toUnixInteger());

            // Save new session and remove old one
            await Promise.all([
                this.authRedis.saveUserSession({
                    ssid: newSsid,
                    ttlSeconds,
                    value: {
                        accessJti: newAccessToken.metadata.jti,
                        meta: session.meta,
                        refreshJti: newRefreshToken.metadata.jti,
                        user,
                    },
                    userId: user.id,
                }),
                this.authRedis.logout(session.user.id, ssid), // Remove old session
            ]);

            const userDto = new UserResponseDto(user);

            this.logger.debug(
                `Token refreshed successfully for user ${session.user.id}, old ssid: ${ssid}, new ssid: ${newSsid}`,
            );

            return {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                ssid: newSsid,
                user: userDto,
            };
        } catch (error) {
            this.logger.error(`Refresh token error: ${(error as Error).message}`, (error as Error).stack);
            throw new UnauthorizedException('Invalid token');
        }
    }

    async register(dto: RegisterDto): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        const user = await this.userService.register(dto);

        const tokenPair = await this.jwtService.signTokenPair({ id: user.id, email: user.email });

        const { accessToken, refreshToken, ssid } = tokenPair;

        const ttlSeconds = Math.max(0, get(refreshToken, 'metadata.exp', 0) - DateTime.now().toUnixInteger());

        await this.authRedis.saveUserSession({
            ssid,
            ttlSeconds,
            value: {
                accessJti: accessToken.metadata.jti,
                meta: dto.metadata,
                refreshJti: refreshToken.metadata.jti,
                user,
            },
            userId: user.id,
        });

        const userDto = new UserResponseDto(user);

        return { accessToken, refreshToken, ssid, user: userDto };
    }
}
