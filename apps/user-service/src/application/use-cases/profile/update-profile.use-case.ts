import type { IUserRepository, ICacheService } from '@/domain/interfaces/repository.interface';
import type { IUserProfile } from '@/domain/entities/user.entity';
import type { EventPublisher } from '@/infrastructure/messaging/event.publisher';

interface IUpdateProfileOptions {
  userId: string;
  updates: Partial<Omit<IUserProfile, 'userId' | 'createdAt' | 'updatedAt'>>;
}

export class UpdateProfileUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly cache: ICacheService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(options: IUpdateProfileOptions): Promise<IUserProfile> {
    const updated = await this.repository.updateProfile(options.userId, options.updates);

    // Invalidate cache
    await this.cache.del(`profile:${options.userId}`);

    // Publish event
    const changes = Object.keys(options.updates);
    await this.eventPublisher.publishProfileUpdated({
      userId: options.userId,
      changes,
    });

    return updated;
  }
}
