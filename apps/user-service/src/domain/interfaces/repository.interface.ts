import type {
  IUserProfile,
  IFinancialPreferences,
  INotificationSettings,
  IFamilyMember,
} from '../entities/user.entity';

export interface IUserRepository {
  // Profile
  findProfileByUserId(userId: string): Promise<IUserProfile | null>;
  createProfile(profile: Omit<IUserProfile, 'createdAt' | 'updatedAt'>): Promise<IUserProfile>;
  updateProfile(
    userId: string,
    updates: Partial<Omit<IUserProfile, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<IUserProfile>;
  deleteProfile(userId: string): Promise<void>;

  // Financial Preferences
  findFinancialPreferences(userId: string): Promise<IFinancialPreferences | null>;
  createFinancialPreferences(
    prefs: Omit<IFinancialPreferences, 'createdAt' | 'updatedAt'>
  ): Promise<IFinancialPreferences>;
  updateFinancialPreferences(
    userId: string,
    updates: Partial<Omit<IFinancialPreferences, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<IFinancialPreferences>;

  // Notification Settings
  findNotificationSettings(userId: string): Promise<INotificationSettings | null>;
  createNotificationSettings(
    settings: Omit<INotificationSettings, 'createdAt' | 'updatedAt'>
  ): Promise<INotificationSettings>;
  updateNotificationSettings(
    userId: string,
    updates: Partial<Omit<INotificationSettings, 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<INotificationSettings>;

  // Family
  findFamilyMembers(userId: string): Promise<IFamilyMember[]>;
  createFamilyMember(
    member: Omit<IFamilyMember, 'createdAt' | 'updatedAt' | 'invitedAt' | 'acceptedAt'>
  ): Promise<IFamilyMember>;
  updateFamilyMemberStatus(options: {
    headUserId: string;
    memberUserId: string;
    status: 'ACCEPTED' | 'REJECTED';
  }): Promise<IFamilyMember>;
  deleteFamilyMember(options: { headUserId: string; memberUserId: string }): Promise<void>;
}

export interface IStorageService {
  uploadFile(options: { key: string; buffer: Buffer; contentType: string }): Promise<string>;
  deleteFile(key: string): Promise<void>;
  getSignedUrl(key: string): Promise<string>;
}

export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set(options: { key: string; value: unknown; ttl?: number }): Promise<void>;
  del(key: string): Promise<void>;
  flush(): Promise<void>;
}
