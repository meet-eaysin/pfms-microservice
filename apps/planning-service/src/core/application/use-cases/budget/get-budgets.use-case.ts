import { Inject, Injectable } from '@nestjs/common';
import { IBudgetRepository } from '../../../domain/repositories/budget.repository';
import { Budget } from '../../../domain/models/budget.model';

@Injectable()
export class GetBudgetsUseCase {
  constructor(
    @Inject('IBudgetRepository')
    private readonly budgetRepository: IBudgetRepository
  ) {}

  async execute(userId: string): Promise<Budget[]> {
    return this.budgetRepository.findByUserId(userId);
  }
}
