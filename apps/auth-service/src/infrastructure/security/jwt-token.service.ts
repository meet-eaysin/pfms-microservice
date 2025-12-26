import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../domain/ports/repositories';
import { TokenPayload } from '../../domain/types/token-payload';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JwtTokenServiceImpl implements TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  generateAccessToken(payload: TokenPayload): string {
    return this.jwtService.sign(
      { ...payload },
      {
        expiresIn: this.configService.accessTokenExpiresIn,
      },
    );
  }

  generateRefreshToken(): string {
    return this.jwtService.sign(
      {},
      {
        secret: this.configService.jwtRefreshSecret,
        expiresIn: this.configService.refreshTokenExpiresIn,
      },
    );
  }

  // To support opaque tokens if needed, but going with JWT for now as per "Response: jwt..." hint.
  // Actually, I'll add a helper to just generate random string if needed, but interface says string.

  verifyAccessToken(token: string): TokenPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.jwtSecret,
    });
  }

  verifyRefreshToken(token: string): TokenPayload {
    return this.jwtService.verify(token, {
      secret: this.configService.jwtRefreshSecret,
    });
  }
}
