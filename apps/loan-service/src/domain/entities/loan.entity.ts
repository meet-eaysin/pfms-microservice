export enum LoanType {
  BORROWED = 'BORROWED',
  LENT = 'LENT',
}

export enum LoanStatus {
  ACTIVE = 'ACTIVE',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  DEFAULTED = 'DEFAULTED',
}

export enum InterestType {
  SIMPLE = 'SIMPLE',
  COMPOUND = 'COMPOUND',
  NONE = 'NONE',
}

export class Contact {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly contactType: string,
    public name?: string,
    public email?: string,
    public phone?: string,
    public relationship?: string,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

export class Loan {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly contactId: string,
    public readonly type: LoanType,
    public readonly principalAmount: number,
    public readonly currency: string,
    public status: LoanStatus,
    public readonly startDate: Date,
    public endDate?: Date,
    public interestRate?: number,
    public interestType: InterestType = InterestType.NONE,
    public emiEnabled: boolean = false,
    public emiAmount?: number,
    public totalPaid: number = 0,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date
  ) {}
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  SKIPPED = 'SKIPPED',
  WAIVED = 'WAIVED',
}

export class EMISchedule {
  constructor(
    public readonly id: string,
    public readonly loanId: string,
    public readonly installmentNumber: number,
    public readonly dueDate: Date,
    public readonly totalAmount: number,
    public status: ScheduleStatus = ScheduleStatus.PENDING,
    public paidAmount: number = 0,
    public readonly createdAt?: Date
  ) {}
}

export class Payment {
  constructor(
    public readonly id: string,
    public readonly loanId: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly paymentDate: Date,
    public readonly emiScheduleId?: string,
    public readonly status: string = 'COMPLETED',
    public readonly createdAt?: Date
  ) {}
}
