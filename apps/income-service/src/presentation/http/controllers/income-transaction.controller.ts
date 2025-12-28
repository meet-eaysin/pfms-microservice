import { Controller, Post, Body } from '@nestjs/common';
import { RecordIncomeUseCase } from '@/core/application/use-cases/income-transaction/record-income.use-case';
import { RecordIncomeDto } from '@/core/application/dto/income-transaction.dto';

@Controller('income/transactions')
export class IncomeTransactionController {
  constructor(
    private readonly recordIncomeUseCase: RecordIncomeUseCase,
  ) {}

  @Post()
  async record(@Body() dto: RecordIncomeDto) {
    return this.recordIncomeUseCase.execute(dto);
  }
}
