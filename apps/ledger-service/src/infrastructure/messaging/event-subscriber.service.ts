import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, ChannelModel } from 'amqplib';

@Injectable()
export class EventSubscriberService implements OnModuleInit {
  private connection!: ChannelModel;
  private channel!: Channel;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
    await this.subscribeToEvents();
  }

  private async connect() {
    try {
      const rabbitMQUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost';
      this.connection = await connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();
      console.log('✅ Connected to RabbitMQ for event subscription');
    } catch (error) {
      console.error('❌ Failed to connect to RabbitMQ:', error);
    }
  }

  private async subscribeToEvents() {
    if (!this.channel) return;

    const exchange = 'pfms.events';
    await this.channel.assertExchange(exchange, 'topic', { durable: true });

    // Subscribe to expense.created
    const expenseQueue = await this.channel.assertQueue('ledger.expense.created', {
      durable: true,
    });
    await this.channel.bindQueue(expenseQueue.queue, exchange, 'expense.created');

    this.channel.consume(expenseQueue.queue, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await this.handleExpenseCreated(event);
          this.channel?.ack(msg);
        } catch (error) {
          console.error('Error processing expense.created event:', error);
          this.channel?.nack(msg, false, false);
        }
      }
    });

    // Subscribe to income.received
    const incomeQueue = await this.channel.assertQueue('ledger.income.received', { durable: true });
    await this.channel.bindQueue(incomeQueue.queue, exchange, 'income.received');

    this.channel.consume(incomeQueue.queue, async (msg) => {
      if (msg) {
        try {
          const event = JSON.parse(msg.content.toString());
          await this.handleIncomeReceived(event);
          this.channel?.ack(msg);
        } catch (error) {
          console.error('Error processing income.received event:', error);
          this.channel?.nack(msg, false, false);
        }
      }
    });

    console.log('✅ Subscribed to expense.created and income.received events');
  }

  private async handleExpenseCreated(event: any) {
    console.log('📝 Received expense.created event:', event);
    // TODO: Create journal entry when event structure is finalized
  }

  private async handleIncomeReceived(event: any) {
    console.log('📝 Received income.received event:', event);
    // TODO: Create journal entry when event structure is finalized
  }
}
