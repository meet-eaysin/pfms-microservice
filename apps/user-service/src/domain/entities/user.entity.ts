export interface IUserProfile {
  userId: string;
  firstName: string;
  lastName: string | null;
  avatarUrl: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFinancialPreferences {
  userId: string;
  baseCurrency: string;
  fiscalYearStart: Date;
  riskTolerance: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  updatedAt: Date;
}

export interface INotificationSettings {
  userId: string;
  emailDailyDigest: boolean;
  pushTransactions: boolean;
  emailWeeklyReport: boolean;
  pushBudgetAlerts: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFamilyMember {
  headUserId: string;
  memberUserId: string;
  relationship: string;
  inviteStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  invitedAt: Date;
  acceptedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
