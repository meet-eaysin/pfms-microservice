import { Test, TestingModule } from '@nestjs/testing';
import { AuthApplicationService } from '../../../src/application/services/auth.application.service';
import { BetterAuthAdapter } from '../../../src/infrastructure/auth/better-auth.adapter';
import { UnauthorizedException } from '@nestjs/common';
import { User, Session } from '../../../src/domain/entities/user.entity';

// Mock better-auth before importing the adapter
jest.mock('better-auth', () => ({
  betterAuth: jest.fn(() => ({
    handler: jest.fn(),
    api: {
      getSession: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}));

describe('AuthApplicationService', () => {
  let service: AuthApplicationService;
  let betterAuthAdapter: jest.Mocked<BetterAuthAdapter>;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession: Session = {
    id: 'session-123',
    userId: 'user-123',
    token: 'session-token',
    expiresAt: new Date(Date.now() + 86400000),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockBetterAuthAdapter = {
      getSessionByToken: jest.fn(),
      getSession: jest.fn(),
      signOut: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthApplicationService,
        {
          provide: BetterAuthAdapter,
          useValue: mockBetterAuthAdapter,
        },
      ],
    }).compile();

    service = module.get<AuthApplicationService>(AuthApplicationService);
    betterAuthAdapter = module.get(BetterAuthAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateSession', () => {
    it('should validate session successfully', async () => {
      betterAuthAdapter.getSessionByToken.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const result = await service.validateSession('valid-token');

      expect(result).toEqual({ user: mockUser, session: mockSession });
      expect(betterAuthAdapter.getSessionByToken).toHaveBeenCalledWith('valid-token');
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      betterAuthAdapter.getSessionByToken.mockResolvedValue(null);

      await expect(service.validateSession('invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getSession', () => {
    it('should get session from headers successfully', async () => {
      const headers = { cookie: 'better-auth-session=token' };
      betterAuthAdapter.getSession.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const result = await service.getSession(headers);

      expect(result).toEqual({ user: mockUser, session: mockSession });
      expect(betterAuthAdapter.getSession).toHaveBeenCalledWith(headers);
    });

    it('should throw UnauthorizedException when no session found', async () => {
      betterAuthAdapter.getSession.mockResolvedValue(null);

      await expect(service.getSession({})).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('signOut', () => {
    it('should sign out successfully', async () => {
      const headers = { cookie: 'better-auth-session=token' };
      betterAuthAdapter.signOut.mockResolvedValue();

      await service.signOut(headers);

      expect(betterAuthAdapter.signOut).toHaveBeenCalledWith(headers);
    });
  });
});
