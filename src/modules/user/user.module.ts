import { Module } from '@nestjs/common';

import { OrmModule, User } from '@ecom-co/orm';

import { UserGrpcController } from './user.grpc.controller';
import { UserService } from './user.service';

@Module({
    imports: [
        OrmModule.forFeatureExtended([User]),
        // Example: If you need to use gRPC clients in this module
        // GrpcClientModule.forFeature(['app-client', 'notification-client'])
    ],
    controllers: [UserGrpcController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
