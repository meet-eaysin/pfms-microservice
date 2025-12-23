import { createLogger } from '@pfms/utils';
import { RabbitMQEventBus } from '@pfms/event-bus';
import { handleUserCreated } from '../consumers/user-created.consumer';

const logger = createLogger('ExpenseService:EventSubscribers');

/**
 * Register all event subscribers for the expense service
 */
export async function registerEventSubscribers(eventBus: RabbitMQEventBus): Promise<void> {
  logger.info('📋 Registering event subscribers...');

  try {
    // Subscribe to user.created events
    await eventBus.subscribe('user.created', handleUserCreated);
    logger.info('✅ Subscribed to user.created events');

    // Add more subscribers here as needed
    // await eventBus.subscribe('other.event', handleOtherEvent);

    logger.info('✅ All event subscribers registered successfully');
  } catch (error) {
    logger.error('❌ Failed to register event subscribers', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
