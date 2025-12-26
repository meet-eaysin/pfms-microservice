import { User, Session, OAuthAccount } from '../entities/user.entity';
import { TokenPayload } from '../types/token-payload';

export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract create(user: User): Promise<User>;
  abstract update(user: User): Promise<User>;
}

export abstract class SessionRepository {
  abstract create(session: Session): Promise<Session>;
  abstract findById(id: string): Promise<Session | null>;
  abstract findByRefreshToken(token: string): Promise<Session | null>;
  abstract deleteByUserId(userId: string): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract update(session: Session): Promise<Session>;
  abstract findAllByUserId(userId: string): Promise<Session[]>;
}

export abstract class OAuthAccountRepository {
  abstract findByProvider(
    providerId: string,
    providerUserId: string,
  ): Promise<OAuthAccount | null>;
  abstract create(account: OAuthAccount): Promise<OAuthAccount>;
}

export abstract class PasswordEncoder {
  abstract hash(password: string): Promise<string>;
  abstract compare(plain: string, hashed: string): Promise<boolean>;
}

export abstract class TokenService {
  abstract generateAccessToken(payload: TokenPayload): string;
  abstract generateRefreshToken(): string;
  abstract verifyAccessToken(token: string): TokenPayload;
  abstract verifyRefreshToken(token: string): TokenPayload;
}
