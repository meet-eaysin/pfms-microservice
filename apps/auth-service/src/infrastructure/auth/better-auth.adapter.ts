import type { PrismaClient } from '@prisma/client';
import type { User, Session } from '../../domain/entities/user.entity';
import type { AuthConfig } from '../../config';
import type { Request, Response } from 'express';
import type { betterAuth } from 'better-auth';
import type { toNodeHandler } from 'better-auth/node';

interface IBetterAuthSession {
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

type HeadersInput =
  | { headers: Headers }
  | Record<string, string | string[] | undefined>;

export class BetterAuthAdapter {
  public readonly auth: ReturnType<typeof betterAuth>;
  private readonly nodeHandler: ReturnType<typeof toNodeHandler>;

  private constructor(
    auth: ReturnType<typeof betterAuth>,
    nodeHandler: ReturnType<typeof toNodeHandler>,
  ) {
    this.auth = auth;
    this.nodeHandler = nodeHandler;
  }

  static async create(
    config: AuthConfig,
    prisma: PrismaClient,
  ): Promise<BetterAuthAdapter> {
    if (!config.BETTER_AUTH_SECRET || config.BETTER_AUTH_SECRET.length < 32) {
      throw new Error('BETTER_AUTH_SECRET must be at least 32 characters long');
    }

    if (!config.DATABASE_URL) {
      throw new Error('Database URL is required for better-auth');
    }

    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const { betterAuth } = await dynamicImport('better-auth');
    const { toNodeHandler } = await dynamicImport('better-auth/node');
    const { prismaAdapter } = await dynamicImport(
      'better-auth/adapters/prisma',
    );

    const auth = betterAuth({
      database: prismaAdapter(prisma, {
        provider: 'postgresql',
      }),
      secret: config.BETTER_AUTH_SECRET,
      emailAndPassword: {
        enabled: true,
        minPasswordLength: config.PASSWORD_MIN_LENGTH,
        maxPasswordLength: 128,
        requireEmailVerification: config.EMAIL_VERIFICATION_ENABLED,
      },
      socialProviders: BetterAuthAdapter.configureSocialProviders(config),
      session: {
        expiresIn: config.SESSION_ABSOLUTE_TIMEOUT_HOURS * 60 * 60,
        updateAge: config.SESSION_IDLE_TIMEOUT_HOURS * 60 * 60,
        cookieCache: {
          enabled: true,
          maxAge: config.BETTER_AUTH_COOKIE_MAX_AGE,
        },
      },
      advanced: {
        cookiePrefix: config.BETTER_AUTH_COOKIE_NAME,
        crossSubDomainCookies: {
          enabled: false,
        },
        useSecureCookies: config.BETTER_AUTH_COOKIE_SECURE,
        defaultCookieAttributes: {
          sameSite: config.BETTER_AUTH_COOKIE_SAME_SITE,
          httpOnly: true,
          secure: config.BETTER_AUTH_COOKIE_SECURE,
          path: '/',
        },
      },
      basePath: '/api/v1/auth',
    });

    const nodeHandler = toNodeHandler(auth);

    return new BetterAuthAdapter(auth, nodeHandler);
  }

  private static configureSocialProviders(
    config: AuthConfig,
  ): Record<string, unknown> {
    const providers: Record<string, unknown> = {};

    // Google OAuth
    if (
      config.GOOGLE_CLIENT_ID !== undefined &&
      config.GOOGLE_CLIENT_SECRET !== undefined
    ) {
      providers.google = {
        clientId: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        redirectURI: config.GOOGLE_REDIRECT_URI,
      };
    }

    // GitHub OAuth
    if (
      config.GITHUB_CLIENT_ID !== undefined &&
      config.GITHUB_CLIENT_SECRET !== undefined
    ) {
      providers.github = {
        clientId: config.GITHUB_CLIENT_ID,
        clientSecret: config.GITHUB_CLIENT_SECRET,
        redirectURI: config.GITHUB_REDIRECT_URI,
      };
    }

    // Apple OAuth
    if (
      config.APPLE_CLIENT_ID !== undefined &&
      config.APPLE_TEAM_ID !== undefined &&
      config.APPLE_KEY_ID !== undefined &&
      config.APPLE_PRIVATE_KEY !== undefined
    ) {
      providers.apple = {
        clientId: config.APPLE_CLIENT_ID,
        teamId: config.APPLE_TEAM_ID,
        keyId: config.APPLE_KEY_ID,
        privateKey: config.APPLE_PRIVATE_KEY,
        redirectURI: config.APPLE_REDIRECT_URI,
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
    headersInput: HeadersInput,
  ): Promise<{ user: User; session: Session } | null> {
    const headers =
      'headers' in headersInput ? headersInput.headers : headersInput;
    const session = await this.auth.api.getSession({ headers });

    if (
      session === null ||
      session === undefined ||
      !this.isBetterAuthSession(session)
    ) {
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

    if (
      session === null ||
      session === undefined ||
      !this.isBetterAuthSession(session)
    ) {
      return null;
    }

    return this.mapToEntities(session);
  }

  async signOut(headersInput: HeadersInput): Promise<void> {
    const headers =
      'headers' in headersInput ? headersInput.headers : headersInput;
    await this.auth.api.signOut({ headers });
  }

  private isBetterAuthSession(obj: unknown): obj is IBetterAuthSession {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'user' in obj &&
      'session' in obj
    );
  }

  private mapToEntities(betterAuthSession: IBetterAuthSession): {
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
