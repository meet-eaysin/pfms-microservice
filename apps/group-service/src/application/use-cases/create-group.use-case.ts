import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IGroupRepository } from '../../domain/interfaces/group.repository.interface';
import { FinanceGroup, GroupMember, MemberRole } from '../../domain/entities/group.entity';
import { CreateGroupDto } from '../dto/group/create-group.dto';

@Injectable()
export class CreateGroupUseCase {
  constructor(private readonly repository: IGroupRepository) {}

  async execute(userId: string, dto: CreateGroupDto): Promise<FinanceGroup> {
    // 1. Create Group
    const group = new FinanceGroup(uuidv4(), dto.name, userId, dto.description, dto.groupType);
    const createdGroup = await this.repository.createGroup(group);

    // 2. Add Creator as Admin Member
    const member = new GroupMember(uuidv4(), createdGroup.id, userId, MemberRole.ADMIN);
    await this.repository.addMember(member);

    return createdGroup;
  }
}
