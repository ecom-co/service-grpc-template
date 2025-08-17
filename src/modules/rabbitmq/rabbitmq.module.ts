import { ExchangeType, RabbitMQModule } from '@ecom-co/rabbitmq';
import { Module } from '@nestjs/common';

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
                uri: configService.rabbitmqUrl,
                exchanges: [
                    { name: 'demo.exchange2', type: ExchangeType.Topic },
                    { name: 'exchange1', type: ExchangeType.Topic },
                ],
                queues: [
                    {
                        name: 'rpc-queue',
                        exchange: 'exchange1',
                        routingKey: 'rpc-route',
                    },
                    {
                        name: 'rpc.demo.exchange2.rpc.routing.key',
                        exchange: 'demo.exchange2',
                        routingKey: 'rpc.routing.key',
                    },
                    {
                        name: 'subscribe.queue',
                        exchange: 'demo.exchange2',
                        routingKey: 'subscribe.routing.key',
                    },
                ],
                channels: [
                    {
                        name: 'default',
                        prefetchCount: 10,
                        default: true,
                    },
                ],
                registerHandlers: true,
                enableControllerDiscovery: true,
                enableDirectReplyTo: true,
                strictConfig: true,
                debug: configService.nodeEnv === 'development', // Enable debug in development
                connectionInitOptions: { wait: true, timeout: 5000, reject: true },
            }),
        }),
    ],
    controllers: [],
    providers: [RabbitmqService, OrdersRabbitHandler],
    exports: [RabbitmqService],
})
export class RabbitmqModule {}
