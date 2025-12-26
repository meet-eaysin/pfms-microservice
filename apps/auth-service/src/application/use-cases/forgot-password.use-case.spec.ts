import { Test, TestingModule } from '@nestjs/testing';
import { ForgotPasswordUseCase } from './forgot-password.use-case';
import { UserRepository } from '../../domain/ports/repositories';
import { PasswordResetTokenRepository } from '../../domain/ports/password-reset-token.repository';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { User } from '../../domain/entities/user.entity';

describe('ForgotPasswordUseCase', () => {
  let useCase: ForgotPasswordUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<PasswordResetTokenRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ForgotPasswordUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
          },
        },
        {
          provide: PasswordResetTokenRepository,
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            publishForgotPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ForgotPasswordUseCase>(ForgotPasswordUseCase);
    userRepository = module.get(UserRepository);
    tokenRepository = module.get(PasswordResetTokenRepository);
    eventPublisher = module.get(EventPublisher);
  });

  it('should generate token and publish event if user exists', async () => {
    const user = new User(
      '1',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
    );
    userRepository.findByEmail.mockResolvedValue(user);

    await useCase.execute('test@example.com');

    expect(tokenRepository.save).toHaveBeenCalled();
    expect(eventPublisher.publishForgotPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
      }),
    );
  });

  it('should not throw and not publish event if user does not exist', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await useCase.execute('test@example.com');

    expect(tokenRepository.save).not.toHaveBeenCalled();
    expect(eventPublisher.publishForgotPassword).not.toHaveBeenCalled();
  });
});
