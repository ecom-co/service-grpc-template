import { Controller } from '@nestjs/common';

import { GrpcMethod } from '@nestjs/microservices';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { UserService } from './user.service';

@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @GrpcMethod('UserService', 'CreateUser')
    async createUser(data: CreateUserDto) {
        return await this.userService.create(data);
    }

    /**
     * Enhanced gRPC methods using scale features
     */
    @GrpcMethod('UserService', 'GetHealth')
    getHealth() {
        // Return a simple health status since getServiceHealth() method was removed
        return {
            status: 'healthy',
            service: 'user-service',
            timestamp: new Date().toISOString(),
        };
    }

    @GrpcMethod('UserService', 'GetUser')
    async getUser(data: GetUserDto) {
        return await this.userService.findOne(data.id);
    }

    @GrpcMethod('UserService', 'ListUsers')
    async listUsers(data: ListUsersDto) {
        return await this.userService.findAll({
            limit: data.limit || 10,
            page: data.page || 1,
        });
    }

    @GrpcMethod('UserService', 'UpdateUser')
    async updateUser(data: UpdateUserDto & { id: string }) {
        const { id, ...updateData } = data;

        return await this.userService.update(id, updateData);
    }

    @GrpcMethod('UserService', 'DeleteUser')
    async deleteUser(data: GetUserDto) {
        return await this.userService.remove(data.id);
    }
}
