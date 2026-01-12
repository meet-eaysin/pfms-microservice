import { Injectable } from '@nestjs/common';
import { IGroupRepository } from '../../domain/interfaces/group.repository.interface';
import { FinanceGroup } from '../../domain/entities/group.entity';

@Injectable()
export class GetGroupsUseCase {
  constructor(private readonly repository: IGroupRepository) {}

  async execute(userId: string): Promise<FinanceGroup[]> {
    return this.repository.findGroupsByUserId(userId);
  }
}
