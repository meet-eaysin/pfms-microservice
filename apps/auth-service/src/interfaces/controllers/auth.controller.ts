import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
import { EnableMfaUseCase } from '../../application/use-cases/enable-mfa.use-case';
import { VerifyMfaUseCase } from '../../application/use-cases/verify-mfa.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { RegisterUserDto } from '../../application/dtos/register-user.dto';
import { LoginUserDto } from '../../application/dtos/login-user.dto';
import { AuthGuard } from '@nestjs/passport'; // Or custom guard

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUserUseCase,
    private readonly loginUseCase: LoginUserUseCase,
    private readonly logoutUseCase: LogoutUserUseCase,
    private readonly refreshUseCase: RefreshSessionUseCase,
    private readonly enableMfaUseCase: EnableMfaUseCase,
    private readonly verifyMfaUseCase: VerifyMfaUseCase,
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginUserDto,
    @Req() req: { headers: { [key: string]: string | undefined }; ip: string },
  ) {
    const deviceInfo = {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    };
    return this.loginUseCase.execute(dto, deviceInfo);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: { user: { id: string } }) {
    const userId = req.user.id;
    await this.logoutUseCase.execute(userId);
    return { success: true };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    return this.refreshUseCase.execute(body.refreshToken);
  }

  @Post('mfa/enable')
  @UseGuards(AuthGuard('jwt'))
  async enableMfa(@Req() req: { user: { id: string } }) {
    return this.enableMfaUseCase.execute(req.user.id);
  }

  @Post('mfa/verify')
  @UseGuards(AuthGuard('jwt'))
  async verifyMfa(
    @Req() req: { user: { id: string } },
    @Body() body: { code: string },
  ) {
    return this.verifyMfaUseCase.execute(req.user.id, body.code);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.forgotPasswordUseCase.execute(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.resetPasswordUseCase.execute(body.token, body.newPassword);
  }
}
