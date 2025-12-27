import type { IUserRepository } from '../../../domain/interfaces/repository.interface';
import type { IFinancialPreferences } from '../../../domain/entities/user.entity';

export class GetFinancialPreferencesUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async execute(userId: string): Promise<IFinancialPreferences | null> {
    return await this.repository.findFinancialPreferences(userId);
  }
}
