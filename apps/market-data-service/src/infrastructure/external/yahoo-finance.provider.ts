import axios from 'axios';
import { createLogger } from '@pfms/config';
import { AssetPrice } from '@/domain/entities/asset-price.entity';
import { HistoricalCandle } from '@/domain/entities/historical-candle.entity';
import type {
  IPriceProvider,
  AssetSearchResult,
} from '@/domain/interfaces/price-provider.interface';
import type { MarketProvidersConfig } from '@/config';

const logger = createLogger('YahooFinanceProvider');

export class YahooFinanceProvider implements IPriceProvider {
  private readonly baseUrl = 'https://query1.finance.yahoo.com/v8/finance';

  constructor(_config: MarketProvidersConfig) {}

  async getPrice(symbol: string): Promise<AssetPrice | null> {
    try {
      const url = `${this.baseUrl}/chart/${symbol.toUpperCase()}?interval=1m&range=1d`;
      const response = await axios.get(url);

      const result = response.data.chart.result?.[0];
      if (!result) return null;

      const price = result.meta.regularMarketPrice;
      const currency = result.meta.currency;

      return AssetPrice.create(symbol, price, currency);
    } catch (error) {
      logger.error('Failed to fetch price from Yahoo Finance', { symbol, error });
      return null;
    }
  }

  async getHistoricalCandles(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalCandle[]> {
    try {
      const startTimestamp = Math.floor(startDate.getTime() / 1000);
      const endTimestamp = Math.floor(endDate.getTime() / 1000);
      const url = `${this.baseUrl}/chart/${symbol.toUpperCase()}?period1=${startTimestamp}&period2=${endTimestamp}&interval=1d`;

      const response = await axios.get(url);
      const result = response.data.chart.result?.[0];
      if (!result) return [];

      const { timestamp, indicators } = result;
      const { quote } = indicators;
      const { open, high, low, close, volume } = quote[0];

      return timestamp.map((t: number, i: number) =>
        HistoricalCandle.create(
          symbol,
          new Date(t * 1000),
          open[i],
          high[i],
          low[i],
          close[i],
          BigInt(volume[i] ?? 0)
        )
      );
    } catch (error) {
      logger.error('Failed to fetch historical data from Yahoo Finance', { symbol, error });
      return [];
    }
  }

  async searchSymbols(query: string): Promise<AssetSearchResult[]> {
    try {
      const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(
        query
      )}&quotesCount=10`;
      const response = await axios.get(url);

      return (response.data.quotes || []).map(
        (q: {
          symbol: string;
          shortname?: string;
          longname?: string;
          quoteType: string;
          exchange: string;
        }) => ({
          symbol: q.symbol,
          name: q.shortname || q.longname,
          type: q.quoteType,
          exchange: q.exchange,
        })
      );
    } catch (error) {
      logger.error('Failed to search symbols on Yahoo Finance', { query, error });
      return [];
    }
  }
}
