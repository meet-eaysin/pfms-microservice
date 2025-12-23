import { randomUUID } from 'crypto';
import { createLogger } from '@pfms/utils';
import { DeleteExpenseCommand } from './delete-expense.command';
import { ExpenseRepository } from '../../domain/repositories/expense.repository';
import { getEventBus } from '../../infrastructure/event-bus.client';

const logger = createLogger('DeleteExpenseHandler');

export class DeleteExpenseHandler {
  constructor(private expenseRepository: ExpenseRepository) {}

  async execute(command: DeleteExpenseCommand): Promise<void> {
    logger.info('Deleting expense', { expenseId: command.id, userId: command.userId });

    // Find existing expense
    const existing = await this.expenseRepository.findById(command.id, command.userId);
    if (!existing) {
      throw new Error(`Expense not found: ${command.id}`);
    }

    // Delete expense (soft delete)
    await this.expenseRepository.delete(command.id, command.userId);

    // Publish event
    const eventBus = getEventBus();
    await eventBus.publish('transaction.expense.deleted', {
      eventId: randomUUID(),
      eventType: 'transaction.expense.deleted',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        expenseId: command.id,
        userId: command.userId,
      },
      metadata: {
        correlationId: randomUUID(),
      },
    });

    logger.info('Expense deleted successfully', { expenseId: command.id });
  }
}
