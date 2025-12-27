import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlanningModule } from './modules/planning.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PlanningModule,
  ],
})
export class AppModule {}
