import express, { type Express, type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { createLogger, HttpStatus } from '@pfms/utils';
import * as promClient from 'prom-client';

// Configuration
import { loadUserServiceConfig } from './config';

// Infrastructure
import { createPrismaUserRepository } from './infrastructure/database/prisma.repository';
import { createRedisCacheService } from './infrastructure/cache/redis-cache.service';
import { createS3StorageService } from './infrastructure/storage/s3-storage.service';
import { createEventPublisher } from './infrastructure/messaging/event.publisher';

// Use Cases
import { GetProfileUseCase } from './application/use-cases/profile/get-profile.use-case';
import { UpdateProfileUseCase } from './application/use-cases/profile/update-profile.use-case';
import { UploadAvatarUseCase } from './application/use-cases/profile/upload-avatar.use-case';
import { GetFinancialPreferencesUseCase } from './application/use-cases/preferences/get-financial-preferences.use-case';
import { UpdateFinancialPreferencesUseCase } from './application/use-cases/preferences/update-financial-preferences.use-case';
import { ListFamilyMembersUseCase } from './application/use-cases/family/list-family-members.use-case';
import { InviteFamilyMemberUseCase } from './application/use-cases/family/invite-family-member.use-case';

// Routes
import { createHealthRouter } from './interfaces/http/routes/health.routes';
import { createProfileRouter } from './interfaces/http/routes/profile.routes';
import { createPreferencesRouter } from './interfaces/http/routes/preferences.routes';
import { createFamilyRouter } from './interfaces/http/routes/family.routes';
import { errorHandler } from './interfaces/http/middleware/error-handler.middleware';

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
    // Initialize Infrastructure
    // ============================================
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: config.database.DATABASE_URL,
        },
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });

    await prisma.$connect();
    logger.info('✅ Database connected');

    const repository = createPrismaUserRepository(prisma);
    const cache = createRedisCacheService(config.redis);
    const storage = createS3StorageService(config.storage);
    const eventPublisher = createEventPublisher(config.rabbitmq);
    await eventPublisher.connect();

    logger.info('✅ Infrastructure initialized');

    // ============================================
    // Initialize Use Cases
    // ============================================
    const getProfileUseCase = new GetProfileUseCase(repository);
    const updateProfileUseCase = new UpdateProfileUseCase(repository, cache, eventPublisher);
    const uploadAvatarUseCase = new UploadAvatarUseCase(repository, storage, cache);
    const getFinancialPreferencesUseCase = new GetFinancialPreferencesUseCase(repository);
    const updateFinancialPreferencesUseCase = new UpdateFinancialPreferencesUseCase(
      repository,
      cache,
      eventPublisher
    );
    const listFamilyMembersUseCase = new ListFamilyMembersUseCase(repository);
    const inviteFamilyMemberUseCase = new InviteFamilyMemberUseCase(repository, eventPublisher);

    logger.info('✅ Use cases initialized');

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
    app.use('/health', createHealthRouter({ prisma }));

    app.use(
      '/api/v1/user/profile',
      createProfileRouter({
        getProfileUseCase,
        updateProfileUseCase,
        uploadAvatarUseCase,
      })
    );

    app.use(
      '/api/v1/user/preferences',
      createPreferencesRouter({
        getFinancialPreferencesUseCase,
        updateFinancialPreferencesUseCase,
      })
    );

    app.use(
      '/api/v1/user/family',
      createFamilyRouter({
        listFamilyMembersUseCase,
        inviteFamilyMemberUseCase,
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

📚 API Endpoints:
  GET    /health                              (Health check)
  GET    /health/ready                        (Readiness check)
  GET    /metrics                             (Prometheus metrics)
  
  Profile:
  GET    /api/v1/user/profile                 (Get profile)
  PUT    /api/v1/user/profile                 (Update profile)
  POST   /api/v1/user/profile/avatar          (Upload avatar)
  
  Preferences:
  GET    /api/v1/user/preferences/financial   (Get financial preferences)
  PUT    /api/v1/user/preferences/financial   (Update financial preferences)
  
  Family:
  GET    /api/v1/user/family                  (List family members)
  POST   /api/v1/user/family/invite           (Invite family member)
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

      await eventPublisher.close();
      await cache.disconnect();
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
