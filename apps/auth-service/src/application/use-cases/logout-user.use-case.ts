import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/ports/repositories';

@Injectable()
export class LogoutUserUseCase {
  constructor(private readonly sessionRepository: SessionRepository) {}

  async execute(userId: string, currentSessionId?: string): Promise<void> {
    if (currentSessionId) {
        await this.sessionRepository.delete(currentSessionId);
    } else {
        await this.sessionRepository.delete(currentSessionId);
    }
  }
}
