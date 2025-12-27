export enum Frequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class RecurringExpense {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly description: string | null,
    public readonly frequency: Frequency,
    public readonly interval: number,
    public readonly startDate: Date,
    public readonly nextDueDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
