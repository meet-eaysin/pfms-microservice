import { betterAuth } from 'better-auth';
import { PrismaClient } from '@prisma/client';
import { User, Session } from '../../domain/entities/user.entity';
import { AuthConfig } from '../../config';
import { toNodeHandler } from 'better-auth/node';
import type { Request, Response } from 'express';

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

export class BetterAuthAdapter {
  public readonly auth: ReturnType<typeof betterAuth>;
  private readonly nodeHandler: ReturnType<typeof toNodeHandler>;

  constructor(
    private readonly config: AuthConfig,
    private readonly prisma: PrismaClient,
  ) {
    if (
      !this.config.BETTER_AUTH_SECRET ||
      this.config.BETTER_AUTH_SECRET.length < 32
    ) {
      throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
    }

    if (!this.config.DATABASE_URL) {
      throw new Error('Database URL is required for better-auth');
    }

    this.auth = betterAuth({
      database: this.prisma,
      secret: this.config.BETTER_AUTH_SECRET,
      emailAndPassword: {
        enabled: true,
        minPasswordLength: this.config.PASSWORD_MIN_LENGTH,
        maxPasswordLength: 128,
        requireEmailVerification: this.config.EMAIL_VERIFICATION_ENABLED,
      },
      socialProviders: this.configureSocialProviders(),
      session: {
        expiresIn: this.config.SESSION_ABSOLUTE_TIMEOUT_HOURS * 60 * 60,
        updateAge: this.config.SESSION_IDLE_TIMEOUT_HOURS * 60 * 60,
        cookieCache: {
          enabled: true,
          maxAge: this.config.BETTER_AUTH_COOKIE_MAX_AGE,
        },
      },
      advanced: {
        cookiePrefix: this.config.BETTER_AUTH_COOKIE_NAME,
        crossSubDomainCookies: {
          enabled: false,
        },
        useSecureCookies: this.config.BETTER_AUTH_COOKIE_SECURE,
        defaultCookieAttributes: {
          sameSite: this.config.BETTER_AUTH_COOKIE_SAME_SITE,
          httpOnly: true,
          secure: this.config.BETTER_AUTH_COOKIE_SECURE,
          path: '/',
        },
      },
    });

    // Create Node.js handler for Express
    this.nodeHandler = toNodeHandler(this.auth);
  }

  private configureSocialProviders(): Record<string, unknown> {
    const providers: Record<string, unknown> = {};

    // Google OAuth
    if (this.config.GOOGLE_CLIENT_ID && this.config.GOOGLE_CLIENT_SECRET) {
      providers.google = {
        clientId: this.config.GOOGLE_CLIENT_ID,
        clientSecret: this.config.GOOGLE_CLIENT_SECRET,
        redirectURI: this.config.GOOGLE_REDIRECT_URI,
      };
    }

    // GitHub OAuth
    if (this.config.GITHUB_CLIENT_ID && this.config.GITHUB_CLIENT_SECRET) {
      providers.github = {
        clientId: this.config.GITHUB_CLIENT_ID,
        clientSecret: this.config.GITHUB_CLIENT_SECRET,
        redirectURI: this.config.GITHUB_REDIRECT_URI,
      };
    }

    // Apple OAuth
    if (
      this.config.APPLE_CLIENT_ID &&
      this.config.APPLE_TEAM_ID &&
      this.config.APPLE_KEY_ID &&
      this.config.APPLE_PRIVATE_KEY
    ) {
      providers.apple = {
        clientId: this.config.APPLE_CLIENT_ID,
        teamId: this.config.APPLE_TEAM_ID,
        keyId: this.config.APPLE_KEY_ID,
        privateKey: this.config.APPLE_PRIVATE_KEY,
        redirectURI: this.config.APPLE_REDIRECT_URI,
      };
    }

    return providers;
  }

  /**
   * Handle Better Auth requests using the official toNodeHandler
   * This should be used for the catch-all route: app.all('/api/auth/*', ...)
   */
  async handleRequest(req: Request, res: Response): Promise<void> {
    return this.nodeHandler(req, res);
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
}

// Factory function for creating adapter
export function createBetterAuthAdapter(
  config: AuthConfig,
  prisma: PrismaClient,
): BetterAuthAdapter {
  return new BetterAuthAdapter(config, prisma);
}
