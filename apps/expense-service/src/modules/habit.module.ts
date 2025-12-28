import { Module } from '@nestjs/common';
import { HabitController } from '../presentation/controllers/habit.controller';
import { CreateHabitUseCase } from '../application/use-cases/habit/create-habit.use-case';
import { LogHabitUseCase } from '../application/use-cases/habit/log-habit.use-case';

@Module({
  controllers: [HabitController],
  providers: [CreateHabitUseCase, LogHabitUseCase],
})
export class HabitModule {}
