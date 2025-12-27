import { RecurringExpense } from '../models/recurring-expense.model';

export interface IRecurringRepository {
  create(
    recurring: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RecurringExpense>;
  findAll(userId: string): Promise<RecurringExpense[]>;
}
