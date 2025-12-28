import { Inject, Injectable } from '@nestjs/common';
import { IBudgetRepository } from '@/domain/interfaces/budget.repository';
import { Budget } from '@/domain/entities/budget.model';

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
