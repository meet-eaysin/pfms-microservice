import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateBudgetUseCase } from '@/application/use-cases/budget/create-budget.use-case';
import { GetBudgetsUseCase } from '@/application/use-cases/budget/get-budgets.use-case';
import { CreateBudgetDto } from '@/application/dto/budget/create-budget.dto';

@ApiTags('budgets')
@Controller('api/v1/planning/budgets')
export class BudgetController {
  constructor(
    private readonly createBudgetUseCase: CreateBudgetUseCase,
    private readonly getBudgetsUseCase: GetBudgetsUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new budget' })
  @ApiResponse({ status: 201, description: 'Budget created successfully' })
  async create(@Body() createBudgetDto: CreateBudgetDto) {
    return this.createBudgetUseCase.execute(createBudgetDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all budgets for a user' })
  @ApiResponse({ status: 200, description: 'Budgets retrieved successfully' })
  async getAll(@Param('userId') userId: string) {
    // TODO: Get userId from auth token
    return this.getBudgetsUseCase.execute(userId || 'test-user-id');
  }
}
