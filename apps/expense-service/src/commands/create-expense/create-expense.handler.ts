import { randomUUID } from 'crypto';
import { createLogger } from '@pfms/utils';
import { CreateExpenseCommand } from './create-expense.command';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';
import { getEventBus } from '../../infrastructure/event-bus.client';

const logger = createLogger('CreateExpenseHandler');

export class CreateExpenseHandler {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(command: CreateExpenseCommand): Promise<Expense> {
    logger.info('Creating expense', { userId: command.userId, amount: command.amount });

    // Create expense entity
    const expense = await this.expenseRepository.create({
      userId: command.userId,
      amount: command.amount,
      currency: command.currency,
      description: command.description,
      categoryId: command.categoryId || null,
      tags: command.tags || [],
      date: new Date(command.date),
      source: command.source || 'manual',
      isRecurring: command.isRecurring || false,
      recurringRuleId: command.recurringRuleId || null,
      attachments: command.attachments || [],
    });

    // Publish event
    const eventBus = getEventBus();
    await eventBus.publish('transaction.expense.created', {
      eventId: randomUUID(),
      eventType: 'transaction.expense.created',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        expenseId: expense.id,
        userId: expense.userId,
        amount: expense.amount,
        currency: expense.currency,
        categoryId: expense.categoryId,
        date: expense.date.toISOString(),
      },
      metadata: {
        correlationId: randomUUID(),
      },
    });

    logger.info('Expense created successfully', { expenseId: expense.id });

    return expense;
  }
}
