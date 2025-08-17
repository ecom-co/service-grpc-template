import { GrpcNotFoundException } from '@ecom-co/grpc';
import { BaseRepository, InjectRepository, User } from '@ecom-co/orm';
import { ApiResponseData, ApiPaginatedResponseData, Paging } from '@ecom-co/utils';
import { Injectable } from '@nestjs/common';
import { map } from 'lodash';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: BaseRepository<User>,
    ) {}

    async create(dto: CreateUserDto) {
        const result = await this.userRepository.findOneOrCreate(
            {
                name: dto.name,
            },
            {
                isActive: true,
            },
        );

        return new ApiResponseData({
            data: new UserResponseDto(result),
            message: 'User created successfully',
            statusCode: 201,
        });
    }

    async findAll({
        page,
        limit,
    }: {
        page: number;
        limit: number;
    }): Promise<ApiPaginatedResponseData<UserResponseDto>> {
        const [users, total] = await this.userRepository.findAndCount({
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const paging = new Paging({
            page,
            limit,
            total,
            currentPageSize: users.length,
        });

        return new ApiPaginatedResponseData<UserResponseDto>({
            data: map(users, (user) => new UserResponseDto(user)),
            paging,
            message: 'Users retrieved successfully',
        });
    }

    async findOne(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            throw new GrpcNotFoundException('User not found');
        }

        return new ApiResponseData({
            data: new UserResponseDto(user),
            message: 'User retrieved successfully',
            statusCode: 200,
        });
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException('User not found');
        }

        const updatedUser = await this.userRepository.save({
            ...user,
            ...dto,
        });

        return new ApiResponseData({
            data: new UserResponseDto(updatedUser),
            message: 'User updated successfully',
            statusCode: 200,
        });
    }

    async remove(id: string) {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException('User not found');
        }

        await this.userRepository.remove(user);

        return new ApiResponseData({
            data: {
                success: true,
                message: `User ${id} deleted successfully`,
            },
            message: 'User deleted successfully',
            statusCode: 200,
        });
    }
}
