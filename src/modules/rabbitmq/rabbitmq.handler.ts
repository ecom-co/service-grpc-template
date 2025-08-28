import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class OrdersRabbitHandler {
    private readonly logger = new Logger(OrdersRabbitHandler.name);
}
