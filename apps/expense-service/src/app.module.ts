import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './shared/modules/infrastructure.module';
import { ExpenseModule } from './shared/modules/expense.module';
import { CategoryModule } from './shared/modules/category.module';
import { HabitModule } from './shared/modules/habit.module';
import { RecurringModule } from './shared/modules/recurring.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
    ExpenseModule,
    CategoryModule,
    HabitModule,
    RecurringModule,
  ],
})
export class AppModule {}
