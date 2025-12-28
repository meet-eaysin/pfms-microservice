import { IncomeTransaction } from '../entities/income-transaction.model';

export interface IIncomeTransactionRepository {
  create(transaction: Omit<IncomeTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<IncomeTransaction>;
  findAll(filters: { sourceId?: string; startDate?: Date; endDate?: Date }): Promise<IncomeTransaction[]>;
  findById(id: string): Promise<IncomeTransaction | null>;
}
