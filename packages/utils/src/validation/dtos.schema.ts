import z from 'zod';

// ============================================
// COMMON VALIDATION SCHEMAS
// ============================================

export const emailSchema = z.string().email();

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  );

export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

export const uuidSchema = z.string().uuid();

export const dateSchema = z.string().datetime();

export const currencySchema = z.enum(['USD', 'EUR', 'GBP', 'BDT', 'INR']);

export const amountSchema = z.number().positive();

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const idSchema = z.union([z.string().uuid(), z.number().int().positive()]);

// ============================================
// COMMON DTOs
// ============================================

export const dateRangeSchema = z.object({
  startDate: dateSchema,
  endDate: dateSchema,
});

export const paginatedRequestSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// ============================================
// USER DTOs
// ============================================

export const userCreateSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(2).max(100),
  lastName: z.string().max(100).optional(),
  phone: phoneSchema.optional(),
  currency: currencySchema.default('USD'),
  timezone: z.string().default('UTC'),
});

export const userUpdateSchema = z.object({
  firstName: z.string().min(2).max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: phoneSchema.optional(),
  dateOfBirth: dateSchema.optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
  avatar: z.string().url().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
});

export const financialPreferencesSchema = z.object({
  dailyBudgetLimit: amountSchema.optional(),
  monthlyBudgetLimit: amountSchema.optional(),
  savingsTarget: amountSchema.optional(),
  investmentRiskLevel: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  salaryDay: z.number().int().min(1).max(31).optional(),
  earningSchedule: z.enum(['monthly', 'weekly', 'biweekly']).optional(),
});

// ============================================
// EXPENSE DTOs
// ============================================

export const expenseCreateSchema = z.object({
  amount: amountSchema,
  currency: currencySchema,
  category: z.string(),
  subcategory: z.string().optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
  date: dateSchema,
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']).optional(),
  location: z
    .object({
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      address: z.string().optional(),
    })
    .optional(),
  notes: z.string().optional(),
});

export const expenseUpdateSchema = expenseCreateSchema.partial();

export const recurringExpenseCreateSchema = z.object({
  name: z.string().min(2).max(200),
  amount: amountSchema,
  currency: currencySchema,
  category: z.string(),
  description: z.string().optional(),
  recurrence: z.object({
    interval: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
    frequency: z.number().int().min(1).optional(),
  }),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  paymentMethod: z.enum(['cash', 'card', 'bank_transfer', 'upi', 'wallet', 'other']).optional(),
  autoCreate: z.boolean().default(false),
  reminderEnabled: z.boolean().default(true),
  reminderDays: z.number().int().min(0).max(30).default(3),
});

export const habitCreateSchema = z.object({
  habitType: z.string(),
  name: z.string().min(2).max(100),
  costPerUnit: amountSchema,
  currency: currencySchema,
  unit: z.string(),
  targetReduction: z.number().int().min(0).max(100).optional(),
});

export const habitEntryCreateSchema = z.object({
  habitId: uuidSchema,
  quantity: z.number().int().positive(),
  date: dateSchema,
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/)
    .optional(),
  notes: z.string().optional(),
  location: z.string().optional(),
});

// ============================================
// INVESTMENT DTOs
// ============================================

export const portfolioCreateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  riskLevel: z.enum(['conservative', 'moderate', 'aggressive']).optional(),
  currency: currencySchema.optional(),
  targetAllocation: z.record(z.string(), z.number()).optional(),
  rebalancingFrequency: z.enum(['monthly', 'quarterly', 'yearly', 'manual']).optional(),
});

export const assetCreateSchema = z.object({
  portfolioId: uuidSchema,
  assetType: z.string(),
  symbol: z.string().toUpperCase(),
  name: z.string(),
  quantity: z.number().positive(),
  purchasePrice: amountSchema,
  purchaseDate: dateSchema,
  exchange: z.string().optional(),
  sector: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

export const transactionCreateSchema = z.object({
  assetId: uuidSchema,
  portfolioId: uuidSchema,
  transactionType: z.enum(['buy', 'sell', 'dividend', 'interest', 'split', 'merger']),
  symbol: z.string().toUpperCase(),
  quantity: z.number().positive(),
  price: amountSchema,
  fees: amountSchema.optional(),
  taxes: amountSchema.optional(),
  commission: amountSchema.optional(),
  transactionDate: dateSchema,
  notes: z.string().optional(),
});

export const priceAlertCreateSchema = z.object({
  symbol: z.string().toUpperCase(),
  assetType: z.string(),
  alertType: z.enum(['above', 'below', 'target']),
  targetPrice: amountSchema,
  notificationChannels: z.array(z.string()).optional(),
});

// ============================================
// LOAN DTOs
// ============================================

export const contactCreateSchema = z.object({
  contactType: z.enum(['app_user', 'external']),
  linkedUserId: uuidSchema.optional(),
  name: z.string().optional(),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  address: z.string().optional(),
  nickname: z.string().optional(),
  relationship: z.string().optional(),
  notes: z.string().optional(),
});

export const loanCreateSchema = z.object({
  contactId: uuidSchema.optional(),
  type: z.string(),
  direction: z.enum(['borrowed', 'lent']),
  principalAmount: amountSchema,
  currency: currencySchema,
  interestRate: z.number().min(0).max(100),
  interestType: z.enum(['simple', 'compound', 'none']),
  startDate: dateSchema,
  endDate: dateSchema.optional(),
  emiEnabled: z.boolean().optional(),
  emiFrequency: z.enum(['weekly', 'biweekly', 'monthly', 'quarterly']).optional(),
  emiDay: z.number().int().min(1).max(31).optional(),
  totalInstallments: z.number().int().positive().optional(),
  reason: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
  notes: z.string().optional(),
});

export const loanPaymentCreateSchema = z.object({
  loanId: uuidSchema,
  emiScheduleId: uuidSchema.optional(),
  amount: amountSchema,
  paymentDate: dateSchema,
  paymentMethod: z.string().optional(),
  paymentType: z.enum(['regular', 'partial', 'early', 'lump_sum']).optional(),
  notes: z.string().optional(),
});

// ============================================
// GROUP DTOs
// ============================================

export const groupCreateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().max(500).optional(),
  groupType: z.enum(['trip', 'party', 'event', 'household', 'office', 'other']),
  currency: currencySchema,
  memberEmails: z.array(emailSchema).optional(),
});

export const groupExpenseCreateSchema = z.object({
  groupId: uuidSchema,
  amount: amountSchema,
  currency: currencySchema,
  description: z.string().max(500),
  category: z.string().optional(),
  expenseDate: dateSchema,
  splitType: z.enum(['equal', 'unequal', 'percentage', 'shares', 'adjustment']),
  splits: z.array(
    z.object({
      userId: uuidSchema,
      amount: amountSchema.optional(),
      percentage: z.number().optional(),
      shares: z.number().optional(),
    })
  ),
});

// ============================================
// AUTOMATION DTOs
// ============================================

export const automationRuleCreateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  trigger: z.object({
    type: z.string(),
    schedule: z.string().optional(),
    event: z.string().optional(),
  }),
  conditions: z.array(
    z.object({
      field: z.string(),
      operator: z.enum([
        'equals',
        'not_equals',
        'greater_than',
        'less_than',
        'contains',
        'between',
      ]),
      value: z.any(),
      logicalOperator: z.enum(['AND', 'OR']).optional(),
    })
  ),
  actions: z.array(
    z.object({
      type: z.string(),
      parameters: z.record(z.string(), z.any()),
      order: z.number().int().positive(),
    })
  ),
});

// ============================================
// TAX DTOs
// ============================================

export const taxCalculationSchema = z.object({
  taxYear: z.string(),
  incomes: z.array(
    z.object({
      incomeType: z.string(),
      amount: amountSchema,
      source: z.string(),
    })
  ),
  deductions: z.array(
    z.object({
      deductionType: z.string(),
      amount: amountSchema,
      description: z.string().optional(),
    })
  ),
});

// ============================================
// SAVINGS & GOALS DTOs
// ============================================

export const savingsGoalCreateSchema = z.object({
  name: z.string().min(2).max(200),
  description: z.string().optional(),
  category: z.string(),
  targetAmount: amountSchema,
  currency: currencySchema,
  priority: z.enum(['high', 'medium', 'low']).optional(),
  targetDate: dateSchema.optional(),
  autoSaveEnabled: z.boolean().optional(),
  autoSaveAmount: amountSchema.optional(),
  autoSaveFrequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
  autoSavePercentage: z.number().min(0).max(100).optional(),
});

export const savingsContributionSchema = z.object({
  goalId: uuidSchema,
  amount: amountSchema,
  transactionType: z.enum(['deposit', 'withdrawal']),
  description: z.string().optional(),
  date: dateSchema,
  isAutomatic: z.boolean().optional(),
});
