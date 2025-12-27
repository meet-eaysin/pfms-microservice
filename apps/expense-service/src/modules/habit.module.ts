import { Module } from '@nestjs/common';
import { HabitController } from '../presentation/http/controllers/habit.controller';
import { CreateHabitUseCase } from '../core/application/use-cases/habit/create-habit.use-case';
import { LogHabitUseCase } from '../core/application/use-cases/habit/log-habit.use-case';

@Module({
  controllers: [HabitController],
  providers: [CreateHabitUseCase, LogHabitUseCase],
})
export class HabitModule {}
