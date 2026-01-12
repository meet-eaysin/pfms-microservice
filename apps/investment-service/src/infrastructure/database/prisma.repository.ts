import { Injectable } from '@nestjs/common';
import { PrismaClient, $Enums } from '@prisma/client';
import { IInvestmentRepository } from '../../domain/interfaces/investment.repository.interface';
import { Portfolio } from '../../domain/entities/portfolio.entity';
import { Asset } from '../../domain/entities/asset.entity';
import {
  Transaction,
  TransactionType,
} from '../../domain/entities/transaction.entity';

@Injectable()
export class PrismaInvestmentRepository implements IInvestmentRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async createPortfolio(portfolio: Portfolio): Promise<Portfolio> {
    const data = await this.prisma.portfolio.create({
      data: {
        id: portfolio.id,
        userId: portfolio.userId,
        name: portfolio.name,
        description: portfolio.description,
      },
    });

    return new Portfolio(
      data.id,
      data.userId,
      data.name,
      data.description || undefined,
      data.createdAt,
      data.updatedAt,
    );
  }

  async getPortfolioById(id: string): Promise<Portfolio | null> {
    const data = await this.prisma.portfolio.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new Portfolio(
      data.id,
      data.userId,
      data.name,
      data.description || undefined,
      data.createdAt,
      data.updatedAt,
    );
  }

  async getPortfoliosByUserId(userId: string): Promise<Portfolio[]> {
    const data = await this.prisma.portfolio.findMany({
      where: { userId },
    });

    return data.map(
      (d) =>
        new Portfolio(
          d.id,
          d.userId,
          d.name,
          d.description || undefined,
          d.createdAt,
          d.updatedAt,
        ),
    );
  }

  async updatePortfolio(portfolio: Portfolio): Promise<Portfolio> {
    const data = await this.prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        name: portfolio.name,
        description: portfolio.description,
      },
    });

    return new Portfolio(
      data.id,
      data.userId,
      data.name,
      data.description || undefined,
      data.createdAt,
      data.updatedAt,
    );
  }

  async deletePortfolio(id: string): Promise<void> {
    await this.prisma.portfolio.delete({
      where: { id },
    });
  }

  async upsertAsset(asset: Asset): Promise<Asset> {
    const data = await this.prisma.asset.upsert({
      where: {
        portfolioId_symbol: {
          portfolioId: asset.portfolioId,
          symbol: asset.symbol,
        },
      },
      update: {
        quantity: asset.quantity,
        averageBuyPrice: asset.averageBuyPrice,
      },
      create: {
        id: asset.id,
        portfolioId: asset.portfolioId,
        symbol: asset.symbol,
        assetType: asset.assetType,
        quantity: asset.quantity,
        averageBuyPrice: asset.averageBuyPrice,
        currency: asset.currency,
      },
    });

    return new Asset(
      data.id,
      data.portfolioId,
      data.symbol,
      data.assetType,
      data.quantity.toNumber(),
      data.averageBuyPrice.toNumber(),
      data.currency,
      data.createdAt,
      data.updatedAt,
    );
  }

  async getAssetById(id: string): Promise<Asset | null> {
    const data = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!data) return null;

    return new Asset(
      data.id,
      data.portfolioId,
      data.symbol,
      data.assetType,
      data.quantity.toNumber(),
      data.averageBuyPrice.toNumber(),
      data.currency,
      data.createdAt,
      data.updatedAt,
    );
  }

  async getAssetByPortfolioAndSymbol(
    portfolioId: string,
    symbol: string,
  ): Promise<Asset | null> {
    const data = await this.prisma.asset.findUnique({
      where: {
        portfolioId_symbol: {
          portfolioId,
          symbol,
        },
      },
    });

    if (!data) return null;

    return new Asset(
      data.id,
      data.portfolioId,
      data.symbol,
      data.assetType,
      data.quantity.toNumber(),
      data.averageBuyPrice.toNumber(),
      data.currency,
      data.createdAt,
      data.updatedAt,
    );
  }

  async getAssetsByPortfolioId(portfolioId: string): Promise<Asset[]> {
    const data = await this.prisma.asset.findMany({
      where: { portfolioId },
    });

    return data.map(
      (d) =>
        new Asset(
          d.id,
          d.portfolioId,
          d.symbol,
          d.assetType,
          d.quantity.toNumber(),
          d.averageBuyPrice.toNumber(),
          d.currency,
          d.createdAt,
          d.updatedAt,
        ),
    );
  }

  async createTransaction(transaction: Transaction): Promise<Transaction> {
    const data = await this.prisma.transaction.create({
      data: {
        id: transaction.id,
        assetId: transaction.assetId,
        type: transaction.type.toString() as $Enums.TransactionType,
        quantity: transaction.quantity,
        price: transaction.price,
        fees: transaction.fees,
        tax: transaction.tax,
        date: transaction.date,
      },
    });

    return new Transaction(
      data.id,
      data.assetId,
      data.type as unknown as TransactionType,
      data.quantity.toNumber(),
      data.price.toNumber(),
      data.fees?.toNumber() || 0,
      data.tax?.toNumber() || 0,
      data.date,
      data.createdAt,
    );
  }

  async getTransactionsByAssetId(assetId: string): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: { assetId },
      orderBy: { date: 'desc' },
    });

    return data.map(
      (d) =>
        new Transaction(
          d.id,
          d.assetId,
          d.type as unknown as TransactionType,
          d.quantity.toNumber(),
          d.price.toNumber(),
          d.fees?.toNumber() || 0,
          d.tax?.toNumber() || 0,
          d.date,
          d.createdAt,
        ),
    );
  }

  async getTransactionsByPortfolioId(
    portfolioId: string,
  ): Promise<Transaction[]> {
    const data = await this.prisma.transaction.findMany({
      where: {
        asset: {
          portfolioId,
        },
      },
      orderBy: { date: 'desc' },
    });

    return data.map(
      (d) =>
        new Transaction(
          d.id,
          d.assetId,
          d.type as unknown as TransactionType,
          d.quantity.toNumber(),
          d.price.toNumber(),
          d.fees?.toNumber() || 0,
          d.tax?.toNumber() || 0,
          d.date,
          d.createdAt,
        ),
    );
  }
}
