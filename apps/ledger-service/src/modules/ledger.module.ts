import { Module } from '@nestjs/common';
import { AccountController } from '../presentation/http/controllers/account.controller';
import { EntryController } from '../presentation/http/controllers/entry.controller';
import { AnalyticsController } from '../presentation/http/controllers/analytics.controller';
import { CreateAccountUseCase } from '../core/application/use-cases/account/create-account.use-case';
import { GetAccountsUseCase } from '../core/application/use-cases/account/get-accounts.use-case';
import { PostEntryUseCase } from '../core/application/use-cases/entry/post-entry.use-case';
import { GetEntriesUseCase } from '../core/application/use-cases/entry/get-entries.use-case';
import { GetBalanceSheetUseCase } from '../core/application/use-cases/analytics/get-balance-sheet.use-case';
import { GetNetWorthUseCase } from '../core/application/use-cases/analytics/get-net-worth.use-case';
import { EventSubscriberService } from '../infrastructure/messaging/event-subscriber.service';

@Module({
  controllers: [AccountController, EntryController, AnalyticsController],
  providers: [
    CreateAccountUseCase,
    GetAccountsUseCase,
    PostEntryUseCase,
    GetEntriesUseCase,
    GetBalanceSheetUseCase,
    GetNetWorthUseCase,
    EventSubscriberService,
  ],
})
export class LedgerModule {}
