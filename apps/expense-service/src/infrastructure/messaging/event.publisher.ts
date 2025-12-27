import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';
import { Connection, Channel } from 'amqplib';

@Injectable()
export class EventPublisher implements OnModuleInit, OnModuleDestroy {
  private connection: any;
  private channel: any;
  private readonly logger = new Logger(EventPublisher.name);
  private readonly exchange = 'pfms.events';

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    try {
      const host = this.configService.get<string>('RABBITMQ_HOST');
      const port = this.configService.get<string>('RABBITMQ_PORT');
      const user = this.configService.get<string>('RABBITMQ_USER');
      const pass = this.configService.get<string>('RABBITMQ_PASSWORD');
      const vhost = this.configService.get<string>('RABBITMQ_VHOST');

      const url = `amqp://${user}:${pass}@${host}:${port}${vhost}`;
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      await this.channel.assertExchange(this.exchange, 'topic', { durable: true });

      this.logger.log('✅ Connected to RabbitMQ');
    } catch (error) {
      this.logger.error('❌ Failed to connect to RabbitMQ', error);
    }
  }

  async publish(routingKey: string, data: any): Promise<void> {
    if (!this.channel) {
      this.logger.error('Cannot publish event, channel is not open');
      return;
    }
    const message = Buffer.from(JSON.stringify(data));
    this.channel.publish(this.exchange, routingKey, message);
    this.logger.debug(`Published event '${routingKey}'`);
  }

  private async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}
