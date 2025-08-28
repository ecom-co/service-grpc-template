import { networkInterfaces } from 'os';

import { Injectable } from '@nestjs/common';

import { ConfigService as NestConfigService } from '@nestjs/config';

import { values } from 'lodash';

import { EnvironmentVariables } from '@/modules/config/config.validation';

@Injectable()
export class ConfigServiceApp {
    // Network Configuration
    get currentIp(): string {
        const nets = networkInterfaces();

        for (const net of values(nets)) {
            if (!net) continue;

            for (const addr of net) {
                if (addr.family === 'IPv4' && !addr.internal) {
                    return addr.address;
                }
            }
        }

        return '127.0.0.1';
    }

    // Application Configuration
    get databaseUrl(): string | undefined {
        return this.configService.get('DATABASE_URL');
    }

    // gRPC Configuration
    get grpcPackage(): string {
        return this.configService.get('GRPC_PACKAGE', 'app');
    }

    get grpcPort(): number {
        return this.configService.get('GRPC_PORT', 50053);
    }

    get grpcProtoPath(): string {
        return this.configService.get('GRPC_PROTO_PATH', 'proto/app.proto');
    }

    get grpcUrl(): string {
        return `${this.currentIp}:${this.grpcPort}`;
    }

    get isDevelopment(): boolean {
        return this.nodeEnv === 'development';
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }

    // Tracing Configuration
    get jaegerEndpoint(): string | undefined {
        return this.configService.get('JAEGER_ENDPOINT');
    }

    // JWT Configuration for auth (access token)
    get jwtAccessTokenExpirationTime(): number {
        return this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_TIME');
    }

    get jwtAccessTokenPrivateKey(): string {
        return this.configService.get('JWT_ACCESS_TOKEN_PRIVATE_KEY');
    }

    get jwtAccessTokenPublicKey(): string {
        return this.configService.get('JWT_ACCESS_TOKEN_PUBLIC_KEY');
    }

    // JWT Configuration for auth (refresh token)
    get jwtRefreshTokenExpirationTime(): number {
        return this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
    }

    get jwtRefreshTokenPrivateKey(): string {
        return this.configService.get('JWT_REFRESH_TOKEN_PRIVATE_KEY');
    }

    get jwtRefreshTokenPublicKey(): string {
        return this.configService.get('JWT_REFRESH_TOKEN_PUBLIC_KEY');
    }

    get nodeEnv(): string {
        return this.configService.get('NODE_ENV');
    }

    get port(): number {
        return this.configService.get('PORT');
    }

    // RabbitMQ Configuration
    get rabbitmqUrl(): string {
        return this.configService.get('RABBITMQ_URL');
    }

    get redisUrl(): string {
        return this.configService.get('REDIS_URL');
    }

    constructor(private readonly configService: NestConfigService<EnvironmentVariables>) {}
}
