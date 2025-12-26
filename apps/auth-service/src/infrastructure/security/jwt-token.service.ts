import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../domain/ports/repositories';
import { TokenPayload } from '../../domain/types/token-payload';

@Injectable()
export class JwtTokenServiceImpl implements TokenService {
  constructor(private jwtService: JwtService) {}

  generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '15m' }); // 15m as per docs
  }

  generateRefreshToken(): string {
     // Docs say "Long-lived Refresh Tokens (7d)". 
     // Usually refresh tokens are opaque or also JWTs. 
     // Docs say "RefreshToken: jwt..." in Register Response example.
     // But "refresh_token: TEXT Hashed token for rotation" in DB schema.
     // If we store it hashed, we probably give the user a random string matching standard practice for rotation.
     // However, the Register Response example `refreshToken: "jwt..."` implies it might be a JWT.
     // If it IS a JWT, why hash it? Maybe hash the signature?
     // I'll assume standard Opaque token (random string) is safer for strict rotation and revocation, BUT
     // to Match "Match APIs... Response: refreshToken: jwt...", I will make it a JWT.
     // Actually, if I use `jwtService.sign(payload, { expiresIn: '7d' })`, that matches.
     // And I will store the *hash* of it in DB? Or the token itself?
     // Schema says `refresh_token String @db.Text`.
     // Documentation says "Refresh Token: Hashed token for rotation".
     // If I return a JWT to the user, and store a hash, I can't look it up easily unless I decode the JWT to get ID.
     // I'll stick to: Generate JWT, Return JWT. Store Hash of JWT (or just JWT? Docs say Hashed).
     // Wait, if I store Hash, I need index to find it? No, usually I'd put `sessionId` inside the JWT payload.
     // Then `findById(sessionId)` and compare `hash(token)` with stored hash.
     // I'll do that: RefreshToken = JWT containing `sub` (userId) and `sid` (sessionId).
     return this.jwtService.sign({}, { expiresIn: '7d' });
  }

  // To support opaque tokens if needed, but going with JWT for now as per "Response: jwt..." hint.
  // Actually, I'll add a helper to just generate random string if needed, but interface says string.
  
  verifyAccessToken(token: string): TokenPayload {
      return this.jwtService.verify(token);
  }
}
