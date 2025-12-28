import { Inject, Injectable } from '@nestjs/common';
import { IAccountRepository } from '@/domain/interfaces/account.repository';
import { Account, AccountType } from '@/domain/entities/account.model';

@Injectable()
export class GetAccountsUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly repository: IAccountRepository
  ) {}

  async execute(userId: string, type?: AccountType): Promise<Account[]> {
    return this.repository.findAll(userId, type);
  }
}
