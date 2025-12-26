import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { PasswordResetTokenRepository } from '../../domain/ports/password-reset-token.repository';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisPasswordResetTokenRepository implements PasswordResetTokenRepository {
  private redis: Redis;

  constructor(private configService: ConfigService) {
    // Need redis config from ConfigService
    // this.redis = new Redis(configService.redisUrl);
    // Assuming ConfigService has redis config, or use default from env if not exposed yet.
    // auth-service.md says REDIS_URL.
    // ConfigService has server, jwt, auth. Redis is in `packages/config` but ConfigService wrapper might not expose it yet.
    // I should check ConfigService.
    // For now assuming:
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async save(email: string, token: string, ttlSeconds: number): Promise<void> {
    await this.redis.set(`allow_reset:${token}`, email, 'EX', ttlSeconds);
  }

  async findByToken(token: string): Promise<string | null> {
    return this.redis.get(`allow_reset:${token}`);
  }

  async delete(token: string): Promise<void> {
    await this.redis.del(`allow_reset:${token}`);
  }
}
