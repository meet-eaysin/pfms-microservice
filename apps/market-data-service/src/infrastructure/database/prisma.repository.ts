import { PrismaClient } from '@prisma/client';
import { AssetPrice } from '@/domain/entities/asset-price.entity';
import { HistoricalCandle } from '@/domain/entities/historical-candle.entity';
import type { IMarketDataRepository } from '@/domain/interfaces/repository.interface';

export class PrismaMarketDataRepository implements IMarketDataRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertAssetPrice(assetPrice: AssetPrice): Promise<void> {
    await this.prisma.assetPrice.upsert({
      where: { symbol: assetPrice.symbol },
      update: {
        price: assetPrice.price,
        currency: assetPrice.currency,
        lastUpdated: assetPrice.lastUpdated,
      },
      create: {
        symbol: assetPrice.symbol,
        price: assetPrice.price,
        currency: assetPrice.currency,
        lastUpdated: assetPrice.lastUpdated,
      },
    });
  }

  async getAssetPrice(symbol: string): Promise<AssetPrice | null> {
    const data = await this.prisma.assetPrice.findUnique({
      where: { symbol: symbol.toUpperCase() },
    });

    if (!data) return null;

    return new AssetPrice(data.symbol, data.price.toNumber(), data.currency, data.lastUpdated);
  }

  async getBatchAssetPrices(symbols: string[]): Promise<AssetPrice[]> {
    const data = await this.prisma.assetPrice.findMany({
      where: {
        symbol: { in: symbols.map((s) => s.toUpperCase()) },
      },
    });

    return data.map((d) => new AssetPrice(d.symbol, d.price.toNumber(), d.currency, d.lastUpdated));
  }

  async saveHistoricalCandles(candles: HistoricalCandle[]): Promise<void> {
    for (const candle of candles) {
      await this.prisma.historicalCandle.upsert({
        where: {
          symbol_date: {
            symbol: candle.symbol,
            date: candle.date,
          },
        },
        update: {
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        },
        create: {
          symbol: candle.symbol,
          date: candle.date,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        },
      });
    }
  }

  async getHistoricalCandles(
    symbol: string,
    startDate: Date,
    endDate: Date
  ): Promise<HistoricalCandle[]> {
    const data = await this.prisma.historicalCandle.findMany({
      where: {
        symbol: symbol.toUpperCase(),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    return data.map(
      (d) =>
        new HistoricalCandle(
          d.symbol,
          d.date,
          d.open.toNumber(),
          d.high.toNumber(),
          d.low.toNumber(),
          d.close.toNumber(),
          d.volume
        )
    );
  }
}

export function createPrismaMarketDataRepository(prisma: PrismaClient): IMarketDataRepository {
  return new PrismaMarketDataRepository(prisma);
}
