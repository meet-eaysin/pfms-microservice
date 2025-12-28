import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IIncomeTransactionRepository } from '@/domain/interfaces/income-transaction.repository';
import { IIncomeSourceRepository } from '@/domain/interfaces/income-source.repository';
import { IncomeTransaction } from '@/domain/entities/income-transaction.model';
import { parseISO, formatDate, DateFormats } from '@pfms/date';
import { RabbitMQEventBus } from '@pfms/event-bus';
import { generateUUID } from '@pfms/utils';
import { IncomeReceivedEvent } from '../../events/income.events';

export interface RecordIncomeCommand {
  sourceId: string;
  amount: number;
  date: string;
  isTaxable?: boolean;
  notes?: string;
}

@Injectable()
export class RecordIncomeUseCase {
  constructor(
    @Inject('IIncomeTransactionRepository')
    private readonly transactionRepository: IIncomeTransactionRepository,
    @Inject('IIncomeSourceRepository')
    private readonly sourceRepository: IIncomeSourceRepository,
    private readonly eventBus: RabbitMQEventBus
  ) {}

  async execute(command: RecordIncomeCommand): Promise<IncomeTransaction> {
    const source = await this.sourceRepository.findById(command.sourceId);
    if (!source) {
      throw new NotFoundException('Income source not found');
    }

    const transaction = await this.transactionRepository.create({
      sourceId: command.sourceId,
      amount: command.amount,
      date: parseISO(command.date),
      isTaxable: command.isTaxable ?? true,
      notes: command.notes || null,
    });

    // Publish income.received event
    const event: IncomeReceivedEvent = {
      eventId: generateUUID(),
      eventType: 'income.received',
      timestamp: formatDate(new Date(), DateFormats.ISO_DATETIME),
      version: '1.0',
      data: {
        incomeId: transaction.id,
        userId: source.userId,
        amount: transaction.amount,
        currency: source.currency,
        sourceId: transaction.sourceId,
        date: formatDate(transaction.date, DateFormats.ISO_DATE),
        isTaxable: transaction.isTaxable,
        notes: transaction.notes || '',
      },
      metadata: {
        userId: source.userId,
      },
    };

    await this.eventBus.publish('income.received', event);

    return transaction;
  }
}
