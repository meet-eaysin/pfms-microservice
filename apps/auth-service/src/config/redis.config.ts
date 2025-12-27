import { registerAs } from '@nestjs/config';
import { loadRedisConfig } from '@pfms/config';

export default registerAs('redis', () => {
  return loadRedisConfig();
});
