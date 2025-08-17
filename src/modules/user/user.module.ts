import { OrmModule, User } from '@ecom-co/orm';
import { Module } from '@nestjs/common';

import { UserGrpcController } from './user.grpc.controller';
import { UserService } from './user.service';

@Module({
    imports: [OrmModule.forFeatureExtended([User])],
    controllers: [UserGrpcController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
