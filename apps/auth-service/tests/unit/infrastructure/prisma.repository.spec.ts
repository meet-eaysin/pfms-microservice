import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaRepository } from '../../../src/infrastructure/database/prisma.repository';

// Create mock functions that will be reused
const mockUserFindUnique = jest.fn();
const mockSessionFindMany = jest.fn();
const mockSessionDeleteMany = jest.fn();
const mockDisconnect = jest.fn();

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: mockUserFindUnique,
      },
      session: {
        findMany: mockSessionFindMany,
        deleteMany: mockSessionDeleteMany,
      },
      $disconnect: mockDisconnect,
    })),
  };
});

describe('PrismaRepository', () => {
  let repository: PrismaRepository;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: 'session-123',
    userId: 'user-123',
    token: 'token',
    expiresAt: new Date(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaRepository,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('postgresql://localhost:5432/test'),
          },
        },
      ],
    }).compile();

    repository = module.get(PrismaRepository);
  });

  describe('findUserById', () => {
    it('should return user by ID', async () => {
      mockUserFindUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserById('user-123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        emailVerified: mockUser.emailVerified,
        name: mockUser.name,
        image: mockUser.image,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });

    it('should return null when user not found', async () => {
      mockUserFindUnique.mockResolvedValue(null);

      const result = await repository.findUserById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions', async () => {
      mockSessionFindMany.mockResolvedValue([mockSession]);

      const result = await repository.getUserSessions('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockSession.id,
        userId: mockSession.userId,
        token: mockSession.token,
        expiresAt: mockSession.expiresAt,
        ipAddress: mockSession.ipAddress,
        userAgent: mockSession.userAgent,
        createdAt: mockSession.createdAt,
        updatedAt: mockSession.updatedAt,
      });
    });
  });

  describe('revokeSession', () => {
    it('should revoke a session', async () => {
      mockSessionDeleteMany.mockResolvedValue({ count: 1 });

      await repository.revokeSession('session-123', 'user-123');

      expect(mockSessionDeleteMany).toHaveBeenCalledWith({
        where: {
          id: 'session-123',
          userId: 'user-123',
        },
      });
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all sessions for user', async () => {
      mockSessionDeleteMany.mockResolvedValue({ count: 5 });

      await repository.revokeAllSessions('user-123');

      expect(mockSessionDeleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
        },
      });
    });

    it('should revoke all sessions except one', async () => {
      mockSessionDeleteMany.mockResolvedValue({ count: 4 });

      await repository.revokeAllSessions('user-123', 'current-session');

      expect(mockSessionDeleteMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          id: { not: 'current-session' },
        },
      });
    });
  });
});
