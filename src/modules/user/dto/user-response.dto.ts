import { User } from '@ecom-co/orm';
import { Exclude, Expose, ApiProperty, plainToInstance } from '@ecom-co/utils';
import { assign } from 'lodash';

@Exclude()
export class UserResponseDto {
    @Expose()
    @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    id: string;

    @Expose()
    @ApiProperty({ description: 'User name', example: 'John Doe' })
    name: string;

    @Expose()
    @ApiProperty({ description: 'User email', example: 'john@example.com' })
    email: string;

    @Expose()
    @ApiProperty({ description: 'User is active', example: true })
    isActive: boolean;

    @Expose()
    @ApiProperty({ description: 'User creation date', example: '2024-01-01T00:00:00.000Z' })
    createdAt: string;

    @Expose()
    @ApiProperty({ description: 'User last update date', example: '2024-01-01T00:00:00.000Z' })
    updatedAt: string;

    constructor(partial: Partial<User>) {
        assign(this, plainToInstance(UserResponseDto, partial, { excludeExtraneousValues: true }));
    }
}
