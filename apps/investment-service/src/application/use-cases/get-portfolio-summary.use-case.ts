import { Injectable, Inject } from '@nestjs/common';
import { IInvestmentRepository } from '../../domain/interfaces/investment.repository.interface';
import { IMarketDataClient } from '../../domain/interfaces/market-data-client.interface';

export interface PortfolioSummary {
  totalInvested: number;
  currentValue: number;
  unrealizedGain: number;
  returnPct: number;
  assets: Array<{
    symbol: string;
    quantity: number;
    avgBuyPrice: number;
    currentPrice: number;
    currentValue: number;
    unrealizedGain: number;
    returnPct: number;
  }>;
}

@Injectable()
export class GetPortfolioSummaryUseCase {
  constructor(
    @Inject('IInvestmentRepository')
    private readonly repository: IInvestmentRepository,
    @Inject('IMarketDataClient')
    private readonly marketDataClient: IMarketDataClient,
  ) {}

  async execute(portfolioId: string): Promise<PortfolioSummary> {
    const assets = await this.repository.getAssetsByPortfolioId(portfolioId);
    if (assets.length === 0) {
      return {
        totalInvested: 0,
        currentValue: 0,
        unrealizedGain: 0,
        returnPct: 0,
        assets: [],
      };
    }

    const symbols = assets.map((a) => a.symbol);
    const prices = await this.marketDataClient.getBatchPrices(symbols);
    const priceMap = new Map(prices.map((p) => [p.symbol, p.price]));

    let totalInvested = 0;
    let currentValue = 0;

    const assetSummaries = assets.map((asset) => {
      const currentPrice = priceMap.get(asset.symbol) || asset.averageBuyPrice;
      const invested = asset.quantity * asset.averageBuyPrice;
      const currentVal = asset.quantity * currentPrice;
      const gain = currentVal - invested;
      const returnPct = invested > 0 ? (gain / invested) * 100 : 0;

      totalInvested += invested;
      currentValue += currentVal;

      return {
        symbol: asset.symbol,
        quantity: asset.quantity,
        avgBuyPrice: asset.averageBuyPrice,
        currentPrice,
        currentValue: currentVal,
        unrealizedGain: gain,
        returnPct,
      };
    });

    const totalGain = currentValue - totalInvested;
    const totalReturnPct =
      totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue,
      unrealizedGain: totalGain,
      returnPct: totalReturnPct,
      assets: assetSummaries,
    };
  }
}
