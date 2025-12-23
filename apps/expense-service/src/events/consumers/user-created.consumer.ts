import { createLogger } from '@pfms/utils';
import { UserCreatedEvent } from '../types';

const logger = createLogger('ExpenseService:UserCreatedConsumer');

/**
 * Handler for user.created events
 * Initialize default expense categories for new users
 */
export async function handleUserCreated(event: UserCreatedEvent): Promise<void> {
  const { userId, email, firstName, lastName } = event.data;

  logger.info('👤 Processing user created event', {
    userId,
    email,
    eventId: event.eventId,
  });

  try {
    // TODO: Initialize default expense categories for user
    // TODO: Set up default budget limits
    logger.info('✅ User initialized for expense tracking', { userId });
  } catch (error) {
    logger.error('❌ Failed to process user.created event', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
