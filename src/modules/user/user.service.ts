import { Injectable, Logger } from '@nestjs/common';

import { map, omit } from 'lodash';

import {
    Cacheable,
    GrpcConflictException,
    GrpcNotFoundException,
    GrpcUnauthorizedException,
    MonitorPerformance,
    TraceOperation,
} from '@ecom-co/grpc';
import { BaseRepository, InjectRepository, User } from '@ecom-co/orm';
import { ApiPaginatedResponseData, ApiResponseData, Paging } from '@ecom-co/utils';
import { compare, hash } from 'bcrypt';

import { LoginDto } from '@/modules/auth/dto/login.dto';
import { RegisterDto } from '@/modules/auth/dto/register.dto';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: BaseRepository<User>,
    ) {}

    @MonitorPerformance({ includeMemory: true, threshold: 500 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.create',
    })
    async create(dto: CreateUserDto): Promise<ApiResponseData<UserResponseDto>> {
        const result = await this.userRepository.save(dto);

        this.logger.debug(new UserResponseDto(result));

        return new ApiResponseData({
            data: new UserResponseDto(result),
            message: 'User created successfully',
            statusCode: 201,
        });
    }

    async checkEmailExists(email: string): Promise<boolean> {
        return (await this.userRepository.count({ where: { email } })) > 0;
    }

    async checkUsernameExists(username: string): Promise<boolean> {
        return (await this.userRepository.count({ where: { username } })) > 0;
    }

    // Cache for 60 seconds
    async findAll({
        limit,
        page,
    }: {
        limit: number;
        page: number;
    }): Promise<ApiPaginatedResponseData<UserResponseDto>> {
        const [users, total] = await this.userRepository.findAndCount({
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                updatedAt: true,
            },
            skip: (page - 1) * limit,
            take: limit,
        });

        const paging = new Paging({
            currentPageSize: users.length,
            limit,
            page,
            total,
        });

        return new ApiPaginatedResponseData<UserResponseDto>({
            data: map(users, (user) => new UserResponseDto(user)),
            message: 'Users retrieved successfully',
            paging,
        });
    }

    @Cacheable({ ttl: 300 }) // Cache for 5 minutes
    @MonitorPerformance({ includeMemory: true, threshold: 200 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.findByEmail',
    })
    async findByEmail(email: string): Promise<null | User> {
        const user = await this.userRepository.findOne({
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                updatedAt: true,
            },
            where: { email },
        });

        if (!user) {
            this.logger.warn(`User not found with email: ${email}`);

            return null;
        }

        return user;
    }

    @Cacheable({ ttl: 300 }) // Cache for 5 minutes
    @MonitorPerformance({ includeMemory: true, threshold: 200 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.findById',
    })
    async findById(id: string): Promise<null | User> {
        const user = await this.userRepository.findOne({
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                updatedAt: true,
            },
            where: { id },
        });

        if (!user) {
            this.logger.warn(`User not found with ID: ${id}`);

            return null;
        }

        return user;
    }

    @Cacheable({ ttl: 300 }) // Cache for 5 minutes
    @MonitorPerformance({ includeMemory: true, threshold: 200 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.findByUsername',
    })
    async findByUsername(username: string): Promise<null | User> {
        const user = await this.userRepository.findOne({
            select: {
                id: true,
                email: true,
                username: true,
                isActive: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                updatedAt: true,
            },
            where: { username },
        });

        if (!user) {
            this.logger.warn(`User not found with username: ${username}`);

            return null;
        }

        return user;
    }

    @Cacheable({ ttl: 300 }) // Cache for 5 minutes
    @MonitorPerformance({ includeMemory: true, threshold: 200 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.findOne',
    })
    async findOne(id: string): Promise<ApiResponseData<UserResponseDto>> {
        const user = await this.userRepository.findOne({
            select: {
                id: true,
                isActive: true,
                firstName: true,
                lastName: true,
                createdAt: true,
                updatedAt: true,
            },
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException(`User with ID ${id} not found`);
        }

        return new ApiResponseData({
            data: new UserResponseDto(user),
            message: 'User retrieved successfully',
            statusCode: 200,
        });
    }

    @MonitorPerformance({ includeMemory: true, threshold: 500 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.update',
    })
    async update(id: string, dto: UpdateUserDto): Promise<ApiResponseData<UserResponseDto>> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException(`User with ID ${id} not found`);
        }

        const result = await this.userRepository.save({
            ...user,
            ...dto,
        });

        return new ApiResponseData({
            data: new UserResponseDto(result),
            message: 'User updated successfully',
            statusCode: 200,
        });
    }

    @MonitorPerformance({ includeMemory: true, threshold: 500 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.updatePassword',
    })
    async updatePassword(id: string, newPassword: string): Promise<ApiResponseData<UserResponseDto>> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException(`User with ID ${id} not found`);
        }

        const hashedPassword = await hash(newPassword, 10);

        const result = await this.userRepository.save({
            ...user,
            password: hashedPassword,
        });

        return new ApiResponseData({
            data: new UserResponseDto(result),
            message: 'Password updated successfully',
            statusCode: 200,
        });
    }

    /**
     *
     * @param {string} id - The ID of the user to remove
     * @returns {ApiResponseData<UserResponseDto>} - The response data
     */
    @MonitorPerformance({ includeMemory: true, threshold: 500 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.remove',
    })
    async remove(id: string): Promise<ApiResponseData<UserResponseDto>> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException(`User with ID ${id} not found`);
        }

        await this.userRepository.remove(user);

        return new ApiResponseData({
            data: new UserResponseDto(user),
            message: 'User removed successfully',
            statusCode: 200,
        });
    }

    discoverUserServices(): { host: string; name: string; port: number; status: string }[] {
        // This would typically discover services from service registry
        return [
            {
                name: 'User Service',
                status: 'healthy',
                host: 'localhost',
                port: 50051,
            },
        ];
    }

    async login(dto: LoginDto): Promise<User> {
        const user = await this.userRepository.findOneOrFail({
            select: {
                id: true,
                email: true,
                password: true,
            },
            where: { email: dto.email },
        });

        if (!user) {
            throw new GrpcUnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await compare(dto.password, user.password);

        if (!isPasswordValid) {
            throw new GrpcUnauthorizedException('Invalid credentials');
        }

        return omit(user, ['password']);
    }

    async register(dto: RegisterDto): Promise<User> {
        if (await this.checkEmailExists(dto.email)) {
            throw new GrpcConflictException('Email already exists');
        }

        if (await this.checkUsernameExists(dto.username)) {
            throw new GrpcConflictException('Username already exists');
        }

        const hashedPassword = await hash(dto.password, 10);

        const user = await this.userRepository.save({
            ...dto,
            password: hashedPassword,
        });

        return omit(user, ['password']);
    }

    @MonitorPerformance({ includeMemory: true, threshold: 500 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.toggleActive',
    })
    async toggleActive(id: string): Promise<ApiResponseData<UserResponseDto>> {
        const user = await this.userRepository.findOne({
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException(`User with ID ${id} not found`);
        }

        const result = await this.userRepository.save({
            ...user,
            isActive: !user.isActive,
        });

        return new ApiResponseData({
            data: new UserResponseDto(result),
            message: `User ${result.isActive ? 'activated' : 'deactivated'} successfully`,
            statusCode: 200,
        });
    }
}
