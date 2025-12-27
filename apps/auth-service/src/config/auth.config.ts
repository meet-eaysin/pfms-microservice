import { registerAs } from '@nestjs/config';
import { loadAuthConfig, type AuthConfig } from '@pfms/config';

export interface ExtendedAuthConfig extends AuthConfig {
  databaseUrl: string;
  betterAuthUrl: string;
}

export default registerAs('auth', (): ExtendedAuthConfig => {
  const authConfig = loadAuthConfig();
  const databaseUrl =
    process.env.DATABASE_URL || process.env.BETTER_AUTH_DATABASE_URL || '';

  return {
    ...authConfig,
    databaseUrl,
    betterAuthUrl:
      process.env.BETTER_AUTH_URL ||
      `http://localhost:${process.env.SERVICE_PORT || 3001}/api/auth`,
  };
});
