import { Controller } from '@nestjs/common';

import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppGrpcController {
    @GrpcMethod('AppService', 'GetHello')
    getHello(data: { name?: string }) {
        const name = data?.name || 'World';

        return { message: `Hello ${name} from gRPC!` };
    }
}
