// Mock uuid before any imports
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CreateExpenseUseCase } from '@/application/use-cases/expense/create-expense.use-case';
import { IExpenseRepository } from '@/domain/interfaces/expense.repository';
import { RabbitMQEventBus } from '@pfms/event-bus';
import { Expense } from '@/domain/entities/expense.model';

describe('CreateExpenseUseCase', () => {
  let useCase: CreateExpenseUseCase;
  let mockRepository: jest.Mocked<IExpenseRepository>;
  let mockEventBus: jest.Mocked<RabbitMQEventBus>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Create mock event bus
    mockEventBus = {
      publish: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn(),
      connect: jest.fn(),
      disconnect: jest.fn(),
      isConnected: jest.fn().mockReturnValue(true),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateExpenseUseCase,
        { provide: 'IExpenseRepository', useValue: mockRepository },
        { provide: RabbitMQEventBus, useValue: mockEventBus },
      ],
    }).compile();

    useCase = module.get<CreateExpenseUseCase>(CreateExpenseUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should create an expense successfully', async () => {
      const command = {
        userId: 'user-1',
        amount: 100,
        categoryId: 'cat-1',
        date: '2025-01-01',
      };

      const mockExpense: Expense = {
        id: '123',
        userId: 'user-1',
        amount: 100,
        currency: 'USD',
        categoryId: 'cat-1',
        date: new Date('2025-01-01'),
        description: null,
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockExpense);

      const result = await useCase.execute(command);

      expect(result).toEqual(mockExpense);
      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          amount: 100,
          currency: 'USD',
          categoryId: 'cat-1',
        })
      );
    });

    it('should use default currency when not provided', async () => {
      const command = {
        userId: 'user-1',
        amount: 100,
        categoryId: 'cat-1',
        date: '2025-01-01',
      };

      const mockExpense: Expense = {
        id: '123',
        userId: 'user-1',
        amount: 100,
        currency: 'USD',
        categoryId: 'cat-1',
        date: new Date('2025-01-01'),
        description: null,
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockExpense);

      await useCase.execute(command);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'USD',
        })
      );
    });

    it('should publish expense.created event', async () => {
      const command = {
        userId: 'user-1',
        amount: 100,
        categoryId: 'cat-1',
        date: '2025-01-01',
      };

      const mockExpense: Expense = {
        id: '123',
        userId: 'user-1',
        amount: 100,
        currency: 'USD',
        categoryId: 'cat-1',
        date: new Date('2025-01-01'),
        description: null,
        isRecurring: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockResolvedValue(mockExpense);

      await useCase.execute(command);

      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'expense.created',
        expect.objectContaining({
          eventType: 'expense.created',
          version: '1.0',
          data: expect.objectContaining({
            expenseId: '123',
            userId: 'user-1',
            amount: 100,
            currency: 'USD',
          }),
          metadata: expect.objectContaining({
            userId: 'user-1',
          }),
        })
      );
    });

    it('should propagate repository errors', async () => {
      const command = {
        userId: 'user-1',
        amount: 100,
        categoryId: 'cat-1',
        date: '2025-01-01',
      };

      const error = new Error('Database connection failed');
      mockRepository.create.mockRejectedValue(error);

      await expect(useCase.execute(command)).rejects.toThrow('Database connection failed');
    });
  });
});
