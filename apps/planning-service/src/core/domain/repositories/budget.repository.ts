import { Budget } from '../models/budget.model';

export interface IBudgetRepository {
  create(data: {
    userId: string;
    categoryId?: string;
    name: string;
    amountLimit: number;
    period: string;
    startDate: Date;
    endDate?: Date;
  }): Promise<Budget>;

  findById(id: string): Promise<Budget | null>;

  findByUserId(userId: string): Promise<Budget[]>;

  findActiveByUser(userId: string): Promise<Budget[]>;

  update(id: string, data: Partial<Budget>): Promise<Budget>;

  delete(id: string): Promise<void>;
}
