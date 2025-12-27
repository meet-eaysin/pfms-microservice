import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RabbitMQEventBus, BaseEvent } from '@pfms/event-bus';
import { User, Session } from '../../domain/entities/user.entity';

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

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventPublisher.name);
  private readonly eventBus: RabbitMQEventBus;

  constructor(private readonly configService: ConfigService) {
    const rabbitmqConfig = this.configService.get('rabbitmq');
    
    this.eventBus = new RabbitMQEventBus({
      rabbitmq: {
        host: rabbitmqConfig.RABBITMQ_HOST,
        port: rabbitmqConfig.RABBITMQ_PORT,
        username: rabbitmqConfig.RABBITMQ_USER || 'guest',
        password: rabbitmqConfig.RABBITMQ_PASSWORD || 'guest',
      },
      serviceName: 'auth-service',
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.eventBus.connect();
      this.logger.log('Event bus connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to event bus', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.eventBus.close();
      this.logger.log('Event bus disconnected');
    } catch (error) {
      this.logger.error('Error disconnecting from event bus', error);
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
      this.logger.log(`Published user.created event for user ${user.id}`);
    } catch (error) {
      this.logger.error('Failed to publish user.created event', error);
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
      this.logger.log(`Published session.created event for user ${session.userId}`);
    } catch (error) {
      this.logger.error('Failed to publish session.created event', error);
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
      this.logger.log(`Published password.reset event for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to publish password.reset event', error);
    }
  }
}
