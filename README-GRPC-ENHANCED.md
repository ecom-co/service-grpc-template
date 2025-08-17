# Enhanced gRPC Implementation Guide

This document describes how the enhanced gRPC library with scale features is implemented in the template project.

## Overview

The template now uses the enhanced `@ecom-co/grpc` library v1.0.0 with the following scale features:

- **Service Discovery**: Memory-based service registry
- **Circuit Breaker**: Fault tolerance with configurable thresholds
- **Health Checks**: Automated service health monitoring
- **Distributed Tracing**: Request tracing with Jaeger integration
- **Clustering**: Multi-node coordination and leader election

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Required
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ecom_backend
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost:5672
ELASTICSEARCH_URL=http://localhost:9200

# Optional - Enhanced Features
JAEGER_ENDPOINT=http://localhost:14268/api/traces
REGION=local
HOSTNAME=localhost
```

### Module Configuration

The enhanced gRPC module is configured in `src/app.module.ts`:

```typescript
GrpcModule.forRootAsync({
    inject: [ConfigServiceApp],
    useFactory: (configService: ConfigServiceApp) => ({
        services: [
            {
                name: 'User Service',
                package: 'user',
                protoPath: 'src/proto/services/user.proto',
                port: 50052,
                enabled: true,
            },
        ],

        // Scale features
        serviceDiscovery: { provider: 'memory' },
        circuitBreaker: {
            failureThreshold: 5,
            recoveryTimeout: 30000,
            monitoringPeriod: 60000,
            expectedErrors: ['UNAVAILABLE', 'DEADLINE_EXCEEDED', 'CANCELLED'],
        },
        healthCheck: {
            interval: 30000,
            timeout: 5000,
            retries: 3,
        },
        tracing: {
            serviceName: 'ecom-backend-dev',
            samplingRate: 1.0, // 100% in dev
            jaegerEndpoint: configService.jaegerEndpoint,
            tags: {
                'service.version': '1.0.0',
                environment: 'development',
                region: 'local',
            },
        },
        cluster: {
            nodeId: 'ecom-backend-localhost-1234567890',
            nodes: [],
            leaderElection: true,
            heartbeatInterval: 10000,
            electionTimeout: 30000,
        },
    }),
});
```

## Usage Examples

### Service Layer Enhancement

The `UserService` now uses the enhanced `ServiceManager`:

```typescript
import { ServiceManager } from '@ecom-co/grpc';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: BaseRepository<User>,
        private readonly serviceManager: ServiceManager,
    ) {}

    async create(dto: CreateUserDto) {
        return await this.serviceManager.executeWithEnhancements(async () => {
            const result = await this.userRepository.findOneOrCreate({ name: dto.name }, { isActive: true });

            return new ApiResponseData({
                data: new UserResponseDto(result),
                message: 'User created successfully',
                statusCode: 201,
            });
        }, 'user.create');
    }

    async getServiceHealth() {
        const serviceStatus = this.serviceManager.getEnhancedServiceStatus();
        const clusterInfo = this.serviceManager.getClusterInfo();

        return {
            service: 'user-service',
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: serviceStatus.services?.length || 0,
            cluster: clusterInfo,
            circuitBreaker: serviceStatus.circuitBreaker,
        };
    }

    async discoverUserServices() {
        const instances = await this.serviceManager.discoverServices('User Service');
        return instances;
    }
}
```

### gRPC Controller Enhancement

The `UserGrpcController` exposes enhanced endpoints:

```typescript
@Controller()
export class UserGrpcController {
    constructor(private readonly userService: UserService) {}

    @GrpcMethod('UserService', 'CreateUser')
    async createUser(data: CreateUserDto) {
        return await this.userService.create(data);
    }

    @GrpcMethod('UserService', 'GetHealth')
    async getHealth() {
        return await this.userService.getServiceHealth();
    }

    @GrpcMethod('UserService', 'DiscoverServices')
    async discoverServices() {
        return await this.userService.discoverUserServices();
    }
}
```

## Scale Features in Action

### 1. Circuit Breaker

- Automatically opens circuit after 5 consecutive failures
- Waits 30 seconds before attempting recovery
- Monitors failures over 60-second windows
- Handles expected gRPC errors gracefully

### 2. Service Discovery

- Uses in-memory registry for development
- Services auto-register on startup
- Can discover other service instances
- Supports service health tracking

### 3. Health Monitoring

- Checks service health every 30 seconds
- 5-second timeout per health check
- Retries 3 times before marking unhealthy
- Exposes health status via gRPC endpoint

### 4. Distributed Tracing

- Traces all service calls with Jaeger
- 100% sampling in development
- Automatic span creation and correlation
- Custom tags for environment tracking

### 5. Clustering

- Unique node identification
- Leader election support
- Heartbeat mechanism (10s intervals)
- Election timeout (30s)

## Testing the Implementation

### 1. Start the Services

```bash
# Start infrastructure (Redis, PostgreSQL, RabbitMQ, Elasticsearch)
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
pnpm install

# Start the application
pnpm run start:dev
```

### 2. Test gRPC Endpoints

```bash
# Test health endpoint
grpcurl -plaintext localhost:50052 UserService/GetHealth

# Test service discovery
grpcurl -plaintext localhost:50052 UserService/DiscoverServices

# Test user operations with circuit breaker
grpcurl -plaintext -d '{"name":"John Doe","email":"john@example.com"}' localhost:50052 UserService/CreateUser
```

### 3. Monitor Traces (Optional)

If Jaeger is running:

```bash
# Start Jaeger (optional)
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 14268:14268 \
  jaegertracing/all-in-one:latest

# View traces at http://localhost:16686
```

## Benefits

1. **Resilience**: Circuit breaker prevents cascade failures
2. **Observability**: Full tracing and health monitoring
3. **Scalability**: Service discovery and clustering support
4. **Reliability**: Automatic failure detection and recovery
5. **Performance**: Enhanced error handling and retry logic

## Next Steps

1. **Production Setup**: Configure external service discovery (Consul/etcd)
2. **Monitoring**: Set up Grafana dashboards for metrics
3. **Alerting**: Configure alerts based on health checks
4. **Load Testing**: Test circuit breaker under load
5. **Documentation**: Update proto files with new methods
