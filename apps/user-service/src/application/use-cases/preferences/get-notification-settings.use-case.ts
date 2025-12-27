import type { IUserRepository } from '@/domain/interfaces/repository.interface';
import type { INotificationSettings } from '@/domain/entities/user.entity';

export class GetNotificationSettingsUseCase {
  constructor(private readonly repository: IUserRepository) {}

  async execute(userId: string): Promise<INotificationSettings | null> {
    return await this.repository.findNotificationSettings(userId);
  }
}
