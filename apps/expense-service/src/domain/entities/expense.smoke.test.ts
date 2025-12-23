export class Expense {
  constructor(
    public id: string,
    public amount: number,
    public description: string,
    public date: Date
  ) {
    if (amount <= 0) {
      throw new Error('Amount must be positive');
    }
  }
}

describe('Expense Entity', () => {
  it('should create an expense with valid data', () => {
    const expense = new Expense('1', 100, 'Test', new Date());
    expect(expense).toBeDefined();
    expect(expense.amount).toBe(100);
  });

  it('should throw error for negative amount', () => {
    expect(() => new Expense('1', -50, 'Test', new Date())).toThrow('Amount must be positive');
  });
});
