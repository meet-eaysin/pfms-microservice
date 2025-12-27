import { Inject, Injectable } from '@nestjs/common';
import { IExpenseRepository } from '../../../domain/repositories/expense.repository';
import { Expense } from '../../../domain/models/expense.model';
import { parseISO } from '@pfms/date';

export interface CreateExpenseCommand {
  userId: string;
  amount: number;
  currency?: string;
  categoryId: string;
  date: string;
  description?: string;
  isRecurring?: boolean;
}

@Injectable()
export class CreateExpenseUseCase {
  constructor(
    @Inject('IExpenseRepository')
    private readonly expenseRepository: IExpenseRepository
  ) {}

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    return this.expenseRepository.create({
      userId: command.userId,
      amount: command.amount,
      currency: command.currency || 'USD',
      categoryId: command.categoryId,
      date: parseISO(command.date),
      description: command.description || null,
      isRecurring: command.isRecurring || false,
    });
  }
}
