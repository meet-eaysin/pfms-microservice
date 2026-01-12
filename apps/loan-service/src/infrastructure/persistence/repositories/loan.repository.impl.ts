import { Injectable } from '@nestjs/common';
import { $Enums } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { ILoanRepository } from '../../../domain/interfaces/loan.repository.interface';
import {
  Loan,
  Contact,
  EMISchedule,
  Payment,
  LoanType,
  LoanStatus,
  InterestType,
  ScheduleStatus,
} from '../../../domain/entities/loan.entity';

@Injectable()
export class PrismaLoanRepository implements ILoanRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createContact(contact: Contact): Promise<Contact> {
    const data = await this.prisma.contact.create({
      data: {
        id: contact.id,
        userId: contact.userId,
        contactType: contact.contactType,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        relationship: contact.relationship,
      },
    });

    return new Contact(
      data.id,
      data.userId,
      data.contactType,
      data.name || undefined,
      data.email || undefined,
      data.phone || undefined,
      data.relationship || undefined,
      data.createdAt,
      data.updatedAt
    );
  }

  async findContactById(id: string): Promise<Contact | null> {
    const data = await this.prisma.contact.findUnique({ where: { id } });
    if (!data) return null;

    return new Contact(
      data.id,
      data.userId,
      data.contactType,
      data.name || undefined,
      data.email || undefined,
      data.phone || undefined,
      data.relationship || undefined,
      data.createdAt,
      data.updatedAt
    );
  }

  async findContactsByUserId(userId: string): Promise<Contact[]> {
    const data = await this.prisma.contact.findMany({ where: { userId } });
    return data.map(
      (d) =>
        new Contact(
          d.id,
          d.userId,
          d.contactType,
          d.name || undefined,
          d.email || undefined,
          d.phone || undefined,
          d.relationship || undefined,
          d.createdAt,
          d.updatedAt
        )
    );
  }

  async createLoan(loan: Loan): Promise<Loan> {
    const data = await this.prisma.loan.create({
      data: {
        id: loan.id,
        userId: loan.userId,
        contactId: loan.contactId,
        type: loan.type as $Enums.LoanType,
        principalAmount: loan.principalAmount,
        currency: loan.currency,
        status: loan.status as $Enums.LoanStatus,
        startDate: loan.startDate,
        endDate: loan.endDate,
        interestRate: loan.interestRate,
        interestType: loan.interestType as $Enums.InterestType,
        emiEnabled: loan.emiEnabled,
        emiAmount: loan.emiAmount,
        totalPaid: loan.totalPaid,
      },
    });

    return this.mapLoan(data);
  }

  async findLoanById(id: string): Promise<Loan | null> {
    const data = await this.prisma.loan.findUnique({ where: { id } });
    if (!data) return null;
    return this.mapLoan(data);
  }

  async findLoansByUserId(userId: string): Promise<Loan[]> {
    const data = await this.prisma.loan.findMany({ where: { userId } });
    return data.map((d) => this.mapLoan(d));
  }

  async updateLoan(loan: Loan): Promise<Loan> {
    const data = await this.prisma.loan.update({
      where: { id: loan.id },
      data: {
        status: loan.status as $Enums.LoanStatus,
        totalPaid: loan.totalPaid,
      },
    });
    return this.mapLoan(data);
  }

  async createEMISchedules(schedules: EMISchedule[]): Promise<void> {
    await this.prisma.eMISchedule.createMany({
      data: schedules.map((s) => ({
        id: s.id,
        loanId: s.loanId,
        installmentNumber: s.installmentNumber,
        dueDate: s.dueDate,
        principalAmount: s.totalAmount,
        interestAmount: 0,
        totalAmount: s.totalAmount,
        status: s.status as $Enums.ScheduleStatus,
        paidAmount: s.paidAmount,
      })),
    });
  }

  async findSchedulesByLoanId(loanId: string): Promise<EMISchedule[]> {
    const data = await this.prisma.eMISchedule.findMany({
      where: { loanId },
      orderBy: { installmentNumber: 'asc' },
    });

    return data.map(
      (d) =>
        new EMISchedule(
          d.id,
          d.loanId,
          d.installmentNumber,
          d.dueDate,
          d.totalAmount.toNumber(),
          d.status as ScheduleStatus,
          d.paidAmount.toNumber(),
          d.createdAt
        )
    );
  }

  async updateSchedule(schedule: EMISchedule): Promise<void> {
    await this.prisma.eMISchedule.update({
      where: { id: schedule.id },
      data: {
        status: schedule.status as $Enums.ScheduleStatus,
        paidAmount: schedule.paidAmount,
      },
    });
  }

  async createPayment(payment: Payment): Promise<Payment> {
    const data = await this.prisma.payment.create({
      data: {
        id: payment.id,
        loanId: payment.loanId,
        userId: payment.userId,
        amount: payment.amount,
        paymentDate: payment.paymentDate,
        emiScheduleId: payment.emiScheduleId,
        status: payment.status,
      },
    });

    return new Payment(
      data.id,
      data.loanId,
      data.userId,
      data.amount.toNumber(),
      data.paymentDate,
      data.emiScheduleId || undefined,
      data.status,
      data.createdAt
    );
  }

  async findPaymentsByLoanId(loanId: string): Promise<Payment[]> {
    const data = await this.prisma.payment.findMany({ where: { loanId } });
    return data.map(
      (d) =>
        new Payment(
          d.id,
          d.loanId,
          d.userId,
          d.amount.toNumber(),
          d.paymentDate,
          d.emiScheduleId || undefined,
          d.status,
          d.createdAt
        )
    );
  }

  private mapLoan(data: any): Loan {
    return new Loan(
      data.id,
      data.userId,
      data.contactId,
      data.type as LoanType,
      data.principalAmount.toNumber(),
      data.currency,
      data.status as LoanStatus,
      data.startDate,
      data.endDate || undefined,
      data.interestRate?.toNumber() || undefined,
      data.interestType as InterestType,
      data.emiEnabled,
      data.emiAmount?.toNumber() || undefined,
      data.totalPaid.toNumber(),
      data.createdAt,
      data.updatedAt
    );
  }
}
