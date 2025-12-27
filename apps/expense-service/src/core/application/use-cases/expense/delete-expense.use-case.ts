import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IExpenseRepository } from '../../../domain/repositories/expense.repository';

@Injectable()
export class DeleteExpenseUseCase {
  constructor(
    @Inject('IExpenseRepository')
    private readonly expenseRepository: IExpenseRepository
  ) {}

  async execute(id: string): Promise<void> {
    const existing = await this.expenseRepository.findById(id);
    if (!existing) {
      throw new NotFoundException('Expense not found');
    }

    await this.expenseRepository.delete(id);
  }
}
