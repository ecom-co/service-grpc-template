import { ElasticsearchModule } from '@ecom-co/elasticsearch';
import { CORE_ENTITIES, OrmModule } from '@ecom-co/orm';
import { RedisModule } from '@ecom-co/redis';
import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigModule } from '@/modules/config/config.module';
import { ConfigServiceApp } from '@/modules/config/config.service';
import { RabbitmqModule } from '@/modules/rabbitmq/rabbitmq.module';
import { UserModule } from '@/modules/user/user.module';

import { AppGrpcController } from '@/app.grpc.controller';
import { AppService } from '@/app.service';
import { ServiceManager } from '@/services';

@Module({
    imports: [
        NestConfigModule.forRoot(),
        OrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigServiceApp],
            useFactory: (configService: ConfigServiceApp) => ({
                type: 'postgres',
                url: configService.databaseUrl,
                synchronize: configService.isDevelopment,
                logging: configService.isDevelopment,
                entities: [...CORE_ENTITIES],
                autoLoadEntities: true,
                health: true,
                keepConnectionAlive: true,
                retryAttempts: 10,
                retryDelay: 3000,
                extra: {
                    max: 10,
                    connectionTimeoutMillis: 5000,
                    idleTimeoutMillis: 30000,
                },
            }),
        }),
        RedisModule.forRootAsync({
            inject: [ConfigServiceApp],
            useFactory: (config: ConfigServiceApp) => ({
                clients: [
                    {
                        type: 'single',
                        name: 'default',
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
                clients: [
                    { name: 'default', node: config.elasticsearchUrl },
                    { name: 'analytics', node: config.elasticsearchUrl },
                ],
                autoCreateIndices: true,
                documents: [],
            }),
            predeclare: ['analytics'],
        }),
        RabbitmqModule,

        ConfigModule,
        UserModule,
    ],
    controllers: [AppGrpcController],
    providers: [AppService, ServiceManager],
})
export class AppModule {}
