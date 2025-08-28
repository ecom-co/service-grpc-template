import { Controller, UseGuards } from '@nestjs/common';

import { GrpcMethod } from '@ecom-co/grpc';
import { Payload } from '@nestjs/microservices';

import { CurrentSsid } from '@/core/decorators/current-ssid.decorator';
import { CurrentUser } from '@/core/decorators/current-user.decorator';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';
import { GrpcJwtGuard } from '@/modules/auth/guards/grpc-jwt.guard';
import { GrpcRefreshTokenGuard } from '@/modules/auth/guards/grpc-refresh-token.guard';
import { SessionUser } from '@/modules/auth/services/auth-redis.service';
import { AuthService } from '@/modules/auth/services/auth.service';
import { TokenPair } from '@/modules/auth/services/jwt.service';
import { UserResponseDto } from '@/modules/user/dto/user-response.dto';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @GrpcMethod('AuthService', 'GetProfile')
    @UseGuards(GrpcJwtGuard)
    getProfile(@CurrentUser() user: SessionUser): Promise<{
        message: string;
        user: UserResponseDto;
    }> {
        return this.authService.getProfile(user.id);
    }

    @GrpcMethod('AuthService', 'Login')
    login(@Payload() dto: LoginDto): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        return this.authService.login(dto);
    }

    @GrpcMethod('AuthService', 'RefreshToken')
    @UseGuards(GrpcRefreshTokenGuard)
    refreshToken(@CurrentSsid() ssid: string): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        return this.authService.refreshTokenBySsid(ssid);
    }

    @GrpcMethod('AuthService', 'Register')
    register(@Payload() dto: RegisterDto): Promise<{
        accessToken: TokenPair['accessToken'];
        refreshToken: TokenPair['refreshToken'];
        ssid: string;
        user: UserResponseDto;
    }> {
        return this.authService.register(dto);
    }
}
