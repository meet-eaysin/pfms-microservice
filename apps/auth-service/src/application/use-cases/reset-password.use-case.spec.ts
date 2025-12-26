import { Test, TestingModule } from '@nestjs/testing';
import { ResetPasswordUseCase } from './reset-password.use-case';
import {
  UserRepository,
  SessionRepository,
  PasswordEncoder,
} from '../../domain/ports/repositories';
import { PasswordResetTokenRepository } from '../../domain/ports/password-reset-token.repository';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { User } from '../../domain/entities/user.entity';
import { BadRequestException } from '@nestjs/common';

describe('ResetPasswordUseCase', () => {
  let useCase: ResetPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let passwordEncoder: jest.Mocked<PasswordEncoder>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResetPasswordUseCase,
        {
          provide: UserRepository,
          useValue: { findByEmail: jest.fn(), update: jest.fn() },
        },
        {
          provide: PasswordResetTokenRepository,
          useValue: { findByToken: jest.fn(), delete: jest.fn() },
        },
        { provide: SessionRepository, useValue: { deleteByUserId: jest.fn() } },
        { provide: PasswordEncoder, useValue: { hash: jest.fn() } },
        {
          provide: EventPublisher,
          useValue: { publishPasswordChanged: jest.fn() },
        },
      ],
    }).compile();

    useCase = module.get<ResetPasswordUseCase>(ResetPasswordUseCase);
    userRepository = module.get(UserRepository);
    tokenRepository = module.get(PasswordResetTokenRepository);
    sessionRepository = module.get(SessionRepository);
    passwordEncoder = module.get(PasswordEncoder);
    eventPublisher = module.get(EventPublisher);
  });

  it('should reset password, revoke sessions, and publish event', async () => {
    const user = new User(
      '1',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
      'oldHash',
      'secret',
    );
    tokenRepository.findByToken.mockResolvedValue('test@example.com');
    userRepository.findByEmail.mockResolvedValue(user);
    passwordEncoder.hash.mockResolvedValue('newHash');

    await useCase.execute('token', 'newPass');

    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'newHash' }),
    );
    expect(sessionRepository.deleteByUserId).toHaveBeenCalledWith('1');
    expect(tokenRepository.delete).toHaveBeenCalledWith('token');
    expect(eventPublisher.publishPasswordChanged).toHaveBeenCalled();
  });

  it('should throw if token invalid', async () => {
    tokenRepository.findByToken.mockResolvedValue(null);
    await expect(useCase.execute('token', 'newPass')).rejects.toThrow(
      BadRequestException,
    );
  });
});
