import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EventPublisher } from '../../../src/infrastructure/messaging/event.publisher';
import { User, Session } from '../../../src/domain/entities/user.entity';

jest.mock('@pfms/event-bus', () => ({
  RabbitMQEventBus: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    publish: jest.fn().mockResolvedValue(undefined),
  })),
  BaseEvent: {},
}));

describe('EventPublisher', () => {
  let eventPublisher: EventPublisher;
  let eventBus: any;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    emailVerified: true,
    name: 'Test User',
    image: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession: Session = {
    id: 'session-123',
    userId: 'user-123',
    token: 'token',
    expiresAt: new Date(),
    ipAddress: '127.0.0.1',
    userAgent: 'Test Agent',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventPublisher,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              RABBITMQ_HOST: 'localhost',
              RABBITMQ_PORT: 5672,
              RABBITMQ_USER: 'guest',
              RABBITMQ_PASSWORD: 'guest',
            }),
          },
        },
      ],
    }).compile();

    eventPublisher = module.get(EventPublisher);
    eventBus = (eventPublisher as any).eventBus;
  });

  describe('publishUserCreated', () => {
    it('should publish user created event', async () => {
      await eventPublisher.publishUserCreated(mockUser);

      expect(eventBus.publish).toHaveBeenCalledWith(
        'user.created',
        expect.objectContaining({
          eventType: 'user.created',
          data: expect.objectContaining({
            userId: mockUser.id,
            email: mockUser.email,
          }),
        }),
      );
    });
  });

  describe('publishSessionCreated', () => {
    it('should publish session created event', async () => {
      await eventPublisher.publishSessionCreated(mockSession);

      expect(eventBus.publish).toHaveBeenCalledWith(
        'session.created',
        expect.objectContaining({
          eventType: 'session.created',
          data: expect.objectContaining({
            sessionId: mockSession.id,
            userId: mockSession.userId,
          }),
        }),
      );
    });
  });

  describe('publishPasswordReset', () => {
    it('should publish password reset event', async () => {
      await eventPublisher.publishPasswordReset('user-123', 'test@example.com');

      expect(eventBus.publish).toHaveBeenCalledWith(
        'password.reset',
        expect.objectContaining({
          eventType: 'password.reset',
          data: expect.objectContaining({
            userId: 'user-123',
            email: 'test@example.com',
          }),
        }),
      );
    });
  });
});
