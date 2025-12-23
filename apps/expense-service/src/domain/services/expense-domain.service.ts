import { createLogger } from '@pfms/utils';
import { ExpenseRepository } from '../repositories/expense.repository';

const logger = createLogger('ExpenseDomainService');

export class ExpenseDomainService {
  constructor(private expenseRepository: ExpenseRepository) {}

  /**
   * Validate expense creation business rules
   */
  async validateExpenseCreation(data: {
    userId: string;
    amount: number;
    categoryId: string | null;
  }): Promise<void> {
    // Business rule: Amount must be positive
    if (data.amount <= 0) {
      throw new Error('Expense amount must be greater than zero');
    }

    // Business rule: Amount should not exceed reasonable limit (e.g., $1M)
    if (data.amount > 1000000) {
      throw new Error('Expense amount exceeds maximum allowed limit');
    }

    logger.debug('Expense creation validation passed', { userId: data.userId });
  }

  /**
   * Check if user has exceeded budget for category
   */
  async checkCategoryBudget(
    userId: string,
    categoryId: string
  ): Promise<{ exceeded: boolean; currentTotal: number; budget: number | null }> {
    // Get current month's expenses for this category
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);
    endOfMonth.setDate(0);
    endOfMonth.setHours(23, 59, 59, 999);

    const stats = await this.expenseRepository.getStats({
      userId,
      categoryId,
      startDate: startOfMonth,
      endDate: endOfMonth,
    });

    const currentTotal = stats.totalAmount;

    // Note: Budget checking would require category repository
    // For now, return basic stats
    return {
      exceeded: false,
      currentTotal,
      budget: null,
    };
  }

  /**
   * Calculate expense trends
   */
  async calculateTrends(
    userId: string,
    days: number = 30
  ): Promise<{
    averageDaily: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    percentageChange: number;
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const stats = await this.expenseRepository.getStats({
      userId,
      startDate,
      endDate,
    });

    const averageDaily = stats.totalAmount / days;

    // Calculate trend (simplified - would need historical comparison)
    return {
      averageDaily,
      trend: 'stable',
      percentageChange: 0,
    };
  }

  /**
   * Validate expense update
   */
  async validateExpenseUpdate(
    expenseId: string,
    userId: string,
    updates: Partial<{ amount: number }>
  ): Promise<void> {
    const expense = await this.expenseRepository.findById(expenseId, userId);

    if (!expense) {
      throw new Error('Expense not found');
    }

    if (expense.isDeleted()) {
      throw new Error('Cannot update deleted expense');
    }

    if (updates.amount !== undefined && updates.amount <= 0) {
      throw new Error('Expense amount must be greater than zero');
    }

    logger.debug('Expense update validation passed', { expenseId });
  }
}
