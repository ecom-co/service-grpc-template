import * as Joi from 'joi';

export interface EnvironmentVariables {
    // Database Configuration
    DATABASE_URL: string;
    // Elasticsearch Configuration (optional)
    ELASTICSEARCH_PASSWORD?: string;

    ELASTICSEARCH_URL?: string;

    ELASTICSEARCH_USERNAME?: string;

    // gRPC Configuration
    GRPC_PACKAGE?: string;

    GRPC_PORT?: number;
    GRPC_PROTO_PATH?: string;
    // Tracing Configuration
    JAEGER_ENDPOINT?: string;

    // Application Configuration
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    // RabbitMQ Configuration
    RABBITMQ_URL: string;

    // Redis Configuration
    REDIS_URL: string;
}

export const validate = (config: Record<string, unknown>): EnvironmentVariables => {
    const result = validationSchema.validate(config, {
        abortEarly: false,
        allowUnknown: true,
    });

    if (result.error) {
        throw new Error(`Config validation error: ${result.error.message}`);
    }

    return result.value as EnvironmentVariables;
};

export const validationSchema = Joi.object({
    // Database Configuration - Use string instead of uri for flexibility
    DATABASE_URL: Joi.string().required().description('Database URL for the PostgreSQL server'),
    // Elasticsearch Configuration (optional) - Use string instead of uri
    ELASTICSEARCH_PASSWORD: Joi.string().optional().description('Elasticsearch password'),

    ELASTICSEARCH_URL: Joi.string().default('http://localhost:9200').description('Elasticsearch URL'),

    ELASTICSEARCH_USERNAME: Joi.string().optional().description('Elasticsearch username'),

    // gRPC Configuration
    GRPC_PACKAGE: Joi.string().default('app'),

    GRPC_PORT: Joi.number().default(50051),
    GRPC_PROTO_PATH: Joi.string().default('src/proto/services/user.proto'),
    // Tracing Configuration
    JAEGER_ENDPOINT: Joi.string().optional().description('Jaeger collector endpoint for distributed tracing'),

    // Application Configuration
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().port().default(3012),
    // RabbitMQ Configuration - Use string instead of uri
    RABBITMQ_URL: Joi.string().required().description('AMQP URL for the RabbitMQ server'),

    // Redis Configuration - Use string instead of uri
    REDIS_URL: Joi.string().required().description('Redis URL for the Redis server'),
});
