import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountController } from '../presentation/http/controllers/account.controller';
import { EntryController } from '../presentation/http/controllers/entry.controller';
import { AnalyticsController } from '../presentation/http/controllers/analytics.controller';
import { CreateAccountUseCase } from '../core/application/use-cases/account/create-account.use-case';
import { GetAccountsUseCase } from '../core/application/use-cases/account/get-accounts.use-case';
import { PostEntryUseCase } from '../core/application/use-cases/entry/post-entry.use-case';
import { GetEntriesUseCase } from '../core/application/use-cases/entry/get-entries.use-case';
import { GetBalanceSheetUseCase } from '../core/application/use-cases/analytics/get-balance-sheet.use-case';
import { GetNetWorthUseCase } from '../core/application/use-cases/analytics/get-net-worth.use-case';
import { LedgerEventHandler } from '../infrastructure/messaging/event-subscriber.service';
import { RabbitMQEventBus } from '@pfms/event-bus';

@Module({
  imports: [ConfigModule],
  controllers: [AccountController, EntryController, AnalyticsController],
  providers: [
    CreateAccountUseCase,
    GetAccountsUseCase,
    PostEntryUseCase,
    GetEntriesUseCase,
    GetBalanceSheetUseCase,
    GetNetWorthUseCase,
    LedgerEventHandler,
    {
      provide: RabbitMQEventBus,
      useFactory: async (configService: ConfigService) => {
        const eventBus = new RabbitMQEventBus({
          rabbitmq: {
            host: configService.get('RABBITMQ_HOST') || 'localhost',
            port: configService.get('RABBITMQ_PORT') || 5672,
            username: configService.get('RABBITMQ_USER') || 'guest',
            password: configService.get('RABBITMQ_PASSWORD') || 'guest',
            vhost: configService.get('RABBITMQ_VHOST') || '/',
          },
          serviceName: 'ledger-service',
        });
        await eventBus.connect();
        return eventBus;
      },
      inject: [ConfigService],
    },
  ],
})
export class LedgerModule {}
