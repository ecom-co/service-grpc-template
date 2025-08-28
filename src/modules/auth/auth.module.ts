import { Module } from '@nestjs/common';

import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '@/modules/auth/auth.controller';
import { GrpcRefreshTokenGuard } from '@/modules/auth/guards/grpc-refresh-token.guard';
import { AuthRedisService } from '@/modules/auth/services/auth-redis.service';
import { AuthService } from '@/modules/auth/services/auth.service';
import { JwtService } from '@/modules/auth/services/jwt.service';
import { JwtStrategy } from '@/modules/auth/strategies/grpc-jwt.strategy';
import { GrpcRefreshTokenStrategy } from '@/modules/auth/strategies/grpc-refresh-token.strategy';
import { UserModule } from '@/modules/user/user.module';

@Module({
    imports: [UserModule, JwtModule.register({})],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtService,
        AuthRedisService,
        JwtStrategy,
        GrpcRefreshTokenStrategy,
        GrpcRefreshTokenGuard,
    ],
    exports: [AuthService, JwtService],
})
export class AuthModule {}
