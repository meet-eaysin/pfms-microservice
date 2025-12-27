import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IIncomeTransactionRepository } from '../../../domain/repositories/income-transaction.repository';
import { IIncomeSourceRepository } from '../../../domain/repositories/income-source.repository';
import { IncomeTransaction } from '../../../domain/models/income-transaction.model';
import { parseISO } from '@pfms/date';

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
  ) {}

  async execute(command: RecordIncomeCommand): Promise<IncomeTransaction> {
    const source = await this.sourceRepository.findById(command.sourceId);
    if (!source) {
      throw new NotFoundException('Income source not found');
    }

    return this.transactionRepository.create({
      sourceId: command.sourceId,
      amount: command.amount,
      date: parseISO(command.date),
      isTaxable: command.isTaxable ?? true,
      notes: command.notes || null,
    });
  }
}
