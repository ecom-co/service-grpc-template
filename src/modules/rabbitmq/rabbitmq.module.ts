import { Module } from '@nestjs/common';

import { ExchangeType, RabbitMQModule } from '@ecom-co/rabbitmq';

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
                        default: true,
                        name: 'default',
                        prefetchCount: 10,
                    },
                ],
                connectionInitOptions: { reject: true, timeout: 5000, wait: true },
                debug: configService.nodeEnv === 'development', // Enable debug in development
                enableControllerDiscovery: true,
                enableDirectReplyTo: true,
                exchanges: [
                    { name: 'demo.exchange2', type: ExchangeType.Topic },
                    { name: 'exchange1', type: ExchangeType.Topic },
                ],
                queues: [
                    {
                        exchange: 'exchange1',
                        name: 'rpc-queue',
                        routingKey: 'rpc-route',
                    },
                    {
                        exchange: 'demo.exchange2',
                        name: 'rpc.demo.exchange2.rpc.routing.key',
                        routingKey: 'rpc.routing.key',
                    },
                    {
                        exchange: 'demo.exchange2',
                        name: 'subscribe.queue',
                        routingKey: 'subscribe.routing.key',
                    },
                ],
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
