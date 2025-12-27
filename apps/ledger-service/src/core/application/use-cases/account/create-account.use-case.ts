import { Inject, Injectable } from '@nestjs/common';
import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { Account, AccountType } from '../../../domain/models/account.model';

export interface CreateAccountCommand {
  userId: string;
  name: string;
  type: AccountType;
  subtype?: string;
  currency?: string;
  isMutable?: boolean;
}

@Injectable()
export class CreateAccountUseCase {
  constructor(
    @Inject('IAccountRepository')
    private readonly repository: IAccountRepository,
  ) {}

  async execute(command: CreateAccountCommand): Promise<Account> {
    return this.repository.create({
      userId: command.userId,
      name: command.name,
      type: command.type,
      subtype: command.subtype || null,
      currency: command.currency || 'USD',
      balance: 0,
      isMutable: command.isMutable ?? true,
    });
  }
}
