import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { RegisterUserUseCase } from '../../application/use-cases/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/login-user.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/logout-user.use-case';
import { RefreshSessionUseCase } from '../../application/use-cases/refresh-session.use-case';
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
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginUserDto, @Req() req: { headers: { [key: string]: string | undefined }; ip: string }) {
    // Extract device info from req if needed
    const deviceInfo = {
        userAgent: req.headers['user-agent'],
        ip: req.ip
    };
    return this.loginUseCase.execute(dto, deviceInfo);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: { user: { id: string } }) {
    // We assume JWT strategy populates user and potentially sessionId if we add it to payload
    // If not, we do global logout or need method to get session from token
    // For now, assuming simply calling execute.
    // If JwtStrategy extracts valid user, we have userId.
    const userId = req.user.id;
    // Ideally we pass sessionId if available
    await this.logoutUseCase.execute(userId);
    return { success: true };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() body: { refreshToken: string }) {
    return this.refreshUseCase.execute(body.refreshToken);
  }
}
