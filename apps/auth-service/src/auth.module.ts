import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserCreatedEvent } from './domain/ports/event-publisher';

import { AuthController } from './interfaces/controllers/auth.controller';

import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';

import { PrismaService } from './infrastructure/config/prisma.service';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository';
import { Argon2PasswordEncoder } from './infrastructure/security/argon2-password.encoder';
import { JwtTokenServiceImpl } from './infrastructure/security/jwt-token.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';

import { UserRepository, SessionRepository, PasswordEncoder, TokenService } from './domain/ports/repositories';
import { EventPublisher } from './domain/ports/event-publisher';

// Mock/Simple Event Publisher for now (or RabbitMQ placeholder)
class SimpleEventPublisher implements EventPublisher {
    async publishUserCreated(event: UserCreatedEvent) {
        console.log('Event Published: UserCreated', event);
    }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Ensure ConfigModule is here
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret',
        signOptions: { expiresIn: '15m' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    PrismaService,
    JwtStrategy,
    SimpleEventPublisher,
    // Use Cases
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshSessionUseCase,

    // Bindings
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: SessionRepository, useClass: PrismaSessionRepository },
    { provide: PasswordEncoder, useClass: Argon2PasswordEncoder },
    { provide: TokenService, useClass: JwtTokenServiceImpl },
    { provide: EventPublisher, useClass: SimpleEventPublisher }, // Using Simple for now, update to Rabbit if needed
  ],
})
export class AuthModule {}
