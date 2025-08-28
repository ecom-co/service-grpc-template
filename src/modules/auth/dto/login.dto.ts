import { IsEmail, IsNotEmpty, IsOptional, IsString } from '@ecom-co/utils';

export class LoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    metadata?: Record<string, unknown>;

    @IsNotEmpty()
    @IsString()
    password: string;
}
