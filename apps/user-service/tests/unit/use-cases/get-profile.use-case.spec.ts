import { describe, it, expect, beforeEach } from '@jest/globals';
import { GetProfileUseCase } from '../../../src/application/use-cases/profile/get-profile.use-case';
import type { IUserRepository } from '../../../src/domain/interfaces/repository.interface';
import type { IUserProfile } from '../../../src/domain/entities/user.entity';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;

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

    useCase = new GetProfileUseCase(mockRepository);
  });

  it('should return user profile when found', async () => {
    const mockProfile: IUserProfile = {
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

    mockRepository.findProfileByUserId.mockResolvedValue(mockProfile);

    const result = await useCase.execute('user-123');

    expect(result).toEqual(mockProfile);
    expect(mockRepository.findProfileByUserId).toHaveBeenCalledWith('user-123');
    expect(mockRepository.findProfileByUserId).toHaveBeenCalledTimes(1);
  });

  it('should return null when profile not found', async () => {
    mockRepository.findProfileByUserId.mockResolvedValue(null);

    const result = await useCase.execute('non-existent-user');

    expect(result).toBeNull();
    expect(mockRepository.findProfileByUserId).toHaveBeenCalledWith('non-existent-user');
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database connection failed');
    mockRepository.findProfileByUserId.mockRejectedValue(error);

    await expect(useCase.execute('user-123')).rejects.toThrow('Database connection failed');
  });
});
