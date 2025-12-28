import { Inject, Injectable } from '@nestjs/common';
import { IJournalEntryRepository } from '@/core/domain/repositories/journal-entry.repository';
import { JournalEntry } from '@/core/domain/models/journal-entry.model';

@Injectable()
export class GetEntriesUseCase {
  constructor(
    @Inject('IJournalEntryRepository')
    private readonly repository: IJournalEntryRepository,
  ) {}

  async execute(userId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<JournalEntry[]> {
    return this.repository.findAll(userId, filters);
  }
}
