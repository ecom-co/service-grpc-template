import { Global, Module } from '@nestjs/common';

import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { ConfigServiceApp } from '@/modules/config/config.service';
import { validate } from '@/modules/config/config.validation';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            envFilePath: '.env',
            isGlobal: true,
            validate,
            validationOptions: {
                abortEarly: true,
                allowUnknown: true,
            },
        }),
    ],
    providers: [ConfigServiceApp],
    exports: [ConfigServiceApp],
})
export class ConfigModule {}
