import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './modules/infrastructure.module';
import { LedgerModule } from './modules/ledger.module';
import { HealthController } from './presentation/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
    LedgerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
