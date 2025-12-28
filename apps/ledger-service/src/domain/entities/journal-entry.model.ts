export enum EntrySource {
  MANUAL = 'MANUAL',
  EXPENSE_SERVICE = 'EXPENSE_SERVICE',
  INCOME_SERVICE = 'INCOME_SERVICE',
  INVESTMENT_SERVICE = 'INVESTMENT_SERVICE',
}

export enum Direction {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
}

export class PostingLine {
  constructor(
    public readonly id: string,
    public readonly entryId: string,
    public readonly accountId: string,
    public readonly amount: number,
    public readonly direction: Direction
  ) {}
}

export class JournalEntry {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly date: Date,
    public readonly description: string,
    public readonly reference: string | null,
    public readonly source: EntrySource,
    public readonly lines: PostingLine[],
    public readonly createdAt: Date
  ) {}
}
