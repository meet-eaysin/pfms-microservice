export class Expense {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly categoryId: string,
    public readonly date: Date,
    public readonly description: string | null,
    public readonly isRecurring: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
