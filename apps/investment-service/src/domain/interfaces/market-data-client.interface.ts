export interface AssetPrice {
  symbol: string;
  price: number;
  currency: string;
  lastUpdated: Date;
}

export interface IMarketDataClient {
  getPrice(symbol: string, isCrypto?: boolean): Promise<AssetPrice | null>;
  getBatchPrices(symbols: string[]): Promise<AssetPrice[]>;
}
