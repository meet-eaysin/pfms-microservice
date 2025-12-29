import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * AuthGuard - Validates Bearer token from Authorization header
 *
 * In production, this should validate JWT tokens against auth-service.
 * For now, it extracts the token and treats it as userId for development.
 *
 * @example
 * @Controller('expenses')
 * @UseGuards(AuthGuard)
 * export class ExpenseController { }
 */
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header required');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid authorization format. Expected: Bearer <token>');
    }

    // TODO: In production, validate JWT token here
    // For development, treat token as userId
    request.userId = token;

    return true;
  }
}
