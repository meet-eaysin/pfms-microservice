import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure.module';
import { BudgetController } from '../presentation/http/controllers/budget.controller';
import { GoalController } from '../presentation/http/controllers/goal.controller';
import { AutomationController } from '../presentation/http/controllers/automation.controller';
import { CreateBudgetUseCase } from '../application/use-cases/budget/create-budget.use-case';
import { GetBudgetsUseCase } from '../application/use-cases/budget/get-budgets.use-case';
import { CreateGoalUseCase } from '../application/use-cases/goal/create-goal.use-case';
import { ContributeToGoalUseCase } from '../application/use-cases/goal/contribute-to-goal.use-case';
import { CreateRuleUseCase } from '../application/use-cases/automation/create-rule.use-case';
import { PlanningEventHandler } from '../infrastructure/messaging/event-handler.service';
import { RabbitMQEventBus } from '@pfms/event-bus';

@Module({
  imports: [ConfigModule, InfrastructureModule],
  controllers: [BudgetController, GoalController, AutomationController],
  providers: [
    // Budget use cases
    CreateBudgetUseCase,
    GetBudgetsUseCase,

    // Goal use cases
    CreateGoalUseCase,
    ContributeToGoalUseCase,

    // Automation use cases
    CreateRuleUseCase,

    // Event handler
    PlanningEventHandler,

    // RabbitMQ Event Bus
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
          serviceName: 'planning-service',
        });
        await eventBus.connect();
        return eventBus;
      },
      inject: [ConfigService],
    },
  ],
})
export class PlanningModule {}
