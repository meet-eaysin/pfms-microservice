import { Injectable } from '@nestjs/common';
import { IJournalEntryRepository } from '@/domain/interfaces/journal-entry.repository';
import { JournalEntry, PostingLine, Direction, EntrySource } from '@/domain/entities/journal-entry.model';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaJournalEntryRepository implements IJournalEntryRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(prismaEntry: any): JournalEntry {
    const lines = (prismaEntry.lines || []).map((line: any) => new PostingLine(
      line.id,
      line.entryId,
      line.accountId,
      Number(line.amount),
      line.direction as Direction,
    ));

    return new JournalEntry(
      prismaEntry.id,
      prismaEntry.userId,
      prismaEntry.date,
      prismaEntry.description,
      prismaEntry.reference,
      prismaEntry.source as EntrySource,
      lines,
      prismaEntry.createdAt,
    );
  }

  async create(entry: Omit<JournalEntry, 'id' | 'createdAt'>): Promise<JournalEntry> {
    const created = await this.prisma.journalEntry.create({
      data: {
        userId: entry.userId,
        date: entry.date,
        description: entry.description,
        reference: entry.reference,
        source: entry.source,
        lines: {
          create: entry.lines.map(line => ({
            accountId: line.accountId,
            amount: line.amount,
            direction: line.direction,
          })),
        },
      },
      include: { lines: true },
    });
    return this.toDomain(created);
  }

  async findAll(userId: string, filters?: { startDate?: Date; endDate?: Date }): Promise<JournalEntry[]> {
    const entries = await this.prisma.journalEntry.findMany({
      where: {
        userId,
        ...(filters?.startDate && filters?.endDate && {
          date: { gte: filters.startDate, lte: filters.endDate },
        }),
      },
      include: { lines: true },
    });
    return entries.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<JournalEntry | null> {
    const entry = await this.prisma.journalEntry.findUnique({
      where: { id },
      include: { lines: true },
    });
    return entry ? this.toDomain(entry) : null;
  }
}
