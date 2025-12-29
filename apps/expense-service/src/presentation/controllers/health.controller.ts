import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/persistence/prisma.service';

/**
 * HealthController - Provides health check endpoints for monitoring
 *
 * This endpoint is used by:
 * - Docker health checks
 * - Kong API Gateway health monitoring
 * - Load balancers
 * - Kubernetes liveness/readiness probes
 */
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async check() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'expense-service',
      checks: {
        database: 'unknown',
      },
    };

    // Check database connectivity
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }

    return health;
  }

  /**
   * Readiness probe - indicates if service is ready to accept traffic
   */
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

  /**
   * Liveness probe - indicates if service is alive
   */
  @Get('live')
  live() {
    return { status: 'alive' };
  }
}
