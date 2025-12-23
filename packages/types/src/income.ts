import { UUID, Currency, ISODateString, Decimal } from './common';

/**
 * Income Service Types
 */
export interface IncomeSource {
  id: UUID;
  userId: UUID;
  name: string;
  type: 'salary' | 'freelance' | 'business' | 'bonus' | 'investment' | 'other';
  amount?: Decimal;
  currency: Currency;
  frequency?: 'one-time' | 'monthly' | 'weekly' | 'yearly';
  isRecurring: boolean;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface IncomeTransaction {
  id: UUID;
  userId: UUID;
  incomeSourceId?: UUID;
  amount: Decimal;
  currency: Currency;
  date: string;
  description?: string;
  category?: string;
  paymentMethod?: string;
  taxDeducted?: Decimal;
  netAmount: Decimal;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
}

export interface CashflowProjection {
  id: UUID;
  userId: UUID;
  projectionDate: string;
  projectedBalance: Decimal;
  confidenceScore: number;
  expectedIncome: Decimal;
  expectedExpenses: Decimal;
  notes?: string;
  calculatedAt: ISODateString;
}

/**
 * Income DTOs
 */
export interface CreateIncomeSourceDto {
  name: string;
  type: 'salary' | 'freelance' | 'business' | 'bonus' | 'investment' | 'other';
  amount?: Decimal;
  currency?: Currency;
  frequency?: 'one-time' | 'monthly' | 'weekly' | 'yearly';
  isRecurring?: boolean;
}

export interface UpdateIncomeSourceDto {
  name?: string;
  type?: 'salary' | 'freelance' | 'business' | 'bonus' | 'investment' | 'other';
  amount?: Decimal;
  currency?: Currency;
  frequency?: 'one-time' | 'monthly' | 'weekly' | 'yearly';
  isRecurring?: boolean;
  isActive?: boolean;
}

export interface CreateIncomeTransactionDto {
  incomeSourceId?: UUID;
  amount: Decimal;
  currency?: Currency;
  date: string;
  description?: string;
  category?: string;
  paymentMethod?: string;
  taxDeducted?: Decimal;
}

/**
 * Income Analytics
 */
export interface IncomeAnalytics {
  totalIncome: Decimal;
  averageMonthlyIncome: Decimal;
  sourceBreakdown: Array<{
    source: string;
    amount: Decimal;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    income: Decimal;
  }>;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface CashflowSummary {
  projectedBalance: Decimal;
  expectedIncome: Decimal;
  expectedExpenses: Decimal;
  netProjection: Decimal;
  warningDates: string[];
  criticalDates: string[];
}
