import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { betterAuth } from 'better-auth';
import { PrismaClient } from '@prisma/client';
import { User, Session } from '../../domain/entities/user.entity';

interface BetterAuthSession {
  user: {
    id: string;
    email: string;
    emailVerified: boolean;
    name?: string | null;
    image?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}

@Injectable()
export class BetterAuthAdapter {
  private readonly auth: ReturnType<typeof betterAuth>;
  private readonly prisma: PrismaClient;

  constructor(private readonly configService: ConfigService) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.configService.get<string>('auth.databaseUrl'),
        },
      },
    });

    const authSecret = this.configService.get<string>(
      'auth.BETTER_AUTH_SECRET',
    );
    const databaseUrl = this.configService.get<string>('auth.databaseUrl');

    if (!authSecret || authSecret.length < 32) {
      throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
    }

    if (!databaseUrl) {
      throw new Error('Database URL is required for better-auth');
    }

    this.auth = betterAuth({
      database: this.prisma,
      secret: authSecret,
      emailAndPassword: {
        enabled: true,
        minPasswordLength: this.configService.get<number>(
          'auth.PASSWORD_MIN_LENGTH',
          8,
        ),
        maxPasswordLength: 128,
        requireEmailVerification: this.configService.get<boolean>(
          'auth.EMAIL_VERIFICATION_ENABLED',
          true,
        ),
      },
      socialProviders: this.configureSocialProviders(),
      session: {
        expiresIn:
          this.configService.get<number>(
            'auth.SESSION_ABSOLUTE_TIMEOUT_HOURS',
            24,
          ) *
          60 *
          60,
        updateAge:
          this.configService.get<number>('auth.SESSION_IDLE_TIMEOUT_HOURS', 2) *
          60 *
          60,
        cookieCache: {
          enabled: true,
          maxAge: this.configService.get<number>(
            'auth.BETTER_AUTH_COOKIE_MAX_AGE',
            2592000,
          ),
        },
      },
      advanced: {
        cookiePrefix: this.configService.get<string>(
          'auth.BETTER_AUTH_COOKIE_NAME',
          'better-auth',
        ),
        crossSubDomainCookies: {
          enabled: false,
        },
        useSecureCookies: this.configService.get<boolean>(
          'auth.BETTER_AUTH_COOKIE_SECURE',
          true,
        ),
        defaultCookieAttributes: {
          sameSite: this.configService.get<'strict' | 'lax' | 'none'>(
            'auth.BETTER_AUTH_COOKIE_SAME_SITE',
            'lax',
          ),
          httpOnly: true,
          secure: this.configService.get<boolean>(
            'auth.BETTER_AUTH_COOKIE_SECURE',
            true,
          ),
          path: '/',
        },
      },
    });
  }

  private configureSocialProviders(): Record<string, unknown> {
    const providers: Record<string, unknown> = {};

    // Google OAuth
    const googleClientId = this.configService.get<string>(
      'auth.GOOGLE_CLIENT_ID',
    );
    const googleClientSecret = this.configService.get<string>(
      'auth.GOOGLE_CLIENT_SECRET',
    );
    if (googleClientId && googleClientSecret) {
      providers.google = {
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        redirectURI: this.configService.get<string>('auth.GOOGLE_REDIRECT_URI'),
      };
    }

    // GitHub OAuth
    const githubClientId = this.configService.get<string>(
      'auth.GITHUB_CLIENT_ID',
    );
    const githubClientSecret = this.configService.get<string>(
      'auth.GITHUB_CLIENT_SECRET',
    );
    if (githubClientId && githubClientSecret) {
      providers.github = {
        clientId: githubClientId,
        clientSecret: githubClientSecret,
        redirectURI: this.configService.get<string>('auth.GITHUB_REDIRECT_URI'),
      };
    }

    // Apple OAuth
    const appleClientId = this.configService.get<string>(
      'auth.APPLE_CLIENT_ID',
    );
    const appleTeamId = this.configService.get<string>('auth.APPLE_TEAM_ID');
    const appleKeyId = this.configService.get<string>('auth.APPLE_KEY_ID');
    const applePrivateKey = this.configService.get<string>(
      'auth.APPLE_PRIVATE_KEY',
    );
    if (appleClientId && appleTeamId && appleKeyId && applePrivateKey) {
      providers.apple = {
        clientId: appleClientId,
        teamId: appleTeamId,
        keyId: appleKeyId,
        privateKey: applePrivateKey,
        redirectURI: this.configService.get<string>('auth.APPLE_REDIRECT_URI'),
      };
    }

    return providers;
  }

  async handleRequest(req: unknown): Promise<void> {
    await this.auth.handler(req as Parameters<typeof this.auth.handler>[0]);
  }

  async getSession(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<{ user: User; session: Session } | null> {
    const session = await this.auth.api.getSession({ headers });

    if (!session || !this.isBetterAuthSession(session)) {
      return null;
    }

    return this.mapToEntities(session);
  }

  async getSessionByToken(
    token: string,
  ): Promise<{ user: User; session: Session } | null> {
    const session = await this.auth.api.getSession({
      headers: {
        cookie: `better-auth-session=${token}`,
      },
    });

    if (!session || !this.isBetterAuthSession(session)) {
      return null;
    }

    return this.mapToEntities(session);
  }

  async signOut(
    headers: Record<string, string | string[] | undefined>,
  ): Promise<void> {
    await this.auth.api.signOut({ headers });
  }

  private isBetterAuthSession(obj: unknown): obj is BetterAuthSession {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'user' in obj &&
      'session' in obj
    );
  }

  private mapToEntities(betterAuthSession: BetterAuthSession): {
    user: User;
    session: Session;
  } {
    return {
      user: {
        id: betterAuthSession.user.id,
        email: betterAuthSession.user.email,
        emailVerified: betterAuthSession.user.emailVerified,
        name: betterAuthSession.user.name ?? null,
        image: betterAuthSession.user.image ?? null,
        createdAt: betterAuthSession.user.createdAt,
        updatedAt: betterAuthSession.user.updatedAt,
      },
      session: {
        id: betterAuthSession.session.id,
        userId: betterAuthSession.session.userId,
        token: betterAuthSession.session.token,
        expiresAt: betterAuthSession.session.expiresAt,
        ipAddress: betterAuthSession.session.ipAddress ?? null,
        userAgent: betterAuthSession.session.userAgent ?? null,
        createdAt: betterAuthSession.session.createdAt,
        updatedAt: betterAuthSession.session.updatedAt,
      },
    };
  }

  getPrisma(): PrismaClient {
    return this.prisma;
  }
}
