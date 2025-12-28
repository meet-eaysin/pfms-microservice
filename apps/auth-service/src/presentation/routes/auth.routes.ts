import type { Router, Request, Response, NextFunction } from 'express';
import type { BetterAuthAdapter } from '../../../infrastructure/auth/better-auth.adapter';
import type { AuthApplicationService } from '../../../application/services/auth.application.service';
import type {
  GetUserByIdUseCase,
  GetUserSessionsUseCase,
  RevokeSessionUseCase,
  RevokeAllSessionsUseCase,
} from '../../../application/use-cases/session.use-cases';
import { Router as ExpressRouter } from 'express';
import {
  authMiddleware,
  type IAuthenticatedRequest,
} from '../middleware/auth.middleware';
import { fromNodeHeaders } from 'better-auth/node';
import { createLogger } from '@pfms/utils';

const logger = createLogger('AuthRoutes');

interface IAuthRouterDependencies {
  betterAuthAdapter: BetterAuthAdapter;
  authService: AuthApplicationService;
  getUserByIdUseCase: GetUserByIdUseCase;
  getUserSessionsUseCase: GetUserSessionsUseCase;
  revokeSessionUseCase: RevokeSessionUseCase;
  revokeAllSessionsUseCase: RevokeAllSessionsUseCase;
}

export function createAuthRouter(deps: IAuthRouterDependencies): Router {
  const router = ExpressRouter();
  const authMw = authMiddleware({ authService: deps.authService });

  // ============================================
  // Better-Auth Handler (Catch-all)
  // ============================================
  // This handles ALL better-auth endpoints (signup, signin, OAuth, etc.)
  // Must be mounted BEFORE express.json() middleware
  // See: https://www.better-auth.com/docs/integrations/express

  router.all('/*', async (req: Request, res: Response): Promise<void> => {
    try {
      await deps.betterAuthAdapter.handleRequest(req, res);
    } catch (error) {
      logger.error('Better Auth request failed', { error, path: req.path });
      res.status(500).json({ error: 'Authentication error' });
    }
  });

  // ============================================
  // Custom Session Management Endpoints
  // ============================================
  // These use fromNodeHeaders to properly convert Express headers

  router.get(
    '/session',
    authMw,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const session = await deps.betterAuthAdapter.auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
        });

        if (session === null || session === undefined) {
          res.status(401).json({
            statusCode: 401,
            message: 'No active session',
          });
          return;
        }

        res.json(session);
      } catch (error) {
        next(error);
      }
    },
  );

  router.post(
    '/signout',
    authMw,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await deps.betterAuthAdapter.auth.api.signOut({
          headers: fromNodeHeaders(req.headers),
        });
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  // ============================================
  // User Management Endpoints
  // ============================================

  router.get(
    '/user/:id',
    authMw,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const userId = req.params.id;
        if (userId === undefined || userId === '') {
          res
            .status(400)
            .json({ statusCode: 400, message: 'User ID is required' });
          return;
        }

        const user = await deps.getUserByIdUseCase.execute(userId);

        if (user === null) {
          res.status(404).json({
            statusCode: 404,
            message: 'User not found',
          });
          return;
        }

        res.json(user);
      } catch (error) {
        next(error);
      }
    },
  );

  router.get(
    '/sessions',
    authMw,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const sessions = await deps.getUserSessionsUseCase.execute(
          authReq.user.id,
        );
        res.json(sessions);
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete(
    '/sessions/:sessionId',
    authMw,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const sessionId = req.params.sessionId;
        if (sessionId === undefined || sessionId === '') {
          res
            .status(400)
            .json({ statusCode: 400, message: 'Session ID is required' });
          return;
        }

        const authReq = req as IAuthenticatedRequest;
        await deps.revokeSessionUseCase.execute(sessionId, authReq.user.id);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  router.delete(
    '/sessions',
    authMw,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        await deps.revokeAllSessionsUseCase.execute(authReq.user.id);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  );

  return router;
}
