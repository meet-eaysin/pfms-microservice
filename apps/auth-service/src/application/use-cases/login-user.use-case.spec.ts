import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserUseCase } from './login-user.use-case';
import {
  UserRepository,
  SessionRepository,
  PasswordEncoder,
  TokenService,
} from '../../domain/ports/repositories';
import { LoginUserDto } from '../dtos/login-user.dto';
import { User } from '../../domain/entities/user.entity';
import { UnauthorizedException } from '@nestjs/common';

describe('LoginUserUseCase', () => {
  let useCase: LoginUserUseCase;
  let userRepository: UserRepository;
  let sessionRepository: SessionRepository;
  let passwordEncoder: PasswordEncoder;
  let tokenService: TokenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: UserRepository,
          useValue: {
            findByEmail: jest.fn(),
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
            compare: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn().mockReturnValue('access_token'),
            generateRefreshToken: jest.fn().mockReturnValue('refresh_token'),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get(UserRepository);
    sessionRepository = module.get(SessionRepository);
    passwordEncoder = module.get(PasswordEncoder);
    tokenService = module.get(TokenService);
  });

  it('should login successfully', async () => {
    const dto: LoginUserDto = {
      email: 'test@example.com',
      password: 'password123',
    };
    const user = new User(
      'user-id',
      dto.email,
      'user',
      true,
      false,
      new Date(),
      'hashed_password',
    );

    (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);
    (passwordEncoder.compare as jest.Mock).mockResolvedValue(true);

    const result = await useCase.execute(dto);

    expect(userRepository.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(passwordEncoder.compare).toHaveBeenCalledWith(
      dto.password,
      'hashed_password',
    );
    expect(tokenService.generateAccessToken).toHaveBeenCalled();
    expect(tokenService.generateRefreshToken).toHaveBeenCalled();
    expect(sessionRepository.create).toHaveBeenCalled();
    expect(result).toEqual({
      user: { id: 'user-id', email: dto.email, role: 'user' },
      accessToken: 'access_token',
      refreshToken: 'refresh_token',
    });
  });

  it('should throw UnauthorizedException if user not found', async () => {
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(null);
    const dto = { email: 'test@example.com', password: 'pwd' };
    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if password valid', async () => {
    const user = new User(
      'user-id',
      'test@example.com',
      'user',
      true,
      false,
      new Date(),
      'hashed_password',
    );
    (userRepository.findByEmail as jest.Mock).mockResolvedValue(user);
    (passwordEncoder.compare as jest.Mock).mockResolvedValue(false);
    const dto = { email: 'test@example.com', password: 'pwd' };
    await expect(useCase.execute(dto)).rejects.toThrow(UnauthorizedException);
  });
});
