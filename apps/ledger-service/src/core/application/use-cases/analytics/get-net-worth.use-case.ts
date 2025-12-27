import { Inject, Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { AccountType } from '../../../domain/models/account.model';

export interface NetWorth {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  breakdown: {
    assets: { [key: string]: number };
    liabilities: { [key: string]: number };
  };
}

@Injectable()
export class GetNetWorthUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(userId: string): Promise<NetWorth> {
    const assets = await this.accountRepository.findAll(userId, AccountType.ASSET);
    const liabilities = await this.accountRepository.findAll(userId, AccountType.LIABILITY);

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);

    const assetBreakdown: { [key: string]: number } = {};
    assets.forEach(a => {
      assetBreakdown[a.name] = a.balance;
    });

    const liabilityBreakdown: { [key: string]: number } = {};
    liabilities.forEach(l => {
      liabilityBreakdown[l.name] = l.balance;
    });

    return {
      totalAssets,
      totalLiabilities,
      netWorth: totalAssets - totalLiabilities,
      breakdown: {
        assets: assetBreakdown,
        liabilities: liabilityBreakdown,
      },
    };
  }
}
