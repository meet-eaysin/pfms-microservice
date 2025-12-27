import { IAuthService } from '../../domain/interfaces/auth.interface';
import { User, Session } from '../../domain/entities/user.entity';
import { BetterAuthAdapter } from '../../infrastructure/auth/better-auth.adapter';

export class AuthApplicationService implements IAuthService {
  constructor(private readonly betterAuthAdapter: BetterAuthAdapter) {}

  async validateSession(
    token: string,
  ): Promise<{ user: User; session: Session } | null> {
    const session = await this.betterAuthAdapter.getSessionByToken(token);

    if (!session) {
      throw new Error('Invalid session');
    }

    return session;
  }

  async getSession(
    headersOrRecord:
      | { headers: Headers }
      | Record<string, string | string[] | undefined>,
  ): Promise<{ user: User; session: Session } | null> {
    // Handle both Headers object and Record format
    const headers =
      'headers' in headersOrRecord
        ? headersOrRecord
        : { headers: headersOrRecord as any };
    const session = await this.betterAuthAdapter.getSession(headers as any);

    if (!session) {
      throw new Error('No active session');
    }

    return session;
  }

  async signOut(
    headersOrRecord:
      | { headers: Headers }
      | Record<string, string | string[] | undefined>,
  ): Promise<void> {
    // Handle both Headers object and Record format
    const headers =
      'headers' in headersOrRecord
        ? headersOrRecord
        : { headers: headersOrRecord as any };
    await this.betterAuthAdapter.signOut(headers as any);
  }
}
