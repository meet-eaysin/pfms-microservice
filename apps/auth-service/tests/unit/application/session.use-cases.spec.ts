import { Test, TestingModule } from '@nestjs/testing';
import {
  GetUserByIdUseCase,
  GetUserSessionsUseCase,
  RevokeSessionUseCase,
  RevokeAllSessionsUseCase,
} from '../../../src/application/use-cases/session.use-cases';
import { IAuthRepository } from '../../../src/domain/interfaces/auth.interface';
import { User, Session } from '../../../src/domain/entities/user.entity';

describe('Session Use Cases', () => {
  let getUserByIdUseCase: GetUserByIdUseCase;
  let getUserSessionsUseCase: GetUserSessionsUseCase;
  let revokeSessionUseCase: RevokeSessionUseCase;
  let revokeAllSessionsUseCase: RevokeAllSessionsUseCase;
  let authRepository: jest.Mocked<IAuthRepository>;

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
    const mockAuthRepository: jest.Mocked<IAuthRepository> = {
      findUserById: jest.fn(),
      findUserByEmail: jest.fn(),
      getUserSessions: jest.fn(),
      revokeSession: jest.fn(),
      revokeAllSessions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserByIdUseCase,
        GetUserSessionsUseCase,
        RevokeSessionUseCase,
        RevokeAllSessionsUseCase,
        {
          provide: 'IAuthRepository',
          useValue: mockAuthRepository,
        },
      ],
    }).compile();

    getUserByIdUseCase = module.get(GetUserByIdUseCase);
    getUserSessionsUseCase = module.get(GetUserSessionsUseCase);
    revokeSessionUseCase = module.get(RevokeSessionUseCase);
    revokeAllSessionsUseCase = module.get(RevokeAllSessionsUseCase);
    authRepository = module.get('IAuthRepository');
  });

  describe('GetUserByIdUseCase', () => {
    it('should return user by ID', async () => {
      authRepository.findUserById.mockResolvedValue(mockUser);

      const result = await getUserByIdUseCase.execute('user-123');

      expect(result).toEqual(mockUser);
      expect(authRepository.findUserById).toHaveBeenCalledWith('user-123');
    });

    it('should return null when user not found', async () => {
      authRepository.findUserById.mockResolvedValue(null);

      const result = await getUserByIdUseCase.execute('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('GetUserSessionsUseCase', () => {
    it('should return user sessions', async () => {
      authRepository.getUserSessions.mockResolvedValue([mockSession]);

      const result = await getUserSessionsUseCase.execute('user-123');

      expect(result).toEqual([mockSession]);
      expect(authRepository.getUserSessions).toHaveBeenCalledWith('user-123');
    });
  });

  describe('RevokeSessionUseCase', () => {
    it('should revoke a session', async () => {
      authRepository.revokeSession.mockResolvedValue();

      await revokeSessionUseCase.execute('session-123', 'user-123');

      expect(authRepository.revokeSession).toHaveBeenCalledWith('session-123', 'user-123');
    });
  });

  describe('RevokeAllSessionsUseCase', () => {
    it('should revoke all sessions', async () => {
      authRepository.revokeAllSessions.mockResolvedValue();

      await revokeAllSessionsUseCase.execute('user-123');

      expect(authRepository.revokeAllSessions).toHaveBeenCalledWith('user-123', undefined);
    });

    it('should revoke all sessions except one', async () => {
      authRepository.revokeAllSessions.mockResolvedValue();

      await revokeAllSessionsUseCase.execute('user-123', 'current-session');

      expect(authRepository.revokeAllSessions).toHaveBeenCalledWith('user-123', 'current-session');
    });
  });
});
