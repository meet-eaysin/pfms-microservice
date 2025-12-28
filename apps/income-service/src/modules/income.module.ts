import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncomeSourceController } from '../presentation/http/controllers/income-source.controller';
import { IncomeTransactionController } from '../presentation/http/controllers/income-transaction.controller';
import { CreateSourceUseCase } from '../application/use-cases/income-source/create-source.use-case';
import { RecordIncomeUseCase } from '../application/use-cases/income-transaction/record-income.use-case';
import { RabbitMQEventBus } from '@pfms/event-bus';

@Module({
  imports: [ConfigModule],
  controllers: [IncomeSourceController, IncomeTransactionController],
  providers: [
    CreateSourceUseCase,
    RecordIncomeUseCase,
    {
      provide: RabbitMQEventBus,
      useFactory: async (configService: ConfigService) => {
        const eventBus = new RabbitMQEventBus({
          rabbitmq: {
            host: configService.get('RABBITMQ_HOST') || 'localhost',
            port: configService.get('RABBITMQ_PORT') || 5672,
            username: configService.get('RABBITMQ_USER') || 'guest',
            password: configService.get('RABBITMQ_PASSWORD') || 'guest',
            vhost: configService.get('RABBITMQ_VHOST') || '/',
          },
          serviceName: 'income-service',
        });
        await eventBus.connect();
        return eventBus;
      },
      inject: [ConfigService],
    },
  ],
})
export class IncomeModule {}
