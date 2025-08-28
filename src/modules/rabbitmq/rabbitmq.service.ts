// rabbitmq.service.ts
import { Injectable } from '@nestjs/common';

import { AmqpConnection } from '@ecom-co/rabbitmq';

@Injectable()
export class RabbitmqService {
    constructor(private readonly amqpConnection: AmqpConnection) {}
}
