import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ExpenseController } from '../presentation/http/controllers/expense.controller';
import { CreateExpenseUseCase } from '../core/application/use-cases/expense/create-expense.use-case';
import { GetExpensesUseCase } from '../core/application/use-cases/expense/get-expenses.use-case';
import { UpdateExpenseUseCase } from '../core/application/use-cases/expense/update-expense.use-case';
import { DeleteExpenseUseCase } from '../core/application/use-cases/expense/delete-expense.use-case';
import { RabbitMQEventBus } from '@pfms/event-bus';

@Module({
  imports: [ConfigModule],
  controllers: [ExpenseController],
  providers: [
    CreateExpenseUseCase,
    GetExpensesUseCase,
    UpdateExpenseUseCase,
    DeleteExpenseUseCase,
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
          serviceName: 'expense-service',
        });
        await eventBus.connect();
        return eventBus;
      },
      inject: [ConfigService],
    },
  ],
})
export class ExpenseModule {}
