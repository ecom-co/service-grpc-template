import { APP_PIPE } from '@nestjs/core';

import { Module } from '@nestjs/common';

import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { filter, map } from 'lodash';

import { ElasticsearchModule } from '@ecom-co/elasticsearch';
import { GrpcConfig, GrpcModule, GrpcValidationPipe } from '@ecom-co/grpc';
import { CORE_ENTITIES, OrmModule } from '@ecom-co/orm';
import { RedisModule } from '@ecom-co/redis';

import { ConfigModule } from '@/modules/config/config.module';
import { ConfigServiceApp } from '@/modules/config/config.service';
import { RabbitmqModule } from '@/modules/rabbitmq/rabbitmq.module';
import { UserModule } from '@/modules/user/user.module';

import { AppGrpcController } from '@/app.grpc.controller';
import { AppService } from '@/app.service';

const configs: GrpcConfig[] = [
    // Server configurations
    {
        name: 'user-service',
        type: 'server',
        package: 'user',
        port: 50052,
        protoPath: 'src/proto/services/user.proto',
    },
    {
        name: 'app-service',
        type: 'server',
        package: 'app',
        port: 50053,
        protoPath: 'src/proto/app.proto',
    },
    // Client configurations (example - uncomment if needed)
    // {
    //     name: 'notification-client',
    //     type: 'client',
    //     package: 'notification',
    //     protoPath: 'src/proto/services/notification.proto',
    //     url: 'localhost:50054'
    // },
    // {
    //     name: 'payment-client',
    //     type: 'client',
    //     package: 'payment',
    //     protoPath: 'src/proto/services/payment.proto',
    //     url: 'localhost:50055'
    // }
];

@Module({
    imports: [
        NestConfigModule.forRoot(),
        OrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigServiceApp],
            useFactory: (configService: ConfigServiceApp) => ({
                type: 'postgres',
                autoLoadEntities: true,
                entities: [...CORE_ENTITIES],
                extra: {
                    connectionTimeoutMillis: 5000,
                    idleTimeoutMillis: 30000,
                    max: 10,
                },
                health: true,
                keepConnectionAlive: true,
                logging: configService.isDevelopment,
                retryAttempts: 10,
                retryDelay: 3000,
                synchronize: configService.isDevelopment,
                url: configService.databaseUrl,
            }),
        }),
        RedisModule.forRootAsync({
            inject: [ConfigServiceApp],
            useFactory: (config: ConfigServiceApp) => ({
                clients: [
                    {
                        name: 'default',
                        type: 'single',
                        connectionString: config.redisUrl,
                    },
                ],
            }),
            // predeclare: ['forward'],
        }),
        ElasticsearchModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigServiceApp],
            predeclare: ['analytics'],
            useFactory: (config: ConfigServiceApp) => ({
                autoCreateIndices: true,
                clients: [
                    { name: 'default', node: config.elasticsearchUrl },
                    { name: 'analytics', node: config.elasticsearchUrl },
                ],
                documents: [],
            }),
        }),
        RabbitmqModule,

        // New gRPC module with discriminated union types
        GrpcModule.forRoot({
            configs: map(
                filter(configs, (c) => c.type === 'server'),
                (c) => ({
                    name: c.name,
                    type: c.type,
                    host: c.host,
                    package: c.package,
                    port: c.port,
                    protoPath: c.protoPath,
                }),
            ),
        }),

        ConfigModule,
        UserModule,
    ],
    controllers: [AppGrpcController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useClass: GrpcValidationPipe,
        },
    ],
})
export class AppModule {}
