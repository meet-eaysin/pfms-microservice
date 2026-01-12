import { Injectable, NotFoundException } from '@nestjs/common';
import { IGroupRepository } from '../../domain/interfaces/group.repository.interface';
import { FinanceGroup, GroupMember, GroupExpense } from '../../domain/entities/group.entity';

@Injectable()
export class GetGroupDetailsUseCase {
  constructor(private readonly repository: IGroupRepository) {}

  async execute(groupId: string): Promise<{
    group: FinanceGroup;
    members: GroupMember[];
    expenses: GroupExpense[];
  }> {
    const group = await this.repository.findGroupById(groupId);
    if (!group) {
      throw new NotFoundException('Group not found');
    }

    const members = await this.repository.findMembersByGroupId(groupId);
    const expenses = await this.repository.findExpensesByGroupId(groupId);

    return {
      group,
      members,
      expenses,
    };
  }
}
