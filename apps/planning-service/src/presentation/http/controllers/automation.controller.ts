import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateRuleUseCase } from '../../../application/use-cases/automation/create-rule.use-case';
import { CreateRuleDto } from '../../../application/dto/automation/create-rule.dto';

@ApiTags('automation')
@Controller('api/v1/automation/rules')
export class AutomationController {
  constructor(private readonly createRuleUseCase: CreateRuleUseCase) {}

  @Post()
  @ApiOperation({ summary: 'Create a new automation rule' })
  @ApiResponse({ status: 201, description: 'Rule created successfully' })
  async create(@Body() dto: CreateRuleDto) {
    return this.createRuleUseCase.execute(dto);
  }
}
