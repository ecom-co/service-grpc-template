import { Module } from '@nestjs/common';

import { UserGrpcController } from './user.grpc.controller';

@Module({
    controllers: [UserGrpcController],
    providers: [],
    exports: [],
})
export class UserModule {}
