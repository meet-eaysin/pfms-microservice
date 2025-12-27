import type {
  IUserRepository,
  ICacheService,
} from '@/domain/interfaces/repository.interface';
import type { IFinancialPreferences } from '@/domain/entities/user.entity';
import type { EventPublisher } from '@/infrastructure/messaging/event.publisher';
import { Currency } from '@/domain/value-objects/currency.vo';
import { RiskTolerance } from '@/domain/value-objects/risk-tolerance.vo';

interface IUpdateFinancialPreferencesOptions {
  userId: string;
  updates: Partial<Omit<IFinancialPreferences, 'userId' | 'createdAt' | 'updatedAt'>>;
}

export class UpdateFinancialPreferencesUseCase {
  constructor(
    private readonly repository: IUserRepository,
    private readonly cache: ICacheService,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(options: IUpdateFinancialPreferencesOptions): Promise<IFinancialPreferences> {
    // Validate currency if provided
    if (options.updates.baseCurrency !== undefined) {
      Currency.create(options.updates.baseCurrency);
    }

    // Validate risk tolerance if provided
    if (options.updates.riskTolerance !== undefined) {
      RiskTolerance.create(options.updates.riskTolerance);
    }

    const updated = await this.repository.updateFinancialPreferences(
      options.userId,
      options.updates
    );

    // Invalidate cache
    await this.cache.del(`financial_prefs:${options.userId}`);

    // Publish event
    await this.eventPublisher.publishPreferencesUpdated({
      userId: options.userId,
      baseCurrency: updated.baseCurrency,
      riskTolerance: updated.riskTolerance,
    });

    return updated;
  }
}
