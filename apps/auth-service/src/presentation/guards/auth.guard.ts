import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthApplicationService } from '../../application/services/auth.application.service';
import type { User, Session } from '../../domain/entities/user.entity';

interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  user: User;
  session: Session;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authService: AuthApplicationService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    
    try {
      const session = await this.authService.getSession(request.headers);

      if (!session) {
        throw new UnauthorizedException('Invalid session');
      }

      request.user = session.user;
      request.session = session.session;

      return true;
    } catch (error) {
      this.logger.error('Authentication failed', error);
      throw new UnauthorizedException('Authentication required');
    }
  }
}
