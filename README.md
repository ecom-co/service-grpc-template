# Template with New gRPC Architecture

This template demonstrates how to use the new `@ecom-co/grpc` library with hybrid architecture, centralized configuration, and type-safe discriminated union types.

## 🚀 Key Features Applied

### ✅ **Hybrid Architecture**

- Single app instance for HTTP + gRPC services
- No separate microservice instances
- Unified lifecycle management

### ✅ **Centralized Configuration**

- `GrpcConfigService` manages all configurations and runtime state
- Single source of truth for server/client configs
- Type-safe discriminated union types

### ✅ **Auto-Uppercase Naming**

- All service and client names automatically normalized
- Prevents case-related errors
- Consistent naming across the application

## 📁 Project Structure

```
src/
├── app.module.ts              # Main module with gRPC configs
├── main.ts                    # Bootstrap with hybrid architecture
├── modules/
│   ├── user/
│   │   ├── user.module.ts     # Feature module (can use gRPC clients)
│   │   ├── user.service.ts    # Service with decorators & client examples
│   │   └── user.grpc.controller.ts
│   └── config/
└── proto/                     # Protocol buffer definitions
```

## 🔧 Configuration

### **App Module Setup**

```typescript
// app.module.ts
const configs: GrpcConfig[] = [
    // Server configurations
    {
        name: 'user-service',
        type: 'server',
        package: 'user',
        port: 50052,
        protoPath: 'src/proto/services/user.proto',
        host: '0.0.0.0',
    },
    {
        name: 'app-service',
        type: 'server',
        package: 'app',
        port: 50053,
        protoPath: 'src/proto/app.proto',
        host: '0.0.0.0',
    },
    // Client configurations (example)
    // {
    //     name: 'notification-client',
    //     type: 'client',
    //     package: 'notification',
    //     protoPath: 'src/proto/services/notification.proto',
    //     url: 'localhost:50054'
    // }
];

@Module({
    imports: [
        GrpcModule.forRoot({
            configs: filter(configs, (c) => c.type === 'server'),
        }),
        // ... other modules
    ],
})
export class AppModule {}
```

### **Bootstrap with Hybrid Architecture**

```typescript
// main.ts
const bootstrap = async (): Promise<void> => {
    const app = await NestFactory.create(AppModule);

    // Set app instance for hybrid microservices
    const grpcStarter = app.get(GrpcStarter);
    grpcStarter.setApp(app);

    // Start all gRPC services (connects to main app)
    grpcStarter.start();

    // Initialize gRPC clients if any
    const configService = app.get(GrpcConfigService);
    const clientConfigs = configService.getClientConfigs();

    if (clientConfigs.length > 0) {
        await GrpcClientFactory.initializeClients(clientConfigs);
    }

    await app.listen(3000);
};
```

## 🎯 Using gRPC Clients in Feature Modules

### **1. Import GrpcClientModule in Feature Module**

```typescript
// user/user.module.ts
import { Module } from '@nestjs/common';
import { GrpcClientModule } from '@ecom-co/grpc';

@Module({
    imports: [
        OrmModule.forFeatureExtended([User]),
        // REQUIRED: Create providers for clients you want to use
        GrpcClientModule.forFeature(['notification-client', 'payment-client']),
    ],
    controllers: [UserGrpcController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
```

### **2. Inject Clients in Service**

```typescript
// user/user.service.ts
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { GrpcClient } from '@ecom-co/grpc';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: BaseRepository<User>,
        // Inject gRPC clients (auto-uppercase: 'notification-client' → 'NOTIFICATION-CLIENT')
        @GrpcClient('notification-client') private readonly notificationClient: ClientProxy,
        @GrpcClient('payment-client') private readonly paymentClient: ClientProxy,
    ) {}

    async getUserWithExternalData(userId: string) {
        const user = await this.findOne(userId);

        try {
            // Call notification service
            const notificationService = this.notificationClient.getService<any>('NotificationService');
            const notificationPrefs = await firstValueFrom(notificationService.GetUserPreferences({ userId }));

            // Call payment service
            const paymentService = this.paymentClient.getService<any>('PaymentService');
            const paymentMethods = await firstValueFrom(paymentService.GetUserPaymentMethods({ userId }));

            return {
                user: user.data,
                notificationPreferences: notificationPrefs,
                paymentMethods: paymentMethods,
            };
        } catch (error) {
            this.logger.error('Failed to get external data', { userId, error });
            return { user: user.data };
        }
    }
}
```

## 🎨 Using Decorators

The template includes examples of all available decorators:

```typescript
@Injectable()
export class UserService {
    // Performance monitoring
    @MonitorPerformance({ includeMemory: true, threshold: 500 })
    @TraceOperation({
        includeArgs: true,
        includeResult: false,
        operationName: 'user.create',
    })
    async create(dto: CreateUserDto) {
        // Method implementation
    }

    // Method result caching
    @Cacheable({ ttl: 300 }) // Cache for 5 minutes
    async findAll() {
        // Expensive operation
    }

    // All-in-one decorator
    @EnhancedOperation({
        operationName: 'createUser',
        cacheEnabled: true,
        cacheTtl: 600,
        performanceThreshold: 2000,
        includeArgs: true,
    })
    async createUser(userData: any) {
        // Auto: tracing + performance + caching
    }
}
```

## 🔍 Centralized Configuration Access

```typescript
@Injectable()
export class MyService {
    constructor(private readonly configService: GrpcConfigService) {}

    async someMethod() {
        // Get configurations
        const allConfigs = this.configService.getConfigs();
        const serverConfigs = this.configService.getServerConfigs();
        const clientConfigs = this.configService.getClientConfigs();

        // Get runtime state
        const runningServices = this.configService.getRunningServicesList();
        const usedPorts = this.configService.getUsedPorts();
        const isServiceRunning = this.configService.isServiceRunning('USER-SERVICE');

        // Get configuration options
        const basePort = this.configService.getBasePort();
        const host = this.configService.getHost();
        const isDev = this.configService.isDevelopment();
    }
}
```

## 🚀 Getting Started

1. **Install dependencies**:

    ```bash
    npm install
    ```

2. **Configure gRPC services** in `app.module.ts`

3. **Add client configurations** if needed

4. **Import GrpcClientModule** in feature modules that use clients

5. **Inject clients** using `@GrpcClient()` decorator

6. **Start the application**:
    ```bash
    npm run start:dev
    ```

## 📊 Benefits

- **Type Safety**: Discriminated union types prevent configuration errors
- **Hybrid Architecture**: Single app instance, no conflicts
- **Auto-Uppercase**: Consistent naming prevents errors
- **Centralized Config**: Single source of truth for all configurations
- **Clean Injection**: Simple `@GrpcClient()` decorator for client injection
- **Production Ready**: Built-in monitoring, tracing, and caching

## 🔧 Migration from Old Architecture

The template shows the complete migration from the old architecture to the new one:

- ✅ Updated `app.module.ts` with discriminated union types
- ✅ Updated `main.ts` with hybrid bootstrap
- ✅ Added examples for client usage in feature modules
- ✅ Maintained all existing functionality
- ✅ Added comprehensive error handling examples
