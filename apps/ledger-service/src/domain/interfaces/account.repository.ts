import { Account, AccountType } from '../entities/account.model';

export interface IAccountRepository {
  create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account>;
  findAll(userId: string, type?: AccountType): Promise<Account[]>;
  findById(id: string): Promise<Account | null>;
  updateBalance(id: string, newBalance: number): Promise<Account>;
}
