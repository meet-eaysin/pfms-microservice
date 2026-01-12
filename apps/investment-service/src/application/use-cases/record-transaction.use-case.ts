import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { Asset } from '../../domain/entities/asset.entity';
import {
  Transaction,
  TransactionType,
} from '../../domain/entities/transaction.entity';
import { IInvestmentRepository } from '../../domain/interfaces/investment.repository.interface';
import { RecordTransactionDto } from '../dto/transaction.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RecordTransactionUseCase {
  constructor(
    @Inject('IInvestmentRepository')
    private readonly repository: IInvestmentRepository,
  ) {}

  async execute(
    portfolioId: string,
    dto: RecordTransactionDto,
  ): Promise<Transaction> {
    let asset = await this.repository.getAssetByPortfolioAndSymbol(
      portfolioId,
      dto.symbol,
    );

    if (!asset) {
      if (dto.type === TransactionType.SELL) {
        throw new BadRequestException(
          `Cannot sell ${dto.symbol} as you don't own it in this portfolio`,
        );
      }
      asset = new Asset(
        uuidv4(),
        portfolioId,
        dto.symbol,
        'stock', // Defaulting to stock for now, can be improved
        0,
        0,
        'USD',
      );
      await this.repository.upsertAsset(asset);
    }

    const currentQuantity = asset.quantity;
    const currentAvgPrice = asset.averageBuyPrice;

    let newQuantity = currentQuantity;
    let newAvgPrice = currentAvgPrice;

    if (dto.type === TransactionType.BUY) {
      newQuantity = currentQuantity + dto.quantity;
      const totalCost =
        currentQuantity * currentAvgPrice +
        dto.quantity * dto.price +
        (dto.fees || 0);
      newAvgPrice = totalCost / newQuantity;
    } else if (dto.type === TransactionType.SELL) {
      if (currentQuantity < dto.quantity) {
        throw new BadRequestException(
          `Insufficient quantity of ${dto.symbol} to sell. Owned: ${currentQuantity}, Requested: ${dto.quantity}`,
        );
      }
      newQuantity = currentQuantity - dto.quantity;
    }

    asset.quantity = newQuantity;
    asset.averageBuyPrice = newAvgPrice;
    await this.repository.upsertAsset(asset);

    const transaction = new Transaction(
      uuidv4(),
      asset.id,
      dto.type,
      dto.quantity,
      dto.price,
      dto.fees,
      dto.tax,
      dto.date,
    );

    return this.repository.createTransaction(transaction);
  }
}
