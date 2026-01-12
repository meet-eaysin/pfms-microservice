import type { AssetPrice } from '../entities/asset-price.entity';
import type { HistoricalCandle } from '../entities/historical-candle.entity';

export interface IPriceProvider {
  getPrice(symbol: string): Promise<AssetPrice | null>;
  getHistoricalCandles(symbol: string, startDate: Date, endDate: Date): Promise<HistoricalCandle[]>;
  searchSymbols(query: string): Promise<AssetSearchResult[]>;
}

export interface AssetSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange?: string;
}
