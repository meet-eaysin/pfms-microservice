import { Injectable } from '@nestjs/common';
import { IExpenseRepository } from '../../../core/domain/repositories/expense.repository';
import { Expense } from '../../../core/domain/models/expense.model';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaExpenseRepository implements IExpenseRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaExpense: any): Expense {
    return new Expense(
      prismaExpense.id,
      prismaExpense.userId,
      Number(prismaExpense.amount),
      prismaExpense.currency,
      prismaExpense.categoryId,
      prismaExpense.date,
      prismaExpense.description,
      prismaExpense.isRecurring,
      prismaExpense.createdAt,
      prismaExpense.updatedAt
    );
  }

  async create(expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>): Promise<Expense> {
    const created = await this.prisma.expense.create({
      data: {
        userId: expense.userId,
        amount: expense.amount,
        currency: expense.currency,
        categoryId: expense.categoryId,
        date: expense.date,
        description: expense.description,
        isRecurring: expense.isRecurring,
      },
    });
    return this.toDomain(created);
  }

  async findAll(
    userId: string,
    filters?: { startDate?: Date; endDate?: Date; categoryId?: string }
  ): Promise<Expense[]> {
    const where: Prisma.ExpenseWhereInput = { userId };

    if (filters?.startDate && filters?.endDate) {
      where.date = { gte: filters.startDate, lte: filters.endDate };
    }
    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    const expenses = await this.prisma.expense.findMany({ where });
    return expenses.map((e) => this.toDomain(e));
  }

  async findById(id: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    return expense ? this.toDomain(expense) : null;
  }

  async update(
    id: string,
    data: Partial<Omit<Expense, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
  ): Promise<Expense> {
    const updated = await this.prisma.expense.update({
      where: { id },
      data: {
        ...(data.amount !== undefined && { amount: data.amount }),
        ...(data.currency !== undefined && { currency: data.currency }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.date !== undefined && { date: data.date }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
      },
    });
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.delete({ where: { id } });
  }
}
