import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

// ============================================
// Configuration Schemas
// ============================================

const ServerConfigSchema = z.object({
  SERVICE_PORT: z.number().default(3001),
  SERVICE_NAME: z.string().default('auth-service'),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('*'),
  ENABLE_SWAGGER: z.boolean().default(false),
});

const AuthConfigSchema = z.object({
  BETTER_AUTH_SECRET: z
    .string()
    .min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  PASSWORD_MIN_LENGTH: z.number().default(8),
  EMAIL_VERIFICATION_ENABLED: z.boolean().default(true),
  SESSION_ABSOLUTE_TIMEOUT_HOURS: z.number().default(24),
  SESSION_IDLE_TIMEOUT_HOURS: z.number().default(2),
  BETTER_AUTH_COOKIE_NAME: z.string().default('better-auth'),
  BETTER_AUTH_COOKIE_MAX_AGE: z.number().default(2592000), // 30 days
  BETTER_AUTH_COOKIE_SECURE: z.boolean().default(true),
  BETTER_AUTH_COOKIE_SAME_SITE: z
    .enum(['strict', 'lax', 'none'])
    .default('lax'),
  // OAuth Providers
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().optional(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),
  APPLE_REDIRECT_URI: z.string().optional(),
});

const RabbitMQConfigSchema = z.object({
  RABBITMQ_HOST: z.string().default('localhost'),
  RABBITMQ_PORT: z.number().default(5672),
  RABBITMQ_USER: z.string().default('guest'),
  RABBITMQ_PASSWORD: z.string().default('guest'),
  RABBITMQ_VHOST: z.string().default('/'),
});

const RedisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.number().default(0),
});

const AuthServiceConfigSchema = z.object({
  server: ServerConfigSchema,
  auth: AuthConfigSchema,
  rabbitmq: RabbitMQConfigSchema,
  redis: RedisConfigSchema,
});

// ============================================
// Types
// ============================================

export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type AuthConfig = z.infer<typeof AuthConfigSchema>;
export type RabbitMQConfig = z.infer<typeof RabbitMQConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type AuthServiceConfig = z.infer<typeof AuthServiceConfigSchema>;

// ============================================
// Config Loader
// ============================================

export function loadAuthServiceConfig(): AuthServiceConfig {
  const rawConfig = {
    server: {
      SERVICE_PORT: process.env.SERVICE_PORT
        ? Number(process.env.SERVICE_PORT)
        : 3001,
      SERVICE_NAME: process.env.SERVICE_NAME || 'auth-service',
      HOST: process.env.HOST || '0.0.0.0',
      CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
      ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === 'true',
    },
    auth: {
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || '',
      DATABASE_URL: process.env.DATABASE_URL || '',
      PASSWORD_MIN_LENGTH: process.env.PASSWORD_MIN_LENGTH
        ? Number(process.env.PASSWORD_MIN_LENGTH)
        : 8,
      EMAIL_VERIFICATION_ENABLED:
        process.env.EMAIL_VERIFICATION_ENABLED !== 'false',
      SESSION_ABSOLUTE_TIMEOUT_HOURS: process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS
        ? Number(process.env.SESSION_ABSOLUTE_TIMEOUT_HOURS)
        : 24,
      SESSION_IDLE_TIMEOUT_HOURS: process.env.SESSION_IDLE_TIMEOUT_HOURS
        ? Number(process.env.SESSION_IDLE_TIMEOUT_HOURS)
        : 2,
      BETTER_AUTH_COOKIE_NAME:
        process.env.BETTER_AUTH_COOKIE_NAME || 'better-auth',
      BETTER_AUTH_COOKIE_MAX_AGE: process.env.BETTER_AUTH_COOKIE_MAX_AGE
        ? Number(process.env.BETTER_AUTH_COOKIE_MAX_AGE)
        : 2592000,
      BETTER_AUTH_COOKIE_SECURE:
        process.env.BETTER_AUTH_COOKIE_SECURE !== 'false',
      BETTER_AUTH_COOKIE_SAME_SITE:
        (process.env.BETTER_AUTH_COOKIE_SAME_SITE as
          | 'strict'
          | 'lax'
          | 'none') || 'lax',
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      GITHUB_REDIRECT_URI: process.env.GITHUB_REDIRECT_URI,
      APPLE_CLIENT_ID: process.env.APPLE_CLIENT_ID,
      APPLE_TEAM_ID: process.env.APPLE_TEAM_ID,
      APPLE_KEY_ID: process.env.APPLE_KEY_ID,
      APPLE_PRIVATE_KEY: process.env.APPLE_PRIVATE_KEY,
      APPLE_REDIRECT_URI: process.env.APPLE_REDIRECT_URI,
    },
    rabbitmq: {
      RABBITMQ_HOST: process.env.RABBITMQ_HOST || 'localhost',
      RABBITMQ_PORT: process.env.RABBITMQ_PORT
        ? Number(process.env.RABBITMQ_PORT)
        : 5672,
      RABBITMQ_USER: process.env.RABBITMQ_USER || 'guest',
      RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD || 'guest',
      RABBITMQ_VHOST: process.env.RABBITMQ_VHOST || '/',
    },
    redis: {
      REDIS_HOST: process.env.REDIS_HOST || 'localhost',
      REDIS_PORT: process.env.REDIS_PORT
        ? Number(process.env.REDIS_PORT)
        : 6379,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_DB: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
    },
  };

  try {
    return AuthServiceConfigSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Configuration validation failed:');
      error.errors.forEach((err) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error(
        'Invalid configuration. Please check your environment variables.',
      );
    }
    throw error;
  }
}
