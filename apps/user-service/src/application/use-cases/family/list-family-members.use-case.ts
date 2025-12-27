import type { IUserRepository } from '../../../domain/interfaces/repository.interface';
import type { IFamilyMember } from '../../../domain/entities/user.entity';

export class ListFamilyMembersUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async execute(userId: string): Promise<IFamilyMember[]> {
    return await this.repository.findFamilyMembers(userId);
  }
}
