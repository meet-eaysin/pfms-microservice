import { Inject, Injectable } from '@nestjs/common';
import { IJournalEntryRepository } from '@/domain/interfaces/journal-entry.repository';
import { JournalEntry } from '@/domain/entities/journal-entry.model';

@Injectable()
export class GetEntriesUseCase {
  constructor(
    @Inject('IJournalEntryRepository')
    private readonly repository: IJournalEntryRepository
  ) {}

  async execute(
    userId: string,
    filters?: { startDate?: Date; endDate?: Date }
  ): Promise<JournalEntry[]> {
    return this.repository.findAll(userId, filters);
  }
}
