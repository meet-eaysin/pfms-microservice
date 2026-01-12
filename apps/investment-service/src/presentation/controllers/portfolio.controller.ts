import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreatePortfolioUseCase } from '../../application/use-cases/create-portfolio.use-case';
import { RecordTransactionUseCase } from '../../application/use-cases/record-transaction.use-case';
import { GetPortfolioSummaryUseCase } from '../../application/use-cases/get-portfolio-summary.use-case';
import { CreatePortfolioDto } from '../../application/dto/portfolio.dto';
import { RecordTransactionDto } from '../../application/dto/transaction.dto';

@ApiTags('Portfolios')
@Controller('portfolios')
export class PortfolioController {
  constructor(
    private readonly createPortfolioUseCase: CreatePortfolioUseCase,
    private readonly recordTransactionUseCase: RecordTransactionUseCase,
    private readonly getSummaryUseCase: GetPortfolioSummaryUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new investment portfolio' })
  @ApiResponse({ status: 201, description: 'Portfolio created successfully' })
  async create(@Body() dto: CreatePortfolioDto) {
    // For now, using a mock userId until AuthGuard is fully integrated
    // In real app, this would come from req.user.id
    const mockUserId = '8f3e-4b2a-9d1c-5a6b7c8d9e0f';
    return this.createPortfolioUseCase.execute(mockUserId, dto);
  }

  @Post(':id/transactions')
  @ApiOperation({ summary: 'Record a new transaction in a portfolio' })
  async recordTransaction(
    @Param('id') portfolioId: string,
    @Body() dto: RecordTransactionDto,
  ) {
    return this.recordTransactionUseCase.execute(portfolioId, dto);
  }

  @Get(':id/summary')
  @ApiOperation({ summary: 'Get a summary of portfolio performance' })
  async getSummary(@Param('id') portfolioId: string) {
    return this.getSummaryUseCase.execute(portfolioId);
  }
}
