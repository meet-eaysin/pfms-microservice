import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { CreateExpenseUseCase } from '../../application/use-cases/expense/create-expense.use-case';
import { GetExpensesUseCase } from '../../application/use-cases/expense/get-expenses.use-case';
import { UpdateExpenseUseCase } from '../../application/use-cases/expense/update-expense.use-case';
import { DeleteExpenseUseCase } from '../../application/use-cases/expense/delete-expense.use-case';
import { CreateExpenseDto, UpdateExpenseDto } from '../../application/dto/expense/expense.dto';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';

@Controller('expenses')
@UseGuards(AuthGuard)
export class ExpenseController {
  constructor(
    private readonly createExpenseUseCase: CreateExpenseUseCase,
    private readonly getExpensesUseCase: GetExpensesUseCase,
    private readonly updateExpenseUseCase: UpdateExpenseUseCase,
    private readonly deleteExpenseUseCase: DeleteExpenseUseCase
  ) {}

  @Post()
  async create(@CurrentUser() userId: string, @Body() dto: CreateExpenseDto) {
    return this.createExpenseUseCase.execute({ userId, ...dto });
  }

  @Get()
  async findAll(
    @CurrentUser() userId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('categoryId') categoryId?: string
  ) {
    return this.getExpensesUseCase.execute({ userId, startDate, endDate, categoryId });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateExpenseDto) {
    return this.updateExpenseUseCase.execute({ id, ...dto });
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteExpenseUseCase.execute(id);
    return { message: 'Expense deleted successfully' };
  }
}
