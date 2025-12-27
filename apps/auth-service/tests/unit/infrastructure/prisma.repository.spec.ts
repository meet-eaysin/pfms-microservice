import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaRepository } from '../../../src/infrastructure/database/prisma.repository';
import { User, Session } from '../../../src/domain/entities/user.entity';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      user: {
        findUnique: jest.fn(),
      },
      session: {
        findMany: jest.fn(),
        deleteMany: jest.fn(),
      },
      $disconnect: jest.fn(),
    })),
  };
});

describe('PrismaRepository', () => {
  let repository: PrismaRepository;
  let configService: ConfigService;
  let prisma: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    image: null,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockSession = {
    id: 'session-123',
    user_id: 'user-123',
    token: 'token',
    expires_at: new Date(),
    ip_address: '127.0.0.1',
    user_agent: 'Test Agent',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
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
    configService = module.get(ConfigService);
    prisma = (repository as any).prisma;
  });

  describe('findUserById', () => {
    it('should return user by ID', async () => {
      prisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findUserById('user-123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        emailVerified: mockUser.email_verified,
        name: mockUser.name,
        image: mockUser.image,
        createdAt: mockUser.created_at,
        updatedAt: mockUser.updated_at,
      });
    });

    it('should return null when user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const result = await repository.findUserById('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions', async () => {
      prisma.session.findMany.mockResolvedValue([mockSession]);

      const result = await repository.getUserSessions('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: mockSession.id,
        userId: mockSession.user_id,
        token: mockSession.token,
        expiresAt: mockSession.expires_at,
        ipAddress: mockSession.ip_address,
        userAgent: mockSession.user_agent,
        createdAt: mockSession.created_at,
        updatedAt: mockSession.updated_at,
      });
    });
  });

  describe('revokeSession', () => {
    it('should revoke a session', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 1 });

      await repository.revokeSession('session-123', 'user-123');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          id: 'session-123',
          user_id: 'user-123',
        },
      });
    });
  });

  describe('revokeAllSessions', () => {
    it('should revoke all sessions for user', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 5 });

      await repository.revokeAllSessions('user-123');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
        },
      });
    });

    it('should revoke all sessions except one', async () => {
      prisma.session.deleteMany.mockResolvedValue({ count: 4 });

      await repository.revokeAllSessions('user-123', 'current-session');

      expect(prisma.session.deleteMany).toHaveBeenCalledWith({
        where: {
          user_id: 'user-123',
          id: { not: 'current-session' },
        },
      });
    });
  });
});
