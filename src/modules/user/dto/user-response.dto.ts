import { assign } from 'lodash';

import { User } from '@ecom-co/orm';
import { ApiProperty, Exclude, Expose, plainToInstance } from '@ecom-co/utils';

@Exclude()
export class UserResponseDto {
    @ApiProperty({ description: 'User ID', example: '123e4567-e89b-12d3-a456-426614174000' })
    @Expose()
    id: string;

    @ApiProperty({ description: 'User name', example: 'John Doe' })
    @Expose()
    name: string;

    @ApiProperty({ description: 'User email', example: 'john@example.com' })
    @Expose()
    email: string;

    @ApiProperty({ description: 'User is active', example: true })
    @Expose()
    isActive: boolean;

    @ApiProperty({ description: 'User creation date', example: '2024-01-01T00:00:00.000Z' })
    @Expose()
    createdAt: string;

    @ApiProperty({ description: 'User last update date', example: '2024-01-01T00:00:00.000Z' })
    @Expose()
    updatedAt: string;

    constructor(partial: Partial<User>) {
        assign(this, plainToInstance(UserResponseDto, partial, { excludeExtraneousValues: true }));
    }
}
