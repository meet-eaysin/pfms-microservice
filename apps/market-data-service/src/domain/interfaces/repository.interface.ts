import type { AssetPrice } from '../entities/asset-price.entity';
import type { HistoricalCandle } from '../entities/historical-candle.entity';

export interface IMarketDataRepository {
  upsertAssetPrice(assetPrice: AssetPrice): Promise<void>;
  getAssetPrice(symbol: string): Promise<AssetPrice | null>;
  getBatchAssetPrices(symbols: string[]): Promise<AssetPrice[]>;
  saveHistoricalCandles(candles: HistoricalCandle[]): Promise<void>;
  getHistoricalCandles(symbol: string, startDate: Date, endDate: Date): Promise<HistoricalCandle[]>;
}

export interface ICacheService {
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  del(key: string): Promise<void>;
  disconnect(): Promise<void>;
}
