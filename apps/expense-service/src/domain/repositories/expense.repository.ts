import { Expense } from '../entities/expense.entity';

export interface CreateExpenseData {
  userId: string;
  amount: number;
  currency: string;
  description: string;
  categoryId: string | null;
  tags: string[];
  date: Date;
  source: string;
  isRecurring: boolean;
  recurringRuleId: string | null;
  attachments: string[];
}

export interface ExpenseRepository {
  /**
   * Create a new expense
   */
  create(data: CreateExpenseData): Promise<Expense>;

  /**
   * Find expense by ID
   */
  findById(id: string, userId: string): Promise<Expense | null>;

  /**
   * Find all expenses for a user with filters
   */
  findAll(params: {
    userId: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ expenses: Expense[]; total: number }>;

  /**
   * Update an expense
   */
  update(id: string, userId: string, data: Partial<Expense>): Promise<Expense>;

  /**
   * Delete an expense (soft delete)
   */
  delete(id: string, userId: string): Promise<void>;

  /**
   * Get expense statistics
   */
  getStats(params: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
  }): Promise<{
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    byCategory: Record<string, number>;
    byCurrency: Record<string, number>;
  }>;
}
