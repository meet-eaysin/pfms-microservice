import { z } from 'zod';

export const redisSchema = z.object({
  REDIS_URL: z.string().url().optional().describe('Redis connection URL'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().nonnegative().default(0),
  REDIS_CLUSTER: z
    .enum(['true', 'false'])
    .transform((val) => val === 'true')
    .default('false'),
  REDIS_CLUSTER_NODES: z.string().optional().describe('Comma-separated cluster nodes'),
  REDIS_POOL_SIZE: z.coerce.number().int().positive().default(5),
  REDIS_POOL_MIN: z.coerce.number().int().nonnegative().default(1),
  REDIS_FAMILY: z.coerce.number().int().default(4).describe('IP family (4 or 6)'),
  REDIS_RETRY_STRATEGY: z.enum(['exponential', 'fixed']).default('exponential'),
  REDIS_MAX_RETRIES: z.coerce.number().int().nonnegative().default(10),
  REDIS_TTL: z.coerce.number().int().positive().default(3600).describe('Default TTL in seconds'),
  REDIS_SOCKET_KEEPALIVE: z.coerce.number().int().nonnegative().default(30000),
});

export type RedisConfig = z.infer<typeof redisSchema>;
