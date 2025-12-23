// ============================================
// Config Schemas (Service-Independent)
// Each service can import individual schemas
// Database schemas moved to per-service
// ============================================

export { redisSchema, type RedisConfig } from './redis.schema';
export { rabbitmqSchema, type RabbitMQConfig } from './rabbitmq.schema';
export { jwtSchema, type JWTConfig } from './jwt.schema';
export { loggingSchema, type LoggingConfig } from './logging.schema';
export { serverSchema, type ServerConfig } from './server.schema';
export { authSchema, type AuthConfig } from './auth.schema';
