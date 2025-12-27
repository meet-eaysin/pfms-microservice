import { Injectable } from '@nestjs/common';
import { IBudgetRepository } from '../../../core/domain/repositories/budget.repository';
import { Budget, BudgetPeriod } from '../../../core/domain/models/budget.model';
import { PrismaService } from '../prisma.service';
import { Budget as PrismaBudget, BudgetPeriod as PrismaBudgetPeriod } from '@prisma/client';

const mapBudgetPeriod = (p: PrismaBudgetPeriod): BudgetPeriod => {
  switch (p) {
    case 'DAILY':
      return BudgetPeriod.DAILY;
    case 'WEEKLY':
      return BudgetPeriod.WEEKLY;
    case 'MONTHLY':
      return BudgetPeriod.MONTHLY;
    case 'YEARLY':
      return BudgetPeriod.YEARLY;
  }
};

const mapToPrismaBudgetPeriod = (p: BudgetPeriod): PrismaBudgetPeriod => {
  switch (p) {
    case BudgetPeriod.DAILY:
      return 'DAILY';
    case BudgetPeriod.WEEKLY:
      return 'WEEKLY';
    case BudgetPeriod.MONTHLY:
      return 'MONTHLY';
    case BudgetPeriod.YEARLY:
      return 'YEARLY';
  }
};

@Injectable()
export class PrismaBudgetRepository implements IBudgetRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    userId: string;
    categoryId?: string;
    name: string;
    amountLimit: number;
    period: string;
    startDate: Date;
    endDate?: Date;
  }): Promise<Budget> {
    const budget = await this.prisma.budget.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId || null,
        name: data.name,
        amountLimit: data.amountLimit,
        period: mapToPrismaBudgetPeriod(data.period as BudgetPeriod),
        startDate: data.startDate,
        endDate: data.endDate || null,
      },
    });
    return this.toDomain(budget);
  }

  async findById(id: string): Promise<Budget | null> {
    const budget = await this.prisma.budget.findUnique({ where: { id } });
    return budget ? this.toDomain(budget) : null;
  }

  async findByUserId(userId: string): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({ where: { userId } });
    return budgets.map((b) => this.toDomain(b));
  }

  async findActiveByUser(userId: string): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { userId, isActive: true },
    });
    return budgets.map((b) => this.toDomain(b));
  }

  async update(id: string, data: Partial<Budget>): Promise<Budget> {
    const budget = await this.prisma.budget.update({
      where: { id },
      data: {
        ...(data.userId && { userId: data.userId }),
        ...(data.categoryId && { categoryId: data.categoryId }),
        ...(data.name && { name: data.name }),
        ...(data.amountLimit !== undefined && { amountLimit: data.amountLimit }),
        ...(data.period && { period: mapToPrismaBudgetPeriod(data.period) }),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.endDate && { endDate: data.endDate }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return this.toDomain(budget);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } });
  }

  private toDomain(budget: PrismaBudget): Budget {
    return new Budget(
      budget.id,
      budget.userId,
      budget.categoryId,
      budget.name,
      Number(budget.amountLimit),
      mapBudgetPeriod(budget.period),
      budget.startDate,
      budget.endDate,
      budget.isActive,
      budget.createdAt,
      budget.updatedAt
    );
  }
}
