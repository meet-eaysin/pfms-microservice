import type { IAuthService } from '../../domain/interfaces/auth.interface';
import type { User, Session } from '../../domain/entities/user.entity';
import type { BetterAuthAdapter } from '../../infrastructure/auth/better-auth.adapter';

interface ISessionResult {
  user: User;
  session: Session;
}

type HeadersInput =
  | { headers: Headers }
  | Record<string, string | string[] | undefined>;

export class AuthApplicationService implements IAuthService {
  constructor(private readonly betterAuthAdapter: BetterAuthAdapter) {}

  async validateSession(token: string): Promise<ISessionResult | null> {
    const session = await this.betterAuthAdapter.getSessionByToken(token);

    if (session === null) {
      throw new Error('Invalid session');
    }

    return session;
  }

  async getSession(headersInput: HeadersInput): Promise<ISessionResult | null> {
    const session = await this.betterAuthAdapter.getSession(headersInput);

    if (session === null) {
      throw new Error('No active session');
    }

    return session;
  }

  async signOut(headersInput: HeadersInput): Promise<void> {
    await this.betterAuthAdapter.signOut(headersInput);
  }
}
