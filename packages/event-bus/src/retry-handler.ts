import { EventEmitter } from 'events';
import { createLogger } from '@pfms/config';
import { BaseEvent, EventHandler } from './types';

const logger = createLogger('RetryHandler');

export class RetryHandler {
  private maxRetries: number = 3;
  private baseDelay: number = 1000; // 1 second

  constructor(private eventBus: EventEmitter) {}

  /**
   * Retry handler execution with exponential backoff
   */
  async retry(
    handler: EventHandler,
    event: BaseEvent,
    eventType: string,
    attempt: number = 1
  ): Promise<void> {
    if (attempt > this.maxRetries) {
      logger.error('❌ Max retries exceeded, message will go to DLQ', {
        eventType,
        eventId: event.eventId,
        attempts: attempt,
      });

      // Emit event for monitoring
      this.eventBus.emit('event:dlq', { eventType, event });

      throw new Error('Max retries exceeded');
    }

    const delay = this.calculateDelay(attempt);

    logger.warn(`⏳ Retrying handler (attempt ${attempt}/${this.maxRetries})`, {
      eventType,
      eventId: event.eventId,
      delay,
    });

    await this.sleep(delay);

    try {
      await handler(event);

      logger.info('✅ Retry successful', {
        eventType,
        eventId: event.eventId,
        attempt,
      });
    } catch (error) {
      logger.error('❌ Retry failed', {
        eventType,
        eventId: event.eventId,
        attempt,
        error,
      });

      // Retry again
      await this.retry(handler, event, eventType, attempt + 1);
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateDelay(attempt: number): number {
    return this.baseDelay * Math.pow(2, attempt - 1);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
