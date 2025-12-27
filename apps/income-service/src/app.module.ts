import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { InfrastructureModule } from './modules/infrastructure.module';
import { IncomeModule } from './modules/income.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    InfrastructureModule,
    IncomeModule,
  ],
})
export class AppModule {}
