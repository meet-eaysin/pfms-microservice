import { PrismaClient } from '@prisma/client';
import { createLogger } from '@pfms/utils';
import type { UserServiceConfig } from '@/config';

// Infrastructure Factories
import { createPrismaUserRepository } from '@/infrastructure/database/prisma.repository';
import { createRedisCacheService } from '@/infrastructure/cache/redis-cache.service';
import { createS3StorageService } from '@/infrastructure/storage/s3-storage.service';
import {
  createEventPublisher,
  type EventPublisher,
} from '@/infrastructure/messaging/event.publisher';

// Repository Interfaces
import type {
  IUserRepository,
  ICacheService,
  IStorageService,
} from '@/domain/interfaces/repository.interface';

// Use Cases
import {
  GetProfileUseCase,
  UpdateProfileUseCase,
  UploadAvatarUseCase,
  GetFinancialPreferencesUseCase,
  UpdateFinancialPreferencesUseCase,
  GetNotificationSettingsUseCase,
  UpdateNotificationSettingsUseCase,
  ListFamilyMembersUseCase,
  InviteFamilyMemberUseCase,
} from '@/application/use-cases';

const logger = createLogger('ServiceContainer');

export interface IServiceContainer {
  prisma: PrismaClient;
  repository: IUserRepository;
  cache: ICacheService;
  storage: IStorageService;
  eventPublisher: EventPublisher;
  useCases: {
    getProfile: GetProfileUseCase;
    updateProfile: UpdateProfileUseCase;
    uploadAvatar: UploadAvatarUseCase;
    getFinancialPreferences: GetFinancialPreferencesUseCase;
    updateFinancialPreferences: UpdateFinancialPreferencesUseCase;
    getNotificationSettings: GetNotificationSettingsUseCase;
    updateNotificationSettings: UpdateNotificationSettingsUseCase;
    listFamilyMembers: ListFamilyMembersUseCase;
    inviteFamilyMember: InviteFamilyMemberUseCase;
  };
}

export async function createServiceContainer(
  config: UserServiceConfig
): Promise<IServiceContainer> {
  logger.info('Initializing service container...');

  // 1. Initialize Infrastructure
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: config.database.DATABASE_URL,
      },
    },
    // Log queries in development
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

  const repository = createPrismaUserRepository(prisma);
  const cache = createRedisCacheService(config.redis);
  const storage = createS3StorageService(config.storage);
  const eventPublisher = createEventPublisher(config.rabbitmq);

  // 2. Initialize Use Cases
  const useCases = {
    getProfile: new GetProfileUseCase(repository),
    updateProfile: new UpdateProfileUseCase(repository, cache, eventPublisher),
    uploadAvatar: new UploadAvatarUseCase(repository, storage, cache),
    getFinancialPreferences: new GetFinancialPreferencesUseCase(repository),
    updateFinancialPreferences: new UpdateFinancialPreferencesUseCase(
      repository,
      cache,
      eventPublisher
    ),
    getNotificationSettings: new GetNotificationSettingsUseCase(repository),
    updateNotificationSettings: new UpdateNotificationSettingsUseCase(repository, cache),
    listFamilyMembers: new ListFamilyMembersUseCase(repository),
    inviteFamilyMember: new InviteFamilyMemberUseCase(repository, eventPublisher),
  };

  logger.info('Service container initialized successfully');

  return {
    prisma,
    repository,
    cache,
    storage,
    eventPublisher,
    useCases,
  };
}
