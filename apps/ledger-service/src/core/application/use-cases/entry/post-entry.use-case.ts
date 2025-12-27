import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { IJournalEntryRepository } from '../../../domain/repositories/journal-entry.repository';
import { IAccountRepository } from '../../../domain/repositories/account.repository';
import { JournalEntry, Direction, EntrySource } from '../../../domain/models/journal-entry.model';
import { parseISO } from '@pfms/date';

export interface PostingLineCommand {
  accountId: string;
  amount: number;
  direction: Direction;
}

export interface PostEntryCommand {
  userId: string;
  date: string;
  description: string;
  reference?: string;
  lines: PostingLineCommand[];
}

@Injectable()
export class PostEntryUseCase {
  constructor(
    @Inject('IJournalEntryRepository')
    private readonly entryRepository: IJournalEntryRepository,
    @Inject('IAccountRepository')
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(command: PostEntryCommand): Promise<JournalEntry> {
    // Validate: Debits must equal Credits
    let totalDebits = 0;
    let totalCredits = 0;

    for (const line of command.lines) {
      if (line.direction === Direction.DEBIT) {
        totalDebits += line.amount;
      } else {
        totalCredits += line.amount;
      }
    }

    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      throw new BadRequestException(
        `Entry is not balanced: Debits=${totalDebits}, Credits=${totalCredits}`,
      );
    }

    // Verify all accounts exist
    for (const line of command.lines) {
      const account = await this.accountRepository.findById(line.accountId);
      if (!account) {
        throw new BadRequestException(`Account ${line.accountId} not found`);
      }
    }

    // Create entry
    const entry = await this.entryRepository.create({
      userId: command.userId,
      date: parseISO(command.date),
      description: command.description,
      reference: command.reference || null,
      source: EntrySource.MANUAL,
      lines: command.lines.map(line => ({
        id: '', // Will be generated
        entryId: '', // Will be set
        accountId: line.accountId,
        amount: line.amount,
        direction: line.direction,
      })),
    });

    // Update account balances
    for (const line of command.lines) {
      const account = await this.accountRepository.findById(line.accountId);
      if (!account) continue;

      let newBalance = account.balance;
      
      // Asset/Expense: Debit increases, Credit decreases
      // Liability/Revenue/Equity: Credit increases, Debit decreases
      if (account.type === 'ASSET' || account.type === 'EXPENSE') {
        newBalance += line.direction === Direction.DEBIT ? line.amount : -line.amount;
      } else {
        newBalance += line.direction === Direction.CREDIT ? line.amount : -line.amount;
      }

      await this.accountRepository.updateBalance(line.accountId, newBalance);
    }

    return entry;
  }
}
