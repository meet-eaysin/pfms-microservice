import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ILoanRepository } from '../../domain/interfaces/loan.repository.interface';
import { Payment, LoanStatus, ScheduleStatus } from '../../domain/entities/loan.entity';
import { RecordLoanPaymentDto } from '../dto/loan/record-payment.dto';

@Injectable()
export class RecordPaymentUseCase {
  constructor(private readonly repository: ILoanRepository) {}

  async execute(userId: string, dto: RecordLoanPaymentDto): Promise<Payment> {
    // 1. Find loan
    const loan = await this.repository.findLoanById(dto.loanId);
    if (!loan) {
      throw new NotFoundException('Loan not found');
    }

    if (loan.userId !== userId) {
      throw new BadRequestException('Unauthorized access to loan');
    }

    // 2. Create Payment entity
    const payment = new Payment(
      uuidv4(),
      dto.loanId,
      userId,
      dto.amount,
      new Date(dto.paymentDate),
      dto.emiScheduleId,
      'COMPLETED'
    );

    const createdPayment = await this.repository.createPayment(payment);

    // 3. Update Loan total paid and status
    loan.totalPaid += dto.amount;
    if (loan.totalPaid >= loan.principalAmount) {
      loan.status = LoanStatus.PAID;
    }
    await this.repository.updateLoan(loan);

    // 4. Update EMI Schedule if provided
    if (dto.emiScheduleId) {
      const schedules = await this.repository.findSchedulesByLoanId(loan.id);
      const schedule = schedules.find((s) => s.id === dto.emiScheduleId);
      if (schedule) {
        schedule.paidAmount += dto.amount;
        if (schedule.paidAmount >= schedule.totalAmount) {
          schedule.status = ScheduleStatus.PAID;
        } else if (schedule.paidAmount > 0) {
          schedule.status = ScheduleStatus.PARTIAL;
        }
        await this.repository.updateSchedule(schedule);
      }
    }

    return createdPayment;
  }
}
