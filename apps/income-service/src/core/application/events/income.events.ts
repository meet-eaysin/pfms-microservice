import { BaseEvent } from '@pfms/event-bus';

export interface IncomeReceivedEvent extends BaseEvent {
  eventType: 'income.received';
  data: {
    incomeId: string;
    userId: string;
    amount: number;
    currency: string;
    sourceId: string;
    date: string;
    isTaxable: boolean;
    notes?: string;
  };
}
