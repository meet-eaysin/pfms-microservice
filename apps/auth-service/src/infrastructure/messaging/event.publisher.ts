import { RabbitMQEventBus, BaseEvent } from '@pfms/event-bus';
import { User, Session } from '../../domain/entities/user.entity';
import { RabbitMQConfig } from '../../config';
import { createLogger } from '@pfms/config';

interface UserCreatedEventData {
  userId: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  createdAt: Date;
}

interface SessionCreatedEventData {
  sessionId: string;
  userId: string;
  ipAddress: string | null;
  userAgent: string | null;
}

interface PasswordResetEventData {
  userId: string;
  email: string;
}

export class EventPublisher {
  private readonly logger = createLogger('EventPublisher');
  private readonly eventBus: RabbitMQEventBus;

  constructor(config: RabbitMQConfig) {
    this.eventBus = new RabbitMQEventBus({
      rabbitmq: {
        host: config.RABBITMQ_HOST,
        port: config.RABBITMQ_PORT,
        username: config.RABBITMQ_USER,
        password: config.RABBITMQ_PASSWORD,
      },
      serviceName: 'auth-service',
    });
  }

  async connect(): Promise<void> {
    try {
      await this.eventBus.connect();
      this.logger.info('Event bus connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to event bus', { error });
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.eventBus.close();
      this.logger.info('Event bus disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from event bus', { error });
    }
  }

  async publishUserCreated(user: User): Promise<void> {
    try {
      const event: BaseEvent & { data: UserCreatedEventData } = {
        eventId: crypto.randomUUID(),
        eventType: 'user.created',
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          userId: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
        metadata: {
          userId: user.id,
        },
      };

      await this.eventBus.publish('user.created', event);
      this.logger.info(`Published user.created event for user ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to publish user.created event', { error });
    }
  }

  async publishSessionCreated(session: Session): Promise<void> {
    try {
      const event: BaseEvent & { data: SessionCreatedEventData } = {
        eventId: crypto.randomUUID(),
        eventType: 'session.created',
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          sessionId: session.id,
          userId: session.userId,
          ipAddress: session.ipAddress,
          userAgent: session.userAgent,
        },
        metadata: {
          userId: session.userId,
        },
      };

      await this.eventBus.publish('session.created', event);
      this.logger.info(
        `Published session.created event for user ${session.userId}`,
      );
    } catch (error) {
      this.logger.error('Failed to publish session.created event', { error });
    }
  }

  async publishPasswordReset(userId: string, email: string): Promise<void> {
    try {
      const event: BaseEvent & { data: PasswordResetEventData } = {
        eventId: crypto.randomUUID(),
        eventType: 'password.reset',
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          userId,
          email,
        },
        metadata: {
          userId,
        },
      };

      await this.eventBus.publish('password.reset', event);
      this.logger.info(`Published password.reset event for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to publish password.reset event', { error });
    }
  }
}

// Factory function
export function createEventPublisher(config: RabbitMQConfig): EventPublisher {
  return new EventPublisher(config);
}
