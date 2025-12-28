export interface ExpenseCreatedEvent {
  eventId: string;
  eventType: 'expense.created';
  timestamp: string;
  version: string;
  data: {
    expenseId: string;
    userId: string;
    amount: number;
    currency: string;
    categoryId: string;
    date: string;
    description: string;
  };
  metadata: {
    userId: string;
  };
}
