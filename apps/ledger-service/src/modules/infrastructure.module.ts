import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../infrastructure/persistence/prisma.service';
import { PrismaAccountRepository } from '../infrastructure/persistence/repositories/account.repository.impl';
import { PrismaJournalEntryRepository } from '../infrastructure/persistence/repositories/journal-entry.repository.impl';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    {
      provide: 'IAccountRepository',
      useClass: PrismaAccountRepository,
    },
    {
      provide: 'IJournalEntryRepository',
      useClass: PrismaJournalEntryRepository,
    },
  ],
  exports: [PrismaService, 'IAccountRepository', 'IJournalEntryRepository'],
})
export class InfrastructureModule {}
