import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/repositories';
import { PasswordResetTokenRepository } from '../../domain/ports/password-reset-token.repository';
import { EventPublisher } from '../../domain/ports/event-publisher';
import { randomBytes } from 'crypto';

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: PasswordResetTokenRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);
    // Security: Always return success message even if user not found to prevent enumeration
    if (!user) {
      return { message: 'If email exists, link sent.' };
    }

    const token = randomBytes(32).toString('hex');
    await this.tokenRepository.save(email, token, 3600); // 1 hour

    await this.eventPublisher.publishForgotPassword({
      email: user.email,
      token: token,
    });

    return { message: 'If email exists, link sent.' };
  }
}
