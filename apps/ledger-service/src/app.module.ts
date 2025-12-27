import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './modules/infrastructure.module';
import { LedgerModule } from './modules/ledger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
    LedgerModule,
  ],
})
export class AppModule {}
