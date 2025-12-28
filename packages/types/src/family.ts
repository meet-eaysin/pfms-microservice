import { UUID, ISODateString } from './common';
import { UserRole } from './enums';

/**
 * Family Service Types
 */
export interface FamilyAccount {
  id: UUID;
  mainUserId: UUID;
  name: string;
  description?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface FamilyMember {
  id: UUID;
  familyAccountId: UUID;
  userId: UUID;
  role: UserRole;
  relationshipToMain: string;
  joinedAt: ISODateString;
  isActive: boolean;
}

export interface FamilyInvitation {
  id: UUID;
  familyAccountId: UUID;
  invitedEmail: string;
  invitedBy: UUID;
  role: UserRole;
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAt: ISODateString;
  createdAt: ISODateString;
  acceptedAt?: ISODateString;
}

export interface FamilySettings {
  id: UUID;
  familyAccountId: UUID;
  currencyFormat: string;
  timezone: string;
  language: string;
  shareExpenses: boolean;
  allowSharedBudgets: boolean;
  requireApprovalForBudgets: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Family DTOs
 */
export interface CreateFamilyAccountDto {
  name: string;
  description?: string;
  members?: Array<{
    email: string;
    role: UserRole;
    relationshipToMain: string;
  }>;
}

export interface InviteFamilyMemberDto {
  email: string;
  role: UserRole;
  relationshipToMain: string;
}

export interface AcceptInvitationDto {
  invitationId: UUID;
  relationshipToMain?: string;
}
