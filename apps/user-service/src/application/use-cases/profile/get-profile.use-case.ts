import type { IUserRepository } from '../../../domain/interfaces/repository.interface';
import type { IUserProfile } from '../../../domain/entities/user.entity';

export class GetProfileUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async execute(userId: string): Promise<IUserProfile | null> {
    return await this.repository.findProfileByUserId(userId);
  }
}
