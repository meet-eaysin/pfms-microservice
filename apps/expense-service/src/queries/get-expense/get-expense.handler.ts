import { createLogger } from '@pfms/utils';
import { GetExpenseQuery } from './get-expense.query';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';

const logger = createLogger('GetExpenseHandler');

export class GetExpenseHandler {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(query: GetExpenseQuery): Promise<Expense | null> {
    logger.debug('Getting expense', { expenseId: query.id, userId: query.userId });

    const expense = await this.expenseRepository.findById(query.id, query.userId);

    if (!expense) {
      logger.warn('Expense not found', { expenseId: query.id });
      return null;
    }

    return expense;
  }
}
