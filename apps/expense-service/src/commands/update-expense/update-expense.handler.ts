import { randomUUID } from 'crypto';
import { createLogger } from '@pfms/utils';
import { UpdateExpenseCommand } from './update-expense.command';
import { Expense } from '../../domain/entities/expense.entity';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';
import { getEventBus } from '../../infrastructure/event-bus.client';

const logger = createLogger('UpdateExpenseHandler');

export class UpdateExpenseHandler {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(command: UpdateExpenseCommand): Promise<Expense> {
    logger.info('Updating expense', { expenseId: command.id, userId: command.userId });

    // Find existing expense
    const existing = await this.expenseRepository.findById(command.id, command.userId);
    if (!existing) {
      throw new Error(`Expense not found: ${command.id}`);
    }

    // Update expense
    const updateData: Partial<{
      amount: number;
      currency: string;
      description: string;
      categoryId: string | null;
      tags: string[];
      date: Date;
    }> = {};
    if (command.amount !== undefined) updateData.amount = command.amount;
    if (command.currency !== undefined) updateData.currency = command.currency;
    if (command.description !== undefined) updateData.description = command.description;
    if (command.categoryId !== undefined) updateData.categoryId = command.categoryId;
    if (command.tags !== undefined) updateData.tags = command.tags;
    if (command.date !== undefined) updateData.date = new Date(command.date);

    const expense = await this.expenseRepository.update(command.id, command.userId, updateData);

    // Publish event
    const eventBus = getEventBus();
    await eventBus.publish('transaction.expense.updated', {
      eventId: randomUUID(),
      eventType: 'transaction.expense.updated',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        expenseId: expense.id,
        userId: expense.userId,
        changes: updateData,
      },
      metadata: {
        correlationId: randomUUID(),
      },
    });

    logger.info('Expense updated successfully', { expenseId: expense.id });

    return expense;
  }
}
