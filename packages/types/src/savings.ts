import { UUID, Currency, ISODateString, Decimal, Percentage } from './common';

/**
 * Savings & Goals Service Types
 */
export interface SavingsGoal {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  targetAmount: Decimal;
  currentAmount: Decimal;
  currency: Currency;
  category: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  icon?: string;
  color?: string;
  isActive: boolean;
  autoContribute?: {
    enabled: boolean;
    amount?: Decimal;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SavingsContribution {
  id: UUID;
  goalId: UUID;
  userId: UUID;
  amount: Decimal;
  date: string;
  notes?: string;
  createdAt: ISODateString;
}

export interface EmergencyFund {
  id: UUID;
  userId: UUID;
  targetAmount: Decimal;
  currentAmount: Decimal;
  currency: Currency;
  monthsOfExpenses: number;
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface SavingsRule {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  ruleType: 'percentage' | 'fixed_amount' | 'roundup';
  triggerOn: 'income' | 'expense' | 'both';
  targetGoalId?: UUID;
  parameters: {
    percentage?: Decimal;
    amount?: Decimal;
    minThreshold?: Decimal;
  };
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/**
 * Savings DTOs
 */
export interface CreateSavingsGoalDto {
  name: string;
  description?: string;
  targetAmount: Decimal;
  currency?: Currency;
  category: string;
  deadline?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  icon?: string;
  color?: string;
  autoContribute?: {
    enabled?: boolean;
    amount?: Decimal;
    frequency?: 'daily' | 'weekly' | 'monthly';
  };
}

export interface ContributeToGoalDto {
  goalId: UUID;
  amount: Decimal;
  date?: string;
  notes?: string;
}

export interface CreateEmergencyFundDto {
  targetAmount: Decimal;
  currency?: Currency;
  monthsOfExpenses?: number;
}

export interface CreateSavingsRuleDto {
  name: string;
  description?: string;
  ruleType: 'percentage' | 'fixed_amount' | 'roundup';
  triggerOn: 'income' | 'expense' | 'both';
  targetGoalId?: UUID;
  parameters: {
    percentage?: Decimal;
    amount?: Decimal;
    minThreshold?: Decimal;
  };
}

/**
 * Savings Analytics
 */
export interface GoalProgress {
  goal: SavingsGoal;
  progressPercentage: number;
  amountRemaining: Decimal;
  daysRemaining?: number;
  projectedCompletionDate?: string;
  savingsRate: Decimal;
  onTrack: boolean;
}

export interface SavingsSummary {
  totalSavings: Decimal;
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  emergencyFundStatus: {
    coverage: number;
    status: 'critically_low' | 'low' | 'adequate' | 'excellent';
  };
  averageMonthlySavings: Decimal;
  savingsRate: Percentage;
}

export interface SavingsRecommendation {
  type: 'goal_completion' | 'emergency_fund' | 'increase_rate' | 'optimize_allocation';
  title: string;
  description: string;
  suggestedAction: string;
  estimatedImpact: Decimal;
  priority: 'low' | 'medium' | 'high';
}
