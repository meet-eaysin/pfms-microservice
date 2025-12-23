import { createLogger } from '@pfms/utils';
import { getEventBus } from '../../infrastructure/event-bus.client';
import {
  ExpenseCreatedEventData,
  ExpenseUpdatedEventData,
  ExpenseDeletedEventData,
  createExpenseCreatedEvent,
  createExpenseUpdatedEvent,
  createExpenseDeletedEvent,
} from '../types';

const logger = createLogger('ExpenseService:EventPublisher');

/**
 * Publish expense.created event
 */
export async function publishExpenseCreated(
  data: ExpenseCreatedEventData,
  metadata?: { correlationId?: string; causationId?: string; userId?: string }
): Promise<void> {
  try {
    const eventBus = getEventBus();
    const event = createExpenseCreatedEvent(data, metadata);

    await eventBus.publish('expense.created', event);

    logger.info('✅ Published expense.created event', {
      eventId: event.eventId,
      expenseId: data.expenseId,
      userId: data.userId,
    });
  } catch (error) {
    logger.error('❌ Failed to publish expense.created event', {
      expenseId: data.expenseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Publish expense.updated event
 */
export async function publishExpenseUpdated(
  data: ExpenseUpdatedEventData,
  metadata?: { correlationId?: string; causationId?: string; userId?: string }
): Promise<void> {
  try {
    const eventBus = getEventBus();
    const event = createExpenseUpdatedEvent(data, metadata);

    await eventBus.publish('expense.updated', event);

    logger.info('✅ Published expense.updated event', {
      eventId: event.eventId,
      expenseId: data.expenseId,
      userId: data.userId,
    });
  } catch (error) {
    logger.error('❌ Failed to publish expense.updated event', {
      expenseId: data.expenseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Publish expense.deleted event
 */
export async function publishExpenseDeleted(
  data: ExpenseDeletedEventData,
  metadata?: { correlationId?: string; causationId?: string; userId?: string }
): Promise<void> {
  try {
    const eventBus = getEventBus();
    const event = createExpenseDeletedEvent(data, metadata);

    await eventBus.publish('expense.deleted', event);

    logger.info('✅ Published expense.deleted event', {
      eventId: event.eventId,
      expenseId: data.expenseId,
      userId: data.userId,
    });
  } catch (error) {
    logger.error('❌ Failed to publish expense.deleted event', {
      expenseId: data.expenseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
