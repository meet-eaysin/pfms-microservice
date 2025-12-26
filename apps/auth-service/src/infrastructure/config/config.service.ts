import { Injectable } from '@nestjs/common';
import {
  loadAuthConfig,
  loadJWTConfig,
  loadServerConfig,
  AuthConfig,
  JWTConfig,
  ServerConfig,
} from '@pfms/config';

@Injectable()
export class ConfigService {
  public readonly auth: AuthConfig;
  public readonly jwt: JWTConfig;
  public readonly server: ServerConfig;

  constructor() {
    this.auth = loadAuthConfig();
    this.jwt = loadJWTConfig();
    this.server = loadServerConfig();
  }

  get isProduction(): boolean {
    return this.server.NODE_ENV === 'production';
  }

  get port(): number {
    return this.server.PORT;
  }

  get jwtSecret(): string {
    return this.jwt.JWT_SECRET;
  }

  get jwtRefreshSecret(): string {
    // Fallback or explicit refresh secret
    return this.jwt.JWT_REFRESH_SECRET || this.jwt.JWT_SECRET;
  }

  get accessTokenExpiresIn(): number {
    return this.parseDuration(this.jwt.JWT_ACCESS_EXPIRES_IN);
  }

  get refreshTokenExpiresIn(): number {
    return this.parseDuration(this.jwt.JWT_REFRESH_EXPIRES_IN);
  }

  private parseDuration(value: string): number {
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) {
      // Default to seconds if valid number, else throw or fallback
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) return parsed;
      throw new Error(`Invalid duration format: ${value}`);
    }
    const num = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
      case 's':
        return num;
      case 'm':
        return num * 60;
      case 'h':
        return num * 3600;
      case 'd':
        return num * 86400;
      default:
        return num;
    }
  }
}
