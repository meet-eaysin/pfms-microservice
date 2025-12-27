import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/presentation/controllers/auth.controller';
import { AuthApplicationService } from '../../../src/application/services/auth.application.service';
import { BetterAuthAdapter } from '../../../src/infrastructure/auth/better-auth.adapter';
import {
  GetUserByIdUseCase,
  GetUserSessionsUseCase,
  RevokeSessionUseCase,
  RevokeAllSessionsUseCase,
} from '../../../src/application/use-cases/session.use-cases';
import { User, Session } from '../../../src/domain/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthApplicationService>;
  let betterAuthAdapter: jest.Mocked<BetterAuthAdapter>;
  let getUserByIdUseCase: jest.Mocked<GetUserByIdUseCase>;
  let getUserSessionsUseCase: jest.Mocked<GetUserSessionsUseCase>;
  let revokeSessionUseCase: jest.Mocked<RevokeSessionUseCase>;

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
    token: 'token',
    expiresAt: new Date(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthApplicationService,
          useValue: {
            getSession: jest.fn(),
            signOut: jest.fn(),
          },
        },
        {
          provide: BetterAuthAdapter,
          useValue: {
            handleRequest: jest.fn(),
          },
        },
        {
          provide: GetUserByIdUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetUserSessionsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RevokeSessionUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: RevokeAllSessionsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    authService = module.get(AuthApplicationService);
    betterAuthAdapter = module.get(BetterAuthAdapter);
    getUserByIdUseCase = module.get(GetUserByIdUseCase);
    getUserSessionsUseCase = module.get(GetUserSessionsUseCase);
    revokeSessionUseCase = module.get(RevokeSessionUseCase);
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      authService.getSession.mockResolvedValue({
        user: mockUser,
        session: mockSession,
      });

      const result = await controller.getSession({ cookie: 'test' });

      expect(result).toEqual({
        user: mockUser,
        session: mockSession,
      });
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      getUserByIdUseCase.execute.mockResolvedValue(mockUser);

      const result = await controller.getUserById('user-123');

      expect(result).toEqual(mockUser);
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions', async () => {
      getUserSessionsUseCase.execute.mockResolvedValue([mockSession]);

      const result = await controller.getUserSessions(mockUser);

      expect(result).toEqual([mockSession]);
    });
  });

  describe('revokeSession', () => {
    it('should revoke a session', async () => {
      revokeSessionUseCase.execute.mockResolvedValue();

      await controller.revokeSession('session-123', mockUser);

      expect(revokeSessionUseCase.execute).toHaveBeenCalledWith('session-123', 'user-123');
    });
  });
});
