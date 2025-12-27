import { Module } from '@nestjs/common';
import { IncomeSourceController } from '../presentation/http/controllers/income-source.controller';
import { IncomeTransactionController } from '../presentation/http/controllers/income-transaction.controller';
import { CreateSourceUseCase } from '../core/application/use-cases/income-source/create-source.use-case';
import { RecordIncomeUseCase } from '../core/application/use-cases/income-transaction/record-income.use-case';

@Module({
  controllers: [IncomeSourceController, IncomeTransactionController],
  providers: [CreateSourceUseCase, RecordIncomeUseCase],
})
export class IncomeModule {}
