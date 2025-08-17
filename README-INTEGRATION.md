# 🚀 Backend Integration Guide

## Overview

This guide shows how to integrate your NestJS backend with the ecom-be-stack services.

## 📁 File Structure

```
ecom-backend/
├── src/
│   └── modules/
│       └── config/
│           ├── config.module.ts
│           ├── config.service.ts
│           └── config.validation.ts  # ← Use backend-config-validation.ts
├── .env                              # ← Use backend.env
├── docker-compose.yml                # ← Use backend-docker-compose.yml (optional)
└── package.json
```

## 🔧 Setup Steps

### 1. **Copy Environment Configuration**

```bash
# Copy the backend environment file
cp backend.env ../ecom-backend/.env
```

### 2. **Update Config Validation**

Replace your `config.validation.ts` with the content from `backend-config-validation.ts`

### 3. **Start Services**

```bash
# Start all infrastructure services
./docker.sh up

# Test connections
./docker.sh test
```

### 4. **Start Backend**

```bash
cd ../ecom-backend
npm run start:dev
```

## 🔗 Connection Details

### **Database (PostgreSQL)**

- **URL:** `postgresql://dev_ecom:DevEcom_Secure2025#@localhost:5443/ecommerce_db`
- **Host:** localhost:5443
- **User:** dev_ecom (developer role)
- **Database:** ecommerce_db

### **Redis Cache**

- **URL:** `redis://dev_ecom:DevEcom_Cache2025$@localhost:6390/0`
- **Host:** localhost:6390
- **User:** dev_ecom (limited commands)

### **RabbitMQ**

- **URL:** `amqp://dev_ecom:DevEcom_Queue2025&@localhost:5683/ecommerce`
- **Host:** localhost:5683
- **User:** dev_ecom (publisher role)
- **VHost:** /ecommerce

### **Elasticsearch**

- **URL:** `http://localhost:9201`
- **Host:** localhost:9201
- **Auth:** None (development mode)

## 📊 Service Usage Examples

### **Database Usage**

```typescript
// In your service
@InjectRepository(User)
private readonly userRepository: BaseRepository<User>

// The DATABASE_URL will be used automatically by TypeORM
```

### **Redis Usage**

```typescript
// In your service
@InjectRedisFacade()
private readonly cache: RedisFacade

// Uses REDIS_URL automatically
await this.cache.set('key', 'value');
```

### **RabbitMQ Usage**

```typescript
// In your service
constructor(private readonly amqp: AmqpConnection) {}

// Uses RABBITMQ_URL automatically
await this.amqp.publish('exchange', 'routing.key', { data: 'test' });
```

### **Elasticsearch Usage**

```typescript
// In your service
@InjectEsRepository(ProductSearchDoc)
private readonly productRepo: EsRepository<ProductSearchDoc>

// Uses ELASTICSEARCH_URL automatically
await this.productRepo.index({ id: '1', name: 'Product' });
```

## 🛠️ Configuration Service Updates

Your `ConfigServiceApp` should work with these environment variables:

```typescript
// config.service.ts
export class ConfigServiceApp {
    // Database
    get databaseUrl(): string {
        return this.configService.get<string>('DATABASE_URL')!;
    }

    // Redis
    get redisUrl(): string {
        return this.configService.get<string>('REDIS_URL')!;
    }

    get redisHost(): string {
        return this.configService.get<string>('REDIS_HOST')!;
    }

    get redisPort(): number {
        return this.configService.get<number>('REDIS_PORT')!;
    }

    get redisPassword(): string | undefined {
        return this.configService.get<string>('REDIS_PASSWORD');
    }

    // RabbitMQ
    get rabbitmqUrl(): string {
        return this.configService.get<string>('RABBITMQ_URL')!;
    }

    // Elasticsearch
    get elasticsearchUrl(): string {
        return this.configService.get<string>('ELASTICSEARCH_URL')!;
    }

    // Swagger
    get swaggerTitle(): string {
        return this.configService.get<string>('SWAGGER_TITLE')!;
    }

    get swaggerDescription(): string {
        return this.configService.get<string>('SWAGGER_DESCRIPTION')!;
    }

    get swaggerVersion(): string {
        return this.configService.get<string>('SWAGGER_VERSION')!;
    }
}
```

## 🔍 Testing Connections

### **Test Database Connection**

```bash
# Test with psql
psql postgresql://dev_ecom:DevEcom_Secure2025#@localhost:5443/ecommerce_db -c "SELECT 1;"
```

### **Test Redis Connection**

```bash
# Test with redis-cli
redis-cli -h localhost -p 6390 --user dev_ecom --pass DevEcom_Cache2025$ ping
```

### **Test RabbitMQ Connection**

```bash
# Test management API
curl -u dev_ecom:DevEcom_Queue2025& http://localhost:15683/api/overview
```

### **Test Elasticsearch Connection**

```bash
# Test cluster health
curl http://localhost:9201/_cluster/health
```

## 🚨 Important Notes

1. **Use Developer Credentials:** The backend uses `dev_ecom` user with limited permissions
2. **Admin Operations:** Use admin credentials only for migrations and maintenance
3. **Port Mapping:** Services run on custom ports (5443, 6390, 5683, 9201)
4. **Network:** All services are on `ecom-network` for container communication
5. **Security:** Passwords are strong and role-based

## 🎯 Next Steps

1. **Remove Old Docker Compose:** Delete the old `docker-compose.yml` from backend
2. **Update Package Scripts:** Update npm scripts to use new service ports
3. **Test All Features:** Verify database, cache, queues, and search work
4. **Add Monitoring:** Consider adding health check endpoints
5. **Documentation:** Update API documentation with new connection details

## 🔧 Troubleshooting

### **Connection Refused Errors**

```bash
# Make sure services are running
./docker.sh status

# Check service logs
./docker.sh logs postgres
./docker.sh logs redis
```

### **Authentication Errors**

- Verify credentials in `.env` match the service configurations
- Check user permissions in database/redis/rabbitmq

### **Port Conflicts**

- Services use custom ports to avoid conflicts
- Update any hardcoded port references in your code

Your backend is now ready to use the centralized ecom-be-stack services! 🎉
