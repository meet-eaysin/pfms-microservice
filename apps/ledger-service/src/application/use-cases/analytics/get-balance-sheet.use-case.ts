import { Inject, Injectable } from '@nestjs/common';
import { IAccountRepository } from '@/domain/interfaces/account.repository';
import { AccountType } from '@/domain/entities/account.model';

export interface BalanceSheet {
  assets: { name: string; balance: number }[];
  liabilities: { name: string; balance: number }[];
  equity: { name: string; balance: number }[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

@Injectable()
export class GetBalanceSheetUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository
  ) {}

  async execute(userId: string): Promise<BalanceSheet> {
    const assets = await this.accountRepository.findAll(userId, AccountType.ASSET);
    const liabilities = await this.accountRepository.findAll(userId, AccountType.LIABILITY);
    const equity = await this.accountRepository.findAll(userId, AccountType.EQUITY);

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

    return {
      assets: assets.map((a) => ({ name: a.name, balance: a.balance })),
      liabilities: liabilities.map((l) => ({ name: l.name, balance: l.balance })),
      equity: equity.map((e) => ({ name: e.name, balance: e.balance })),
      totalAssets,
      totalLiabilities,
      totalEquity,
    };
  }
}
