import { PrismaClient } from '@prisma/client';
import { createLogger } from '@pfms/utils';

const logger = createLogger('PrismaClient');

let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ],
    });

    // Log queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on(
        'query' as never,
        ((e: { query: string; duration: number }) => {
          logger.debug('Query:', { query: e.query, duration: e.duration });
        }) as never
      );
    }

    // Graceful shutdown
    process.on('beforeExit', async () => {
      await prisma.$disconnect();
      logger.info('Prisma client disconnected');
    });

    logger.info('Prisma client initialized');
  }

  return prisma;
}

export { prisma };
