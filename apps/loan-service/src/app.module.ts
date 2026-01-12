import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoanModule } from './modules/loan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoanModule,
  ],
})
export class AppModule {}
