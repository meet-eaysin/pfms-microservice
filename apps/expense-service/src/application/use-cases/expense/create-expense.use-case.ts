import { Inject, Injectable } from '@nestjs/common';
import { IExpenseRepository } from '../../../domain/interfaces/expense.repository';
import { Expense } from '../../../domain/entities/expense.model';
import { parseISO, formatDate, DateFormats } from '@pfms/date';
import { RabbitMQEventBus } from '@pfms/event-bus';
import { ExpenseCreatedEvent } from '../../events/expense.events';
import { v4 as uuidv4 } from 'uuid';

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
    private readonly expenseRepository: IExpenseRepository,
    private readonly eventBus: RabbitMQEventBus
  ) {}

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    const expense = await this.expenseRepository.create({
      userId: command.userId,
      amount: command.amount,
      currency: command.currency || 'USD',
      categoryId: command.categoryId,
      date: parseISO(command.date),
      description: command.description || null,
      isRecurring: command.isRecurring || false,
    });

    // Publish expense.created event
    const event: ExpenseCreatedEvent = {
      eventId: uuidv4(),
      eventType: 'expense.created',
      timestamp: formatDate(new Date(), DateFormats.ISO_DATETIME),
      version: '1.0',
      data: {
        expenseId: expense.id,
        userId: expense.userId,
        amount: expense.amount,
        currency: expense.currency,
        categoryId: expense.categoryId,
        date: formatDate(expense.date, DateFormats.ISO_DATE),
        description: expense.description || '',
      },
      metadata: {
        userId: expense.userId,
      },
    };

    await this.eventBus.publish('expense.created', event);

    return expense;
  }
}
