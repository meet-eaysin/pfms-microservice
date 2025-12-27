import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IExpenseRepository } from '../../../domain/repositories/expense.repository';
import { Expense } from '../../../domain/models/expense.model';
import { parseISO } from '@pfms/date';

export interface UpdateExpenseCommand {
  id: string;
  amount?: number;
  currency?: string;
  categoryId?: string;
  date?: string;
  description?: string;
  isRecurring?: boolean;
}

@Injectable()
export class UpdateExpenseUseCase {
  constructor(
    @Inject('IExpenseRepository')
    private readonly expenseRepository: IExpenseRepository
  ) {}

  async execute(command: UpdateExpenseCommand): Promise<Expense> {
    const existing = await this.expenseRepository.findById(command.id);
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    return this.expenseRepository.update(command.id, {
      amount: command.amount,
      currency: command.currency,
      categoryId: command.categoryId,
      date: command.date ? parseISO(command.date) : undefined,
      description: command.description,
      isRecurring: command.isRecurring,
    });
  }
}
