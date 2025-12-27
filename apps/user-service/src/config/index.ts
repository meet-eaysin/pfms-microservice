import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// Configuration Schemas
// ============================================

const ServerConfigSchema = z.object({
  SERVICE_PORT: z.number().default(3002),
  SERVICE_NAME: z.string().default('user-service'),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('*'),
});

const DatabaseConfigSchema = z.object({
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
});

const RedisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.number().default(0),
  REDIS_TTL: z.number().default(3600), // 1 hour default
});

const RabbitMQConfigSchema = z.object({
  RABBITMQ_HOST: z.string().default('localhost'),
  RABBITMQ_PORT: z.number().default(5672),
  RABBITMQ_USER: z.string().default('guest'),
  RABBITMQ_PASSWORD: z.string().default('guest'),
  RABBITMQ_VHOST: z.string().default('/'),
});

const StorageConfigSchema = z.object({
  S3_ENDPOINT: z.string().url('S3_ENDPOINT must be a valid URL'),
  S3_REGION: z.string().default('us-east-1'),
  S3_BUCKET: z.string().min(1, 'S3_BUCKET is required'),
  S3_ACCESS_KEY: z.string().min(1, 'S3_ACCESS_KEY is required'),
  S3_SECRET_KEY: z.string().min(1, 'S3_SECRET_KEY is required'),
  S3_USE_SSL: z.boolean().default(true),
});

const AuthConfigSchema = z.object({
  AUTH_SERVICE_URL: z.string().url('AUTH_SERVICE_URL must be a valid URL'),
});

const UserServiceConfigSchema = z.object({
  server: ServerConfigSchema,
  database: DatabaseConfigSchema,
  redis: RedisConfigSchema,
  rabbitmq: RabbitMQConfigSchema,
  storage: StorageConfigSchema,
  auth: AuthConfigSchema,
});

// ============================================
// Types
// ============================================

export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type RabbitMQConfig = z.infer<typeof RabbitMQConfigSchema>;
export type StorageConfig = z.infer<typeof StorageConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type UserServiceConfig = z.infer<typeof UserServiceConfigSchema>;

// ============================================
// Config Loader
// ============================================

export function loadUserServiceConfig(): UserServiceConfig {
  const rawConfig = {
    server: {
      SERVICE_PORT:
        process.env.SERVICE_PORT !== undefined ? Number(process.env.SERVICE_PORT) : 3002,
      SERVICE_NAME: process.env.SERVICE_NAME ?? 'user-service',
      HOST: process.env.HOST ?? '0.0.0.0',
      CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
    },
    database: {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
    },
    redis: {
      REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
      REDIS_PORT: process.env.REDIS_PORT !== undefined ? Number(process.env.REDIS_PORT) : 6379,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_DB: process.env.REDIS_DB !== undefined ? Number(process.env.REDIS_DB) : 0,
      REDIS_TTL: process.env.REDIS_TTL !== undefined ? Number(process.env.REDIS_TTL) : 3600,
    },
    rabbitmq: {
      RABBITMQ_HOST: process.env.RABBITMQ_HOST ?? 'localhost',
      RABBITMQ_PORT:
        process.env.RABBITMQ_PORT !== undefined ? Number(process.env.RABBITMQ_PORT) : 5672,
      RABBITMQ_USER: process.env.RABBITMQ_USER ?? 'guest',
      RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD ?? 'guest',
      RABBITMQ_VHOST: process.env.RABBITMQ_VHOST ?? '/',
    },
    storage: {
      S3_ENDPOINT: process.env.S3_ENDPOINT ?? '',
      S3_REGION: process.env.S3_REGION ?? 'us-east-1',
      S3_BUCKET: process.env.S3_BUCKET ?? '',
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? '',
      S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? '',
      S3_USE_SSL: process.env.S3_USE_SSL !== 'false',
    },
    auth: {
      AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL ?? '',
    },
  };

  try {
    return UserServiceConfigSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid configuration. Please check your environment variables.');
    }
    throw error;
  }
}
