import { Injectable } from '@nestjs/common';
import { IAuthRepository } from '../../domain/interfaces/auth.interface';
import { User, Session } from '../../domain/entities/user.entity';

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(userId: string): Promise<User | null> {
    return this.authRepository.findUserById(userId);
  }
}

@Injectable()
export class GetUserSessionsUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(userId: string): Promise<Session[]> {
    return this.authRepository.getUserSessions(userId);
  }
}

@Injectable()
export class RevokeSessionUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(sessionId: string, userId: string): Promise<void> {
    return this.authRepository.revokeSession(sessionId, userId);
  }
}

@Injectable()
export class RevokeAllSessionsUseCase {
  constructor(private readonly authRepository: IAuthRepository) {}

  async execute(userId: string, exceptSessionId?: string): Promise<void> {
    return this.authRepository.revokeAllSessions(userId, exceptSessionId);
  }
}
