import { Module } from '@nestjs/common';

import { RabbitMQModule } from '@ecom-co/rabbitmq';

import { ConfigModule } from '@/modules/config/config.module';
import { ConfigServiceApp } from '@/modules/config/config.service';
import { OrdersRabbitHandler } from '@/modules/rabbitmq/rabbitmq.handler';

import { RabbitmqService } from './rabbitmq.service';

@Module({
    imports: [
        RabbitMQModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigServiceApp],
            useFactory: (configService: ConfigServiceApp) => ({
                channels: [
                    {
                        name: 'default',
                        default: true,
                        prefetchCount: 10,
                    },
                ],
                connectionInitOptions: { reject: true, timeout: 5000, wait: true },
                debug: configService.isDevelopment,
                enableControllerDiscovery: true,
                enableDirectReplyTo: true,
                exchanges: [],
                queues: [],
                registerHandlers: true,
                strictConfig: true,
                uri: configService.rabbitmqUrl,
            }),
        }),
    ],
    controllers: [],
    providers: [RabbitmqService, OrdersRabbitHandler],
    exports: [RabbitmqService],
})
export class RabbitmqModule {}
