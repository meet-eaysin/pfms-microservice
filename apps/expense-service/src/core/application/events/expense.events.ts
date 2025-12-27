import { BaseEvent } from '@pfms/event-bus';

export interface ExpenseCreatedEvent extends BaseEvent {
  eventType: 'expense.created';
  data: {
    expenseId: string;
    userId: string;
    amount: number;
    currency: string;
    categoryId: string;
    date: string;
    description: string;
    paymentMethod?: string;
  };
}
