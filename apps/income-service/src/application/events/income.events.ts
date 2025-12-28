export interface IncomeReceivedEvent {
  eventId: string;
  eventType: 'income.received';
  timestamp: string;
  version: string;
  data: {
    incomeId: string;
    userId: string;
    amount: number;
    currency: string;
    sourceId: string;
    date: string;
    isTaxable: boolean;
    notes: string;
  };
  metadata: {
    userId: string;
  };
}
