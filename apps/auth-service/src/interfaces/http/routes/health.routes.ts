import type { Router, Request, Response } from 'express';
import { Router as ExpressRouter } from 'express';
import type { PrismaClient } from '@prisma/client';
import { createLogger } from '@pfms/utils';

const logger = createLogger('HealthRoutes');

interface IHealthRouterOptions {
  prisma: PrismaClient;
}

export function createHealthRouter(options: IHealthRouterOptions): Router {
  const router = ExpressRouter();

  router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
      // Check database connectivity
      await options.prisma.$queryRaw`SELECT 1`;

      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'auth-service',
        version: '1.0.0',
        uptime: process.uptime(),
        database: 'connected',
      });
    } catch (error) {
      logger.error('Health check failed', { error });
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'auth-service',
        database: 'disconnected',
      });
    }
  });

  router.get('/ready', (_req: Request, res: Response): void => {
    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
