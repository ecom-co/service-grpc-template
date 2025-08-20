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
        // Example: Inject gRPC clients if needed
        // @GrpcClient('notification-client') private readonly notificationClient: ClientProxy,
        // @GrpcClient('payment-client') private readonly paymentClient: ClientProxy,
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

        this.logger.debug('User created successfully', { userName: result.name, userId: result.id });

        // Example: Send notification after user creation
        // await this.sendUserCreatedNotification(result);

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
            currentPageSize: users.length,
            limit,
            page,
            total,
        });

        this.logger.debug('Users retrieved successfully', { total, users });

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
                id: true,
                name: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
            },
            where: { id },
        });

        if (!user) {
            throw new GrpcNotFoundException(`User with ID ${id} not found`);
        }

        const data = new ApiResponseData({
            data: new UserResponseDto(user),
            message: 'User retrieved successfully',
            statusCode: 200,
        });

        this.logger.debug('User retrieved successfully', { userId: id });

        return data;
    }

    // Example method showing how to use gRPC clients with the new architecture
    // Uncomment and modify if you need to call other services
    /*
    async getUserWithExternalData(userId: string): Promise<ApiResponseData<any>> {
        const user = await this.findOne(userId);
        
        try {
            // Example: Get notification preferences
            const notificationService = this.notificationClient.getService<any>('NotificationService');
            const notificationPrefs = await firstValueFrom(
                notificationService.GetUserPreferences({ userId })
            );
            
            // Example: Get payment methods
            const paymentService = this.paymentClient.getService<any>('PaymentService');
            const paymentMethods = await firstValueFrom(
                paymentService.GetUserPaymentMethods({ userId })
            );
            
            return new ApiResponseData({
                data: {
                    user: user.data,
                    notificationPreferences: notificationPrefs,
                    paymentMethods: paymentMethods
                },
                message: 'User with external data retrieved successfully',
                statusCode: 200,
            });
        } catch (error) {
            this.logger.error('Failed to get external data for user', { userId, error });
            
            // Return user data only if external services fail
            return new ApiResponseData({
                data: {
                    user: user.data,
                    notificationPreferences: null,
                    paymentMethods: null
                },
                message: 'User retrieved successfully (external services unavailable)',
                statusCode: 200,
            });
        }
    }

    // Example: Send notification after user creation
    private async sendUserCreatedNotification(user: User): Promise<void> {
        try {
            const notificationService = this.notificationClient.getService<any>('NotificationService');
            await firstValueFrom(
                notificationService.SendWelcomeEmail({ 
                    userId: user.id, 
                    userName: user.name,
                    email: user.email 
                })
            );
            
            this.logger.debug('Welcome notification sent successfully', { userId: user.id });
        } catch (error) {
            this.logger.error('Failed to send welcome notification', { userId: user.id, error });
            // Don't throw - notification failure shouldn't break user creation
        }
    }
    */

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

        const data = new ApiResponseData({
            data: new UserResponseDto(result),
            message: 'User updated successfully',
            statusCode: 200,
        });

        this.logger.debug('User updated successfully', { userName: result.name, userId: id });

        return data;
    }

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

        const data = new ApiResponseData({
            data: new UserResponseDto(user),
            message: 'User removed successfully',
            statusCode: 200,
        });

        this.logger.debug('User removed successfully', { userName: user.name, userId: id });

        return data;
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
}
