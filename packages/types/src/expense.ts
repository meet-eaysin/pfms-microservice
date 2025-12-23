import { UUID, Currency, ISODateString, Decimal, Status } from './common';

/**
 * Expense Types
 */
export interface ExpenseCategory {
  id: UUID;
  userId: UUID;
  name: string;
  icon?: string;
  color?: string;
  parentCategoryId?: UUID;
  isSystem: boolean;
  createdAt: ISODateString;
}

export interface Expense {
  id: UUID;
  userId: UUID;
  amount: Decimal;
  currency: Currency;
  categoryId?: UUID;
  description?: string;
  date: string;
  time?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  paymentMethod?: string;
  tags?: string[];
  attachments?: string[];
  isRecurring: boolean;
  recurringId?: UUID;
  source: 'manual' | 'voice' | 'import' | 'auto';
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface RecurringExpense {
  id: UUID;
  userId: UUID;
  name: string;
  amount: Decimal;
  currency: Currency;
  categoryId?: UUID;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  lastPaidDate?: string;
  autoPay: boolean;
  reminderDays: number;
  inflationRate?: Decimal;
  isActive: boolean;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Habit {
  id: UUID;
  userId: UUID;
  name: string;
  category: string;
  unitCost?: Decimal;
  currency: Currency;
  icon?: string;
  targetReduction?: number;
  createdAt: ISODateString;
}

export interface HabitLog {
  id: UUID;
  habitId: UUID;
  userId: UUID;
  quantity: number;
  totalCost?: Decimal;
  date: string;
  time?: string;
  notes?: string;
  createdAt: ISODateString;
}

export interface ImportBatch {
  id: UUID;
  userId: UUID;
  filename: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errorLog?: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: ISODateString;
}

/**
 * Expense DTOs
 */
export interface CreateExpenseDto {
  amount: Decimal;
  currency?: Currency;
  categoryId?: UUID;
  description?: string;
  date: string;
  time?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  paymentMethod?: string;
  tags?: string[];
  attachments?: string[];
  source?: 'manual' | 'voice' | 'import' | 'auto';
  metadata?: Record<string, any>;
}

export interface UpdateExpenseDto {
  amount?: Decimal;
  currency?: Currency;
  categoryId?: UUID;
  description?: string;
  date?: string;
  time?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
  };
  paymentMethod?: string;
  tags?: string[];
  attachments?: string[];
}

export interface CreateRecurringExpenseDto {
  name: string;
  amount: Decimal;
  currency?: Currency;
  categoryId?: UUID;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  autoPay?: boolean;
  reminderDays?: number;
  inflationRate?: Decimal;
}

export interface CreateHabitDto {
  name: string;
  category: string;
  unitCost?: Decimal;
  currency?: Currency;
  icon?: string;
  targetReduction?: number;
}

export interface LogHabitDto {
  quantity: number;
  date: string;
  time?: string;
  notes?: string;
}

/**
 * Expense Analytics
 */
export interface ExpenseAnalytics {
  totalSpent: Decimal;
  categoryBreakdown: Array<{
    category: string;
    amount: Decimal;
    percentage: number;
  }>;
  averageDailySpend: Decimal;
  highestExpense: Expense;
  lowestExpense: Expense;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface BudgetAlert {
  id: UUID;
  userId: UUID;
  type: 'daily' | 'monthly' | 'category';
  threshold: Decimal;
  currentSpend: Decimal;
  percentageUsed: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: ISODateString;
}
