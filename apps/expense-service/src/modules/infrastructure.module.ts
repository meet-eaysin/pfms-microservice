import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { PrismaExpenseRepository } from '../infrastructure/persistence/repositories/expense.repository.impl';
import { PrismaCategoryRepository } from '../infrastructure/persistence/repositories/category.repository.impl';
import { PrismaHabitRepository } from '../infrastructure/persistence/repositories/habit.repository.impl';
import { PrismaRecurringRepository } from '../infrastructure/persistence/repositories/recurring.repository.impl';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: 'IExpenseRepository',
      useClass: PrismaExpenseRepository,
    },
    {
      provide: 'ICategoryRepository',
      useClass: PrismaCategoryRepository,
    },
    {
      provide: 'IHabitRepository',
      useClass: PrismaHabitRepository,
    },
    {
      provide: 'IRecurringRepository',
      useClass: PrismaRecurringRepository,
    },
  ],
  exports: [
    PrismaService,
    'IExpenseRepository',
    'ICategoryRepository',
    'IHabitRepository',
    'IRecurringRepository',
  ],
})
export class InfrastructureModule {}
