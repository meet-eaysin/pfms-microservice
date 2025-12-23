import * as amqp from 'amqplib/callback_api';
import { EventEmitter } from 'events';
import { createLogger } from '@pfms/utils';
import { BaseEvent, EventHandler, EventBusConfig } from './types';
import { RetryHandler } from './retry-handler';

const logger = createLogger('EventBus');

export class RabbitMQEventBus extends EventEmitter {
  private connection: amqp.Connection | null = null;
  private publishChannel: amqp.Channel | null = null;
  private consumeChannel: amqp.Channel | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();
  private retryHandler: RetryHandler;
  private isConnected: boolean = false;

  // Exchange and queue configuration
  private readonly EXCHANGE_NAME = 'pfms.events';
  private readonly EXCHANGE_TYPE = 'topic';
  private readonly DLX_EXCHANGE = 'pfms.events.dlx';
  private readonly DLQ_PREFIX = 'pfms.dlq';

  constructor(private config: EventBusConfig) {
    super();
    this.retryHandler = new RetryHandler(this);
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info('🔌 Connecting to RabbitMQ...', {
        host: this.config.rabbitmq.host,
        port: this.config.rabbitmq.port,
      });

      const connectionUrl = `amqp://${this.config.rabbitmq.username}:${this.config.rabbitmq.password}@${this.config.rabbitmq.host}:${this.config.rabbitmq.port}${this.config.rabbitmq.vhost || '/'}`;

      amqp.connect(connectionUrl, (err, connection) => {
        if (err) {
          logger.error('❌ Failed to connect to RabbitMQ', { error: err });
          return reject(err);
        }

        this.connection = connection;

        // Handle connection events
        connection.on('error', (error) => {
          logger.error('❌ RabbitMQ connection error', { error });
          this.isConnected = false;
        });

        connection.on('close', () => {
          logger.warn('⚠️  RabbitMQ connection closed');
          this.isConnected = false;
          this.reconnect();
        });

        // Create channels
        connection.createChannel((err, publishChannel) => {
          if (err) {
            return reject(err);
          }

          this.publishChannel = publishChannel;

          connection.createChannel((err, consumeChannel) => {
            if (err) {
              return reject(err);
            }

            this.consumeChannel = consumeChannel;

            // Set prefetch for consume channel
            consumeChannel.prefetch(this.config.prefetchCount || 10);

            // Setup exchanges
            this.setupExchanges()
              .then(() => {
                this.isConnected = true;
                logger.info('✅ Connected to RabbitMQ');
                resolve();
              })
              .catch(reject);
          });
        });
      });
    });
  }

  /**
   * Setup exchanges (main and DLX)
   */
  private async setupExchanges(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.publishChannel) {
        return reject(new Error('Publish channel not initialized'));
      }

      // Main topic exchange
      this.publishChannel.assertExchange(
        this.EXCHANGE_NAME,
        this.EXCHANGE_TYPE,
        { durable: true },
        (err) => {
          if (err) return reject(err);

          // Dead letter exchange
          this.publishChannel!.assertExchange(
            this.DLX_EXCHANGE,
            'topic',
            { durable: true },
            (err) => {
              if (err) return reject(err);

              logger.info('✅ Exchanges configured', {
                main: this.EXCHANGE_NAME,
                dlx: this.DLX_EXCHANGE,
              });

              resolve();
            }
          );
        }
      );
    });
  }

  /**
   * Reconnect to RabbitMQ
   */
  private async reconnect(): Promise<void> {
    logger.info('🔄 Attempting to reconnect...');

    await this.sleep(5000); // Wait 5 seconds before reconnecting

    try {
      await this.connect();

      // Re-subscribe to all events
      for (const [eventType] of this.handlers.entries()) {
        await this.setupQueue(eventType);
      }

      logger.info('✅ Reconnected successfully');
    } catch (error) {
      logger.error('❌ Reconnection failed', { error });
      this.reconnect(); // Try again
    }
  }

  /**
   * Publish an event to RabbitMQ
   */
  async publish<T extends BaseEvent>(eventType: string, event: T): Promise<void> {
    if (!this.isConnected || !this.publishChannel) {
      throw new Error('Event bus not connected to RabbitMQ');
    }

    const routingKey = this.getRoutingKey(eventType);
    const payload = JSON.stringify(event);

    logger.debug('📤 Publishing event', {
      eventType,
      routingKey,
      eventId: event.eventId,
    });

    const published = this.publishChannel.publish(
      this.EXCHANGE_NAME,
      routingKey,
      Buffer.from(payload),
      {
        persistent: true,
        contentType: 'application/json',
        messageId: event.eventId,
        timestamp: Date.now(),
        headers: {
          eventType,
          version: event.version,
        },
      }
    );

    if (!published) {
      logger.warn('⚠️  Message buffer full, waiting...');
      await this.waitForDrain();
    }

    logger.info('✅ Event published', {
      eventType,
      eventId: event.eventId,
    });

    // Emit local event for monitoring
    this.emit('event:published', { eventType, event });
  }

  /**
   * Subscribe to an event type
   */
  async subscribe<T extends BaseEvent>(eventType: string, handler: EventHandler<T>): Promise<void> {
    if (!this.isConnected || !this.consumeChannel) {
      throw new Error('Event bus not connected to RabbitMQ');
    }

    // Add handler to map
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);

      // Setup queue and binding
      await this.setupQueue(eventType);
    }

    this.handlers.get(eventType)!.push(handler as EventHandler);

    logger.info('📥 Subscribed to event', { eventType });
  }

  /**
   * Setup queue for event type
   */
  private async setupQueue(eventType: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.consumeChannel) {
        return reject(new Error('Consume channel not initialized'));
      }

      const queueName = this.getQueueName(eventType);
      const routingKey = this.getRoutingKey(eventType);
      const dlqName = `${this.DLQ_PREFIX}.${eventType}`;

      // Assert dead letter queue
      this.consumeChannel.assertQueue(dlqName, { durable: true }, (err) => {
        if (err) return reject(err);

        // Bind DLQ to DLX
        this.consumeChannel!.bindQueue(dlqName, this.DLX_EXCHANGE, routingKey, {}, (err) => {
          if (err) return reject(err);

          // Assert main queue with DLX configuration
          this.consumeChannel!.assertQueue(
            queueName,
            {
              durable: true,
              deadLetterExchange: this.DLX_EXCHANGE,
              deadLetterRoutingKey: routingKey,
            },
            (err) => {
              if (err) return reject(err);

              // Bind queue to exchange
              this.consumeChannel!.bindQueue(
                queueName,
                this.EXCHANGE_NAME,
                routingKey,
                {},
                (err) => {
                  if (err) return reject(err);

                  // Start consuming
                  this.consumeChannel!.consume(
                    queueName,
                    (msg) => this.handleMessage(msg, eventType),
                    { noAck: false },
                    (err) => {
                      if (err) return reject(err);

                      logger.info('✅ Queue setup complete', {
                        queue: queueName,
                        routingKey,
                        dlq: dlqName,
                      });

                      resolve();
                    }
                  );
                }
              );
            }
          );
        });
      });
    });
  }

  /**
   * Handle incoming message from RabbitMQ
   */
  private async handleMessage(msg: amqp.Message | null, eventType: string): Promise<void> {
    if (!msg || !this.consumeChannel) {
      return;
    }

    try {
      const event = JSON.parse(msg.content.toString()) as BaseEvent;

      logger.debug('📨 Received event', {
        eventType,
        eventId: event.eventId,
      });

      const handlers = this.handlers.get(eventType);
      if (!handlers || handlers.length === 0) {
        logger.warn('⚠️  No handlers for event', { eventType });
        this.consumeChannel.ack(msg);
        return;
      }

      // Execute all handlers
      await Promise.all(handlers.map((handler) => this.executeHandler(handler, event, eventType)));

      // Acknowledge message
      this.consumeChannel.ack(msg);

      logger.info('✅ Event processed', {
        eventType,
        eventId: event.eventId,
        handlerCount: handlers.length,
      });

      // Emit local event for monitoring
      this.emit('event:processed', { eventType, event });
    } catch (error) {
      logger.error('❌ Failed to handle message', {
        eventType,
        error,
      });

      // Reject and requeue (will go to DLQ after max retries)
      if (this.consumeChannel) {
        this.consumeChannel.nack(msg, false, false);
      }
    }
  }

  /**
   * Execute a single handler with retry logic
   */
  private async executeHandler(
    handler: EventHandler,
    event: BaseEvent,
    eventType: string
  ): Promise<void> {
    try {
      await handler(event);
    } catch (error) {
      logger.error('❌ Handler failed', {
        eventType,
        eventId: event.eventId,
        error,
      });

      // Retry with exponential backoff
      await this.retryHandler.retry(handler, event, eventType);
    }
  }

  /**
   * Get routing key from event type
   */
  private getRoutingKey(eventType: string): string {
    return eventType;
  }

  /**
   * Get queue name from event type
   */
  private getQueueName(eventType: string): string {
    const serviceName = this.config.serviceName || 'unknown';
    return `${serviceName}.${eventType}`;
  }

  /**
   * Wait for channel drain
   */
  private async waitForDrain(): Promise<void> {
    return new Promise((resolve) => {
      if (this.publishChannel) {
        this.publishChannel.once('drain', resolve);
      }
    });
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Close connections
   */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      logger.info('🔌 Closing event bus connections...');

      if (this.consumeChannel) {
        this.consumeChannel.close(() => {});
      }

      if (this.publishChannel) {
        this.publishChannel.close(() => {});
      }

      if (this.connection) {
        this.connection.close(() => {
          this.isConnected = false;
          logger.info('✅ Event bus closed');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    return this.isConnected && this.connection !== null;
  }
}
