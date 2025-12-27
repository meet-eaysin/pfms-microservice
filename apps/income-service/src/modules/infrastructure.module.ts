import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { PrismaIncomeSourceRepository } from '../infrastructure/persistence/repositories/income-source.repository.impl';
import { PrismaIncomeTransactionRepository } from '../infrastructure/persistence/repositories/income-transaction.repository.impl';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: 'IIncomeSourceRepository',
      useClass: PrismaIncomeSourceRepository,
    },
    {
      provide: 'IIncomeTransactionRepository',
      useClass: PrismaIncomeTransactionRepository,
    },
  ],
  exports: [
    PrismaService,
    'IIncomeSourceRepository',
    'IIncomeTransactionRepository',
  ],
})
export class InfrastructureModule {}
