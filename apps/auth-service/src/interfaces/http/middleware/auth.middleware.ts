import { Request, Response, NextFunction } from 'express';
import { AuthApplicationService } from '../../../application/services/auth.application.service';
import { User, Session } from '../../../domain/entities/user.entity';
import { fromNodeHeaders } from 'better-auth/node';

export interface AuthenticatedRequest extends Request {
  user: User;
  session: Session;
}

export function authMiddleware(authService: AuthApplicationService) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Convert Express headers to Better Auth Headers format
      const headers = fromNodeHeaders(req.headers);

      // getSession expects { headers: Headers }
      const session = await authService.getSession({ headers } as any);

      if (!session) {
        res.status(401).json({
          statusCode: 401,
          message: 'Unauthorized',
          timestamp: new Date().toISOString(),
        });
        return;
      }

      (req as AuthenticatedRequest).user = session.user;
      (req as AuthenticatedRequest).session = session.session;

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
