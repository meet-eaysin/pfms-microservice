import { Test, TestingModule } from '@nestjs/testing';
import { RegisterUserUseCase } from './register-user.use-case';
import { UserRepository, SessionRepository, PasswordEncoder, TokenService } from '../../domain/ports/repositories';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { User } from '../../domain/entities/user.entity';
import { ConflictException } from '@nestjs/common';

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;
  let userRepository: UserRepository;
  let sessionRepository: SessionRepository;
  let passwordEncoder: PasswordEncoder;
  let tokenService: TokenService;
  let eventPublisher: EventPublisher;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterUserUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: SessionRepository,
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: PasswordEncoder,
          useValue: {
            hash: jest.fn().mockResolvedValue('hashed_password'),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockReturnValue('access_token'),
            generateRefreshToken: jest.fn().mockReturnValue('refresh_token'),
          },
        },
        {
          provide: EventPublisher,
          useValue: {
            publishUserCreated: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RegisterUserUseCase>(RegisterUserUseCase);
    userRepository = module.get(UserRepository);
    sessionRepository = module.get(SessionRepository);
    passwordEncoder = module.get(PasswordEncoder);
    tokenService = module.get(TokenService);
    eventPublisher = module.get(EventPublisher);
  });

  it('should register a new user successfully', async () => {
    const dto: RegisterUserDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
    };

    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    (userRepository.create as jest.Mock).mockImplementation((u) => Promise.resolve({ ...u, id: 'user-id' }));

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(passwordEncoder.hash).toHaveBeenCalledWith(dto.password);
    expect(userRepository.create).toHaveBeenCalled();
    expect(eventPublisher.publishUserCreated).toHaveBeenCalledWith(expect.objectContaining({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
    }));
    expect(tokenService.generateAccessToken).toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).toHaveBeenCalled();
    expect(sessionRepository.create).toHaveBeenCalled();
    expect(result).toEqual({
      user: { id: 'user-id', email: dto.email },
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
  });

  it('should throw ConflictException if email exists', async () => {
    const dto: RegisterUserDto = {
      email: 'existing@example.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
    };

    (userRepository.findByEmail as jest.Mock).mockResolvedValue(new User('id', dto.email, 'user', true, false, new Date()));

    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(userRepository.create).not.toHaveBeenCalled();
  });
});
