import * as Joi from 'joi';

export interface EnvironmentVariables {
    // Application Configuration
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;

    // Database Configuration
    DATABASE_URL: string;

    // Redis Configuration
    REDIS_URL: string;

    // RabbitMQ Configuration
    RABBITMQ_URL: string;

    // Elasticsearch Configuration (optional)
    ELASTICSEARCH_URL?: string;
    ELASTICSEARCH_USERNAME?: string;
    ELASTICSEARCH_PASSWORD?: string;

    // gRPC Configuration
    GRPC_PORT?: number;
    GRPC_PACKAGE?: string;
    GRPC_PROTO_PATH?: string;

    // Tracing Configuration
    JAEGER_ENDPOINT?: string;
}

export const validate = (config: Record<string, unknown>): EnvironmentVariables => {
    const result = validationSchema.validate(config, {
        allowUnknown: true,
        abortEarly: false,
    });

    if (result.error) {
        throw new Error(`Config validation error: ${result.error.message}`);
    }

    return result.value as EnvironmentVariables;
};

export const validationSchema = Joi.object({
    // Application Configuration
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().port().default(3012),

    // Database Configuration - Use string instead of uri for flexibility
    DATABASE_URL: Joi.string().required().description('Database URL for the PostgreSQL server'),

    // Redis Configuration - Use string instead of uri
    REDIS_URL: Joi.string().required().description('Redis URL for the Redis server'),

    // RabbitMQ Configuration - Use string instead of uri
    RABBITMQ_URL: Joi.string().required().description('AMQP URL for the RabbitMQ server'),

    // Elasticsearch Configuration (optional) - Use string instead of uri
    ELASTICSEARCH_URL: Joi.string().default('http://localhost:9200').description('Elasticsearch URL'),
    ELASTICSEARCH_USERNAME: Joi.string().optional().description('Elasticsearch username'),
    ELASTICSEARCH_PASSWORD: Joi.string().optional().description('Elasticsearch password'),

    // gRPC Configuration
    GRPC_PORT: Joi.number().default(50051),
    GRPC_PACKAGE: Joi.string().default('app'),
    GRPC_PROTO_PATH: Joi.string().default('src/proto/services/user.proto'),

    // Tracing Configuration
    JAEGER_ENDPOINT: Joi.string().optional().description('Jaeger collector endpoint for distributed tracing'),
});
