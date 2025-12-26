import { Injectable, ConflictException } from '@nestjs/common';
import {
  RegisterUserDto,
  RegisterUserResponseDto,
} from '../dtos/register-user.dto';
import {
  UserRepository,
  PasswordEncoder,
  TokenService,
  SessionRepository,
} from '../../domain/ports/repositories';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { User, Session } from '../../domain/entities/user.entity';

import { randomUUID } from 'crypto';

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordEncoder: PasswordEncoder,
    private readonly tokenService: TokenService,
    private readonly eventPublisher: EventPublisher,
    // Injecting interfaces, module will provide implementations
  ) {}

  async execute(dto: RegisterUserDto): Promise<RegisterUserResponseDto> {
    const existingUser = await this.userRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const passwordHash = await this.passwordEncoder.hash(dto.password);

    const newUser = new User(
      '',
      dto.email,
      'user',
      false,
      false,
      new Date(),
      passwordHash,
    );

    // Note: Creating user returns the User with ID
    const savedUser = await this.userRepository.create(newUser);

    await this.eventPublisher.publishUserCreated({
      id: savedUser.id,
      email: savedUser.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      occurredAt: new Date(),
    });

    const accessToken = this.tokenService.generateAccessToken({
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    });

    const refreshToken = this.tokenService.generateRefreshToken();

    // Create Session
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // We rely on DB to generate ID?
    const sessionId = randomUUID();

    const session = new Session(sessionId, savedUser.id, refreshToken, expiresAt, {});
    await this.sessionRepository.create(session);

    // 6. Return Response
    return {
      user: {
        id: savedUser.id,
        email: savedUser.email,
      },
      accessToken,
      refreshToken,
    };
  }
}
