import { JournalEntry } from '../entities/journal-entry.model';

export interface IJournalEntryRepository {
  create(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry>;
  findAll(userId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<JournalEntry[]>;
  findById(id: string): Promise<JournalEntry | null>;
}
