import { Module } from '@nestjs/common';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { PrismaBudgetRepository } from '../infrastructure/persistence/repositories/budget.repository.impl';
import { PrismaSavingsGoalRepository } from '../infrastructure/persistence/repositories/savings-goal.repository.impl';
import { PrismaAutomationRuleRepository } from '../infrastructure/persistence/repositories/automation-rule.repository.impl';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'IBudgetRepository',
      useClass: PrismaBudgetRepository,
    },
    {
      provide: 'ISavingsGoalRepository',
      useClass: PrismaSavingsGoalRepository,
    },
    {
      provide: 'IAutomationRuleRepository',
      useClass: PrismaAutomationRuleRepository,
    },
  ],
  exports: [
    PrismaService,
    'IBudgetRepository',
    'ISavingsGoalRepository',
    'IAutomationRuleRepository',
  ],
})
export class InfrastructureModule {}
