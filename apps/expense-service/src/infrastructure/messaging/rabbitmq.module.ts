import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventPublisher } from './event.publisher';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EventPublisher],
  exports: [EventPublisher],
})
export class RabbitMQModule {}
