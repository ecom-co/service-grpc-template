import { IsEmail, IsNotEmpty, IsOptional, IsString } from '@ecom-co/utils';

export class RegisterDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsOptional()
    @IsString()
    metadata?: Record<string, unknown>;

    @IsNotEmpty()
    @IsString()
    password: string;
}
