import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { PasswordResetTokenRepository } from '../../domain/ports/password-reset-token.repository';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisPasswordResetTokenRepository implements PasswordResetTokenRepository {
  private redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis(this.configService.redis.REDIS_URL || 'redis://localhost:6379');
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
