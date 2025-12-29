import { Expense } from '@/domain/entities/expense.model';

describe('Expense Entity', () => {
  describe('constructor', () => {
    it('should create a valid expense with all fields', () => {
      const now = new Date();
      const expenseDate = new Date('2025-01-01');

      const expense = new Expense(
        '123',
        'user-1',
        100.5,
        'USD',
        'cat-1',
        expenseDate,
        'Test expense',
        false,
        now,
        now
      );

      expect(expense.id).toBe('123');
      expect(expense.userId).toBe('user-1');
      expect(expense.amount).toBe(100.5);
      expect(expense.currency).toBe('USD');
      expect(expense.categoryId).toBe('cat-1');
      expect(expense.date).toEqual(expenseDate);
      expect(expense.description).toBe('Test expense');
      expect(expense.isRecurring).toBe(false);
      expect(expense.createdAt).toEqual(now);
      expect(expense.updatedAt).toEqual(now);
    });

    it('should handle null description', () => {
      const now = new Date();

      const expense = new Expense(
        '123',
        'user-1',
        100,
        'USD',
        'cat-1',
        new Date(),
        null,
        false,
        now,
        now
      );

      expect(expense.description).toBeNull();
    });

    it('should handle recurring expenses', () => {
      const now = new Date();

      const expense = new Expense(
        '123',
        'user-1',
        100,
        'USD',
        'cat-1',
        new Date(),
        'Monthly subscription',
        true,
        now,
        now
      );

      expect(expense.isRecurring).toBe(true);
    });

    it('should handle different currencies', () => {
      const now = new Date();

      const expense = new Expense(
        '123',
        'user-1',
        100,
        'EUR',
        'cat-1',
        new Date(),
        null,
        false,
        now,
        now
      );

      expect(expense.currency).toBe('EUR');
    });
  });
});
