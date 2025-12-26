import { Test, TestingModule } from '@nestjs/testing';
import { VerifyMfaUseCase } from './verify-mfa.use-case';
import { UserRepository } from '../../domain/ports/repositories';
import { MfaService } from '../../domain/ports/mfa.service';
import { User } from '../../domain/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('VerifyMfaUseCase', () => {
  let useCase: VerifyMfaUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let mfaService: jest.Mocked<MfaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VerifyMfaUseCase,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: MfaService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<VerifyMfaUseCase>(VerifyMfaUseCase);
    userRepository = module.get(UserRepository);
    mfaService = module.get(MfaService);
  });

  it('should verify token and enable mfa if valid', async () => {
    const user = new User(
      '1',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
      null,
      'secret',
    );
    userRepository.findById.mockResolvedValue(user);
    mfaService.verify.mockResolvedValue(true);

    const result = await useCase.execute('1', '123456');

    expect(result.verified).toBe(true);
    expect(result.backupCodes).toHaveLength(10);
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        mfaEnabled: true,
      }),
    );
  });

  it('should return false if token invalid', async () => {
    const user = new User(
      '1',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
      null,
      'secret',
    );
    userRepository.findById.mockResolvedValue(user);
    mfaService.verify.mockResolvedValue(false);

    const result = await useCase.execute('1', 'wrong');

    expect(result.verified).toBe(false);
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('should throw if secret not set', async () => {
    const user = new User(
      '1',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
      null,
      null,
    );
    userRepository.findById.mockResolvedValue(user);

    await expect(useCase.execute('1', '123456')).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
