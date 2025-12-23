import { createLogger } from '@pfms/utils';
import { GetExpenseStatsQuery } from './get-expense-stats.query';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';

const logger = createLogger('GetExpenseStatsHandler');

export class GetExpenseStatsHandler {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(query: GetExpenseStatsQuery): Promise<{
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    byCategory: Record<string, number>;
    byCurrency: Record<string, number>;
  }> {
    logger.debug('Getting expense stats', { userId: query.userId });

    const params: any = {
      userId: query.userId,
    };

    if (query.startDate) params.startDate = new Date(query.startDate);
    if (query.endDate) params.endDate = new Date(query.endDate);
    if (query.categoryId) params.categoryId = query.categoryId;

    const stats = await this.expenseRepository.getStats(params);

    logger.debug('Stats retrieved', { totalExpenses: stats.totalExpenses });

    return stats;
  }
}
