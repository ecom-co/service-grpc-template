import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UserGrpcController {
    @GrpcMethod('UserService', 'CreateUser')
    createUser(data: CreateUserDto) {
        // Mock implementation
        return {
            id: 'user-123',
            name: data.name,
            email: data.email,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    @GrpcMethod('UserService', 'GetUser')
    getUser(data: GetUserDto) {
        // Mock implementation
        return {
            id: data.id,
            name: 'John Doe',
            email: 'john@example.com',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    @GrpcMethod('UserService', 'UpdateUser')
    updateUser(data: UpdateUserDto & { id: string }) {
        // Mock implementation
        return {
            id: data.id,
            name: data.name || 'John Doe',
            email: data.email || 'john@example.com',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
    }

    @GrpcMethod('UserService', 'DeleteUser')
    deleteUser(data: GetUserDto) {
        // Mock implementation
        return {
            success: true,
            message: `User ${data.id} deleted successfully`,
        };
    }

    @GrpcMethod('UserService', 'ListUsers')
    listUsers(data: ListUsersDto) {
        // Mock implementation
        const users = Array.from({ length: data.limit }, (_, i) => ({
            id: `user-${i + 1}`,
            name: `User ${i + 1}`,
            email: `user${i + 1}@example.com`,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }));

        return {
            users,
            total: 100,
            page: data.page,
            limit: data.limit,
        };
    }
}
