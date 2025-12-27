import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISavingsGoalRepository } from '../../../domain/repositories/savings-goal.repository';
import { SavingsGoal } from '../../../domain/models/savings-goal.model';
import { parseISO } from '@pfms/date';

export interface ContributeToGoalCommand {
  goalId: string;
  amount: number;
  date: string;
  notes?: string;
}

@Injectable()
export class ContributeToGoalUseCase {
  constructor(
    @Inject('ISavingsGoalRepository')
    private readonly goalRepository: ISavingsGoalRepository
  ) {}

  async execute(command: ContributeToGoalCommand): Promise<SavingsGoal> {
    const goal = await this.goalRepository.findById(command.goalId);
    if (!goal) {
      throw new NotFoundException('Savings goal not found');
    }

    return this.goalRepository.contribute(
      command.goalId,
      command.amount,
      parseISO(command.date),
      command.notes
    );
  }
}
