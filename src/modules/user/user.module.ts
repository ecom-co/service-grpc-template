import { Module } from '@nestjs/common';

import { OrmModule, User } from '@ecom-co/orm';

import { UserController } from '@/modules/user/user.controller';
import { UserService } from '@/modules/user/user.service';

@Module({
    imports: [OrmModule.forFeatureExtended([User])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
