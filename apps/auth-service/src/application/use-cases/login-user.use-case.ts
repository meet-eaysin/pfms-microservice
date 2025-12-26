import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LoginUserDto, LoginUserResponseDto } from '../dtos/login-user.dto';
import {
  UserRepository,
  PasswordEncoder,
  TokenService,
  SessionRepository,
} from '../../domain/ports/repositories';
import { Session } from '../../domain/entities/user.entity';
import { DeviceInfo } from '../../domain/value-objects/device-info';

@Injectable()
export class LoginUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordEncoder: PasswordEncoder,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    dto: LoginUserDto,
    deviceInfo: DeviceInfo = {},
  ): Promise<LoginUserResponseDto> {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await this.passwordEncoder.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = this.tokenService.generateRefreshToken();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const sessionId = randomUUID();

    const session = new Session(
      sessionId,
      user.id,
      refreshToken,
      expiresAt,
      deviceInfo,
    );
    await this.sessionRepository.create(session);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    };
  }
}
