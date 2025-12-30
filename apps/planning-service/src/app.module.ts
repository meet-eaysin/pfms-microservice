import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlanningModule } from './modules/planning.module';
import { HealthController } from './presentation/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PlanningModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
