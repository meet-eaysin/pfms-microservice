import Redis from 'ioredis';
import type { ICacheService } from '../../domain/interfaces/repository.interface';
import type { RedisConfig } from '../../config';
import { createLogger } from '@pfms/utils';

const logger = createLogger('RedisCache');

export class RedisCacheService implements ICacheService {
  private readonly client: Redis;

  constructor(config: RedisConfig) {
    this.client = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      db: config.REDIS_DB,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      logger.info('✅ Redis connected');
    });

    this.client.on('error', (error) => {
      logger.error('Redis error', { error });
    });
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      logger.error('Cache get error', { error, key });
      return null;
    }
  }

  async set(options: { key: string; value: unknown; ttl?: number }): Promise<void> {
    try {
      const serialized = JSON.stringify(options.value);
      if (options.ttl !== undefined && options.ttl > 0) {
        await this.client.setex(options.key, options.ttl, serialized);
      } else {
        await this.client.set(options.key, serialized);
      }
    } catch (error) {
      logger.error('Cache set error', { error, key: options.key });
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete error', { error, key });
    }
  }

  async flush(): Promise<void> {
    try {
      await this.client.flushdb();
    } catch (error) {
      logger.error('Cache flush error', { error });
    }
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

export function createRedisCacheService(config: RedisConfig): RedisCacheService {
  return new RedisCacheService(config);
}
