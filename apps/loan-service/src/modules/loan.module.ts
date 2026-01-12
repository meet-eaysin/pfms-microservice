import { Module } from '@nestjs/common';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';
import { ILoanRepository } from '../domain/interfaces/loan.repository.interface';
import { CreateLoanUseCase } from '../application/use-cases/create-loan.use-case';
import { CreateContactUseCase } from '../application/use-cases/create-contact.use-case';
import { RecordPaymentUseCase } from '../application/use-cases/record-payment.use-case';
import { GetLoansByUserIdUseCase } from '../application/use-cases/get-loans-by-user.use-case';
import { LoanController } from '../presentation/controllers/loan.controller';

@Module({
  imports: [InfrastructureModule],
  controllers: [LoanController],
  providers: [
    {
      provide: CreateLoanUseCase,
      useFactory: (repo: ILoanRepository) => new CreateLoanUseCase(repo),
      inject: ['ILoanRepository'],
    },
    {
      provide: CreateContactUseCase,
      useFactory: (repo: ILoanRepository) => new CreateContactUseCase(repo),
      inject: ['ILoanRepository'],
    },
    {
      provide: RecordPaymentUseCase,
      useFactory: (repo: ILoanRepository) => new RecordPaymentUseCase(repo),
      inject: ['ILoanRepository'],
    },
    {
      provide: GetLoansByUserIdUseCase,
      useFactory: (repo: ILoanRepository) => new GetLoansByUserIdUseCase(repo),
      inject: ['ILoanRepository'],
    },
  ],
})
export class LoanModule {}
