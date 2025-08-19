import { Injectable } from '@nestjs/common';

import { ConfigService as NestConfigService } from '@nestjs/config';

import { EnvironmentVariables } from '@/modules/config/config.validation';

@Injectable()
export class ConfigServiceApp {
    constructor(private readonly configService: NestConfigService<EnvironmentVariables>) {}

    // Application Configuration
    get databaseUrl(): string | undefined {
        return this.configService.get('DATABASE_URL');
    }

    get isDevelopment(): boolean {
        return this.nodeEnv === 'development';
    }

    get isProduction(): boolean {
        return this.nodeEnv === 'production';
    }

    get nodeEnv(): string {
        return this.configService.get('NODE_ENV');
    }

    get port(): number {
        return this.configService.get('PORT');
    }

    get redisUrl(): string {
        return this.configService.get('REDIS_URL');
    }

    // RabbitMQ Configuration
    get rabbitmqUrl(): string {
        return this.configService.get('RABBITMQ_URL');
    }

    // Elasticsearch Configuration
    get elasticsearchPassword(): string | undefined {
        return this.configService.get('ELASTICSEARCH_PASSWORD');
    }

    get elasticsearchUrl(): string {
        return this.configService.get('ELASTICSEARCH_URL');
    }

    get elasticsearchUsername(): string | undefined {
        return this.configService.get('ELASTICSEARCH_USERNAME');
    }

    // gRPC Configuration
    get grpcPackage(): string {
        return this.configService.get('GRPC_PACKAGE', 'app');
    }

    get grpcPort(): number {
        return this.configService.get('GRPC_PORT', 50051);
    }

    get grpcProtoPath(): string {
        return this.configService.get('GRPC_PROTO_PATH', 'src/proto/services/user.proto');
    }

    // Tracing Configuration
    get jaegerEndpoint(): string | undefined {
        return this.configService.get('JAEGER_ENDPOINT');
    }
}
