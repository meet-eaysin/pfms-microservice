import { Controller, Get, Headers, BadRequestException } from '@nestjs/common';
import { GetBalanceSheetUseCase } from '../../application/use-cases/analytics/get-balance-sheet.use-case';
import { GetNetWorthUseCase } from '../../application/use-cases/analytics/get-net-worth.use-case';

@Controller('ledger/analytics')
export class AnalyticsController {
  constructor(
    private readonly getBalanceSheetUseCase: GetBalanceSheetUseCase,
    private readonly getNetWorthUseCase: GetNetWorthUseCase,
  ) {}

  @Get('balance-sheet')
  async getBalanceSheet(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.getBalanceSheetUseCase.execute(userId);
  }

  @Get('net-worth')
  async getNetWorth(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return this.getNetWorthUseCase.execute(userId);
  }

  private extractUserId(authHeader: string): string {
    if (!authHeader) throw new BadRequestException('Authorization header required');
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) throw new BadRequestException('Invalid authorization header');
    return token;
  }
}
