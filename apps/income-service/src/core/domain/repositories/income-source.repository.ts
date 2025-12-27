import { IncomeSource } from '../models/income-source.model';

export interface IIncomeSourceRepository {
  create(source: Omit<IncomeSource, 'id' | 'createdAt' | 'updatedAt'>): Promise<IncomeSource>;
  findAll(userId: string): Promise<IncomeSource[]>;
  findById(id: string): Promise<IncomeSource | null>;
  update(id: string, data: Partial<Omit<IncomeSource, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>): Promise<IncomeSource>;
  delete(id: string): Promise<void>;
}
