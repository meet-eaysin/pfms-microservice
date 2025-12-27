import { Injectable } from '@nestjs/common';
import { IRecurringRepository } from '../../../core/domain/repositories/recurring.repository';
import { RecurringExpense, Frequency } from '../../../core/domain/models/recurring-expense.model';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRecurringRepository implements IRecurringRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaRecurring: any): RecurringExpense {
    return new RecurringExpense(
      prismaRecurring.id,
      prismaRecurring.userId,
      Number(prismaRecurring.amount),
      prismaRecurring.description,
      prismaRecurring.frequency as Frequency,
      prismaRecurring.interval,
      prismaRecurring.startDate,
      prismaRecurring.nextDueDate,
      prismaRecurring.createdAt,
      prismaRecurring.updatedAt
    );
  }

  async create(
    recurring: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RecurringExpense> {
    const created = await this.prisma.recurringExpense.create({
      data: {
        userId: recurring.userId,
        amount: recurring.amount,
        description: recurring.description,
        frequency: recurring.frequency,
        interval: recurring.interval,
        startDate: recurring.startDate,
        nextDueDate: recurring.nextDueDate,
      },
    });
    return this.toDomain(created);
  }

  async findAll(userId: string): Promise<RecurringExpense[]> {
    const recurring = await this.prisma.recurringExpense.findMany({
      where: { userId },
      orderBy: { nextDueDate: 'asc' },
    });
    return recurring.map((r) => this.toDomain(r));
  }
}
