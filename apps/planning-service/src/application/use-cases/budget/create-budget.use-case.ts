import { Inject, Injectable } from '@nestjs/common';
import { IBudgetRepository } from '@/domain/interfaces/budget.repository';
import { Budget, BudgetPeriod } from '@/domain/entities/budget.model';
import { parseISO } from '@pfms/date';

export interface CreateBudgetCommand {
  userId: string;
  categoryId?: string;
  name: string;
  amountLimit: number;
  period: BudgetPeriod;
  startDate: string;
  endDate?: string;
}

@Injectable()
export class CreateBudgetUseCase {
  constructor(
    @Inject('IBudgetRepository')
    private readonly budgetRepository: IBudgetRepository
  ) {}

  async execute(command: CreateBudgetCommand): Promise<Budget> {
    return this.budgetRepository.create({
      userId: command.userId,
      categoryId: command.categoryId,
      name: command.name,
      amountLimit: command.amountLimit,
      period: command.period,
      startDate: parseISO(command.startDate),
      endDate: command.endDate ? parseISO(command.endDate) : undefined,
    });
  }
}
