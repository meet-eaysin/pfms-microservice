import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '@pfms/utils';

const logger = createLogger('HealthRoutes');

export function createHealthRouter(prisma: PrismaClient): Router {
  const router = Router();

  router.get('/', async (_req: Request, res: Response) => {
    try {
      // Check database connectivity
      await prisma.$queryRaw`SELECT 1`;

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

  router.get('/ready', (_req: Request, res: Response) => {
    res.json({
      ready: true,
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
