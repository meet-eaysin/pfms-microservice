import { Injectable } from '@nestjs/common';
import { IIncomeTransactionRepository } from '@/domain/interfaces/income-transaction.repository';
import { IncomeTransaction } from '@/domain/entities/income-transaction.model';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaIncomeTransactionRepository implements IIncomeTransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaTransaction: any): IncomeTransaction {
    return new IncomeTransaction(
      prismaTransaction.id,
      prismaTransaction.sourceId,
      Number(prismaTransaction.amount),
      prismaTransaction.date,
      prismaTransaction.isTaxable,
      prismaTransaction.notes,
      prismaTransaction.createdAt,
      prismaTransaction.updatedAt,
    );
  }

  async create(transaction: Omit<IncomeTransaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<IncomeTransaction> {
    const created = await this.prisma.incomeTransaction.create({
      data: {
        sourceId: transaction.sourceId,
        amount: transaction.amount,
        date: transaction.date,
        isTaxable: transaction.isTaxable,
        notes: transaction.notes,
      },
    });
    return this.toDomain(created);
  }

  async findAll(filters: { sourceId?: string; startDate?: Date; endDate?: Date }): Promise<IncomeTransaction[]> {
    const where: Prisma.IncomeTransactionWhereInput = {};

    if (filters.sourceId) {
      where.sourceId = filters.sourceId;
    }
    if (filters.startDate && filters.endDate) {
      where.date = { gte: filters.startDate, lte: filters.endDate };
    }

    const transactions = await this.prisma.incomeTransaction.findMany({ where });
    return transactions.map(t => this.toDomain(t));
  }

  async findById(id: string): Promise<IncomeTransaction | null> {
    const transaction = await this.prisma.incomeTransaction.findUnique({ where: { id } });
    return transaction ? this.toDomain(transaction) : null;
  }
}
