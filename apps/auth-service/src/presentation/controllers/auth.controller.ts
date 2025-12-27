import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Headers,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthApplicationService } from '../../application/services/auth.application.service';
import {
  GetUserByIdUseCase,
  GetUserSessionsUseCase,
  RevokeSessionUseCase,
  RevokeAllSessionsUseCase,
} from '../../application/use-cases/session.use-cases';
import { BetterAuthAdapter } from '../../infrastructure/auth/better-auth.adapter';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { User } from '../../domain/entities/user.entity';
import {
  UserResponseDto,
  SessionResponseDto,
  AuthResponseDto,
} from '../../application/dto/response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthApplicationService,
    private readonly betterAuthAdapter: BetterAuthAdapter,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly getUserSessionsUseCase: GetUserSessionsUseCase,
    private readonly revokeSessionUseCase: RevokeSessionUseCase,
    private readonly revokeAllSessionsUseCase: RevokeAllSessionsUseCase,
  ) {}

  @Post('*')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Better Auth requests (signup, signin, etc.)' })
  @ApiResponse({ status: 200, description: 'Auth request successful' })
  async handleAuthPost(@Req() req: unknown): Promise<void> {
    try {
      await this.betterAuthAdapter.handleRequest(req);
    } catch (error) {
      this.logger.error('Auth request failed', error);
      throw error;
    }
  }

  @Get('*')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Better Auth GET requests (OAuth callbacks, etc.)' })
  @ApiResponse({ status: 200, description: 'Auth request successful' })
  async handleAuthGet(@Req() req: unknown): Promise<void> {
    try {
      await this.betterAuthAdapter.handleRequest(req);
    } catch (error) {
      this.logger.error('Auth request failed', error);
      throw error;
    }
  }

  @Get('session')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current session' })
  @ApiResponse({ status: 200, description: 'Current session', type: AuthResponseDto })
  async getSession(@Headers() headers: Record<string, string>): Promise<AuthResponseDto> {
    const session = await this.authService.getSession(headers);
    
    if (!session) {
      throw new Error('No active session');
    }

    return {
      user: session.user,
      session: session.session,
    };
  }

  @Post('signout')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Sign out current session' })
  @ApiResponse({ status: 204, description: 'Successfully signed out' })
  async signOut(@Headers() headers: Record<string, string>): Promise<void> {
    await this.authService.signOut(headers);
  }

  @Get('user/:id')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User details', type: UserResponseDto })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto | null> {
    return this.getUserByIdUseCase.execute(id);
  }

  @Get('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all sessions for current user' })
  @ApiResponse({ status: 200, description: 'List of sessions', type: [SessionResponseDto] })
  async getUserSessions(@CurrentUser() user: User): Promise<SessionResponseDto[]> {
    return this.getUserSessionsUseCase.execute(user.id);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke a specific session' })
  @ApiResponse({ status: 204, description: 'Session revoked' })
  async revokeSession(
    @Param('sessionId') sessionId: string,
    @CurrentUser() user: User,
  ): Promise<void> {
    await this.revokeSessionUseCase.execute(sessionId, user.id);
  }

  @Delete('sessions')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke all sessions except current' })
  @ApiResponse({ status: 204, description: 'All sessions revoked' })
  async revokeAllSessions(@CurrentUser() user: User): Promise<void> {
    await this.revokeAllSessionsUseCase.execute(user.id);
  }
}
