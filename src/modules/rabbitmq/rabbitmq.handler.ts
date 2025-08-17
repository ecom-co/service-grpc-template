import { RabbitRPC, RabbitSubscribe } from '@ecom-co/rabbitmq';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OrdersRabbitHandler {
    private readonly logger = new Logger(OrdersRabbitHandler.name);

    @RabbitSubscribe({
        exchange: 'demo.exchange2',
        routingKey: 'subscribe.routing.key',
        queue: 'subscribe.queue',
    })
    public handleSubscription(msg: any) {
        this.logger.log(`Received subscription message: ${JSON.stringify(msg)}`);
    }

    @RabbitRPC({
        exchange: 'demo.exchange2',
        routingKey: 'rpc.routing.key',
        queue: 'rpc.demo.exchange2.rpc.routing.key',
    })
    public handleRpcRequest(msg: { from: string; type: string }, rawMessage?: any) {
        this.logger.log(`🔥 [DEMO RPC] Received message: ${JSON.stringify(msg)}`);
        this.logger.log(`🔥 [DEMO RPC] Raw message properties: ${JSON.stringify(rawMessage?.properties)}`);
        this.logger.log('🔥 [DEMO RPC] Processing request...');

        const response = {
            ok: true,
            echo: msg,
            timestamp: new Date().toISOString(),
        };

        this.logger.log(`🔥 [DEMO RPC] Sending response: ${JSON.stringify(response)}`);
        return response;
    }

    @RabbitRPC({
        exchange: 'exchange1',
        routingKey: 'rpc-route',
        queue: 'rpc-queue',
    })
    public handleSumRpcRequest(msg: { a: number; b: number }) {
        this.logger.log(`Received Sum RPC request: ${JSON.stringify(msg)}`);
        return { sum: msg.a + msg.b };
    }
}
