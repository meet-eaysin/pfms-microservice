import { Inject, Injectable } from '@nestjs/common';
import { IExpenseRepository } from '../../../domain/repositories/expense.repository';
import { Expense } from '../../../domain/models/expense.model';
import { parseISO } from '@pfms/date';

export interface GetExpensesQuery {
  userId: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
}

@Injectable()
export class GetExpensesUseCase {
  constructor(
    @Inject('IExpenseRepository')
    private readonly expenseRepository: IExpenseRepository
  ) {}

  async execute(query: GetExpensesQuery): Promise<Expense[]> {
    const filters = {
      startDate: query.startDate ? parseISO(query.startDate) : undefined,
      endDate: query.endDate ? parseISO(query.endDate) : undefined,
      categoryId: query.categoryId,
    };

    return this.expenseRepository.findAll(query.userId, filters);
  }
}
