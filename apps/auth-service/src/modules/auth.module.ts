import { Module } from '@nestjs/common';
import { AuthController } from '../presentation/controllers/auth.controller';
import { AuthApplicationService } from '../application/services/auth.application.service';
import { BetterAuthAdapter } from '../infrastructure/auth/better-auth.adapter';
import {
  GetUserByIdUseCase,
  GetUserSessionsUseCase,
  RevokeSessionUseCase,
  RevokeAllSessionsUseCase,
} from '../application/use-cases/session.use-cases';
import { PrismaRepository } from '../infrastructure/database/prisma.repository';
import { EventPublisher } from '../infrastructure/messaging/event.publisher';
import { AuthGuard } from '../presentation/guards/auth.guard';

@Module({
  controllers: [AuthController],
  providers: [
    // Application Services
    AuthApplicationService,
    
    // Use Cases
    GetUserByIdUseCase,
    GetUserSessionsUseCase,
    RevokeSessionUseCase,
    RevokeAllSessionsUseCase,
    
    // Infrastructure
    BetterAuthAdapter,
    {
      provide: 'IAuthRepository',
      useClass: PrismaRepository,
    },
    PrismaRepository,
    EventPublisher,
    
    // Guards
    AuthGuard,
  ],
  exports: [
    AuthApplicationService,
    BetterAuthAdapter,
    AuthGuard,
  ],
})
export class AuthModule {}
