import { PostEntryUseCase } from '@/application/use-cases';
import { Direction } from '@/domain/entities/journal-entry.model';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQEventBus, BaseEvent } from '@pfms/event-bus';

interface ExpenseCreatedEventData {
  expenseId: string;
  userId: string;
  amount: number;
  currency: string;
  categoryId: string;
  date: string;
  description: string;
}

interface IncomeReceivedEventData {
  incomeId: string;
  userId: string;
  amount: number;
  currency: string;
  sourceId: string;
  date: string;
  isTaxable: boolean;
  notes?: string;
}

@Injectable()
export class LedgerEventHandler implements OnModuleInit {
  constructor(
    private readonly eventBus: RabbitMQEventBus,
    private readonly postEntryUseCase: PostEntryUseCase
  ) {}

  async onModuleInit() {
    // Subscribe to events
    await this.eventBus.subscribe('expense.created', this.handleExpenseCreated.bind(this));
    await this.eventBus.subscribe('income.received', this.handleIncomeReceived.bind(this));
    console.log('✅ Ledger event handlers registered');
  }

  private async handleExpenseCreated(event: BaseEvent): Promise<void> {
    const data = event.data as unknown as ExpenseCreatedEventData;

    console.log('📝 Creating ledger entry for expense:', data.expenseId);

    try {
      // For now, we'll use default account IDs
      // In production, these would be looked up based on categoryId and user preferences
      const expenseAccountId = 'default-expense-account';
      const cashAccountId = 'default-cash-account';

      await this.postEntryUseCase.execute({
        userId: data.userId,
        date: data.date,
        description: `Expense: ${data.description}`,
        reference: data.expenseId,
        lines: [
          {
            accountId: expenseAccountId,
            amount: data.amount,
            direction: Direction.DEBIT,
          },
          {
            accountId: cashAccountId,
            amount: data.amount,
            direction: Direction.CREDIT,
          },
        ],
      });

      console.log('✅ Ledger entry created for expense:', data.expenseId);
    } catch (error) {
      console.error('❌ Failed to create ledger entry for expense:', error);
      throw error;
    }
  }

  private async handleIncomeReceived(event: BaseEvent): Promise<void> {
    const data = event.data as unknown as IncomeReceivedEventData;

    console.log('📝 Creating ledger entry for income:', data.incomeId);

    try {
      // For now, we'll use default account IDs
      const bankAccountId = 'default-bank-account';
      const incomeAccountId = 'default-income-account';

      await this.postEntryUseCase.execute({
        userId: data.userId,
        date: data.date,
        description: `Income received${data.notes ? ': ' + data.notes : ''}`,
        reference: data.incomeId,
        lines: [
          {
            accountId: bankAccountId,
            amount: data.amount,
            direction: Direction.DEBIT,
          },
          {
            accountId: incomeAccountId,
            amount: data.amount,
            direction: Direction.CREDIT,
          },
        ],
      });

      console.log('✅ Ledger entry created for income:', data.incomeId);
    } catch (error) {
      console.error('❌ Failed to create ledger entry for income:', error);
      throw error;
    }
  }
}
