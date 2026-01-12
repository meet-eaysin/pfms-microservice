import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaInvestmentRepository } from './database/prisma.repository';
import { HttpMarketDataClient } from './external/market-data.client';

@Global()
@Module({
  providers: [
    {
      provide: PrismaClient,
      useValue: new PrismaClient(),
    },
    {
      provide: 'IInvestmentRepository',
      useClass: PrismaInvestmentRepository,
    },
    {
      provide: 'IMarketDataClient',
      useClass: HttpMarketDataClient,
    },
  ],
  exports: [PrismaClient, 'IInvestmentRepository', 'IMarketDataClient'],
})
export class InfrastructureModule {}
