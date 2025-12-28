import { Injectable } from '@nestjs/common';
import { IAccountRepository } from '@/domain/interfaces/account.repository';
import { Account, AccountType } from '@/domain/entities/account.model';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaAccountRepository implements IAccountRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaAccount: any): Account {
    return new Account(
      prismaAccount.id,
      prismaAccount.userId,
      prismaAccount.name,
      prismaAccount.type as AccountType,
      prismaAccount.subtype,
      prismaAccount.currency,
      Number(prismaAccount.balance),
      prismaAccount.isMutable,
      prismaAccount.createdAt,
      prismaAccount.updatedAt
    );
  }

  async create(account: Omit<Account, 'id' | 'createdAt' | 'updatedAt'>): Promise<Account> {
    const created = await this.prisma.account.create({
      data: {
        userId: account.userId,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        currency: account.currency,
        balance: account.balance,
        isMutable: account.isMutable,
      },
    });
    return this.toDomain(created);
  }

  async findAll(userId: string, type?: AccountType): Promise<Account[]> {
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        ...(type && { type }),
      },
    });
    return accounts.map((a) => this.toDomain(a));
  }

  async findById(id: string): Promise<Account | null> {
    const account = await this.prisma.account.findUnique({ where: { id } });
    return account ? this.toDomain(account) : null;
  }

  async updateBalance(id: string, newBalance: number): Promise<Account> {
    const updated = await this.prisma.account.update({
      where: { id },
      data: { balance: newBalance },
    });
    return this.toDomain(updated);
  }
}
