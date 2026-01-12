import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import {
  IMarketDataClient,
  AssetPrice,
} from '../../domain/interfaces/market-data-client.interface';

interface MarketDataResponse {
  data: {
    symbol: string;
    price: number;
    currency: string;
    lastUpdated: string;
  };
}

@Injectable()
export class HttpMarketDataClient implements IMarketDataClient {
  private readonly logger = new Logger(HttpMarketDataClient.name);
  private readonly baseUrl: string;

  constructor(configService: ConfigService) {
    // Port 3013 as defined in implementation plan for market-data-service
    const host = configService.get<string>(
      'MARKET_DATA_SERVICE_HOST',
      'localhost',
    );
    const port = configService.get<number>('MARKET_DATA_SERVICE_PORT', 3013);
    this.baseUrl = `http://${host}:${port}/api/v1/market`;
  }

  async getPrice(
    symbol: string,
    isCrypto: boolean = false,
  ): Promise<AssetPrice | null> {
    try {
      const type = isCrypto ? 'crypto' : 'stock';
      const response = await axios.get<MarketDataResponse>(
        `${this.baseUrl}/price/${symbol}`,
        {
          params: { type },
        },
      );

      if (response.data && response.data.data) {
        const d = response.data.data;
        return {
          symbol: d.symbol,
          price: d.price,
          currency: d.currency,
          lastUpdated: new Date(d.lastUpdated),
        };
      }
      return null;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to fetch price for ${symbol}`, {
        error: message,
      });
      return null;
    }
  }

  async getBatchPrices(symbols: string[]): Promise<AssetPrice[]> {
    if (symbols.length === 0) return [];

    // For now, market-data-service might not have a batch endpoint yet (from my previous implementation)
    // I should check or implement individual calls.
    // Wait, I implemented market-data-service. It has getPrice.
    // Let's assume for now we call individually or expect the service to provide batch.
    // In my previous implementation of market-data-service, I didn't add a dedicated /batch route but I had the repository helper.
    // I will implementation individual calls in parallel for efficiency if no batch endpoint exists.

    const results = await Promise.all(symbols.map((s) => this.getPrice(s)));

    return results.filter((r): r is AssetPrice => r !== null);
  }
}
