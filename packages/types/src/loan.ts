import { UUID, Currency, ISODateString, Decimal } from './common';

/**
 * Loan Service Types
 */
export interface Contact {
  id: UUID;
  userId: UUID;
  contactType: 'app_user' | 'external';
  linkedUserId?: UUID;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  nickname?: string;
  relationship?: string;
  notes?: string;
  avatarUrl?: string;
  isFavorite: boolean;
  isBlocked: boolean;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Loan {
  id: UUID;
  userId: UUID;
  contactId: UUID;
  type: 'borrowed' | 'lent';
  principalAmount: Decimal;
  currency: Currency;
  interestRate?: Decimal;
  interestType?: 'simple' | 'compound' | 'none';
  interestCalculation?: 'annual' | 'monthly' | 'daily';
  startDate: string;
  endDate?: string;
  actualEndDate?: string;
  emiEnabled: boolean;
  emiFrequency?: string;
  emiAmount?: Decimal;
  emiDay?: number;
  totalInstallments?: number;
  status: 'active' | 'paid' | 'overdue' | 'cancelled' | 'defaulted';
  remainingBalance?: Decimal;
  totalPaid: Decimal;
  totalInterestPaid?: Decimal;
  reason?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  hasWrittenAgreement: boolean;
  agreementUrl?: string;
  witnessInfo?: Record<string, any>;
  reminderEnabled: boolean;
  reminderDaysBefore?: number;
  autoDeduct: boolean;
  lateFeeEnabled: boolean;
  lateFeeAmount?: Decimal;
  lateFeeType?: string;
  gracePeriodDays?: number;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface EMISchedule {
  id: UUID;
  loanId: UUID;
  installmentNumber: number;
  dueDate: string;
  principalAmount: Decimal;
  interestAmount?: Decimal;
  lateFee?: Decimal;
  totalAmount: Decimal;
  status: 'pending' | 'paid' | 'partial' | 'overdue' | 'skipped' | 'waived';
  paidDate?: string;
  paidAmount?: Decimal;
  outstandingAmount: Decimal;
  partialPaymentsCount?: number;
  daysOverdue?: number;
  overdueeSince?: string;
  reminderSent: boolean;
  reminderSentAt?: ISODateString;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface LoanPayment {
  id: UUID;
  loanId: UUID;
  emiScheduleId?: UUID;
  userId: UUID;
  amount: Decimal;
  currency: Currency;
  paymentDate: string;
  paymentTime?: string;
  principalPaid?: Decimal;
  interestPaid?: Decimal;
  lateFeePaid?: Decimal;
  paymentMethod?: string;
  paymentReference?: string;
  paymentType?: 'regular' | 'partial' | 'advance';
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
  receiptUrl?: string;
  verified: boolean;
  verifiedBy?: UUID;
  verifiedAt?: ISODateString;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PaymentReminder {
  id: UUID;
  loanId: UUID;
  emiScheduleId?: UUID;
  userId: UUID;
  reminderType: string;
  reminderDate: string;
  dueDate: string;
  amount: Decimal;
  notificationSent: boolean;
  notificationSentAt?: ISODateString;
  notificationChannels?: string[];
  isAcknowledged: boolean;
  acknowledgedAt?: ISODateString;
  isSnoozed: boolean;
  snoozeUntil?: string;
  createdAt: ISODateString;
}

export interface LoanActivity {
  id: UUID;
  loanId: UUID;
  userId: UUID;
  activityType: string;
  activityDescription: string;
  paymentId?: UUID;
  emiScheduleId?: UUID;
  oldValue?: Record<string, any>;
  newValue: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
}

export interface LoanTemplate {
  id: UUID;
  userId: UUID;
  templateName: string;
  description?: string;
  type: 'borrowed' | 'lent';
  defaultAmount?: Decimal;
  interestRate?: Decimal;
  interestType?: string;
  emiFrequency?: string;
  category?: string;
  usageCount: number;
  lastUsedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface LoanDispute {
  id: UUID;
  loanId: UUID;
  raisedBy: UUID;
  disputeType: string;
  description: string;
  expectedResolution?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority?: 'low' | 'medium' | 'high';
  resolution?: string;
  resolvedBy?: UUID;
  resolvedAt?: ISODateString;
  attachments?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Loan DTOs
 */
export interface CreateContactDto {
  contactType: 'app_user' | 'external';
  linkedUserId?: UUID;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  nickname?: string;
  relationship?: string;
  notes?: string;
  avatarUrl?: string;
}

export interface CreateLoanDto {
  contactId: UUID;
  type: 'borrowed' | 'lent';
  principalAmount: Decimal;
  currency?: Currency;
  interestRate?: Decimal;
  interestType?: 'simple' | 'compound' | 'none';
  startDate: string;
  endDate?: string;
  emiEnabled?: boolean;
  emiFrequency?: string;
  emiAmount?: Decimal;
  emiDay?: number;
  reason?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  hasWrittenAgreement?: boolean;
}

export interface RecordLoanPaymentDto {
  loanId: UUID;
  emiScheduleId?: UUID;
  amount: Decimal;
  paymentDate: string;
  paymentMethod?: string;
  paymentReference?: string;
  paymentType?: 'regular' | 'partial' | 'advance';
  notes?: string;
}

export interface LoanSummary {
  totalLoans: number;
  totalBorrowed: Decimal;
  totalLent: Decimal;
  activeLoans: number;
  overdueLoans: number;
  totalOutstanding: Decimal;
  nextPaymentDue?: {
    date: string;
    amount: Decimal;
  };
}
