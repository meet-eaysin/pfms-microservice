import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

/**
 * HealthController - Provides health check endpoints for monitoring
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ledger-service',
      checks: {
        database: 'unknown',
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }

    return health;
  }

  @Get('ready')
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return { status: 'not ready', error: message };
    }
  }

  @Get('live')
  live() {
    return { status: 'alive' };
  }
}
