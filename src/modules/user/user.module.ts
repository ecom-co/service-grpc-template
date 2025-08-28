import { Module } from '@nestjs/common';

import { OrmModule, User } from '@ecom-co/orm';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports: [OrmModule.forFeatureExtended([User])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
