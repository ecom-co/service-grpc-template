/* eslint-disable no-console */
import {
    ClassSerializerInterceptor,
    ValidationPipe,
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { NestApplication, NestFactory, Reflector } from '@nestjs/core';
import { RpcException } from '@nestjs/microservices';
import { map } from 'lodash';

import { ConfigServiceApp } from '@/modules/config/config.service';

import { AppModule } from '@/app.module';
import { ServiceManager } from '@/services';

@Catch()
export class GrpcExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        console.error('gRPC Exception occurred:', exception);

        // For gRPC, we throw RpcException
        if (exception instanceof HttpException) {
            throw new RpcException({
                status: exception.getStatus(),
                message: exception.getResponse(),
            });
        }

        // For other exceptions
        throw new RpcException({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'Internal server error',
        });
    }
}

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

    const validationPipe: ValidationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        enableDebugMessages: configService.isDevelopment,
        skipMissingProperties: false,
        skipNullProperties: false,
        skipUndefinedProperties: false,
    });
    app.useGlobalPipes(validationPipe);

    // Global class serializer interceptor
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    // Add GrpcExceptionFilter to handle exceptions globally
    app.useGlobalFilters(new GrpcExceptionFilter());

    // Setup and start multiple gRPC microservices using ServiceManager
    const serviceManager = app.get(ServiceManager);
    const enabledServices = serviceManager.getEnabledServices();

    // Log services status
    serviceManager.logServicesStatus();

    for (const service of enabledServices) {
        try {
            const microserviceOptions = serviceManager.getMicroserviceOptions(service);
            const grpcApp = await NestFactory.createMicroservice(AppModule, microserviceOptions);
            await grpcApp.listen();
            console.log(`${service.name} running on port ${service.port}`);
        } catch (err) {
            console.error(`Failed to start ${service.name}`, err as Error);
        }
    }

    console.log(`Environment: ${configService.nodeEnv}`);
    console.log(`Enabled services: ${map(enabledServices, (s) => s.name).join(', ')}`);
};

void bootstrap();
