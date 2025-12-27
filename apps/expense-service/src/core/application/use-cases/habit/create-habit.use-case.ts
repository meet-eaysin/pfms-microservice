import { Inject, Injectable } from '@nestjs/common';
import { IHabitRepository } from '../../../domain/repositories/habit.repository';
import { Habit } from '../../../domain/models/habit.model';

export interface CreateHabitCommand {
  userId: string;
  name: string;
  unitCost: number;
}

@Injectable()
export class CreateHabitUseCase {
  constructor(
    @Inject('IHabitRepository')
    private readonly habitRepository: IHabitRepository,
  ) {}

  async execute(command: CreateHabitCommand): Promise<Habit> {
    return this.habitRepository.create({
      userId: command.userId,
      name: command.name,
      unitCost: command.unitCost,
    });
  }
}
