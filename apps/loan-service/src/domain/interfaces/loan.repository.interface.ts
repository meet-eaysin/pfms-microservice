import { Loan, Contact, EMISchedule, Payment } from '../entities/loan.entity';

export interface ILoanRepository {
  // Contact
  createContact(contact: Contact): Promise<Contact>;
  findContactById(id: string): Promise<Contact | null>;
  findContactsByUserId(userId: string): Promise<Contact[]>;

  // Loan
  createLoan(loan: Loan): Promise<Loan>;
  findLoanById(id: string): Promise<Loan | null>;
  findLoansByUserId(userId: string): Promise<Loan[]>;
  updateLoan(loan: Loan): Promise<Loan>;

  // EMI Schedule
  createEMISchedules(schedules: EMISchedule[]): Promise<void>;
  findSchedulesByLoanId(loanId: string): Promise<EMISchedule[]>;
  updateSchedule(schedule: EMISchedule): Promise<void>;

  // Payment
  createPayment(payment: Payment): Promise<Payment>;
  findPaymentsByLoanId(loanId: string): Promise<Payment[]>;
}
