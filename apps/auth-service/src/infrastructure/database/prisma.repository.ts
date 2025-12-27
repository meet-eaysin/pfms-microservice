import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { IAuthRepository } from '../../domain/interfaces/auth.interface';
import { User, Session } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaRepository implements IAuthRepository, OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor(private readonly configService: ConfigService) {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: this.configService.get<string>('database.url'),
        },
      },
    });
  }

  async findUserById(userId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        email_verified: true,
        name: true,
        image: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified,
      name: user.name,
      image: user.image,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        email_verified: true,
        name: true,
        image: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.email_verified,
      name: user.name,
      image: user.image,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      userId: session.user_id,
      token: session.token,
      expiresAt: session.expires_at,
      ipAddress: session.ip_address,
      userAgent: session.user_agent,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
    }));
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        id: sessionId,
        user_id: userId,
      },
    });
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        user_id: userId,
        ...(exceptSessionId && { id: { not: exceptSessionId } }),
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
