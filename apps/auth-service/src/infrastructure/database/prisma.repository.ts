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
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      token: session.token,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
  }

  async revokeSession(sessionId: string, userId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  async revokeAllSessions(userId: string, exceptSessionId?: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        ...(exceptSessionId && { id: { not: exceptSessionId } }),
      },
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
