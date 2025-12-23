import { UUID, ISODateString, Decimal } from './common';

/**
 * Automation Service Types
 */
export interface AutomationRule {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  triggerType: 'time' | 'expense' | 'income' | 'investment' | 'group' | 'loan';
  triggerConfig: Record<string, any>;
  actionType: 'notify' | 'save' | 'log' | 'categorize' | 'settle' | 'export';
  actionConfig: Record<string, any>;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  isActive: boolean;
  executionCount: number;
  lastExecutedAt?: ISODateString;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface RuleExecution {
  id: UUID;
  ruleId: UUID;
  userId: UUID;
  triggerData: Record<string, any>;
  actionResult: Record<string, any>;
  status: 'success' | 'failed';
  errorMessage?: string;
  executedAt: ISODateString;
}

/**
 * Automation DTOs
 */
export interface CreateAutomationRuleDto {
  name: string;
  description?: string;
  triggerType: 'time' | 'expense' | 'income' | 'investment' | 'group' | 'loan';
  triggerConfig: Record<string, any>;
  actionType: 'notify' | 'save' | 'log' | 'categorize' | 'settle' | 'export';
  actionConfig: Record<string, any>;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
}

export interface UpdateAutomationRuleDto {
  name?: string;
  description?: string;
  triggerConfig?: Record<string, any>;
  actionConfig?: Record<string, any>;
  conditions?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  isActive?: boolean;
}

/**
 * Automation Triggers
 */
export interface TimeTrigger {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'cron';
  time?: string; // HH:mm format
  cronExpression?: string;
}

export interface ExpenseTrigger {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  amount: Decimal;
  category?: string;
  frequency?: 'per_transaction' | 'per_day' | 'per_week' | 'per_month';
}

export interface IncomeTrigger {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  amount: Decimal;
  sourceType?: string;
}

export interface InvestmentTrigger {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  threshold: Decimal;
  thresholdType: 'price' | 'percentage_change' | 'value_change';
  symbol?: string;
}

/**
 * Automation Actions
 */
export interface NotifyAction {
  channels: ('push' | 'email' | 'sms')[];
  title: string;
  body: string;
}

export interface SaveAction {
  targetPortfolio: UUID;
  amount: Decimal;
}

export interface CategorizeAction {
  category: string;
  tags?: string[];
}

export interface SettleAction {
  groupId?: UUID;
  autoApprove: boolean;
}

export interface ExportAction {
  format: 'csv' | 'json' | 'xlsx';
  frequency: 'daily' | 'weekly' | 'monthly';
  destination?: string;
}

/**
 * Automation Examples
 */
export const AUTOMATION_TEMPLATES = {
  budgetAlert: {
    name: 'Budget Alert',
    triggerType: 'expense',
    actionType: 'notify',
    description: 'Get notified when you exceed budget threshold',
  },
  autoSave: {
    name: 'Auto Save',
    triggerType: 'income',
    actionType: 'save',
    description: 'Automatically save percentage of income',
  },
  categorizeRecurring: {
    name: 'Auto Categorize',
    triggerType: 'expense',
    actionType: 'categorize',
    description: 'Auto-categorize recurring expenses',
  },
  investmentAlert: {
    name: 'Price Alert',
    triggerType: 'investment',
    actionType: 'notify',
    description: 'Get notified on investment price changes',
  },
};
