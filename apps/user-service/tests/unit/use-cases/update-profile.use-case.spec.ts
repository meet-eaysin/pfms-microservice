import { describe, it, expect, beforeEach } from '@jest/globals';
import { UpdateProfileUseCase } from '../../../src/application/use-cases/profile/update-profile.use-case';
import type {
  IUserRepository,
  ICacheService,
} from '../../../src/domain/interfaces/repository.interface';
import type { EventPublisher } from '../../../src/infrastructure/messaging/event.publisher';
import type { IUserProfile } from '../../../src/domain/entities/user.entity';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockCache: jest.Mocked<ICacheService>;
  let mockEventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(() => {
    mockRepository = {
      findProfileByUserId: jest.fn(),
      createProfile: jest.fn(),
      updateProfile: jest.fn(),
      deleteProfile: jest.fn(),
      findFinancialPreferences: jest.fn(),
      createFinancialPreferences: jest.fn(),
      updateFinancialPreferences: jest.fn(),
      findNotificationSettings: jest.fn(),
      createNotificationSettings: jest.fn(),
      updateNotificationSettings: jest.fn(),
      findFamilyMembers: jest.fn(),
      createFamilyMember: jest.fn(),
      updateFamilyMemberStatus: jest.fn(),
      deleteFamilyMember: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      flush: jest.fn(),
    } as jest.Mocked<ICacheService>;

    mockEventPublisher = {
      connect: jest.fn(),
      publishProfileUpdated: jest.fn(),
      publishPreferencesUpdated: jest.fn(),
      publishFamilyInvited: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<EventPublisher>;

    useCase = new UpdateProfileUseCase(mockRepository, mockCache, mockEventPublisher);
  });

  it('should update profile and invalidate cache', async () => {
    const updates = { firstName: 'Jane', phone: '+1234567890' };
    const updatedProfile: IUserProfile = {
      userId: 'user-123',
      firstName: 'Jane',
      lastName: 'Doe',
      avatarUrl: null,
      phone: '+1234567890',
      dateOfBirth: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.updateProfile.mockResolvedValue(updatedProfile);
    mockCache.del.mockResolvedValue();
    mockEventPublisher.publishProfileUpdated.mockResolvedValue();

    const result = await useCase.execute({
      userId: 'user-123',
      updates,
    });

    expect(result).toEqual(updatedProfile);
    expect(mockRepository.updateProfile).toHaveBeenCalledWith('user-123', updates);
    expect(mockCache.del).toHaveBeenCalledWith('profile:user-123');
    expect(mockEventPublisher.publishProfileUpdated).toHaveBeenCalledWith({
      userId: 'user-123',
      changes: ['firstName', 'phone'],
    });
  });

  it('should handle empty updates', async () => {
    const updatedProfile: IUserProfile = {
      userId: 'user-123',
      firstName: 'John',
      lastName: 'Doe',
      avatarUrl: null,
      phone: null,
      dateOfBirth: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockRepository.updateProfile.mockResolvedValue(updatedProfile);
    mockCache.del.mockResolvedValue();
    mockEventPublisher.publishProfileUpdated.mockResolvedValue();

    const result = await useCase.execute({
      userId: 'user-123',
      updates: {},
    });

    expect(result).toEqual(updatedProfile);
    expect(mockEventPublisher.publishProfileUpdated).toHaveBeenCalledWith({
      userId: 'user-123',
      changes: [],
    });
  });
});
