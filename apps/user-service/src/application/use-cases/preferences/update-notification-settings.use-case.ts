import type {
  IUserRepository,
  ICacheService,
} from '../../../domain/interfaces/repository.interface';
import type { INotificationSettings } from '../../../domain/entities/user.entity';

interface IUpdateNotificationSettingsOptions {
  userId: string;
  updates: Partial<Omit<INotificationSettings, 'userId' | 'createdAt' | 'updatedAt'>>;
}

export class UpdateNotificationSettingsUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly cache: ICacheService
  ) {}

  async execute(options: IUpdateNotificationSettingsOptions): Promise<INotificationSettings> {
    const updated = await this.repository.updateNotificationSettings(
      options.userId,
      options.updates
    );

    // Invalidate cache
    await this.cache.del(`notification_settings:${options.userId}`);

    return updated;
  }
}
