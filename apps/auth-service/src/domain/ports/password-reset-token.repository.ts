export abstract class PasswordResetTokenRepository {
  abstract save(
    email: string,
    token: string,
    ttlSeconds: number,
  ): Promise<void>;
  abstract findByToken(token: string): Promise<string | null>; // Returns email
  abstract delete(token: string): Promise<void>;
}
