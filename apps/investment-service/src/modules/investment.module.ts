import { Module } from '@nestjs/common';
import { CreatePortfolioUseCase } from '../application/use-cases/create-portfolio.use-case';
import { RecordTransactionUseCase } from '../application/use-cases/record-transaction.use-case';
import { GetPortfolioSummaryUseCase } from '../application/use-cases/get-portfolio-summary.use-case';
import { PortfolioController } from '../presentation/controllers/portfolio.controller';

@Module({
  controllers: [PortfolioController],
  providers: [
    CreatePortfolioUseCase,
    RecordTransactionUseCase,
    GetPortfolioSummaryUseCase,
  ],
})
export class InvestmentModule {}
