import { Portfolio } from '../entities/portfolio.entity';
import { Asset } from '../entities/asset.entity';
import { Transaction } from '../entities/transaction.entity';

export interface IInvestmentRepository {
  // Portfolios
  createPortfolio(portfolio: Portfolio): Promise<Portfolio>;
  getPortfolioById(id: string): Promise<Portfolio | null>;
  getPortfoliosByUserId(userId: string): Promise<Portfolio[]>;
  updatePortfolio(portfolio: Portfolio): Promise<Portfolio>;
  deletePortfolio(id: string): Promise<void>;

  // Assets
  upsertAsset(asset: Asset): Promise<Asset>;
  getAssetById(id: string): Promise<Asset | null>;
  getAssetByPortfolioAndSymbol(
    portfolioId: string,
    symbol: string,
  ): Promise<Asset | null>;
  getAssetsByPortfolioId(portfolioId: string): Promise<Asset[]>;

  // Transactions
  createTransaction(transaction: Transaction): Promise<Transaction>;
  getTransactionsByAssetId(assetId: string): Promise<Transaction[]>;
  getTransactionsByPortfolioId(portfolioId: string): Promise<Transaction[]>;
}
