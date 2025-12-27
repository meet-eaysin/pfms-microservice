import { RabbitMQEventBus } from '@pfms/event-bus';
import type { RabbitMQConfig } from '@/config';
import { createLogger } from '@pfms/utils';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('EventPublisher');

interface IBaseEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  version: string;
  data: Record<string, unknown>;
}

export class EventPublisher {
  private readonly eventBus: RabbitMQEventBus;

  constructor(config: RabbitMQConfig) {
    this.eventBus = new RabbitMQEventBus({
      serviceName: 'user-service',
      rabbitmq: {
        host: config.RABBITMQ_HOST,
        port: config.RABBITMQ_PORT,
        username: config.RABBITMQ_USER,
        password: config.RABBITMQ_PASSWORD,
        vhost: config.RABBITMQ_VHOST,
      },
    });
  }

  async connect(): Promise<void> {
    await this.eventBus.connect();
    logger.info('✅ Event bus connected');
  }

  async publishProfileUpdated(options: { userId: string; changes: string[] }): Promise<void> {
    const event: IBaseEvent = {
      eventId: uuidv4(),
      eventType: 'user.profile.updated',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: options.userId,
        changes: options.changes,
      },
    };

    await this.eventBus.publish('user.profile.updated', event);
    logger.info('Published user.profile.updated event', { userId: options.userId });
  }

  async publishPreferencesUpdated(options: {
    userId: string;
    baseCurrency: string;
    riskTolerance: string;
  }): Promise<void> {
    const event: IBaseEvent = {
      eventId: uuidv4(),
      eventType: 'user.preferences.updated',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        userId: options.userId,
        baseCurrency: options.baseCurrency,
        riskTolerance: options.riskTolerance,
      },
    };

    await this.eventBus.publish('user.preferences.updated', event);
    logger.info('Published user.preferences.updated event', { userId: options.userId });
  }

  async publishFamilyInvited(options: {
    headUserId: string;
    memberEmail: string;
    relationship: string;
  }): Promise<void> {
    const event: IBaseEvent = {
      eventId: uuidv4(),
      eventType: 'user.family.invited',
      timestamp: new Date().toISOString(),
      version: '1.0',
      data: {
        headUserId: options.headUserId,
        memberEmail: options.memberEmail,
        relationship: options.relationship,
      },
    };

    await this.eventBus.publish('user.family.invited', event);
    logger.info('Published user.family.invited event', { headUserId: options.headUserId });
  }

  async close(): Promise<void> {
    await this.eventBus.close();
    logger.info('Event bus closed');
  }
}

export function createEventPublisher(config: RabbitMQConfig): EventPublisher {
  return new EventPublisher(config);
}
