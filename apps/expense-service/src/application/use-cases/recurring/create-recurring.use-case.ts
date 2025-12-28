import { Inject, Injectable } from '@nestjs/common';
import { IRecurringRepository } from '../../../domain/interfaces/recurring.repository';
import { RecurringExpense, Frequency } from '../../../domain/entities/recurring-expense.model';
import { parseISO } from '@pfms/date';

export interface CreateRecurringCommand {
  userId: string;
  amount: number;
  description?: string;
  frequency: Frequency;
  interval: number;
  startDate: string;
}

@Injectable()
export class CreateRecurringUseCase {
  constructor(
    @Inject('IRecurringRepository')
    private readonly recurringRepository: IRecurringRepository
  ) {}

  async execute(command: CreateRecurringCommand): Promise<RecurringExpense> {
    const startDate = parseISO(command.startDate);

    return this.recurringRepository.create({
      userId: command.userId,
      amount: command.amount,
      description: command.description || null,
      frequency: command.frequency,
      interval: command.interval,
      startDate,
      nextDueDate: startDate,
    });
  }
}
