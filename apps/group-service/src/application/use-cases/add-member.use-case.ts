import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IGroupRepository } from '../../domain/interfaces/group.repository.interface';
import { GroupMember } from '../../domain/entities/group.entity';
import { AddMemberDto } from '../dto/group/add-member.dto';

@Injectable()
export class AddMemberUseCase {
  constructor(private readonly repository: IGroupRepository) {}

  async execute(groupId: string, dto: AddMemberDto): Promise<GroupMember> {
    // Check if group exists
    const group = await this.repository.findGroupById(groupId);
    if (!group) {
      throw new BadRequestException('Group not found');
    }

    // Check if member already exists
    const existingMember = await this.repository.findMember(groupId, dto.userId);
    if (existingMember) {
      throw new BadRequestException('User is already a member of this group');
    }

    const member = new GroupMember(uuidv4(), groupId, dto.userId, dto.role, dto.displayName);

    return this.repository.addMember(member);
  }
}
