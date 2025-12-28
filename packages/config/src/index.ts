import dotenv from 'dotenv';
import { z } from 'zod';

export { z };

dotenv.config();

export * from './logger';
export { loadConfig } from './utils';

// ============================================
// Individual Config Loaders
// (Each service loads what it needs independently)
// ============================================

export {
  loadServerConfig,
  loadRedisConfig,
  loadRabbitMQConfig,
  loadJWTConfig,
  loadLoggingConfig,
  loadAuthConfig,
  type ServerConfig,
  type RedisConfig,
  type RabbitMQConfig,
  type JWTConfig,
  type LoggingConfig,
  type AuthConfig,
} from './loader/config.loader';

// ============================================
// Config Schemas
// (For validation and type checking)
// ============================================

export { serverSchema } from './schemas/server.schema';
export { redisSchema } from './schemas/redis.schema';
export { rabbitmqSchema } from './schemas/rabbitmq.schema';
export { jwtSchema } from './schemas/jwt.schema';
export { loggingSchema } from './schemas/logging.schema';
export { authSchema } from './schemas/auth.schema';

// ============================================
// Environment Validator
// (Runtime validation with Zod)
// ============================================

export {
  validateEnv,
  tryValidateEnv,
  getEnv,
  checkRequiredEnv,
  envSchema,
  type Env,
} from './env-validator';
