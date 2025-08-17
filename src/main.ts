import {
    GrpcExceptionFilter,
    GrpcValidationPipe,
    GrpcBootstrapper,
    ServiceManager as GrpcServiceManager,
} from '@ecom-co/grpc';
import { ClassSerializerInterceptor, Logger } from '@nestjs/common';
import { NestApplication, NestFactory, Reflector } from '@nestjs/core';

import { ConfigServiceApp } from '@/modules/config/config.service';

import { AppModule } from '@/app.module';

/**
 * Bootstrap the NestJS application
 */
const bootstrap = async (): Promise<void> => {
    const app: NestApplication = await NestFactory.create(AppModule, {
        snapshot: true,
        logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    // Get config service
    const configService = app.get(ConfigServiceApp);

    // Use custom gRPC validation pipe
    app.useGlobalPipes(new GrpcValidationPipe());

    // Global class serializer interceptor
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Add GrpcExceptionFilter to handle exceptions globally
    const filter = new GrpcExceptionFilter({
        isDevelopment: false,
        enableLogging: true,
        enableMetrics: true,
        enableAsyncLogging: true, // New
        maxDetailsSize: 1000, // New - 1KB limit
        errorRateLimit: 10, // New - 10 errors/minute
        rateLimitWindowMs: 60000, // New - 1 minute window
    });

    app.useGlobalFilters(filter);

    // Setup and start multiple gRPC microservices using GrpcBootstrapper
    const logger = new Logger('Bootstrap');
    const serviceManager = app.get(GrpcServiceManager);

    await GrpcBootstrapper.bootstrap(app, serviceManager, {
        appModule: AppModule,
        logger,
        logEnvironment: true,
        getEnvironment: () => configService.nodeEnv,
        maxConcurrency: 3,
    });
};

void bootstrap();
