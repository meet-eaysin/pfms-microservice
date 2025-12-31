import type { Request, Response, NextFunction } from 'express';
import type { AuthApplicationService } from '../../application/services/auth.application.service';
import type { User, Session } from '../../domain/entities/user.entity';

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
      const dynamicImport = new Function(
        'specifier',
        'return import(specifier)',
      );
      const { fromNodeHeaders } = await dynamicImport('better-auth/node');
      const headers = fromNodeHeaders(req.headers);

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
