export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly assetId: string,
    public type: TransactionType,
    public quantity: number,
    public price: number,
    public fees: number = 0,
    public tax: number = 0,
    public date: Date,
    public readonly createdAt?: Date,
  ) {}
}
