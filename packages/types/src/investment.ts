import { UUID, Currency, ISODateString, Decimal, Percentage } from './common';

/**
 * Investment Service Types
 */
export interface Portfolio {
  id: UUID;
  userId: UUID;
  name: string;
  description?: string;
  totalInvested: Decimal;
  currentValue: Decimal;
  totalReturn: Decimal;
  returnPercentage: Percentage;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface Asset {
  id: UUID;
  portfolioId: UUID;
  userId: UUID;
  assetType: 'stock' | 'crypto' | 'mutual_fund' | 'etf' | 'bond' | 'custom';
  symbol: string;
  name?: string;
  quantity: Decimal;
  averageBuyPrice?: Decimal;
  currentPrice?: Decimal;
  totalInvested?: Decimal;
  currentValue?: Decimal;
  unrealizedPl?: Decimal;
  unrealizedPlPercentage?: Percentage;
  sector?: string;
  currency: Currency;
  lastPriceUpdate?: ISODateString;
  metadata?: Record<string, any>;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface InvestmentTransaction {
  id: UUID;
  assetId: UUID;
  userId: UUID;
  transactionType: 'buy' | 'sell' | 'dividend';
  quantity: Decimal;
  price: Decimal;
  totalAmount: Decimal;
  fees?: Decimal;
  tax?: Decimal;
  date: string;
  time?: string;
  notes?: string;
  createdAt: ISODateString;
}

export interface AssetPrice {
  id: UUID;
  symbol: string;
  assetType: string;
  price: Decimal;
  currency: Currency;
  timestamp: ISODateString;
  source?: string;
}

export interface PortfolioSnapshot {
  id: UUID;
  portfolioId: UUID;
  snapshotDate: string;
  totalValue: Decimal;
  totalReturn: Decimal;
  returnPercentage: Percentage;
  assetAllocation?: Record<string, Decimal>;
  createdAt: ISODateString;
}

/**
 * Investment DTOs
 */
export interface CreatePortfolioDto {
  name: string;
  description?: string;
}

export interface UpdatePortfolioDto {
  name?: string;
  description?: string;
}

export interface CreateAssetDto {
  portfolioId: UUID;
  assetType: 'stock' | 'crypto' | 'mutual_fund' | 'etf' | 'bond' | 'custom';
  symbol: string;
  name?: string;
  quantity: Decimal;
  currency?: Currency;
}

export interface AddInvestmentTransactionDto {
  assetId: UUID;
  transactionType: 'buy' | 'sell' | 'dividend';
  quantity: Decimal;
  price: Decimal;
  fees?: Decimal;
  tax?: Decimal;
  date: string;
  time?: string;
  notes?: string;
}

/**
 * Investment Analytics
 */
export interface PortfolioAnalytics {
  portfolio: Portfolio;
  assets: Asset[];
  assetAllocation: Array<{
    symbol: string;
    percentage: Percentage;
    value: Decimal;
  }>;
  sectorAllocation: Array<{
    sector: string;
    percentage: Percentage;
    value: Decimal;
  }>;
  topPerformers: Asset[];
  bottomPerformers: Asset[];
  riskScore: number;
}

export interface InvestmentReturns {
  realizedReturns: Decimal;
  unrealizedReturns: Decimal;
  totalReturns: Decimal;
  totalReturnPercentage: Percentage;
  yearToDateReturns: Decimal;
  annualizedReturns: Percentage;
  period: {
    startDate: string;
    endDate: string;
  };
}

export interface DividendSummary {
  totalDividends: Decimal;
  monthlyDividends: Array<{
    month: string;
    amount: Decimal;
  }>;
  averageMonthlyDividend: Decimal;
  nextDividendDate?: string;
}
