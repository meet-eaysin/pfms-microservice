import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '@pfms/config';
import { HttpStatus } from '@pfms/http';
import * as promClient from 'prom-client';

// Configuration
import { loadAuthServiceConfig } from './config';

// Infrastructure
import { createBetterAuthAdapter } from './infrastructure/auth/better-auth.adapter';
import { createPrismaRepository } from './infrastructure/database/prisma.repository';
import { createEventPublisher } from './infrastructure/messaging/event.publisher';

// Application
import { AuthApplicationService } from './application/services/auth.application.service';
import {
  GetUserByIdUseCase,
  GetUserSessionsUseCase,
  RevokeSessionUseCase,
  RevokeAllSessionsUseCase,
} from './application/use-cases/session.use-cases';

// Routes & Middleware
import { createAuthRouter } from './presentation/routes/auth.routes';
import { createHealthRouter } from './presentation/routes/health.routes';
import { errorHandler } from './presentation/middleware/error-handler.middleware';

// Load environment variables
dotenv.config();

const logger = createLogger('AuthService');

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

// ============================================
// Bootstrap Application
// ============================================
async function bootstrap(): Promise<void> {
  try {
    logger.info('🚀 Starting Auth Service...');

    // ============================================
    // Load Configuration
    // ============================================
    const config = loadAuthServiceConfig();
    logger.info('✅ Configuration loaded successfully', {
      service: config.server.SERVICE_NAME,
      port: config.server.SERVICE_PORT,
    });

    // ============================================
    // Initialize Infrastructure
    // ============================================
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.auth.DATABASE_URL,
        },
      },
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });

    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected');

    const betterAuthAdapter = createBetterAuthAdapter(config.auth, prisma);
    logger.info('✅ Better-Auth adapter initialized');

    const repository = createPrismaRepository(prisma);
    logger.info('✅ Repository initialized');

    const eventPublisher = createEventPublisher(config.rabbitmq);
    await eventPublisher.connect();
    logger.info('✅ Event bus connected');

    // ============================================
    // Initialize Application Services
    // ============================================
    const authService = new AuthApplicationService(betterAuthAdapter);
    const getUserByIdUseCase = new GetUserByIdUseCase(repository);
    const getUserSessionsUseCase = new GetUserSessionsUseCase(repository);
    const revokeSessionUseCase = new RevokeSessionUseCase(repository);
    const revokeAllSessionsUseCase = new RevokeAllSessionsUseCase(repository);

    logger.info('✅ Application services initialized');

    // ============================================
    // Create Express App
    // ============================================
    const app: Express = express();

    // Security Headers
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        },
        hsts: {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        },
      }),
    );

    // CORS
    const corsOrigin = config.server.CORS_ORIGIN;
    app.use(
      cors({
        origin: corsOrigin === '*' ? true : corsOrigin.split(','),
        credentials: true,
      }),
    );

    // Disable X-Powered-By header
    app.disable('x-powered-by');

    // ============================================
    // Mount Better Auth Routes FIRST
    // ============================================
    // CRITICAL: Better Auth must be mounted BEFORE express.json()
    // See: https://www.better-auth.com/docs/integrations/express
    app.use(
      '/auth',
      createAuthRouter({
        betterAuthAdapter,
        authService,
        getUserByIdUseCase,
        getUserSessionsUseCase,
        revokeSessionUseCase,
        revokeAllSessionsUseCase,
      }),
    );

    // ============================================
    // Body Parsing Middleware
    // ============================================
    // Mount AFTER Better Auth to avoid breaking the client API
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Request logging and metrics middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = (Date.now() - startTime) / 1000;

        // Log request
        logger.info('📊 Request', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration: `${duration * 1000}ms`,
        });

        // Record metrics
        httpRequestDuration.observe(
          {
            method: req.method,
            route: req.path,
            status_code: res.statusCode,
          },
          duration,
        );
      });

      next();
    });

    // ============================================
    // Mount Other Routes
    // ============================================
    app.use('/health', createHealthRouter({ prisma }));

    // Metrics endpoint
    app.get('/metrics', async (_req: Request, res: Response) => {
      try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.send(metrics);
      } catch (error) {
        logger.error('Failed to generate metrics', { error });
        res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .send('Error generating metrics');
      }
    });

    // 404 Handler
    app.use((req: Request, res: Response) => {
      logger.warn('🚫 Not found', { path: req.path });
      res.status(HttpStatus.NOT_FOUND).json({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Route not found',
        timestamp: new Date().toISOString(),
      });
    });

    // Global Error Handler
    app.use(errorHandler);

    // ============================================
    // Start Server
    // ============================================
    const PORT = config.server.SERVICE_PORT;
    const HOST = config.server.HOST;

    const server = app.listen(PORT, HOST, () => {
      logger.info(`
╔════════════════════════════════════════════════════╗
║    🎉 Auth Service Started on Port ${PORT}! 🎉       ║
╚════════════════════════════════════════════════════╝

📍 Binding: ${HOST}:${PORT}
🔒 Security Mode: ${process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'}
🌐 Network: Internal Docker network (Kong Gateway required)
🔌 Event Bus: Connected to RabbitMQ
🗄️  Database: Connected to PostgreSQL

📚 API Endpoints:
  GET    /health                   (Health check)
  GET    /health/ready             (Readiness check)
  GET    /metrics                  (Prometheus metrics)
  /auth/*                          (Better-Auth endpoints)
  GET    /auth/session             (Get current session)
  POST   /auth/signout             (Sign out)
  GET    /auth/user/:id            (Get user by ID)
  GET    /auth/sessions            (Get user sessions)
  DELETE /auth/sessions/:id        (Revoke session)
  DELETE /auth/sessions            (Revoke all sessions)
      `);
    });

    // ============================================
    // Graceful Shutdown
    // ============================================
    const shutdown = async () => {
      logger.info('🛑 Shutting down gracefully...');

      // Close HTTP server
      server.close(() => {
        logger.info('✅ HTTP server closed');
      });

      // Close event bus
      await eventPublisher.close();

      // Disconnect from database
      await prisma.$disconnect();

      logger.info('✅ Shutdown complete');
      process.exit(0);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('❌ Failed to start server', {
      error: error instanceof Error ? error.message : String(error),
    });
    process.exit(1);
  }
}

// ============================================
// Error Handlers
// ============================================
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error });
  process.exit(1);
});

// Start the application
bootstrap();
