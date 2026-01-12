import { Injectable, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ILoanRepository } from '../../domain/interfaces/loan.repository.interface';
import {
  Loan,
  LoanType,
  LoanStatus,
  InterestType,
  EMISchedule,
  ScheduleStatus,
} from '../../domain/entities/loan.entity';
import { CreateLoanDto } from '../../application/dto/loan/create-loan.dto';

@Injectable()
export class CreateLoanUseCase {
  constructor(private readonly repository: ILoanRepository) {}

  async execute(dto: CreateLoanDto & { userId: string }): Promise<Loan> {
    const contact = await this.repository.findContactById(dto.contactId);
    if (!contact) {
      throw new BadRequestException('Contact not found');
    }

    const loan = new Loan(
      uuidv4(),
      dto.userId,
      dto.contactId,
      dto.type as LoanType,
      dto.principalAmount,
      dto.currency || 'USD',
      LoanStatus.ACTIVE,
      new Date(dto.startDate),
      dto.endDate ? new Date(dto.endDate) : undefined,
      dto.interestRate,
      (dto.interestType as InterestType) || InterestType.NONE,
      dto.emiEnabled || false,
      dto.emiAmount
    );

    const createdLoan = await this.repository.createLoan(loan);

    if (loan.emiEnabled && loan.emiAmount && loan.emiAmount > 0) {
      const schedules: EMISchedule[] = [];
      const numInstallments = Math.ceil(loan.principalAmount / loan.emiAmount);

      for (let i = 1; i <= numInstallments; i++) {
        const dueDate = new Date(loan.startDate);
        dueDate.setMonth(dueDate.getMonth() + i);

        schedules.push(
          new EMISchedule(
            uuidv4(),
            createdLoan.id,
            i,
            dueDate,
            loan.emiAmount,
            ScheduleStatus.PENDING
          )
        );
      }

      await this.repository.createEMISchedules(schedules);
    }

    return createdLoan;
  }
}
