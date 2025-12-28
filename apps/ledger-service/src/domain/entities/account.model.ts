export enum AccountType {
  ASSET = 'ASSET',
  LIABILITY = 'LIABILITY',
  EQUITY = 'EQUITY',
  REVENUE = 'REVENUE',
  EXPENSE = 'EXPENSE',
}

export class Account {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly type: AccountType,
    public readonly subtype: string | null,
    public readonly currency: string,
    public readonly balance: number,
    public readonly isMutable: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
