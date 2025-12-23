import { z } from 'zod';

export const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default('localhost'),
  SERVICE_NAME: z.string().default('unknown-service').describe('Microservice name'),
  SERVICE_VERSION: z.string().default('1.0.0'),
  API_VERSION: z.string().default('v1'),
  API_BASE_PATH: z.string().default('/api'),
  CORS_ORIGIN: z.string().default('*').describe('CORS origin(s), comma-separated or *'),
  CORS_CREDENTIALS: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
  CORS_MAX_AGE: z.coerce.number().int().nonnegative().default(3600),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000).describe('15 minutes'),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  ENABLE_SWAGGER: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  SWAGGER_PATH: z.string().default('/api/docs'),
  ENABLE_METRICS: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('true'),
  METRICS_PORT: z.coerce.number().int().positive().optional(),
  REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  KEEP_ALIVE_TIMEOUT: z.coerce.number().int().positive().default(65000),
  GRACEFUL_SHUTDOWN_TIMEOUT: z.coerce.number().int().positive().default(30000),
});

export type ServerConfig = z.infer<typeof serverSchema>;
