import { join } from 'path';

import { NestFactory, Reflector } from '@nestjs/core';

import { Logger } from '@nestjs/common';

import { GrpcExceptionFilter, GrpcLoggingInterceptor, GrpcValidationPipe } from '@ecom-co/grpc';
import { type MicroserviceOptions, Transport } from '@nestjs/microservices';

import { ConfigServiceApp } from '@/modules/config/config.service';

import { AppModule } from '@/app.module';

/**
 * Get proto file path that works in both dev (src) and prod (dist)
 */
const getProtoPath = (service: string): string => join(__dirname, 'proto/services', `${service}.proto`);

/**
 * Bootstrap the NestJS application
 */
const bootstrap = async (): Promise<void> => {
    const logger = new Logger('Bootstrap');

    try {
        const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
            options: {
                package: ['user', 'auth'],
                protoPath: [getProtoPath('user'), getProtoPath('auth')],
                url: '0.0.0.0:50052',
            },
            transport: Transport.GRPC,
        });
        const configServiceApp = app.get(ConfigServiceApp);

        app.useGlobalPipes(
            new GrpcValidationPipe({
                enableErrorLogging: true,
                errorMessagePrefix: 'Request validation failed',
                stripUnknownProperties: true,
                transformOptions: {
                    enableImplicitConversion: true,
                    excludeExtraneousValues: false,
                },
                validationOptions: {},
            }),
        );
        app.useGlobalFilters(new GrpcExceptionFilter());
        const reflector = app.get(Reflector);

        app.useGlobalInterceptors(
            new GrpcLoggingInterceptor(reflector, {
                isDevelopment: configServiceApp.isDevelopment,
                logRequest: configServiceApp.isDevelopment,
                logResponse: configServiceApp.isDevelopment,
            }),
        );
        await app.listen().then(() => {
            logger.log(
                `gRPC microservice is listening on port ${configServiceApp.grpcPort} (${configServiceApp.grpcUrl})`,
            );
        });
    } catch (error) {
        logger.error('Failed to start gRPC microservice:', error);

        if (error instanceof Error) {
            logger.error('Error message:', error.message);
            logger.error('Error stack:', error.stack);
        }

        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    const logger = new Logger('UnhandledRejection');

    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    const logger = new Logger('UncaughtException');

    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGINT', () => {
    const logger = new Logger('Shutdown');

    logger.log('Received SIGINT, shutting down gRPC microservice gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    const logger = new Logger('Shutdown');

    logger.log('Received SIGTERM, shutting down gRPC microservice gracefully...');
    process.exit(0);
});

// Start the application
void bootstrap();
