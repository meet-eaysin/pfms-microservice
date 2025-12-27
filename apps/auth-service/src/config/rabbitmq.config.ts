import { registerAs } from '@nestjs/config';
import { loadRabbitMQConfig } from '@pfms/config';

export default registerAs('rabbitmq', () => {
  return loadRabbitMQConfig();
});
