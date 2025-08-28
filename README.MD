# ECOM gRPC Microservice Template

A production-ready NestJS gRPC microservice template with comprehensive tooling and best practices for building scalable microservices.

## 🚀 Features

- **gRPC Communication**: Built with gRPC for high-performance inter-service communication
- **NestJS Framework**: Leverages NestJS for robust, scalable Node.js applications
- **PostgreSQL Database**: TypeORM integration with PostgreSQL for data persistence
- **Redis Caching**: Redis integration for caching and session management
- **Elasticsearch**: Full-text search capabilities with Elasticsearch
- **RabbitMQ**: Message queuing for asynchronous processing
- **Docker Support**: Complete Docker setup for development and production
- **TypeScript**: Full TypeScript support with strict type checking
- **Testing**: Jest testing framework with e2e testing support
- **Code Quality**: ESLint, Prettier, and Husky for code quality enforcement
- **Validation**: Joi-based configuration validation
- **Logging**: Structured logging with development/production modes
- **Health Checks**: Built-in health check endpoints
- **Error Handling**: Comprehensive error handling and filtering

## 📋 Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL
- Redis
- RabbitMQ
- Elasticsearch

## 🛠️ Installation

1. **Clone the template**

    ```bash
    git clone <repository-url>
    cd template
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

    ```env
    # Application
    NODE_ENV=development
    PORT=3000

    # gRPC
    GRPC_PORT=50052
    GRPC_PACKAGE=user

    # Database
    DATABASE_URL=postgresql://username:password@localhost:5432/database_name

    # Redis
    REDIS_URL=redis://localhost:6379

    # RabbitMQ
    RABBITMQ_URL=amqp://localhost:5672

    # Elasticsearch
    ELASTICSEARCH_URL=http://localhost:9200
    ELASTICSEARCH_USERNAME=elastic
    ELASTICSEARCH_PASSWORD=changeme
    ```

4. **Start with Docker Compose**
    ```bash
    docker-compose up -d
    ```

## 🏃‍♂️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in development mode with hot reload
npm run start:debug        # Start with debugger attached
npm run start:prod         # Start in production mode

# Building
npm run build              # Build the application
npm run build:config       # Generate query configurations

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage
npm run test:watch         # Run tests in watch mode

# Code Quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix ESLint issues
npm run format             # Format code with Prettier
npm run check-types        # Type checking with TypeScript

# Git Hooks
npm run pre-commit         # Run before commit
npm run pre-push           # Run before push
```

### Project Structure

```
src/
├── app.module.ts                 # Main application module
├── main.ts                      # Application bootstrap
├── app.grpc.controller.ts       # gRPC controller
├── app.service.ts               # Application service
├── modules/
│   ├── config/                  # Configuration module
│   │   ├── config.module.ts
│   │   ├── config.service.ts
│   │   └── config.validation.ts
│   ├── user/                    # User module (example)
│   │   ├── user.module.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   └── dto/
│   └── rabbitmq/                # RabbitMQ module
│       ├── rabbitmq.module.ts
│       ├── rabbitmq.service.ts
│       └── rabbitmq.handler.ts
└── proto/                       # Protocol Buffer definitions
    ├── app.proto
    ├── services/
    │   └── user.proto
    └── shared/
        ├── common.proto
        └── error.proto
```

## 🔧 Configuration

The application uses a centralized configuration system with environment variable validation:

### Environment Variables

| Variable            | Description                  | Default       |
| ------------------- | ---------------------------- | ------------- |
| `NODE_ENV`          | Application environment      | `development` |
| `PORT`              | HTTP port                    | `3000`        |
| `GRPC_PORT`         | gRPC port                    | `50051`       |
| `DATABASE_URL`      | PostgreSQL connection string | -             |
| `REDIS_URL`         | Redis connection string      | -             |
| `RABBITMQ_URL`      | RabbitMQ connection string   | -             |
| `ELASTICSEARCH_URL` | Elasticsearch URL            | -             |

### Configuration Service

The `ConfigServiceApp` provides type-safe access to all configuration values:

```typescript
@Injectable()
export class ConfigServiceApp {
    get isDevelopment(): boolean;
    get databaseUrl(): string;
    get redisUrl(): string;
    get grpcPort(): number;
    // ... more getters
}
```

## 📡 gRPC Services

The template includes a complete gRPC service setup with:

### User Service Example

The included User service demonstrates CRUD operations:

```protobuf
service UserService {
  rpc CreateUser (CreateUserRequest) returns (ApiResponseData) {}
  rpc GetUser (GetUserRequest) returns (ApiResponseData) {}
  rpc UpdateUser (UpdateUserRequest) returns (ApiResponseData) {}
  rpc DeleteUser (DeleteUserRequest) returns (ApiResponseData) {}
  rpc ListUsers (ListUsersRequest) returns (ApiPaginatedResponseData) {}
}
```

### Adding New Services

1. Create a new proto file in `src/proto/services/`
2. Define your service and messages
3. Create a new module in `src/modules/`
4. Add the module to `app.module.ts`
5. Update the gRPC configuration in `main.ts`

## 🗄️ Database

### TypeORM Integration

The template uses TypeORM with PostgreSQL:

```typescript
OrmModule.forRootAsync({
    type: 'postgres',
    autoLoadEntities: true,
    entities: [...CORE_ENTITIES],
    url: configService.databaseUrl,
    // ... configuration
});
```

### Entity Example

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    email: string;
}
```

## 🚀 Deployment

### Docker

The template includes a multi-stage Dockerfile:

```dockerfile
# Development stage
FROM node:18-alpine AS dev
# ... development setup

# Production stage
FROM node:18-alpine AS production
# ... production setup
```

### Docker Compose

```yaml
services:
    api:
        build:
            context: .
            dockerfile: Dockerfile
            target: dev
        ports:
            - '50052:50052' # gRPC port
            - '9230:9229' # Debug port
```

### Production Deployment

1. Build the production image:

    ```bash
    docker build --target production -t your-app .
    ```

2. Set production environment variables
3. Deploy with your preferred orchestration tool

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Structure

```
test/
├── jest-e2e.json          # E2E test configuration
└── *.e2e-spec.ts          # E2E test files
```

## 📊 Monitoring & Health Checks

### Health Check Endpoints

The application includes built-in health checks for:

- Database connectivity
- Redis connectivity
- RabbitMQ connectivity
- Elasticsearch connectivity

### Logging

Structured logging with different levels for development and production:

```typescript
// Development: Detailed request/response logging
// Production: Error-focused logging
```

## 🔒 Security

- Input validation with Joi
- gRPC exception filtering
- Environment variable validation
- Type-safe configuration access

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

### Code Quality

The project enforces code quality through:

- ESLint configuration
- Prettier formatting
- Husky git hooks
- Commit message linting

## 📄 License

This template is licensed under the [UNLICENSED] license.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the example implementations

---

**Built with ❤️ using NestJS and gRPC**
