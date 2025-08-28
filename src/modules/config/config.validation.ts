import * as Joi from 'joi';

export interface EnvironmentVariables {
    // Database Configuration
    DATABASE_URL: string;
    // gRPC Configuration
    GRPC_PACKAGE?: string;

    GRPC_PORT?: number;
    GRPC_PROTO_PATH?: string;
    // Tracing Configuration
    JAEGER_ENDPOINT?: string;

    // JWT Configuration for auth (access token)
    JWT_ACCESS_TOKEN_EXPIRATION_TIME: number;
    JWT_ACCESS_TOKEN_PRIVATE_KEY: string;
    JWT_ACCESS_TOKEN_PUBLIC_KEY: string;

    // JWT Configuration for auth (refresh token)
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: number;
    JWT_REFRESH_TOKEN_PRIVATE_KEY: string;
    JWT_REFRESH_TOKEN_PUBLIC_KEY: string;

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
    // gRPC Configuration
    GRPC_PACKAGE: Joi.string().default('app'),

    GRPC_PORT: Joi.number().default(50053),
    GRPC_PROTO_PATH: Joi.string().default('src/proto/services/user.proto'),
    // Tracing Configuration
    JAEGER_ENDPOINT: Joi.string().optional().description('Jaeger collector endpoint for distributed tracing'),

    // JWT Configuration for auth (access token)
    JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.number()
        .required()
        .description('JWT access token expiration time in seconds')
        .default(3600),
    JWT_ACCESS_TOKEN_PRIVATE_KEY: Joi.string().required().description('JWT access token private key'),
    JWT_ACCESS_TOKEN_PUBLIC_KEY: Joi.string().required().description('JWT access token public key'),
    // JWT Configuration for auth (refresh token)
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.number()
        .required()
        .description('JWT refresh token expiration time in seconds')
        .default(86400),
    JWT_REFRESH_TOKEN_PRIVATE_KEY: Joi.string().required().description('JWT refresh token private key'),
    JWT_REFRESH_TOKEN_PUBLIC_KEY: Joi.string().required().description('JWT refresh token public key'),

    // Application Configuration
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().port().default(3012),
    // RabbitMQ Configuration - Use string instead of uri
    RABBITMQ_URL: Joi.string().required().description('AMQP URL for the RabbitMQ server'),
    // Redis Configuration - Use string instead of uri
    REDIS_URL: Joi.string().required().description('Redis URL for the Redis server'),
});
