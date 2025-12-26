import { Injectable } from '@nestjs/common';
import { UserRepository } from '../../domain/ports/repositories';
import { User } from '../../domain/entities/user.entity';
import { PrismaService } from '../config/prisma.service';
import { User as PrismaUser } from '@prisma/client';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        id: user.id || undefined, // Prisma will generate if not provided, but we defined UUID in logic usually
        email: user.email,
        password_hash: user.passwordHash,
        role: user.role,
        is_verified: user.isVerified,
        mfa_enabled: user.mfaEnabled,
        // created_at is default now()
      },
    });
    return this.mapToDomain(created);
  }

  async update(user: User): Promise<User> {
     const updated = await this.prisma.user.update({
        where: { id: user.id },
        data: {
            email: user.email,
            password_hash: user.passwordHash,
            role: user.role,
            is_verified: user.isVerified,
            mfa_enabled: user.mfaEnabled,
        }
    });
    return this.mapToDomain(updated);
  }

  private mapToDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.email,
      prismaUser.role,
      prismaUser.is_verified,
      prismaUser.mfa_enabled,
      prismaUser.created_at,
      prismaUser.password_hash,
    );
  }
}
