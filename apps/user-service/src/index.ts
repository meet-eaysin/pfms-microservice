import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { createLogger } from '@pfms/config';
import { HttpStatus } from '@pfms/http';
import * as promClient from 'prom-client';

// Configuration
import { loadUserServiceConfig } from '@/config';

// Container
import { createServiceContainer } from '@/infrastructure/di/container';

// Routes
import { createHealthRouter } from '@/presentation/routes/health.routes';
import { createProfileRouter } from '@/presentation/routes/profile.routes';
import { createPreferencesRouter } from '@/presentation/routes/preferences.routes';
import { createFamilyRouter } from '@/presentation/routes/family.routes';
import { errorHandler } from '@/presentation/middleware/error-handler.middleware';

// Load environment variables
dotenv.config();

const logger = createLogger('UserService');

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
    logger.info('🚀 Starting User Service...');

    // ============================================
    // Load Configuration
    // ============================================
    const config = loadUserServiceConfig();
    logger.info('✅ Configuration loaded successfully', {
      service: config.server.SERVICE_NAME,
      port: config.server.SERVICE_PORT,
    });

    // ============================================
    // Initialize Container (DI)
    // ============================================
    const container = await createServiceContainer(config);

    // Connect to external services
    await container.prisma.$connect();
    logger.info('✅ Database connected');

    await container.eventPublisher.connect();
    logger.info('✅ Event bus connected');

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
      })
    );

    // CORS
    const corsOrigin = config.server.CORS_ORIGIN;
    app.use(
      cors({
        origin: corsOrigin === '*' ? true : corsOrigin.split(','),
        credentials: true,
      })
    );

    // Disable X-Powered-By
    app.disable('x-powered-by');

    // Body parsing
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));

    // Request logging and metrics middleware
    app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();

      res.on('finish', () => {
        const duration = (Date.now() - startTime) / 1000;

        logger.info('📊 Request', {
          method: req.method,
          path: req.path,
          status: res.statusCode,
          duration: `${duration * 1000}ms`,
        });

        httpRequestDuration.observe(
          {
            method: req.method,
            route: req.path,
            status_code: res.statusCode,
          },
          duration
        );
      });

      next();
    });

    // ============================================
    // Mount Routes
    // ============================================
    app.use('/api/v1/user/health', createHealthRouter({ prisma: container.prisma }));

    app.use(
      '/api/v1/user/profile',
      createProfileRouter({
        getProfileUseCase: container.useCases.getProfile,
        updateProfileUseCase: container.useCases.updateProfile,
        uploadAvatarUseCase: container.useCases.uploadAvatar,
      })
    );

    app.use(
      '/api/v1/user/preferences',
      createPreferencesRouter({
        getFinancialPreferencesUseCase: container.useCases.getFinancialPreferences,
        updateFinancialPreferencesUseCase: container.useCases.updateFinancialPreferences,
        getNotificationSettingsUseCase: container.useCases.getNotificationSettings,
        updateNotificationSettingsUseCase: container.useCases.updateNotificationSettings,
      })
    );

    app.use(
      '/api/v1/user/family',
      createFamilyRouter({
        listFamilyMembersUseCase: container.useCases.listFamilyMembers,
        inviteFamilyMemberUseCase: container.useCases.inviteFamilyMember,
      })
    );

    // Metrics endpoint
    app.get('/metrics', async (_req: Request, res: Response) => {
      try {
        res.set('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.send(metrics);
      } catch (error) {
        logger.error('Failed to generate metrics', { error });
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error generating metrics');
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
║    🎉 User Service Started on Port ${PORT}! 🎉       ║
╚════════════════════════════════════════════════════╝

📍 Binding: ${HOST}:${PORT}
🔒 Security Mode: ${process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'DEVELOPMENT'}
🌐 Network: Internal Docker network (Kong Gateway required)
🔌 Event Bus: Connected to RabbitMQ
🗄️  Database: Connected to PostgreSQL
💾 Cache: Connected to Redis
📦 Storage: Connected to S3/MinIO
`);
    });

    // ============================================
    // Graceful Shutdown
    // ============================================
    const shutdown = async (): Promise<void> => {
      logger.info('🛑 Shutting down gracefully...');

      server.close(() => {
        logger.info('✅ HTTP server closed');
      });

      await container.eventPublisher.close();
      await container.cache.disconnect();
      await container.prisma.$disconnect();

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
