import { Test, TestingModule } from '@nestjs/testing';
import { RefreshSessionUseCase } from './refresh-session.use-case';
import {
  SessionRepository,
  UserRepository,
  TokenService,
} from '../../domain/ports/repositories';
import { UnauthorizedException } from '@nestjs/common';
import { Session, User } from '../../domain/entities/user.entity';

describe('RefreshSessionUseCase', () => {
  let useCase: RefreshSessionUseCase;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenService: jest.Mocked<TokenService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshSessionUseCase,
        {
          provide: SessionRepository,
          useValue: {
            findByRefreshToken: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(), // If reuse detection
          },
        },
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            verifyAccessToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RefreshSessionUseCase>(RefreshSessionUseCase);
    sessionRepository = module.get(SessionRepository);
    userRepository = module.get(UserRepository);
    tokenService = module.get(TokenService);
  });

  it('should refresh tokens if session is valid', async () => {
    const session = new Session(
      'sid',
      'uid',
      'oldRefresh',
      new Date(Date.now() + 10000),
      { ip: '1.2.3.4', userAgent: 'test' },
    );
    const user = new User(
      'uid',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
    );

    sessionRepository.findByRefreshToken.mockResolvedValue(session);
    userRepository.findById.mockResolvedValue(user);
    tokenService.generateAccessToken.mockReturnValue('newAccess');
    tokenService.generateRefreshToken.mockReturnValue('newRefresh');

    const result = await useCase.execute('oldRefresh');

    expect(result).toEqual({
      accessToken: 'newAccess',
      refreshToken: 'newRefresh',
    });
    expect(sessionRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        refreshToken: 'newRefresh',
      }),
    );
  });

  it('should throw if session not found', async () => {
    sessionRepository.findByRefreshToken.mockResolvedValue(null);
    await expect(useCase.execute('invalid')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if session expired', async () => {
    const session = new Session(
      'sid',
      'uid',
      'oldRefresh',
      new Date(Date.now() - 1000),
      null,
    );
    sessionRepository.findByRefreshToken.mockResolvedValue(session);

    await expect(useCase.execute('oldRefresh')).rejects.toThrow(
      UnauthorizedException,
    );
    // Should assume session deletion logic exists if expired, but test just checks throw for now
  });
});
