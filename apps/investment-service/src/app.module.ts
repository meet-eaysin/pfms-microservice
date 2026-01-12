import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { InvestmentModule } from './modules/investment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
    InvestmentModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
