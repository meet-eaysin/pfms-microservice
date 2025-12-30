import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './modules/infrastructure.module';
import { ExpenseModule } from './modules/expense.module';
import { CategoryModule } from './modules/category.module';
import { HabitModule } from './modules/habit.module';
import { RecurringModule } from './modules/recurring.module';
import { HealthController } from './presentation/controllers/health.controller';

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
  controllers: [HealthController],
})
export class AppModule {}
