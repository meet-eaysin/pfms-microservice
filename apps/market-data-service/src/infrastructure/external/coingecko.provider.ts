import axios from 'axios';
import { createLogger } from '@pfms/config';
import { AssetPrice } from '@/domain/entities/asset-price.entity';
import { HistoricalCandle } from '@/domain/entities/historical-candle.entity';
import type {
  IPriceProvider,
  AssetSearchResult,
} from '@/domain/interfaces/price-provider.interface';
import type { MarketProvidersConfig } from '@/config';

const logger = createLogger('CoinGeckoProvider');

export class CoinGeckoProvider implements IPriceProvider {
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';
  private readonly apiKey?: string;

  constructor(config: MarketProvidersConfig) {
    this.apiKey = config.COINGECKO_API_KEY;
  }

  // Simplified mapping for common symbols. In real app, search for ID first.
  private getCoinId(symbol: string): string {
    const mapping: Record<string, string> = {
      BTC: 'bitcoin',
      ETH: 'ethereum',
      BNB: 'binance-coin',
      SOL: 'solana',
      USDT: 'tether',
    };
    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  async getPrice(symbol: string): Promise<AssetPrice | null> {
    try {
      const id = this.getCoinId(symbol);
      const url = `${this.baseUrl}/simple/price?ids=${id}&vs_currencies=usd`;
      const response = await axios.get(url, {
        headers: this.apiKey ? { 'x-cg-demo-api-key': this.apiKey } : {},
      });

      const price = response.data[id]?.usd;
      if (price === undefined) return null;

      return AssetPrice.create(symbol, price, 'USD');
    } catch (error) {
      logger.error('Failed to fetch price from CoinGecko', { symbol, error });
      return null;
    }
  }

  async getHistoricalCandles(
    symbol: string,
    startDate: Date,
    _endDate: Date
  ): Promise<HistoricalCandle[]> {
    try {
      const id = this.getCoinId(symbol);
      const now = new Date();
      const diffDays = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 3600 * 24));

      const url = `${this.baseUrl}/coins/${id}/ohlc?vs_currency=usd&days=${diffDays}`;
      const response = await axios.get(url, {
        headers: this.apiKey ? { 'x-cg-demo-api-key': this.apiKey } : {},
      });

      // CoinGecko OHLC format: [time, open, high, low, close]
      return response.data.map((d: [number, number, number, number, number]) =>
        HistoricalCandle.create(
          symbol,
          new Date(d[0]),
          d[1],
          d[2],
          d[3],
          d[4],
          BigInt(0) // CoinGecko OHLC doesn't provide volume in this endpoint
        )
      );
    } catch (error) {
      logger.error('Failed to fetch historical data from CoinGecko', { symbol, error });
      return [];
    }
  }

  async searchSymbols(query: string): Promise<AssetSearchResult[]> {
    try {
      const url = `${this.baseUrl}/search?query=${encodeURIComponent(query)}`;
      const response = await axios.get(url, {
        headers: this.apiKey ? { 'x-cg-demo-api-key': this.apiKey } : {},
      });

      return (response.data.coins || []).map((c: { symbol: string; name: string; id: string }) => ({
        symbol: c.symbol,
        name: c.name,
        type: 'Crypto',
        id: c.id,
      }));
    } catch (error) {
      logger.error('Failed to search symbols on CoinGecko', { query, error });
      return [];
    }
  }
}
