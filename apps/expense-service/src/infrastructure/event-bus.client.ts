import { RabbitMQEventBus } from '@pfms/event-bus';
import { createLogger } from '@pfms/utils';

const logger = createLogger('EventBusClient');

let eventBus: RabbitMQEventBus | null = null;
let isConnecting = false;

/**
 * Initialize and get the event bus instance
 */
export async function initializeEventBus(): Promise<RabbitMQEventBus> {
  if (eventBus) {
    return eventBus;
  }

  if (isConnecting) {
    // Wait for the connection to complete
    while (isConnecting) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (eventBus) {
      return eventBus;
    }
  }

  isConnecting = true;

  try {
    eventBus = new RabbitMQEventBus({
      rabbitmq: {
        host: process.env.RABBITMQ_HOST || 'localhost',
        port: parseInt(process.env.RABBITMQ_PORT || '5672'),
        username: process.env.RABBITMQ_USER || 'guest',
        password: process.env.RABBITMQ_PASS || 'guest',
      },
      serviceName: 'expense-service',
      prefetchCount: 10,
    });

    await eventBus.connect();
    logger.info('✅ Event bus connected');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      await closeEventBus();
    });

    process.on('SIGINT', async () => {
      await closeEventBus();
    });

    isConnecting = false;
    return eventBus;
  } catch (error) {
    isConnecting = false;
    logger.error('❌ Failed to connect to event bus', { error });
    throw error;
  }
}

/**
 * Get the event bus instance (must be initialized first)
 */
export function getEventBus(): RabbitMQEventBus {
  if (!eventBus) {
    throw new Error('Event bus not initialized. Call initializeEventBus() first.');
  }
  return eventBus;
}

/**
 * Check if event bus is healthy
 */
export async function isEventBusHealthy(): Promise<boolean> {
  if (!eventBus) {
    return false;
  }
  return await eventBus.healthCheck();
}

/**
 * Close event bus connection
 */
export async function closeEventBus(): Promise<void> {
  if (eventBus) {
    logger.info('🔌 Closing event bus connection...');
    await eventBus.close();
    eventBus = null;
    logger.info('✅ Event bus disconnected');
  }
}
