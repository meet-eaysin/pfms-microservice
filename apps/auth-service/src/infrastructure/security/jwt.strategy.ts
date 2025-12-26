import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../../domain/types/token-payload';
// We should use env vars for secret
const JWT_SECRET = process.env.JWT_SECRET || 'secret'; // temporary fallback

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: TokenPayload) {
    // Payload contains sub (userId), email, role
    return { id: payload.sub, email: payload.email, role: payload.role };
  }
}
