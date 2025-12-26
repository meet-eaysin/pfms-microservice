import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/repositories';
import { MfaService } from '../../domain/ports/mfa.service';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class EnableMfaUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly mfaService: MfaService,
  ) {}

  async execute(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { secret, otpauthUrl } = await this.mfaService.generateSecret(
      user.email,
    );
    const qrCode = await this.mfaService.generateQrCode(otpauthUrl);

    const updatedUser = new User(
      user.id,
      user.email,
      user.role,
      user.isVerified,
      user.mfaEnabled, // Keep current status until verified
      user.createdAt,
      user.passwordHash,
      secret, // Set the new secret
    );

    await this.userRepository.update(updatedUser);

    return { secret, qrCode };
  }
}
