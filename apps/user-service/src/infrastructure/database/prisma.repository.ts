import type { PrismaClient } from '@prisma/client';
import type { IUserRepository } from '@/domain/interfaces/repository.interface';
import type {
  IUserProfile,
  IFinancialPreferences,
  INotificationSettings,
  IFamilyMember,
} from '@/domain/entities/user.entity';

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  // ============================================
  // Profile Methods
  // ============================================

  async findProfileByUserId(userId: string): Promise<IUserProfile | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
    });

    return profile;
  }

  async createProfile(
    profile: Omit<IUserProfile, 'createdAt' | 'updatedAt'>
  ): Promise<IUserProfile> {
    return await this.prisma.userProfile.create({
      data: profile,
    });
  }

  async updateProfile(
    userId: string,
    updates: Partial<Omit<IUserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<IUserProfile> {
    return await this.prisma.userProfile.update({
      where: { userId },
      data: updates,
    });
  }

  async deleteProfile(userId: string): Promise<void> {
    await this.prisma.userProfile.delete({
      where: { userId },
    });
  }

  // ============================================
  // Financial Preferences Methods
  // ============================================

  async findFinancialPreferences(userId: string): Promise<IFinancialPreferences | null> {
    return await this.prisma.financialPreferences.findUnique({
      where: { userId },
    });
  }

  async createFinancialPreferences(
    prefs: Omit<IFinancialPreferences, 'createdAt' | 'updatedAt'>
  ): Promise<IFinancialPreferences> {
    return await this.prisma.financialPreferences.create({
      data: prefs,
    });
  }

  async updateFinancialPreferences(
    userId: string,
    updates: Partial<Omit<IFinancialPreferences, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<IFinancialPreferences> {
    return await this.prisma.financialPreferences.update({
      where: { userId },
      data: updates,
    });
  }

  // ============================================
  // Notification Settings Methods
  // ============================================

  async findNotificationSettings(userId: string): Promise<INotificationSettings | null> {
    return await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
  }

  async createNotificationSettings(
    settings: Omit<INotificationSettings, 'createdAt' | 'updatedAt'>
  ): Promise<INotificationSettings> {
    return await this.prisma.notificationSettings.create({
      data: settings,
    });
  }

  async updateNotificationSettings(
    userId: string,
    updates: Partial<Omit<INotificationSettings, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<INotificationSettings> {
    return await this.prisma.notificationSettings.update({
      where: { userId },
      data: updates,
    });
  }

  // ============================================
  // Family Methods
  // ============================================

  async findFamilyMembers(userId: string): Promise<IFamilyMember[]> {
    return await this.prisma.familyMember.findMany({
      where: {
        OR: [{ headUserId: userId }, { memberUserId: userId }],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createFamilyMember(
    member: Omit<IFamilyMember, 'createdAt' | 'updatedAt' | 'invitedAt' | 'acceptedAt'>
  ): Promise<IFamilyMember> {
    return await this.prisma.familyMember.create({
      data: member,
    });
  }

  async updateFamilyMemberStatus(options: {
    headUserId: string;
    memberUserId: string;
    status: 'ACCEPTED' | 'REJECTED';
  }): Promise<IFamilyMember> {
    return await this.prisma.familyMember.update({
      where: {
        headUserId_memberUserId: {
          headUserId: options.headUserId,
          memberUserId: options.memberUserId,
        },
      },
      data: {
        inviteStatus: options.status,
        acceptedAt: options.status === 'ACCEPTED' ? new Date() : null,
      },
    });
  }

  async deleteFamilyMember(options: { headUserId: string; memberUserId: string }): Promise<void> {
    await this.prisma.familyMember.delete({
      where: {
        headUserId_memberUserId: {
          headUserId: options.headUserId,
          memberUserId: options.memberUserId,
        },
      },
    });
  }

  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}

export function createPrismaUserRepository(prisma: PrismaClient): PrismaUserRepository {
  return new PrismaUserRepository(prisma);
}
