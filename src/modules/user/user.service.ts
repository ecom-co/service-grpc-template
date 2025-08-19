import { Injectable, Logger } from '@nestjs/common';

import { map } from 'lodash';

import { Cacheable, GrpcNotFoundException, MonitorPerformance, TraceOperation } from '@ecom-co/grpc';
import { BaseRepository, InjectRepository, User } from '@ecom-co/orm';
import { ApiPaginatedResponseData, ApiResponseData, Paging } from '@ecom-co/utils';

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
        const result = await this.userRepository.findOneOrCreate(
            {
                name: dto.name,
            },
            {
                isActive: true,
            },
        );

        const data = new ApiResponseData({
            data: new UserResponseDto(result),
            message: 'User created successfully',
            statusCode: 201,
        });

        this.logger.debug('User created successfully', { userId: result.id, userName: result.name });

        return data;
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
                createdAt: true,
                id: true,
                isActive: true,
                name: true,
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
        operationName: 'user.findOne',
    })
    async findOne(id: string): Promise<ApiResponseData<UserResponseDto>> {
        const user = await this.userRepository.findOne({
            select: {
                createdAt: true,
                id: true,
                isActive: true,
                name: true,
                updatedAt: true,
            },
            where: { id },
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

    /**
     * Get service health status with enhanced monitoring
     */
    getServiceHealth() {
        return {
            circuitBreaker: {
                failureCount: 0,
                state: 'CLOSED',
                successCount: 100,
            },
            cluster: {
                nodeId: process.env.NODE_ID || 'user-service-01',
                totalNodes: 1,
            },
            service: 'user-service',
            services: 1,
            status: 'healthy',
            timestamp: new Date().toISOString(),
        };
    }

    /**
     * Discover other service instances
     */
    getClusterInfo(): {
        activeConnections: number;
        nodeId: string;
        totalNodes: number;
    } {
        return {
            activeConnections: 0,
            nodeId: process.env.NODE_ID || 'user-service-01',
            totalNodes: 1,
        };
    }

    getServiceStatus(): {
        service: string;
        status: string;
        uptime: number;
        version?: string;
    } {
        const startTime = process.uptime();

        return {
            service: 'User Service',
            status: 'running',
            uptime: startTime,
            version: '1.0.0',
        };
    }

    @MonitorPerformance({ threshold: 400 })
    @TraceOperation({ operationName: 'user.update' })
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
                message: `User ${id} deleted successfully`,
                success: true,
            },
            message: 'User deleted successfully',
            statusCode: 200,
        });
    }

    discoverUserServices(): { host: string; name: string; port: number; status: string }[] {
        // This would typically discover services from service registry
        return [
            {
                host: 'localhost',
                name: 'User Service',
                port: 50051,
                status: 'healthy',
            },
        ];
    }
}
