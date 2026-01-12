import type { AssetPrice } from '@/domain/entities/asset-price.entity';
import type {
  IMarketDataRepository,
  ICacheService,
} from '@/domain/interfaces/repository.interface';
import type { IPriceProvider } from '@/domain/interfaces/price-provider.interface';
import type { EventPublisher } from '@/infrastructure/messaging/event.publisher';

export class GetPriceUseCase {
  constructor(
    private readonly repository: IMarketDataRepository,
    private readonly cache: ICacheService,
    private readonly yahooProvider: IPriceProvider,
    private readonly cryptoProvider: IPriceProvider,
    private readonly eventPublisher: EventPublisher
  ) {}

  async execute(symbol: string, isCrypto: boolean = false): Promise<AssetPrice | null> {
    const cacheKey = `price:${symbol.toUpperCase()}`;

    const cached = await this.cache.get<AssetPrice>(cacheKey);
    if (cached) {
      cached.lastUpdated = new Date(cached.lastUpdated);
      return cached;
    }

    const provider = isCrypto ? this.cryptoProvider : this.yahooProvider;
    const price = await provider.getPrice(symbol);

    if (price) {
      await this.repository.upsertAssetPrice(price);
      await this.cache.set(cacheKey, price);

      await this.eventPublisher.publishPriceUpdate(price.symbol, price.price);

      return price;
    }

    return this.repository.getAssetPrice(symbol);
  }
}
