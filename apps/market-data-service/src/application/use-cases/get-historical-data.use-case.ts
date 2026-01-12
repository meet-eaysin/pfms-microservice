import type { HistoricalCandle } from '@/domain/entities/historical-candle.entity';
import type { IMarketDataRepository } from '@/domain/interfaces/repository.interface';
import type { IPriceProvider } from '@/domain/interfaces/price-provider.interface';

export class GetHistoricalDataUseCase {
  constructor(
    private readonly repository: IMarketDataRepository,
    private readonly yahooProvider: IPriceProvider,
    private readonly cryptoProvider: IPriceProvider
  ) {}

  async execute(
    symbol: string,
    startDate: Date,
    endDate: Date,
    isCrypto: boolean = false
  ): Promise<HistoricalCandle[]> {
    const existing = await this.repository.getHistoricalCandles(symbol, startDate, endDate);

    if (existing.length > 0) {
      return existing;
    }

    const provider = isCrypto ? this.cryptoProvider : this.yahooProvider;
    const candles = await provider.getHistoricalCandles(symbol, startDate, endDate);

    if (candles.length > 0) {
      await this.repository.saveHistoricalCandles(candles);
    }

    return candles;
  }
}
