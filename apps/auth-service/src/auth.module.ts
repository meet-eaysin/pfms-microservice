import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { UserCreatedEvent } from './domain/ports/event-publisher';
import { ConfigService } from './infrastructure/config/config.service';

import { AuthController } from './interfaces/controllers/auth.controller';

import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from './application/use-cases/logout-user.use-case';
import { RefreshSessionUseCase } from './application/use-cases/refresh-session.use-case';
import { EnableMfaUseCase } from './application/use-cases/enable-mfa.use-case';
import { VerifyMfaUseCase } from './application/use-cases/verify-mfa.use-case';
import { ForgotPasswordUseCase } from './application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from './application/use-cases/reset-password.use-case';

import { PrismaService } from './infrastructure/config/prisma.service';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { PrismaSessionRepository } from './infrastructure/repositories/prisma-session.repository';
import { Argon2PasswordEncoder } from './infrastructure/security/argon2-password.encoder';
import { JwtTokenServiceImpl } from './infrastructure/security/jwt-token.service';
import { JwtStrategy } from './infrastructure/security/jwt.strategy';
import { SpeakeasyMfaService } from './infrastructure/services/speakeasy-mfa.service';
import { RedisPasswordResetTokenRepository } from './infrastructure/repositories/redis-password-reset-token.repository';

import {
  UserRepository,
  SessionRepository,
  PasswordEncoder,
  TokenService,
} from './domain/ports/repositories';
import { MfaService } from './domain/ports/mfa.service';
import { PasswordResetTokenRepository } from './domain/ports/password-reset-token.repository';
import {
  EventPublisher,
  UserForgotPasswordEvent,
  UserPasswordChangedEvent,
} from './domain/ports/event-publisher';

class SimpleEventPublisher implements EventPublisher {
  async publishUserCreated(event: UserCreatedEvent) {
    console.log('Event Published: UserCreated', event);
  }
  async publishForgotPassword(event: UserForgotPasswordEvent) {
    console.log('Event Published: ForgotPassword', event);
  }
  async publishPasswordChanged(event: UserPasswordChangedEvent) {
    console.log('Event Published: PasswordChanged', event);
  }
}

@Module({
  imports: [
    NestConfigModule.forRoot({ isGlobal: true }),
    PassportModule,
    JwtModule.registerAsync({
      imports: [AuthModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.accessTokenExpiresIn },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    ConfigService,
    PrismaService,
    JwtStrategy,
    SimpleEventPublisher,
    // Use Cases
    RegisterUserUseCase,
    LoginUserUseCase,
    LogoutUserUseCase,
    RefreshSessionUseCase,
    EnableMfaUseCase,
    VerifyMfaUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,

    // Bindings
    { provide: UserRepository, useClass: PrismaUserRepository },
    { provide: SessionRepository, useClass: PrismaSessionRepository },
    { provide: PasswordEncoder, useClass: Argon2PasswordEncoder },
    { provide: TokenService, useClass: JwtTokenServiceImpl },
    { provide: MfaService, useClass: SpeakeasyMfaService },
    {
      provide: PasswordResetTokenRepository,
      useClass: RedisPasswordResetTokenRepository,
    },
    { provide: EventPublisher, useClass: SimpleEventPublisher },
  ],
  exports: [ConfigService],
})
export class AuthModule {}
