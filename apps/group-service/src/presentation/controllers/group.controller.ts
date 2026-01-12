import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CreateGroupUseCase } from '../../application/use-cases/create-group.use-case';
import { AddMemberUseCase } from '../../application/use-cases/add-member.use-case';
import { AddExpenseUseCase } from '../../application/use-cases/add-expense.use-case';
import { GetGroupsUseCase } from '../../application/use-cases/get-groups.use-case';
import { GetGroupDetailsUseCase } from '../../application/use-cases/get-group-details.use-case';
import { CreateGroupDto } from '../../application/dto/group/create-group.dto';
import { AddMemberDto } from '../../application/dto/group/add-member.dto';
import { AddExpenseDto } from '../../application/dto/group/add-expense.dto';

@ApiTags('Groups')
@Controller()
export class GroupController {
  constructor(
    private readonly createGroupUseCase: CreateGroupUseCase,
    private readonly addMemberUseCase: AddMemberUseCase,
    private readonly addExpenseUseCase: AddExpenseUseCase,
    private readonly getGroupsUseCase: GetGroupsUseCase,
    private readonly getGroupDetailsUseCase: GetGroupDetailsUseCase
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new group' })
  async createGroup(@Body() dto: CreateGroupDto) {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return this.createGroupUseCase.execute(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user groups' })
  async getGroups() {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return this.getGroupsUseCase.execute(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group details with members and expenses' })
  async getGroupDetails(@Param('id') id: string) {
    return this.getGroupDetailsUseCase.execute(id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a member to a group' })
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.addMemberUseCase.execute(id, dto);
  }

  @Post(':id/expenses')
  @ApiOperation({ summary: 'Add an expense to a group' })
  async addExpense(@Param('id') id: string, @Body() dto: AddExpenseDto) {
    const userId = '123e4567-e89b-12d3-a456-426614174000';
    return this.addExpenseUseCase.execute(id, userId, dto);
  }
}
