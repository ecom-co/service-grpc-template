import type { NestApplication } from '@nestjs/core';
import { NestFactory, Reflector } from '@nestjs/core';

import { ClassSerializerInterceptor, Logger } from '@nestjs/common';

import {
    GrpcClientFactory,
    GrpcConfigService,
    GrpcExceptionFilter,
    GrpcStarter,
    GrpcValidationPipe,
} from '@ecom-co/grpc';

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
    const configService = app.get(ConfigServiceApp);

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
        isDevelopment: configService.isDevelopment,
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
                // Get GrpcStarter and set app instance for hybrid microservices
                const grpcStarter = app.get(GrpcStarter);

                grpcStarter.setApp(app);

                // Start all gRPC services (connects to main app and starts listening)
                await grpcStarter.start();

                // Initialize all gRPC clients if any
                const configService = app.get(GrpcConfigService);
                const clientConfigs = configService.getClientConfigs();

                if (clientConfigs.length > 0) {
                    await GrpcClientFactory.initializeClients(clientConfigs);
                    logger.log(`Initialized ${clientConfigs.length} gRPC clients`);
                }

                logger.log('gRPC services bootstrapped successfully with hybrid architecture!');
            } catch (error) {
                logger.error('Failed to start gRPC services:', error);
            }
        })();
    });
};

void bootstrap();
