import {
  redisSchema,
  rabbitmqSchema,
  jwtSchema,
  loggingSchema,
  serverSchema,
  authSchema,
  type RedisConfig,
  type RabbitMQConfig,
  type JWTConfig,
  type LoggingConfig,
  type ServerConfig,
  type AuthConfig,
} from '../schemas';
import { loadConfig } from '../utils';

export type { RedisConfig, RabbitMQConfig, JWTConfig, LoggingConfig, ServerConfig, AuthConfig };

/**
 * Load all application configuration from environment variables
 * Note: Database config is now service-specific, not included here
 */
export interface AppConfig {
  server: ServerConfig;
  redis: RedisConfig;
  rabbitmq: RabbitMQConfig;
  jwt: JWTConfig;
  logging: LoggingConfig;
  auth: AuthConfig;
}

export const loadAppConfig = (): AppConfig => {
  return {
    server: loadConfig(serverSchema),
    redis: loadConfig(redisSchema),
    rabbitmq: loadConfig(rabbitmqSchema),
    jwt: loadConfig(jwtSchema),
    logging: loadConfig(loggingSchema),
    auth: loadConfig(authSchema),
  };
};

/**
 * Singleton configuration instance
 */
let appConfig: AppConfig | null = null;

/**
 * Initialize and cache app configuration
 */
export const initializeConfig = (): AppConfig => {
  if (!appConfig) {
    appConfig = loadAppConfig();
  }
  return appConfig;
};

/**
 * Get the cached app configuration
 */
export const getConfig = (): AppConfig => {
  if (!appConfig) {
    throw new Error('Configuration not initialized. Call initializeConfig() first.');
  }
  return appConfig;
};

/**
 * Reset configuration (useful for testing)
 */
export const resetConfig = (): void => {
  appConfig = null;
};

/**
 * Load individual configuration sections
 * (Database config moved to per-service implementations)
 */

export const loadRedisConfig = (): RedisConfig => {
  return loadConfig(redisSchema);
};

export const loadRabbitMQConfig = (): RabbitMQConfig => {
  return loadConfig(rabbitmqSchema);
};

export const loadJWTConfig = (): JWTConfig => {
  const config = loadConfig(jwtSchema);
  return {
    ...config,
    JWT_REFRESH_SECRET: config.JWT_REFRESH_SECRET || config.JWT_SECRET,
  };
};

export const loadLoggingConfig = (): LoggingConfig => {
  return loadConfig(loggingSchema);
};

export const loadServerConfig = (): ServerConfig => {
  return loadConfig(serverSchema);
};

export const loadAuthConfig = (): AuthConfig => {
  return loadConfig(authSchema);
};
