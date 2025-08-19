import { APP_PIPE } from '@nestjs/core';

import { Module } from '@nestjs/common';

import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { filter, map } from 'lodash';

import { ElasticsearchModule } from '@ecom-co/elasticsearch';
import { GrpcModule, GrpcValidationPipe } from '@ecom-co/grpc';
import { CORE_ENTITIES, OrmModule } from '@ecom-co/orm';
import { RedisModule } from '@ecom-co/redis';

import { ConfigModule } from '@/modules/config/config.module';
import { ConfigServiceApp } from '@/modules/config/config.service';
import { RabbitmqModule } from '@/modules/rabbitmq/rabbitmq.module';
import { UserModule } from '@/modules/user/user.module';

import { AppGrpcController } from '@/app.grpc.controller';
import { AppService } from '@/app.service';

const services = [
    {
        name: 'User Service',
        enabled: true,
        package: 'user',
        port: 50052,
        protoPath: 'src/proto/services/user.proto',
    },
    {
        name: 'App Service',
        enabled: true,
        package: 'app',
        port: 50053,
        protoPath: 'src/proto/app.proto',
    },
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

        GrpcModule.forRoot({
            services: map(
                filter(services, (s) => s.enabled),
                (s) => ({
                    name: s.name,
                    package: s.package,
                    port: s.port,
                    protoPath: s.protoPath,
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
