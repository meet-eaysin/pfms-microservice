import { Controller, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateGoalUseCase } from '../../../core/application/use-cases/goal/create-goal.use-case';
import { ContributeToGoalUseCase } from '../../../core/application/use-cases/goal/contribute-to-goal.use-case';
import { CreateGoalDto, ContributeToGoalDto } from '../../../core/application/dto/goal/goal.dto';

@ApiTags('goals')
@Controller('api/v1/planning/goals')
export class GoalController {
  constructor(
    private readonly createGoalUseCase: CreateGoalUseCase,
    private readonly contributeToGoalUseCase: ContributeToGoalUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new savings goal' })
  @ApiResponse({ status: 201, description: 'Goal created successfully' })
  async create(@Body() dto: CreateGoalDto) {
    return this.createGoalUseCase.execute(dto);
  }

  @Post(':id/contribute')
  @ApiOperation({ summary: 'Add a contribution to a goal' })
  async contribute(@Param('id') id: string, @Body() dto: ContributeToGoalDto) {
    return this.contributeToGoalUseCase.execute({
      goalId: id,
      ...dto,
    });
  }
}
