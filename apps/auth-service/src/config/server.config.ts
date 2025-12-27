import { registerAs } from '@nestjs/config';
import { loadServerConfig } from '@pfms/config';

export default registerAs('server', () => {
  return loadServerConfig();
});
