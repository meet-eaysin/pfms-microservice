import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import authConfig from './config/auth.config';
import databaseConfig from './config/database.config';
import serverConfig from './config/server.config';
import redisConfig from './config/redis.config';
import rabbitmqConfig from './config/rabbitmq.config';
import { AuthModule } from './modules/auth.module';
import { HealthModule } from './modules/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        authConfig,
        databaseConfig,
        serverConfig,
        redisConfig,
        rabbitmqConfig,
      ],
      envFilePath: ['.env.local', '.env'],
    }),
    AuthModule,
    HealthModule,
  ],
})
export class AppModule {}
