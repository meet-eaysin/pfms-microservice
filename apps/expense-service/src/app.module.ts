import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { RedisModule } from './infrastructure/cache/redis/redis.module';
import { RabbitMQModule } from './infrastructure/messaging/rabbitmq.module';
import { ExpensesModule } from './expenses/expenses.module';
import { CategoriesModule } from './categories/categories.module';
import { RecurringModule } from './recurring/recurring.module';
import { HabitsModule } from './habits/habits.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    PrismaModule,
    RedisModule,
    RabbitMQModule,
    ExpensesModule,
    CategoriesModule,
    RecurringModule,
    HabitsModule,
  ],
})
export class AppModule {}
