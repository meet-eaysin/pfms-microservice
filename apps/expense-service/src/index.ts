import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import dotenv from 'dotenv';
import cors from 'cors'; // Import cors

dotenv.config();

// ============================================
// Service-Specific Imports
// ============================================
import { loadExpenseServiceConfig, ExpenseServiceConfig } from './config/config.schema';
import { createLogger, ResponseUtil, HttpStatus } from '@pfms/utils';
import * as metrics from './modules/metrics';

// Routes & Middleware
import expenseRoutes from './api/routes/expense.routes';
import { errorHandler } from './api/middleware/error-handler.middleware';

// Event Bus
import {
  initializeEventBus,
  isEventBusHealthy,
  closeEventBus,
} from './infrastructure/event-bus.client';
import { registerEventSubscribers } from './events/subscribers';

// ============================================
// Initialize Logger
// ============================================
const logger = createLogger('ExpenseService');

logger.info('🚀 Starting Expense Service...');

// ============================================
// Load Service Configuration
// ============================================
let config: ExpenseServiceConfig;
try {
  config = loadExpenseServiceConfig();
  logger.info('✅ Configuration loaded successfully', {
    service: config.SERVICE_NAME,
    port: config.SERVICE_PORT,
  });
} catch (error) {
  logger.error('❌ Failed to load configuration', {
    error: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
}

// ============================================
// Initialize Express
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

// CORS - Allow Kong and internal services
app.use(cors());

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Disable X-Powered-By header
app.disable('x-powered-by');

// Request logging and metrics middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const normalizedPath = metrics.normalizePath(req.path);

    // Log request
    logger.info('📊 Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
    });

    // Record metrics
    metrics.recordHttpRequest(req.method, normalizedPath, res.statusCode, duration);
  });

  next();
});

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

app.get('/health', async (req: Request, res: Response) => {
  const eventBusHealthy = await isEventBusHealthy();

  const healthStatus = {
    status: eventBusHealthy ? 'healthy' : 'degraded',
    timestamp: new Date(),
    service: 'expense-service',
    version: '1.0.0',
    uptime: process.uptime(),
    eventBus: {
      connected: eventBusHealthy,
    },
  };

  const statusCode = eventBusHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
  res.status(statusCode).json(ResponseUtil.success(healthStatus));
});

app.get('/ready', (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json(ResponseUtil.success({ ready: true }));
});

// ============================================
// METRICS ENDPOINT
// ============================================

app.get('/metrics', async (req: Request, res: Response) => {
  try {
    res.set('Content-Type', metrics.getContentType());
    const metricsData = await metrics.getMetrics();
    res.send(metricsData);
  } catch (error) {
    logger.error('Failed to generate metrics', { error });
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error generating metrics');
  }
});

// ============================================
// API ROUTES
// ============================================

// Mount Expense Routes (CQRS)
app.use('/api/v2/expenses', expenseRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  logger.warn('🚫 Not found', { path: req.path });
  res.status(HttpStatus.NOT_FOUND).json(ResponseUtil.notFound('Route not found'));
});

// Global Error Handler
app.use(errorHandler);

// ============================================
// Start Server with Event Bus
// ============================================
const PORT = config.SERVICE_PORT || 3003;
const HOST = '0.0.0.0'; // Bind to all interfaces for Docker support
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Validate required environment
if (IS_PRODUCTION) {
  const requiredEnvVars = ['NODE_ENV'];
  const missing = requiredEnvVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    logger.error('❌ Missing required environment variables', { missing });
    process.exit(1);
  }
}

// Initialize Event Bus and Start Server
async function startServer() {
  try {
    // Initialize Event Bus
    logger.info('🔌 Initializing event bus...');
    const eventBus = await initializeEventBus();

    // Register Event Subscribers
    await registerEventSubscribers(eventBus);

    // Start HTTP Server
    const server = app.listen(PORT, HOST, () => {
      logger.info(`
╔════════════════════════════════════════════════════╗
║    🎉 Expense Service Started on Port ${PORT}! 🎉     ║
╚════════════════════════════════════════════════════╝

📍 Binding: ${HOST}:${PORT}
🔒 Security Mode: ${IS_PRODUCTION ? 'PRODUCTION' : 'DEVELOPMENT'}
🌐 Network: Internal Docker network (Kong Gateway required)
🔌 Event Bus: Connected to RabbitMQ

📚 API Endpoints:
  GET    /health                   (Health check)
  GET    /metrics                  (Prometheus metrics)
  /api/v2/expenses                (Expense Operations)
  `);
    });

    // Graceful Shutdown
    const shutdown = async () => {
      logger.info('🛑 Shutting down gracefully...');

      // Close HTTP server
      server.close(() => {
        logger.info('✅ HTTP server closed');
      });

      // Close event bus
      await closeEventBus();

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

// Start the server
startServer();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
  process.exit(1);
});

export default app;
