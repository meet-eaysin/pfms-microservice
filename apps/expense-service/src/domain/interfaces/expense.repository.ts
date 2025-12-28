import { Expense } from '../entities/expense.model';

export interface IExpenseRepository {
  create(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense>;
  findAll(
    userId: string,
    filters?: { startDate?: Date; endDate?: Date; categoryId?: string }
  ): Promise<Expense[]>;
  findById(id: string): Promise<Expense | null>;
  update(
    id: string,
    data: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Expense>;
  delete(id: string): Promise<void>;
}
