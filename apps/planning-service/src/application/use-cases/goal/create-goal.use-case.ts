import { Inject, Injectable } from '@nestjs/common';
import { ISavingsGoalRepository } from '../../../domain/interfaces/savings-goal.repository';
import { SavingsGoal } from '../../../domain/entities/savings-goal.model';
import { parseISO } from '@pfms/date';

export interface CreateGoalCommand {
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  deadline?: string;
}

@Injectable()
export class CreateGoalUseCase {
  constructor(
    @Inject('ISavingsGoalRepository')
    private readonly goalRepository: ISavingsGoalRepository
  ) {}

  async execute(command: CreateGoalCommand): Promise<SavingsGoal> {
    return this.goalRepository.create({
      userId: command.userId,
      name: command.name,
      description: command.description,
      targetAmount: command.targetAmount,
      deadline: command.deadline ? parseISO(command.deadline) : undefined,
    });
  }
}
