import type { User, Session } from '../entities/user.entity';

export interface IAuthService {
  validateSession(
    token: string,
  ): Promise<{ user: User; session: Session } | null>;
  getSession(
    headers:
      | { headers: Headers }
      | Record<string, string | string[] | undefined>,
  ): Promise<{ user: User; session: Session } | null>;
  signOut(
    headers:
      | { headers: Headers }
      | Record<string, string | string[] | undefined>,
  ): Promise<void>;
}

export interface IAuthRepository {
  findUserById(userId: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  getUserSessions(userId: string): Promise<Session[]>;
  revokeSession(sessionId: string, userId: string): Promise<void>;
  revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void>;
}
