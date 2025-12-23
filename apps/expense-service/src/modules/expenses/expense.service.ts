import { UUID, CreateExpenseDto, Expense, toISODate } from '@pfms/types';
import { createLogger } from '@pfms/utils';
import crypto from 'crypto';

const logger = createLogger('ExpenseService:ExpenseService');

/**
 * Expense Service - Business Logic Layer
 * TODO: Replace with actual database queries when Prisma is set up
 */
export class ExpenseService {
  // In-memory store (temporary - replace with database)
  private expenseDatabase: Map<UUID, Expense> = new Map();

  constructor() {
    this.seedDemoData();
  }

  /**
   * Seed demo data for testing
   */
  private seedDemoData(): void {
    const demoId = '550e8400-e29b-41d4-a716-446655440000' as UUID;
    this.expenseDatabase.set(demoId, {
      id: demoId,
      userId: 'user-123' as UUID,
      amount: 50.99,
      currency: 'USD',
      description: 'Weekly groceries shopping',
      date: '2025-12-18',
      isRecurring: false,
      source: 'manual',
      createdAt: toISODate(new Date()),
      updatedAt: toISODate(new Date()),
    });
  }

  /**
   * List expenses for a user with pagination
   */
  async listExpenses(
    userId: UUID,
    page: number = 1,
    limit: number = 20
  ): Promise<{ expenses: Expense[]; pagination: { page: number; limit: number; total: number } }> {
    logger.info('📥 Fetching expenses', { userId, page, limit });

    const userExpenses = Array.from(this.expenseDatabase.values()).filter(
      (exp) => exp.userId === userId
    );

    const total = userExpenses.length;
    const offset = (page - 1) * limit;
    const expenses = userExpenses.slice(offset, offset + limit);

    logger.info('✅ Retrieved expenses', { userId, count: expenses.length, total });

    return {
      expenses,
      pagination: { page, limit, total },
    };
  }

  /**
   * Get a single expense
   */
  async getExpense(expenseId: UUID, userId: UUID): Promise<Expense | null> {
    logger.info('🔍 Fetching expense', { expenseId, userId });

    const expense = this.expenseDatabase.get(expenseId);

    if (!expense || expense.userId !== userId) {
      logger.warn('⚠️ Expense not found or unauthorized', { expenseId, userId });
      return null;
    }

    return expense;
  }

  /**
   * Create a new expense
   */
  async createExpense(userId: UUID, data: CreateExpenseDto): Promise<Expense> {
    logger.info('📝 Creating expense', { userId, amount: data.amount });

    const newExpense: Expense = {
      id: crypto.randomUUID() as UUID,
      userId,
      amount: data.amount,
      currency: data.currency || 'USD',
      description: data.description || '',
      date: data.date,
      time: data.time,
      location: data.location,
      paymentMethod: data.paymentMethod,
      tags: data.tags,
      attachments: data.attachments,
      isRecurring: false,
      source: (data.source || 'manual') as 'manual' | 'voice' | 'import' | 'auto',
      createdAt: toISODate(new Date()),
      updatedAt: toISODate(new Date()),
    };

    this.expenseDatabase.set(newExpense.id, newExpense);

    logger.info('✅ Expense created', {
      expenseId: newExpense.id,
      userId,
      amount: newExpense.amount,
    });

    // TODO: Publish ExpenseCreatedEvent to RabbitMQ

    return newExpense;
  }

  /**
   * Update an expense
   */
  async updateExpense(
    expenseId: UUID,
    userId: UUID,
    updateData: Partial<Expense>
  ): Promise<Expense | null> {
    logger.info('✏️ Updating expense', { expenseId, userId });

    const expense = this.expenseDatabase.get(expenseId);

    if (!expense || expense.userId !== userId) {
      logger.warn('⚠️ Expense not found or unauthorized', { expenseId, userId });
      return null;
    }

    const updated: Expense = {
      ...expense,
      ...updateData,
      id: expenseId,
      userId,
      updatedAt: toISODate(new Date()),
    };

    this.expenseDatabase.set(expenseId, updated);

    logger.info('✅ Expense updated', { expenseId, userId });

    // TODO: Publish ExpenseUpdatedEvent to RabbitMQ

    return updated;
  }

  /**
   * Delete an expense
   */
  async deleteExpense(expenseId: UUID, userId: UUID): Promise<boolean> {
    logger.info('🗑️ Deleting expense', { expenseId, userId });

    const expense = this.expenseDatabase.get(expenseId);

    if (!expense || expense.userId !== userId) {
      logger.warn('⚠️ Expense not found or unauthorized', { expenseId, userId });
      return false;
    }

    this.expenseDatabase.delete(expenseId);

    logger.info('✅ Expense deleted', { expenseId, userId });

    // TODO: Publish ExpenseDeletedEvent to RabbitMQ

    return true;
  }
}
