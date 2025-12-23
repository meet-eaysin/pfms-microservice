import { PrismaClient, Expense as PrismaExpense } from '@prisma/client';
import { Expense } from '../entities/expense.entity';
import { ExpenseRepository, CreateExpenseData } from './expense.repository';
import { getPrismaClient } from '../../infrastructure/prisma.client';

export class PrismaExpenseRepository implements ExpenseRepository {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = getPrismaClient();
  }

  async create(data: CreateExpenseData): Promise<Expense> {
    const expense = await this.prisma.expense.create({
      data: {
        userId: data.userId,
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        date: data.date,
        source: data.source,
        isRecurring: data.isRecurring,
        recurringRuleId: data.recurringRuleId,
        attachments: data.attachments,
      },
    });

    return this.toDomain(expense);
  }

  async findById(id: string, userId: string): Promise<Expense | null> {
    const expense = await this.prisma.expense.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    return expense ? this.toDomain(expense) : null;
  }

  async findAll(params: {
    userId: string;
    categoryId?: string;
    startDate?: Date;
    endDate?: Date;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<{ expenses: Expense[]; total: number }> {
    const where: {
      userId: string;
      deletedAt: null;
      categoryId?: string;
      date?: { gte?: Date; lte?: Date };
      tags?: { hasSome: string[] };
    } = {
      userId: params.userId,
      deletedAt: null,
    };

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = params.startDate;
      if (params.endDate) where.date.lte = params.endDate;
    }

    if (params.tags && params.tags.length > 0) {
      where.tags = { hasSome: params.tags };
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        orderBy: { date: 'desc' },
        take: params.limit || 50,
        skip: params.offset || 0,
      }),
      this.prisma.expense.count({ where }),
    ]);

    return {
      expenses: expenses.map((e) => this.toDomain(e)),
      total,
    };
  }

  async update(id: string, userId: string, data: Partial<Expense>): Promise<Expense> {
    const expense = await this.prisma.expense.update({
      where: { id },
      data: {
        amount: data.amount,
        currency: data.currency,
        description: data.description,
        categoryId: data.categoryId,
        tags: data.tags,
        date: data.date,
        updatedAt: new Date(),
      },
    });

    return this.toDomain(expense);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.expense.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getStats(params: {
    userId: string;
    startDate?: Date;
    endDate?: Date;
    categoryId?: string;
  }): Promise<{
    totalExpenses: number;
    totalAmount: number;
    averageAmount: number;
    byCategory: Record<string, number>;
    byCurrency: Record<string, number>;
  }> {
    const where: {
      userId: string;
      deletedAt: null;
      date?: { gte?: Date; lte?: Date };
      categoryId?: string;
    } = {
      userId: params.userId,
      deletedAt: null,
    };

    if (params.startDate || params.endDate) {
      where.date = {};
      if (params.startDate) where.date.gte = params.startDate;
      if (params.endDate) where.date.lte = params.endDate;
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    const expenses = await this.prisma.expense.findMany({ where });

    const totalExpenses = expenses.length;
    const totalAmount = expenses.reduce(
      (sum: number, e: PrismaExpense) => sum + Number(e.amount),
      0
    );
    const averageAmount = totalExpenses > 0 ? totalAmount / totalExpenses : 0;

    const byCategory: Record<string, number> = {};
    const byCurrency: Record<string, number> = {};

    expenses.forEach((expense: PrismaExpense) => {
      const categoryId = expense.categoryId || 'uncategorized';
      byCategory[categoryId] = (byCategory[categoryId] || 0) + Number(expense.amount);

      byCurrency[expense.currency] = (byCurrency[expense.currency] || 0) + Number(expense.amount);
    });

    return {
      totalExpenses,
      totalAmount,
      averageAmount,
      byCategory,
      byCurrency,
    };
  }

  private toDomain(prismaExpense: PrismaExpense): Expense {
    return new Expense(
      prismaExpense.id,
      prismaExpense.userId,
      Number(prismaExpense.amount),
      prismaExpense.currency,
      prismaExpense.description,
      prismaExpense.categoryId,
      prismaExpense.tags,
      prismaExpense.date,
      prismaExpense.source,
      prismaExpense.isRecurring,
      prismaExpense.recurringRuleId,
      prismaExpense.attachments,
      prismaExpense.createdAt,
      prismaExpense.updatedAt,
      prismaExpense.deletedAt
    );
  }
}
