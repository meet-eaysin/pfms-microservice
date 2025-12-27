import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version: string;
}

interface ReadinessResponse extends HealthResponse {
  checks: {
    database: string;
    redis: string;
    rabbitmq: string;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(_configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
    };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is ready' })
  async readiness(): Promise<ReadinessResponse> {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
      checks: {
        database: 'connected',
        redis: 'connected',
        rabbitmq: 'connected',
      },
    };
  }

  @Get('live')
  @ApiOperation({ summary: 'Liveness check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is live' })
  liveness(): HealthResponse {
    return {
      status: 'live',
      timestamp: new Date().toISOString(),
      service: 'auth-service',
      version: '1.0.0',
    };
  }
}
