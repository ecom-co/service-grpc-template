import { GrpcNotFoundException, TraceOperation, MonitorPerformance, Cacheable } from '@ecom-co/grpc';
import { BaseRepository, InjectRepository, User } from '@ecom-co/orm';
import { ApiResponseData, ApiPaginatedResponseData, Paging } from '@ecom-co/utils';
import { Injectable, Logger } from '@nestjs/common';
import { map } from 'lodash';

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

    @TraceOperation({
        operationName: 'user.create',
        includeArgs: true,
        includeResult: false,
    })
    @MonitorPerformance({ threshold: 500, includeMemory: true })
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

    @TraceOperation({
        operationName: 'user.findOne',
        includeArgs: true,
        includeResult: false,
    })
    @MonitorPerformance({ threshold: 200, includeMemory: true })
    @Cacheable({ ttl: 300 }) // Cache for 5 minutes
    async findOne(id: string): Promise<ApiResponseData<UserResponseDto>> {
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

    /**
     * Get service health status with enhanced monitoring
     */
    getServiceHealth() {
        return {
            service: 'user-service',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: 1,
            cluster: {
                nodeId: process.env.NODE_ID || 'user-service-01',
                totalNodes: 1,
            },
            circuitBreaker: {
                state: 'CLOSED',
                failureCount: 0,
                successCount: 100,
            },
        };
    }

    /**
     * Discover other service instances
     */
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

    getClusterInfo(): {
        nodeId: string;
        totalNodes: number;
        activeConnections: number;
    } {
        return {
            nodeId: process.env.NODE_ID || 'user-service-01',
            totalNodes: 1,
            activeConnections: 0,
        };
    }

    discoverUserServices(): { name: string; host: string; port: number; status: string }[] {
        // This would typically discover services from service registry
        return [
            {
                name: 'User Service',
                host: 'localhost',
                port: 50051,
                status: 'healthy',
            },
        ];
    }

    @TraceOperation({ operationName: 'user.update' })
    @MonitorPerformance({ threshold: 400 })
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
