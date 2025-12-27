import { Injectable, UnauthorizedException } from '@nestjs/common';
import { IAuthService } from '../../domain/interfaces/auth.interface';
import { User, Session } from '../../domain/entities/user.entity';
import { BetterAuthAdapter } from '../../infrastructure/auth/better-auth.adapter';

@Injectable()
export class AuthApplicationService implements IAuthService {
  constructor(private readonly betterAuthAdapter: BetterAuthAdapter) {}

  async validateSession(
    token: string,
  ): Promise<{ user: User; session: Session } | null> {
    const session = await this.betterAuthAdapter.getSessionByToken(token);

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    return session;
  }

  async getSession(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ user: User; session: Session } | null> {
    const session = await this.betterAuthAdapter.getSession(headers);

    if (!session) {
      throw new UnauthorizedException('No active session');
    }

    return session;
  }

  async signOut(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    await this.betterAuthAdapter.signOut(headers);
  }
}
