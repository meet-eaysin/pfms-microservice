import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from '@pfms/config';
import { HttpStatus } from '@pfms/http';
import * as promClient from 'prom-client';

// Configuration
import { loadMarketDataServiceConfig } from '@/config';

// Container
import { createServiceContainer } from '@/infrastructure/di/container';

// Routes
import { createMarketRouter } from '@/presentation/routes/market.routes';
import { createMarketController } from '@/presentation/controllers/market.controller';

// Load environment variables
dotenv.config();

const logger = createLogger('MarketDataService');

// ============================================
// Prometheus Metrics Setup
// ============================================
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
});

async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting Market Data Service...');

    const config = loadMarketDataServiceConfig();
    const container = await createServiceContainer(config);

    // Connect to external services
    await container.prisma.$connect();
    logger.info('✅ Database connected');

    await container.eventPublisher.connect();
    logger.info('✅ Event bus connected');

    const app: Express = express();

    app.use(helmet());
    app.use(cors({ origin: config.server.CORS_ORIGIN }));
    app.disable('x-powered-by');
    app.use(express.json());

    // Request metrics middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      res.on('finish', () => {
        const duration = (Date.now() - startTime) / 1000;
        httpRequestDuration.observe(
          { method: req.method, route: req.path, status_code: res.statusCode },
          duration
        );
      });
      next();
    });

    // Mount Routes
    const marketController = createMarketController(container);
    app.use('/api/v1/market', createMarketRouter(marketController));

    // Health Check
    app.get('/api/v1/market/health', (_req: Request, res: Response) => {
      res.status(HttpStatus.OK).json({ status: 'UP', timestamp: new Date().toISOString() });
    });

    // Metrics endpoint
    app.get('/metrics', async (_req: Request, res: Response) => {
      res.set('Content-Type', register.contentType);
      res.send(await register.metrics());
    });

    const PORT = config.server.SERVICE_PORT;
    const HOST = config.server.HOST;

    app.listen(PORT, HOST, () => {
      logger.info(`
╔════════════════════════════════════════════════════╗
║ 🎉 Market Data Service Started on Port ${PORT}! 🎉  ║
╚════════════════════════════════════════════════════╝
`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server', { error });
    process.exit(1);
  }
}

bootstrap();
