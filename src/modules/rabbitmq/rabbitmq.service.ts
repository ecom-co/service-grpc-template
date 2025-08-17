// rabbitmq.service.ts
import { AmqpConnection } from '@ecom-co/rabbitmq';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RabbitmqService {
    constructor(private readonly amqpConnection: AmqpConnection) {}

    async sum(a: number, b: number) {
        return await this.amqpConnection.request<{ sum: number }>({
            exchange: 'exchange1',
            routingKey: 'rpc-route',
            payload: { a, b },
            timeout: 5000,
            correlationId: uuidv4(),
        });
    }
}
