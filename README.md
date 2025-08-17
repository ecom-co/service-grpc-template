# E-commerce Platform - gRPC Template

A scalable microservices template built with NestJS and gRPC for e-commerce applications.

## 🚀 Features

- **gRPC Communication**: High-performance RPC framework for microservices
- **NestJS Framework**: Modern Node.js framework with TypeScript support
- **Microservices Architecture**: Scalable service-based architecture
- **TypeORM Integration**: Database ORM with PostgreSQL support
- **Validation**: Request validation using class-validator and custom decorators
- **Standardized Responses**: Consistent API response format using `@ecom-co/utils`
- **Docker Support**: Containerized development and production environments
- **Service Registry**: Dynamic service management and configuration

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- PostgreSQL
- Redis
- RabbitMQ
- Elasticsearch

## 🛠️ Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd template
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start external services**

```bash
# Start PostgreSQL, Redis, RabbitMQ, Elasticsearch
docker-compose up -d postgres redis rabbitmq elasticsearch
```

## 🏗️ Architecture

### Service Structure

```
src/
├── modules/
│   ├── user/           # User Service
│   │   ├── dto/        # Data Transfer Objects
│   │   ├── user.grpc.controller.ts
│   │   ├── user.service.ts
│   │   └── user.module.ts
│   └── config/         # Configuration Service
├── proto/
│   └── services/
│       └── user.proto  # gRPC Protocol Buffers
├── services/
│   ├── service-registry.ts    # Service management
│   ├── service-manager.ts     # Service orchestration
│   └── service-config.ts      # Service configuration
└── main.ts            # Application entry point
```

### Port Configuration

| Service              | Port  | Description                  |
| -------------------- | ----- | ---------------------------- |
| User Service         | 50052 | User management operations   |
| Product Service      | 50053 | Product catalog (planned)    |
| Order Service        | 50054 | Order processing (planned)   |
| Payment Service      | 50055 | Payment processing (planned) |
| Notification Service | 50056 | Notifications (planned)      |

**Important Notes:**

- **Port 50051**: Reserved for main backend application (avoid conflicts)
- **Port Range 50052-50060**: Available for microservices in this template
- **Dynamic Port Assignment**: Services automatically get next available port

### Port Conflict Resolution

If you encounter port conflicts:

1. **Check running services:**

```bash
# Check what's using port 50052
lsof -i :50052
# or
netstat -tulpn | grep 50052
```

2. **Change service port in configuration:**

```typescript
// src/services/service-registry.ts
{
    name: 'User Service',
    package: 'user',
    protoPath: 'src/proto/services/user.proto',
    port: 50053, // Change to available port
    enabled: true,
}
```

3. **Update Docker configuration:**

```yaml
# docker-compose.yml
ports:
    - '50053:50053' # Match the new port
```

4. **Update environment variables:**

```env
# .env
GRPC_PORT=50053
```

### Port Management Strategy

- **Development**: Use ports 50052-50060 for template services
- **Production**: Use environment-specific port ranges
- **Scaling**: Each service gets its own port for independent scaling

## 🚀 Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Docker

```bash
# Development
docker-compose up api

# Production
docker build -t ecom-api .
docker run -p 50052:50052 ecom-api
```

## 📡 gRPC Services

### User Service (Port 50052)

#### Available Methods:

- `CreateUser(CreateUserRequest) → UserResponse`
- `GetUser(GetUserRequest) → UserResponse`
- `UpdateUser(UpdateUserRequest) → UserResponse`
- `DeleteUser(DeleteUserRequest) → DeleteUserResponse`
- `ListUsers(ListUsersRequest) → ListUsersResponse`

#### Request Examples:

**Create User:**

```protobuf
message CreateUserRequest {
  string name = 1;
  string email = 2;
  string password = 3;
}
```

**List Users:**

```protobuf
message ListUsersRequest {
  int32 page = 1;
  int32 limit = 2;
}
```

## 🧪 Testing

### gRPC Client Test

```bash
# Create a test client (example)
node test-grpc-client.js
```

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis
REDIS_URL=redis://localhost:6379

# Elasticsearch
ELASTICSEARCH_URL=http://localhost:9200

# gRPC Configuration
GRPC_PORT=50052                    # Service port (change if conflict)
GRPC_PACKAGE=user                  # Proto package name
GRPC_PROTO_PATH=src/proto/services/user.proto

# RabbitMQ
RABBITMQ_URL=amqp://localhost:5672

# Service Management
SERVICE_ENABLED=true               # Enable/disable services
SERVICE_PORT_RANGE_START=50052     # Start of port range
SERVICE_PORT_RANGE_END=50060       # End of port range
```

### Port Configuration Files

**Service Registry** (`src/services/service-registry.ts`):

```typescript
const services: GrpcServiceConfig[] = [
    {
        name: 'User Service',
        package: 'user',
        protoPath: 'src/proto/services/user.proto',
        port: 50052, // ← Change this if port is in use
        enabled: true,
    },
];
```

**Docker Configuration** (`docker-compose.yml`):

```yaml
ports:
    - '50052:50052' # ← Must match service port
```

**Health Check**:

```yaml
healthcheck:
    test: ['CMD', 'nc', '-z', 'localhost', '50052'] # ← Must match service port
```

### Service Configuration

Services can be enabled/disabled in `src/services/service-registry.ts`:

```typescript
const services: GrpcServiceConfig[] = [
    {
        name: 'User Service',
        package: 'user',
        protoPath: 'src/proto/services/user.proto',
        port: 50052,
        enabled: true,
    },
    // Add more services here
];
```

## 📦 Adding New Services

1. **Create Proto File**

```protobuf
// src/proto/services/new-service.proto
syntax = "proto3";
package newservice;

service NewService {
  rpc MethodName (Request) returns (Response) {}
}
```

2. **Create Module Structure**

```
src/modules/new-service/
├── dto/
├── new-service.grpc.controller.ts
├── new-service.service.ts
└── new-service.module.ts
```

3. **Register Service with Port Assignment**

```typescript
// src/services/service-registry.ts
{
    name: 'New Service',
    package: 'newservice',
    protoPath: 'src/proto/services/new-service.proto',
    port: 50053,  // ← Choose next available port
    enabled: true,
}
```

4. **Update Docker Configuration**

```yaml
# docker-compose.yml
ports:
    - '50053:50053' # ← Match the service port
```

5. **Add to App Module**

```typescript
// src/app.module.ts
imports: [
    // ... other imports
    NewServiceModule,
];
```

### Port Assignment Guidelines

- **Check available ports**: Use `lsof -i :PORT` to verify
- **Sequential assignment**: 50052, 50053, 50054, etc.
- **Document port usage**: Update this README when adding services
- **Environment-specific**: Use different port ranges for dev/staging/prod

## 🔍 Monitoring & Debugging

### Health Checks

- **gRPC Health**: `nc -z localhost 50052` (check if port is listening)
- **Docker Health**: Configured in docker-compose.yml
- **Port Status**: `lsof -i :50052` (check what's using the port)

### Troubleshooting Port Issues

**Common Port Problems:**

1. **Port already in use**: Change port in service registry
2. **Docker port conflict**: Update docker-compose.yml
3. **Health check failing**: Verify port is correctly configured

**Debug Commands:**

```bash
# Check what's using a port
lsof -i :50052

# Check if service is listening
netstat -tulpn | grep 50052

# Test gRPC connection
nc -z localhost 50052

# Check Docker container ports
docker ps
docker port <container-id>
```

### Logs

```bash
# Application logs
npm run start:dev

# Docker logs
docker-compose logs api
```

## 📚 Dependencies

### Core Dependencies

- `@nestjs/common`: NestJS core framework
- `@nestjs/microservices`: gRPC microservices support
- `@grpc/grpc-js`: gRPC implementation
- `@grpc/proto-loader`: Protocol buffer loader
- `class-validator`: Request validation
- `class-transformer`: Data transformation

### Custom Dependencies

- `@ecom-co/orm`: TypeORM integration
- `@ecom-co/redis`: Redis integration
- `@ecom-co/elasticsearch`: Elasticsearch integration
- `@ecom-co/utils`: Utility library with decorators and DTOs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy coding! 🚀**
test
