import type {
  AssetSearchResult,
  IPriceProvider,
} from '@/domain/interfaces/price-provider.interface';
import { createLogger } from '@pfms/config';

const logger = createLogger('SearchSymbolsUseCase');

export class SearchSymbolsUseCase {
  constructor(
    private readonly yahooProvider: IPriceProvider,
    private readonly cryptoProvider: IPriceProvider
  ) {}

  async execute(query: string): Promise<AssetSearchResult[]> {
    const [stocks, cryptos] = await Promise.all([
      this.yahooProvider.searchSymbols(query),
      this.cryptoProvider.searchSymbols(query),
    ]);

    return [...stocks, ...cryptos];
  }
}
