import { Injectable, Inject } from '@nestjs/common';
import { Portfolio } from '../../domain/entities/portfolio.entity';
import { IInvestmentRepository } from '../../domain/interfaces/investment.repository.interface';
import { CreatePortfolioDto } from '../dto/portfolio.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreatePortfolioUseCase {
  constructor(
    @Inject('IInvestmentRepository')
    private readonly repository: IInvestmentRepository,
  ) {}

  async execute(userId: string, dto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = new Portfolio(
      uuidv4(),
      userId,
      dto.name,
      dto.description,
    );

    return this.repository.createPortfolio(portfolio);
  }
}
