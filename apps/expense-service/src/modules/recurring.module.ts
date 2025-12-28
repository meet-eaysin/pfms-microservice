import { Module } from '@nestjs/common';
import { RecurringController } from '../presentation/http/controllers/recurring.controller';
import { CreateRecurringUseCase } from '../application/use-cases/recurring/create-recurring.use-case';

@Module({
  controllers: [RecurringController],
  providers: [CreateRecurringUseCase],
})
export class RecurringModule {}
