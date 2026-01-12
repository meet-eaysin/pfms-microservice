import { Module } from '@nestjs/common';
import { PrismaService } from './persistence/prisma.service';
import { PrismaLoanRepository } from './persistence/repositories/loan.repository.impl';

@Module({
  providers: [
    PrismaService,
    {
      provide: 'ILoanRepository',
      useClass: PrismaLoanRepository,
    },
  ],
  exports: [PrismaService, 'ILoanRepository'],
})
export class InfrastructureModule {}
