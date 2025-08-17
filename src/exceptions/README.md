# gRPC Exception Handling

This module provides custom gRPC exceptions and a comprehensive exception filter for handling errors in gRPC services.

## 🚀 Features

- **Custom gRPC Exceptions**: Pre-defined exceptions for common error scenarios
- **Standardized Error Responses**: Consistent error format across all services
- **Automatic Logging**: Built-in error logging with correlation IDs
- **Development Mode**: Enhanced error details in development environment
- **Metrics Support**: Optional error metrics tracking

## 📦 Available Exceptions

### Basic Exceptions

```typescript
import {
    GrpcNotFoundException,
    GrpcInvalidArgumentException,
    GrpcUnauthenticatedException,
    GrpcPermissionDeniedException,
    GrpcAlreadyExistsException,
    GrpcResourceExhaustedException,
    GrpcFailedPreconditionException,
    GrpcAbortedException,
    GrpcOutOfRangeException,
    GrpcUnimplementedException,
    GrpcInternalException,
    GrpcUnavailableException,
    GrpcDataLossException,
} from '@/exceptions';
```

### Validation Exception

```typescript
import { GrpcValidationException } from '@/exceptions';

// Simple validation error
throw new GrpcValidationException(['Email is required']);

// With field-specific errors
throw new GrpcValidationException(['Validation failed'], {
    email: {
        required: 'Email is required',
        format: 'Invalid email format',
    },
    password: {
        minLength: 'Password must be at least 8 characters',
    },
});
```

## 🛠️ Usage Examples

### 1. Not Found Error

```typescript
@GrpcMethod('UserService', 'GetUser')
async getUser(data: GetUserDto) {
    const user = await this.userService.findById(data.id);

    if (!user) {
        throw new GrpcNotFoundException('User not found');
    }

    return user;
}
```

### 2. Validation Error

```typescript
@GrpcMethod('UserService', 'CreateUser')
async createUser(data: CreateUserDto) {
    const errors = await this.validateUser(data);

    if (errors.length > 0) {
        throw new GrpcValidationException(errors);
    }

    return await this.userService.create(data);
}
```

### 3. Permission Error

```typescript
@GrpcMethod('UserService', 'DeleteUser')
async deleteUser(data: DeleteUserDto) {
    if (!this.hasPermission(data.userId, 'DELETE_USER')) {
        throw new GrpcPermissionDeniedException('Insufficient permissions');
    }

    return await this.userService.delete(data.userId);
}
```

### 4. Resource Already Exists

```typescript
@GrpcMethod('UserService', 'CreateUser')
async createUser(data: CreateUserDto) {
    const existingUser = await this.userService.findByEmail(data.email);

    if (existingUser) {
        throw new GrpcAlreadyExistsException('User with this email already exists');
    }

    return await this.userService.create(data);
}
```

## 🔧 Exception Filter Configuration

The `GrpcExceptionFilter` is automatically configured in `main.ts`:

```typescript
app.useGlobalFilters(
    new GrpcExceptionFilter({
        isDevelopment: configService.isDevelopment,
        enableLogging: true,
        enableMetrics: false,
    }),
);
```

### Configuration Options

```typescript
interface GrpcExceptionFilterOptions {
    isDevelopment?: boolean; // Show detailed errors in development
    enableLogging?: boolean; // Enable error logging
    enableMetrics?: boolean; // Enable error metrics
    customErrorMessages?: Record<number, string>; // Custom error messages
}
```

## 📊 Error Response Format

All gRPC errors return a standardized format:

```typescript
{
    code: number,           // gRPC status code
    message: string,        // Error message
    requestId: string,      // Correlation ID
    timestamp: string,      // ISO timestamp
    service: string,        // Service.method name
    details?: any           // Additional error details
}
```

### gRPC Status Codes

| Code | Name                | Description                |
| ---- | ------------------- | -------------------------- |
| 3    | INVALID_ARGUMENT    | Invalid request parameters |
| 5    | NOT_FOUND           | Resource not found         |
| 6    | ALREADY_EXISTS      | Resource already exists    |
| 7    | PERMISSION_DENIED   | Insufficient permissions   |
| 8    | RESOURCE_EXHAUSTED  | Rate limit exceeded        |
| 9    | FAILED_PRECONDITION | Precondition failed        |
| 10   | ABORTED             | Operation aborted          |
| 11   | OUT_OF_RANGE        | Value out of range         |
| 12   | UNIMPLEMENTED       | Method not implemented     |
| 13   | INTERNAL            | Internal server error      |
| 14   | UNAVAILABLE         | Service unavailable        |
| 15   | DATA_LOSS           | Data loss                  |
| 16   | UNAUTHENTICATED     | Authentication required    |

## 🧪 Testing Exceptions

### Test Client Example

```javascript
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

const packageDefinition = protoLoader.loadSync('./src/proto/services/user.proto');
const userProto = grpc.loadPackageDefinition(packageDefinition).user;
const client = new userProto.UserService('localhost:50052', grpc.credentials.createInsecure());

// Test not found error
client.GetUser({ id: 'not-found' }, (error, response) => {
    if (error) {
        console.log('Error Code:', error.code);
        console.log('Error Message:', error.message);
        console.log('Request ID:', error.details?.requestId);
    }
});

// Test validation error
client.GetUser({ id: 'invalid' }, (error, response) => {
    if (error) {
        console.log('Validation Error:', error.details);
    }
});
```

## 🔍 Logging

The exception filter automatically logs errors with:

- **Correlation ID**: For request tracing
- **Service Method**: Service and method name
- **Error Code**: gRPC status code
- **Error Message**: Human-readable error message
- **Request Data**: In development mode
- **Stack Trace**: For server errors

### Log Levels

- **Warning**: Client errors (codes 3-16, except 13)
- **Error**: Server errors (code 13)
- **Debug**: Request data (development mode only)

## 🚀 Best Practices

1. **Use Specific Exceptions**: Choose the most appropriate exception type
2. **Provide Clear Messages**: Write descriptive error messages
3. **Include Validation Details**: Use `GrpcValidationException` for validation errors
4. **Handle Gracefully**: Always handle exceptions in your service methods
5. **Log Appropriately**: Let the filter handle logging, focus on business logic

## 📚 Related Files

- `src/exceptions/grpc-exceptions.ts` - Custom exception classes
- `src/filters/grpc-exception.filter.ts` - Exception filter implementation
- `src/main.ts` - Filter configuration
- `src/modules/user/user.service.ts` - Usage examples
