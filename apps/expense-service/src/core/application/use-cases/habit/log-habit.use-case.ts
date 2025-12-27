import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IHabitRepository } from '../../../domain/repositories/habit.repository';
import { HabitLog } from '../../../domain/models/habit.model';
import { parseISO } from '@pfms/date';

export interface LogHabitCommand {
  habitId: string;
  quantity: number;
  date: string;
}

@Injectable()
export class LogHabitUseCase {
  constructor(
    @Inject('IHabitRepository')
    private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(command: LogHabitCommand): Promise<HabitLog> {
    const habit = await this.habitRepository.findById(command.habitId);
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return this.habitRepository.logHabit({
      habitId: command.habitId,
      quantity: command.quantity,
      date: parseISO(command.date),
    });
  }
}
