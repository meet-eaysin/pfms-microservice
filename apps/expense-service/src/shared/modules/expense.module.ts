import { Module } from '@nestjs/common';
import { ExpenseController } from '../../presentation/http/controllers/expense.controller';
import { CreateExpenseUseCase } from '../../core/application/use-cases/expense/create-expense.use-case';
import { GetExpensesUseCase } from '../../core/application/use-cases/expense/get-expenses.use-case';
import { UpdateExpenseUseCase } from '../../core/application/use-cases/expense/update-expense.use-case';
import { DeleteExpenseUseCase } from '../../core/application/use-cases/expense/delete-expense.use-case';

@Module({
  controllers: [ExpenseController],
  providers: [CreateExpenseUseCase, GetExpensesUseCase, UpdateExpenseUseCase, DeleteExpenseUseCase],
})
export class ExpenseModule {}
