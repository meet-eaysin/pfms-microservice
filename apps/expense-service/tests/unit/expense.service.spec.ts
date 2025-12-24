import { ExpenseService } from '../../src/modules/expenses/expense.service';
import { UUID } from '@pfms/types';

describe('ExpenseService', () => {
  let service: ExpenseService;

  beforeEach(() => {
    service = new ExpenseService();
  });

  describe('listExpenses', () => {
    it('should return expenses for a user', async () => {
      const userId = 'user-123' as UUID;
      const result = await service.listExpenses(userId);

      expect(result.expenses).toBeDefined();
      expect(Array.isArray(result.expenses)).toBe(true);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(20);
    });

    it('should return demo expense for user-123', async () => {
      const userId = 'user-123' as UUID;
      const result = await service.listExpenses(userId);

      expect(result.expenses.length).toBeGreaterThan(0);
      expect(result.expenses[0].userId).toBe(userId);
    });

    it('should handle pagination', async () => {
      const userId = 'user-123' as UUID;
      const result = await service.listExpenses(userId, 1, 10);

      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(10);
    });

    it('should return empty array for non-existent user', async () => {
      const userId = 'non-existent-user' as UUID;
      const result = await service.listExpenses(userId);

      expect(result.expenses).toEqual([]);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('createExpense', () => {
    it('should create a new expense', async () => {
      const userId = 'user-456' as UUID;
      const createDto = {
        amount: 25.99,
        currency: 'USD',
        description: 'Coffee',
        date: '2025-12-24',
        source: 'manual' as const,
      };

      const expense = await service.createExpense(userId, createDto);

      expect(expense).toBeDefined();
      expect(expense.id).toBeDefined();
      expect(expense.amount).toBe(createDto.amount);
      expect(expense.description).toBe(createDto.description);
      expect(expense.userId).toBe(userId);
    });

    it('should generate unique IDs for multiple expenses', async () => {
      const userId = 'user-456' as UUID;
      const createDto = {
        amount: 25.99,
        currency: 'USD',
        description: 'Test',
        date: '2025-12-24',
        source: 'manual' as const,
      };

      const expense1 = await service.createExpense(userId, createDto);
      const expense2 = await service.createExpense(userId, createDto);

      expect(expense1.id).not.toBe(expense2.id);
    });

    it('should use default values for optional fields', async () => {
      const userId = 'user-456' as UUID;
      const createDto = {
        amount: 25.99,
        date: '2025-12-24',
      };

      const expense = await service.createExpense(userId, createDto);

      expect(expense.currency).toBe('USD');
      expect(expense.description).toBe('');
      expect(expense.source).toBe('manual');
    });
  });

  describe('updateExpense', () => {
    it('should update an existing expense', async () => {
      const userId = 'user-123' as UUID;
      const expenseId = '550e8400-e29b-41d4-a716-446655440000' as UUID;
      const updateDto = {
        amount: 75.5,
        description: 'Updated groceries',
      };

      const updated = await service.updateExpense(expenseId, userId, updateDto);

      expect(updated).toBeDefined();
      expect(updated?.amount).toBe(updateDto.amount);
      expect(updated?.description).toBe(updateDto.description);
    });

    it('should return null when updating non-existent expense', async () => {
      const userId = 'user-123' as UUID;
      const expenseId = 'non-existent-id' as UUID;
      const updateDto = {
        amount: 75.5,
      };

      const updated = await service.updateExpense(expenseId, userId, updateDto);

      expect(updated).toBeNull();
    });

    it('should return null when userId does not match', async () => {
      const userId = 'wrong-user' as UUID;
      const expenseId = '550e8400-e29b-41d4-a716-446655440000' as UUID;
      const updateDto = {
        amount: 75.5,
      };

      const updated = await service.updateExpense(expenseId, userId, updateDto);

      expect(updated).toBeNull();
    });
  });

  describe('deleteExpense', () => {
    it('should delete an existing expense', async () => {
      const userId = 'user-123' as UUID;
      const expenseId = '550e8400-e29b-41d4-a716-446655440000' as UUID;

      const result = await service.deleteExpense(expenseId, userId);
      expect(result).toBe(true);

      // Verify it's deleted by checking list
      const list = await service.listExpenses(userId);
      const found = list.expenses.find((e) => e.id === expenseId);
      expect(found).toBeUndefined();
    });

    it('should return false when deleting non-existent expense', async () => {
      const userId = 'user-123' as UUID;
      const expenseId = 'non-existent-id' as UUID;

      const result = await service.deleteExpense(expenseId, userId);
      expect(result).toBe(false);
    });

    it('should return false when userId does not match', async () => {
      const userId = 'wrong-user' as UUID;
      const expenseId = '550e8400-e29b-41d4-a716-446655440000' as UUID;

      const result = await service.deleteExpense(expenseId, userId);
      expect(result).toBe(false);
    });
  });
});
