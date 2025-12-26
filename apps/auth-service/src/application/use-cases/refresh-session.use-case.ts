import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  SessionRepository,
  TokenService,
  UserRepository,
} from '../../domain/ports/repositories';
import { Session } from '../../domain/entities/user.entity';

@Injectable()
export class RefreshSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
  ) {}

  async execute(
    refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Verify token signature/validity
    try {
      this.tokenService.verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    const session =
      await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session) {
      throw new UnauthorizedException('Session not found or revoked');
    }

    if (session.expiresAt < new Date()) {
      await this.sessionRepository.delete(session.id);
      throw new UnauthorizedException('Session expired');
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Rotate
    const newRefreshToken = this.tokenService.generateRefreshToken();

    // Update Session
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    const updatedSession = new Session(
      session.id,
      session.userId,
      newRefreshToken,
      newExpiresAt,
      session.deviceInfo,
    );

    await this.sessionRepository.update(updatedSession);

    const accessToken = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
