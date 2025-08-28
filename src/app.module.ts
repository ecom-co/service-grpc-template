import { Module } from '@nestjs/common';

import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ElasticsearchModule } from '@ecom-co/elasticsearch';
import { CORE_ENTITIES, OrmModule } from '@ecom-co/orm';
import { RedisModule } from '@ecom-co/redis';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { ConfigModule } from '@/modules/config/config.module';
import { ConfigServiceApp } from '@/modules/config/config.service';
import { RabbitmqModule } from '@/modules/rabbitmq/rabbitmq.module';
import { UserModule } from '@/modules/user/user.module';

import { AppGrpcController } from '@/app.grpc.controller';

@Module({
    imports: [
        EventEmitterModule.forRoot(),
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
                // logging: configService.isDevelopment,
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
            useFactory: (config: ConfigServiceApp) => ({
                autoCreateIndices: true,
                clients: [{ name: 'default', node: config.elasticsearchUrl }],
                documents: [],
            }),
        }),
        RabbitmqModule,
        ConfigModule,
        UserModule,
    ],
    controllers: [AppGrpcController],
})
export class AppModule {}
