import type { NestApplication } from '@nestjs/core';
import { NestFactory, Reflector } from '@nestjs/core';

import { ClassSerializerInterceptor, Logger } from '@nestjs/common';

import { GrpcExceptionFilter, GrpcStarter, GrpcValidationPipe } from '@ecom-co/grpc';

import { ConfigServiceApp } from '@/modules/config/config.service';

import { AppModule } from '@/app.module';

/**
 * Bootstrap the NestJS application
 */
const bootstrap = async (): Promise<void> => {
    const app: NestApplication = await NestFactory.create(AppModule, {
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
        snapshot: true,
    });

    // Get config service
    const _configService = app.get(ConfigServiceApp);

    // Use custom gRPC validation pipe
    app.useGlobalPipes(new GrpcValidationPipe());

    // Global class serializer interceptor
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Add GrpcExceptionFilter to handle exceptions globally
    const filter = new GrpcExceptionFilter({
        enableAsyncLogging: true, // New
        enableLogging: true,
        enableMetrics: true,
        errorRateLimit: 10, // New - 10 errors/minute
        isDevelopment: false,
        maxDetailsSize: 1000, // New - 1KB limit
        rateLimitWindowMs: 60000, // New - 1 minute window
    });

    app.useGlobalFilters(filter);

    // Start the application first
    await app.init();

    const logger = new Logger('Bootstrap');

    logger.log('Application started successfully!');

    // Use setImmediate to defer gRPC startup until after all current operations
    setImmediate(() => {
        void (async () => {
            try {
                const grpcStarter = app.get(GrpcStarter); // Use class reference

                grpcStarter.setAppModule(AppModule);
                await grpcStarter.start();
                logger.log('gRPC services bootstrapped manually!');
            } catch (error) {
                logger.error('Failed to start gRPC services:', error);
            }
        })();
    });
};

void bootstrap();
