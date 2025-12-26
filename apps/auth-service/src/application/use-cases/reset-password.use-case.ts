import { Injectable, BadRequestException } from '@nestjs/common';
import {
  UserRepository,
  SessionRepository,
  PasswordEncoder,
} from '../../domain/ports/repositories';
import { PasswordResetTokenRepository } from '../../domain/ports/password-reset-token.repository';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordEncoder: PasswordEncoder,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean }> {
    const email = await this.tokenRepository.findByToken(token);
    if (!email) {
      throw new BadRequestException('Invalid or expired token');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const hashedPassword = await this.passwordEncoder.hash(newPassword);

    // Update user password
    const updatedUser = new User(
      user.id,
      user.email,
      user.role,
      user.isVerified,
      user.mfaEnabled,
      user.createdAt,
      hashedPassword,
      user.mfaSecret,
    );

    await this.userRepository.update(updatedUser);

    // Revoke all sessions
    await this.sessionRepository.deleteByUserId(user.id);

    // Consume token
    await this.tokenRepository.delete(token);

    // Publish event
    await this.eventPublisher.publishPasswordChanged({
      userId: user.id,
      occurredAt: new Date(),
    });

    return { success: true };
  }
}
