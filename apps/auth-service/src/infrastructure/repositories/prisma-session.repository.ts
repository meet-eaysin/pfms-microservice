import { Injectable } from '@nestjs/common';
import { SessionRepository } from '../../domain/ports/repositories';
import { Session } from '../../domain/entities/user.entity';
import { PrismaService } from '../config/prisma.service';
import { Session as PrismaSession, Prisma } from '@prisma/client';
import { DeviceInfo } from '../../domain/value-objects/device-info';

@Injectable()
export class PrismaSessionRepository implements SessionRepository {
  constructor(private prisma: PrismaService) {}

  async create(session: Session): Promise<Session> {
    const created = await this.prisma.session.create({
      data: {
        id: session.id || undefined,
        user_id: session.userId,
        refresh_token: session.refreshToken,
        expires_at: session.expiresAt,
        device_info: session.deviceInfo as unknown as Prisma.InputJsonValue,
      },
    });
    return this.mapToDomain(created);
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({ where: { id } });
    if (!session) return null;
    return this.mapToDomain(session);
  }

  async findByRefreshToken(token: string): Promise<Session | null> {
    // Since token is likely hashed or just stored.
    // If the requirement was "Hashed token for rotation", we might need to search by exact match if we store hash,
    // OR we search by ID and verify hash.
    // Docs say: "refresh_token: TEXT" in table.
    // We will assume precise match for lookup for now, or scan.
    // Ideally we index it. Schema has no unique index on refresh_token?
    // Schema had: `refresh_token String @db.Text`. No @unique.
    // But we probably want to find by it.
    const session = await this.prisma.session.findFirst({
      where: { refresh_token: token },
    });
    if (!session) return null;
    return this.mapToDomain(session);
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.session.deleteMany({ where: { user_id: userId } });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({ where: { id } });
  }

  async update(session: Session): Promise<Session> {
    const updated = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refresh_token: session.refreshToken,
        expires_at: session.expiresAt,
      },
    });
    return this.mapToDomain(updated);
  }

  async findAllByUserId(userId: string): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: { user_id: userId },
    });
    return sessions.map((s) => this.mapToDomain(s));
  }

  private mapToDomain(prismaSession: PrismaSession): Session {
    return new Session(
      prismaSession.id,
      prismaSession.user_id,
      prismaSession.refresh_token,
      prismaSession.expires_at,
      // Prisma JsonValue type is strict, we need to carefully cast or validate
      prismaSession.device_info as unknown as DeviceInfo | null,
    );
  }
}
