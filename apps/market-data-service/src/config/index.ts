import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const ServerConfigSchema = z.object({
  SERVICE_PORT: z.number().default(3013),
  SERVICE_NAME: z.string().default('market-data-service'),
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
  REDIS_TTL: z.number().default(900), // 15 minutes default for market data
});

const RabbitMQConfigSchema = z.object({
  host: z.string().default('localhost'),
  port: z.number().default(5672),
  username: z.string().default('guest'),
  password: z.string().default('guest'),
  vhost: z.string().default('/'),
});

const MarketProvidersConfigSchema = z.object({
  YAHOO_API_KEY: z.string().optional(),
  COINGECKO_API_KEY: z.string().optional(),
  ALPHA_VANTAGE_API_KEY: z.string().optional(),
});

const MarketDataServiceConfigSchema = z.object({
  server: ServerConfigSchema,
  database: DatabaseConfigSchema,
  redis: RedisConfigSchema,
  rabbitmq: RabbitMQConfigSchema,
  providers: MarketProvidersConfigSchema,
});

export type ServerConfig = z.infer<typeof ServerConfigSchema>;
export type DatabaseConfig = z.infer<typeof DatabaseConfigSchema>;
export type RedisConfig = z.infer<typeof RedisConfigSchema>;
export type RabbitMQConfig = z.infer<typeof RabbitMQConfigSchema>;
export type MarketProvidersConfig = z.infer<typeof MarketProvidersConfigSchema>;
export type MarketDataServiceConfig = z.infer<typeof MarketDataServiceConfigSchema>;

export function loadMarketDataServiceConfig(): MarketDataServiceConfig {
  const rawConfig = {
    server: {
      SERVICE_PORT: process.env.SERVICE_PORT ? Number(process.env.SERVICE_PORT) : 3013,
      SERVICE_NAME: process.env.SERVICE_NAME ?? 'market-data-service',
      HOST: process.env.HOST ?? '0.0.0.0',
      CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
    },
    database: {
      DATABASE_URL: process.env.DATABASE_URL ?? '',
    },
    redis: {
      REDIS_HOST: process.env.REDIS_HOST ?? 'localhost',
      REDIS_PORT: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
      REDIS_PASSWORD: process.env.REDIS_PASSWORD,
      REDIS_DB: process.env.REDIS_DB ? Number(process.env.REDIS_DB) : 0,
      REDIS_TTL: process.env.REDIS_TTL ? Number(process.env.REDIS_TTL) : 900,
    },
    rabbitmq: {
      host: process.env.RABBITMQ_HOST ?? 'localhost',
      port: process.env.RABBITMQ_PORT ? Number(process.env.RABBITMQ_PORT) : 5672,
      username: process.env.RABBITMQ_USER ?? 'guest',
      password: process.env.RABBITMQ_PASSWORD ?? 'guest',
      vhost: process.env.RABBITMQ_VHOST ?? '/',
    },
    providers: {
      YAHOO_API_KEY: process.env.YAHOO_API_KEY,
      COINGECKO_API_KEY: process.env.COINGECKO_API_KEY,
      ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY,
    },
  };

  try {
    return MarketDataServiceConfigSchema.parse(rawConfig);
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
