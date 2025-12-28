import { UUID, Currency, Language, Timezone, ISODateString } from './common';
import { UserRole } from './enums';

/**
 * Auth Service Types
 */
export interface AuthUser {
  id: UUID;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin: ISODateString | null;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Session {
  id: UUID;
  userId: UUID;
  tokenHash: string;
  deviceInfo?: Record<string, any>;
  ipAddress?: string;
  expiresAt: ISODateString;
  createdAt: ISODateString;
  lastAccessedAt: ISODateString;
}

export interface OAuthProvider {
  id: UUID;
  userId: UUID;
  provider: 'google' | 'facebook' | 'apple' | 'github';
  providerUserId: string;
  accessToken?: string;
  refreshToken?: string;
  createdAt: ISODateString;
}

export interface MFASettings {
  id: UUID;
  userId: UUID;
  method: 'totp' | 'sms';
  secret?: string;
  isEnabled: boolean;
  backupCodes?: string[];
  createdAt: ISODateString;
}

export interface PasswordResetToken {
  id: UUID;
  userId: UUID;
  token: string;
  expiresAt: ISODateString;
  used: boolean;
  createdAt: ISODateString;
}

/**
 * User Service Types
 */
export interface UserProfile {
  id: UUID;
  userId: UUID;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  currency: Currency;
  timezone: Timezone;
  language: Language;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface FinancialPreferences {
  id: UUID;
  userId: UUID;
  dailyBudgetLimit?: number;
  monthlyBudgetLimit?: number;
  savingsTarget?: number;
  investmentRiskLevel?: 'low' | 'medium' | 'high';
  salaryDay?: number;
  earningSchedule?: 'monthly' | 'weekly' | 'biweekly';
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PrivacySettings {
  id: UUID;
  userId: UUID;
  profileVisibility: 'private' | 'friends' | 'public';
  showNetWorth: boolean;
  allowAnalytics: boolean;
  dataSharing: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface NotificationPreferenceUser {
  id: UUID;
  userId: UUID;
  channel: 'push' | 'email' | 'sms';
  category: string;
  enabled: boolean;
  createdAt: ISODateString;
}

/**
 * Family/Contact Management - Now in family.ts
 */

/**
 * User Service DTOs
 */
export interface CreateUserProfileDto {
  userId: UUID;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  currency?: Currency;
  timezone?: Timezone;
  language?: Language;
}

export interface UpdateUserProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  dateOfBirth?: string;
  currency?: Currency;
  timezone?: Timezone;
  language?: Language;
}

export interface UpdateFinancialPreferencesDto {
  dailyBudgetLimit?: number;
  monthlyBudgetLimit?: number;
  savingsTarget?: number;
  investmentRiskLevel?: 'low' | 'medium' | 'high';
  salaryDay?: number;
  earningSchedule?: 'monthly' | 'weekly' | 'biweekly';
}

/**
 * Auth Service DTOs
 */
export interface SignUpDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInDto {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface EnableMFADto {
  method: 'totp' | 'sms';
  phoneNumber?: string;
}

export interface VerifyMFADto {
  code: string;
}
