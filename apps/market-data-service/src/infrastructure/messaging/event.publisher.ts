import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@pfms/config';
import type { MarketDataServiceConfig } from '@/config';
import { RabbitMQEventBus } from '@pfms/event-bus';

const logger = createLogger('EventPublisher');

export class EventPublisher {
  private eventBus: RabbitMQEventBus;

  constructor(config: MarketDataServiceConfig) {
    this.eventBus = new RabbitMQEventBus({
      rabbitmq: config.rabbitmq,
      serviceName: config.server.SERVICE_NAME,
    });
  }

  async connect(): Promise<void> {
    await this.eventBus.connect();
    logger.info('Connected to Event Bus');
  }

  async publishPriceUpdate(symbol: string, price: number): Promise<void> {
    await this.eventBus.publish('market.price_update', {
      eventId: uuidv4(),
      eventType: 'market.price_update',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        symbol: symbol.toUpperCase(),
        price,
      },
    });
  }

  async close(): Promise<void> {
    await this.eventBus.close();
  }
}

export function createEventPublisher(config: MarketDataServiceConfig): EventPublisher {
  return new EventPublisher(config);
}
