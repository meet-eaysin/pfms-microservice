import { Test, TestingModule } from '@nestjs/testing';
import { EnableMfaUseCase } from './enable-mfa.use-case';
import { UserRepository } from '../../domain/ports/repositories';
import { MfaService } from '../../domain/ports/mfa.service';
import { User } from '../../domain/entities/user.entity';

describe('EnableMfaUseCase', () => {
  let useCase: EnableMfaUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let mfaService: jest.Mocked<MfaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnableMfaUseCase,
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
            generateSecret: jest.fn(),
            generateQrCode: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<EnableMfaUseCase>(EnableMfaUseCase);
    userRepository = module.get(UserRepository);
    mfaService = module.get(MfaService);
  });

  it('should generate secret and qr code and update user', async () => {
    const user = new User(
      '1',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
    );
    userRepository.findById.mockResolvedValue(user);
    mfaService.generateSecret.mockResolvedValue({
      secret: 'secret',
      otpauthUrl: 'url',
    });
    mfaService.generateQrCode.mockResolvedValue('qr');

    const result = await useCase.execute('1');

    expect(result).toEqual({ secret: 'secret', qrCode: 'qr' });
    expect(userRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        mfaSecret: 'secret',
        mfaEnabled: false,
      }),
    );
  });

  it('should throw error if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1')).rejects.toThrow('User not found');
  });
});
