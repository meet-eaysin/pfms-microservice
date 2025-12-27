export enum BudgetPeriod {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class Budget {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly categoryId: string | null,
    public readonly name: string,
    public readonly amountLimit: number,
    public readonly period: BudgetPeriod,
    public readonly startDate: Date,
    public readonly endDate: Date | null,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  isWithinPeriod(date: Date): boolean {
    if (date < this.startDate) return false;
    if (this.endDate && date > this.endDate) return false;
    return true;
  }

  getRemainingAmount(spent: number): number {
    return this.amountLimit - spent;
  }

  getPercentageUsed(spent: number): number {
    return (spent / this.amountLimit) * 100;
  }
}
