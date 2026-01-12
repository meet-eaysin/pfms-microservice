import { PrismaClient } from '@prisma/client';
import { createLogger } from '@pfms/config';
import type { MarketDataServiceConfig } from '@/config';

// Infrastructure Factories
import { createPrismaMarketDataRepository } from '@/infrastructure/database/prisma.repository';
import { createRedisCacheService } from '@/infrastructure/cache/redis-cache.service';
import {
  createEventPublisher,
  type EventPublisher,
} from '@/infrastructure/messaging/event.publisher';

// Repository Interfaces
import type {
  IMarketDataRepository,
  ICacheService,
} from '@/domain/interfaces/repository.interface';

// Providers
import { YahooFinanceProvider } from '@/infrastructure/external/yahoo-finance.provider';
import { CoinGeckoProvider } from '@/infrastructure/external/coingecko.provider';

// Use Cases
import { GetPriceUseCase } from '@/application/use-cases/get-price.use-case';
import { SearchSymbolsUseCase } from '@/application/use-cases/search-symbols.use-case';
import { GetHistoricalDataUseCase } from '@/application/use-cases/get-historical-data.use-case';

const logger = createLogger('ServiceContainer');

export interface IServiceContainer {
  prisma: PrismaClient;
  repository: IMarketDataRepository;
  cache: ICacheService;
  eventPublisher: EventPublisher;
  useCases: {
    getPrice: GetPriceUseCase;
    searchSymbols: SearchSymbolsUseCase;
    getHistoricalData: GetHistoricalDataUseCase;
  };
}

export async function createServiceContainer(
  config: MarketDataServiceConfig
): Promise<IServiceContainer> {
  logger.info('Initializing service container...');

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.database.DATABASE_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  const repository = createPrismaMarketDataRepository(prisma);
  const cache = createRedisCacheService(config);
  const eventPublisher = createEventPublisher(config);

  // 2. Initialize Providers
  const yahooProvider = new YahooFinanceProvider(config.providers);
  const cryptoProvider = new CoinGeckoProvider(config.providers);

  // 3. Initialize Use Cases
  const useCases = {
    getPrice: new GetPriceUseCase(repository, cache, yahooProvider, cryptoProvider, eventPublisher),
    searchSymbols: new SearchSymbolsUseCase(yahooProvider, cryptoProvider),
    getHistoricalData: new GetHistoricalDataUseCase(repository, yahooProvider, cryptoProvider),
  };

  logger.info('Service container initialized successfully');

  return {
    prisma,
    repository,
    cache,
    eventPublisher,
    useCases,
  };
}
