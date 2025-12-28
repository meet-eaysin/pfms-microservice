import type { Request, Response, NextFunction } from 'express';
import type { AuthApplicationService } from '../../application/services/auth.application.service';
import type { User, Session } from '../../domain/entities/user.entity';
import { fromNodeHeaders } from 'better-auth/node';

export interface IAuthenticatedRequest extends Request {
  user: User;
  session: Session;
}

interface IAuthMiddlewareOptions {
  authService: AuthApplicationService;
}

export function authMiddleware(options: IAuthMiddlewareOptions) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Convert Express headers to Better Auth Headers format
      const headers = fromNodeHeaders(req.headers);

      // getSession expects { headers: Headers }
      const session = await options.authService.getSession({ headers });

      if (session === null) {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      (req as IAuthenticatedRequest).user = session.user;
      (req as IAuthenticatedRequest).session = session.session;

      next();
    } catch {
      res.status(401).json({
        statusCode: 401,
        message: 'Authentication required',
        timestamp: new Date().toISOString(),
      });
    }
  };
}
