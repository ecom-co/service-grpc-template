import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';

import { CreateUserDto } from './dto/create-user.dto';
import { GetUserDto } from './dto/get-user.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller()
export class UserGrpcController {
    constructor(private readonly userService: UserService) {}

    @GrpcMethod('UserService', 'CreateUser')
    async createUser(data: CreateUserDto) {
        return await this.userService.create(data);
    }

    @GrpcMethod('UserService', 'GetUser')
    async getUser(data: GetUserDto) {
        return await this.userService.findOne(data.id);
    }

    @GrpcMethod('UserService', 'UpdateUser')
    async updateUser(data: UpdateUserDto & { id: string }) {
        const { id, ...updateData } = data;
        return await this.userService.update(id, updateData);
    }

    @GrpcMethod('UserService', 'DeleteUser')
    async deleteUser(data: GetUserDto) {
        const result = await this.userService.remove(data.id);
        // Map the delete response to match proto structure
        return {
            deleteData: result.data,
            message: result.message,
            statusCode: result.statusCode,
        };
    }

    @GrpcMethod('UserService', 'ListUsers')
    async listUsers(data: ListUsersDto) {
        return await this.userService.findAll({
            page: data.page,
            limit: data.limit,
        });
    }

    /**
     * Enhanced gRPC methods using scale features
     */
    @GrpcMethod('UserService', 'GetHealth')
    getHealth() {
        return this.userService.getServiceHealth();
    }
}
