import { createLogger } from '@pfms/utils';
import { ListExpensesQuery } from './list-expenses.query';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';

const logger = createLogger('ListExpensesHandler');

export class ListExpensesHandler {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(query: ListExpensesQuery): Promise<{ expenses: Expense[]; total: number }> {
    logger.debug('Listing expenses', { userId: query.userId, filters: query });

    const params: {
      userId: string;
      limit: number;
      offset: number;
      categoryId?: string;
      startDate?: Date;
      endDate?: Date;
      tags?: string[];
    } = {
      userId: query.userId,
      limit: query.limit || 50,
      offset: query.offset || 0,
    };

    if (query.categoryId) params.categoryId = query.categoryId;
    if (query.startDate) params.startDate = new Date(query.startDate);
    if (query.endDate) params.endDate = new Date(query.endDate);
    if (query.tags) params.tags = query.tags;

    const result = await this.expenseRepository.findAll(params);

    logger.debug('Expenses retrieved', { count: result.expenses.length, total: result.total });

    return result;
  }
}
