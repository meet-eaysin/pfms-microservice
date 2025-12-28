export enum IncomeType {
  SALARY = 'SALARY',
  FREELANCE = 'FREELANCE',
  PASSIVE = 'PASSIVE',
  GIFT = 'GIFT',
}

export interface PaySchedule {
  frequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  day?: number;
}

export class IncomeSource {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly type: IncomeType,
    public readonly currency: string,
    public readonly paySchedule: PaySchedule | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
