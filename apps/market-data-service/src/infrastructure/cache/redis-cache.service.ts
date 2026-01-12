import Redis from 'ioredis';
import { createLogger } from '@pfms/config';
import type { ICacheService } from '@/domain/interfaces/repository.interface';
import type { RedisConfig, MarketDataServiceConfig } from '@/config';

const logger = createLogger('RedisCacheService');

export class RedisCacheService implements ICacheService {
  private readonly redis: Redis;
  private readonly defaultTtl: number;

  constructor(config: RedisConfig) {
    this.redis = new Redis({
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD,
      db: config.REDIS_DB,
    });
    this.defaultTtl = config.REDIS_TTL;

    this.redis.on('error', (err) => {
      logger.error('Redis error', { error: err });
    });
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds ?? this.defaultTtl;
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('Failed to parse cached data', { key, error });
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export function createRedisCacheService(config: MarketDataServiceConfig): ICacheService {
  return new RedisCacheService(config.redis);
}
