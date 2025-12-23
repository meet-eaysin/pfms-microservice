import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async healthCheck() {
    const dbHealthy = await this.prisma.healthCheck();

    return {
      status: dbHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
      uptime: process.uptime(),
      database: {
        status: dbHealthy ? 'connected' : 'disconnected',
      },
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check' })
  async readyCheck() {
    const dbHealthy = await this.prisma.healthCheck();

    return {
      ready: dbHealthy,
      timestamp: new Date().toISOString(),
    };
  }
}
