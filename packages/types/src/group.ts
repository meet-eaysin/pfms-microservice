import { UUID, Currency, ISODateString, Decimal, Percentage } from './common';

/**
 * Group Finance Service Types
 */
export interface FinanceGroup {
  id: UUID;
  name: string;
  description?: string;
  groupType?: 'trip' | 'party' | 'office' | 'event' | 'general';
  createdBy: UUID;
  isActive: boolean;
  settings?: {
    chatEnabled?: boolean;
    autoSettle?: boolean;
    simplifyDebts?: boolean;
  };
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface GroupMember {
  id: UUID;
  groupId: UUID;
  userId: UUID;
  role: 'admin' | 'member' | 'viewer';
  displayName?: string;
  joinedAt: ISODateString;
  isActive: boolean;
}

export interface GroupExpense {
  id: UUID;
  groupId: UUID;
  paidBy: UUID;
  amount: Decimal;
  currency: Currency;
  description: string;
  category?: string;
  date: string;
  splitType: 'equal' | 'unequal' | 'percentage' | 'weight' | 'custom';
  attachments?: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface ExpenseSplit {
  id: UUID;
  groupExpenseId: UUID;
  userId: UUID;
  shareAmount: Decimal;
  sharePercentage?: Percentage;
  weight?: number;
  isPaid: boolean;
  paidAt?: ISODateString;
  createdAt: ISODateString;
}

export interface Settlement {
  id: UUID;
  groupId: UUID;
  fromUserId: UUID;
  toUserId: UUID;
  amount: Decimal;
  currency: Currency;
  status: 'pending' | 'completed' | 'cancelled';
  settlementDate?: string;
  notes?: string;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface GroupMessage {
  id: UUID;
  groupId: UUID;
  userId: UUID;
  messageType: 'text' | 'image' | 'expense' | 'settlement';
  content?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
  createdAt: ISODateString;
}

/**
 * Group Finance DTOs
 */
export interface CreateGroupDto {
  name: string;
  description?: string;
  groupType?: 'trip' | 'party' | 'office' | 'event' | 'general';
  settings?: {
    chatEnabled?: boolean;
    autoSettle?: boolean;
  };
}

export interface UpdateGroupDto {
  name?: string;
  description?: string;
  settings?: {
    chatEnabled?: boolean;
    autoSettle?: boolean;
  };
}

export interface AddGroupExpenseDto {
  paidBy: UUID;
  amount: Decimal;
  currency?: Currency;
  description: string;
  category?: string;
  date: string;
  splitType: 'equal' | 'unequal' | 'percentage' | 'weight' | 'custom';
  splits: Array<{
    userId: UUID;
    shareAmount?: Decimal;
    sharePercentage?: Percentage;
    weight?: number;
  }>;
  attachments?: string[];
}

export interface CreateSettlementDto {
  fromUserId: UUID;
  toUserId: UUID;
  amount: Decimal;
  currency?: Currency;
  notes?: string;
}

/**
 * Group Analytics
 */
export interface GroupBalance {
  userId: UUID;
  displayName?: string;
  totalOwed: Decimal;
  totalPaid: Decimal;
  netBalance: Decimal;
  settlements: Array<{
    withUserId: UUID;
    amount: Decimal;
    direction: 'owes' | 'owed';
  }>;
}

export interface GroupExpenseAnalytics {
  totalExpenses: Decimal;
  memberCount: number;
  averagePerMember: Decimal;
  expensesByCategory: Array<{
    category: string;
    amount: Decimal;
    percentage: Percentage;
  }>;
  topSpender: {
    userId: UUID;
    amount: Decimal;
  };
  unsettledAmount: Decimal;
}

export interface SettlementSuggestion {
  from: UUID;
  to: UUID;
  amount: Decimal;
  reason: string;
}
