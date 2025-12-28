export class IncomeTransaction {
  constructor(
    public readonly id: string,
    public readonly sourceId: string,
    public readonly amount: number,
    public readonly date: Date,
    public readonly isTaxable: boolean,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
