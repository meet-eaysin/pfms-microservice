import type { Router, Request, Response, NextFunction } from 'express';
import { Router as ExpressRouter } from 'express';
import type { GetFinancialPreferencesUseCase } from '../../../application/use-cases/preferences/get-financial-preferences.use-case';
import type { UpdateFinancialPreferencesUseCase } from '../../../application/use-cases/preferences/update-financial-preferences.use-case';
import type { GetNotificationSettingsUseCase } from '../../../application/use-cases/preferences/get-notification-settings.use-case';
import type { UpdateNotificationSettingsUseCase } from '../../../application/use-cases/preferences/update-notification-settings.use-case';
import { authMiddleware, type IAuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import {
  UpdateFinancialPreferencesDto,
  UpdateNotificationSettingsDto,
} from '../../../application/dto/user.dto';

interface IPreferencesRouterDeps {
  getFinancialPreferencesUseCase: GetFinancialPreferencesUseCase;
  updateFinancialPreferencesUseCase: UpdateFinancialPreferencesUseCase;
  getNotificationSettingsUseCase: GetNotificationSettingsUseCase;
  updateNotificationSettingsUseCase: UpdateNotificationSettingsUseCase;
}

export function createPreferencesRouter(deps: IPreferencesRouterDeps): Router {
  const router = ExpressRouter();

  // Get financial preferences
  router.get(
    '/financial',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const prefs = await deps.getFinancialPreferencesUseCase.execute(authReq.user.id);

        if (prefs === null) {
          res.status(404).json({ statusCode: 404, message: 'Preferences not found' });
          return;
        }

        res.json(prefs);
      } catch (error) {
        next(error);
      }
    }
  );

  // Update financial preferences
  router.put(
    '/financial',
    authMiddleware,
    validateBody(UpdateFinancialPreferencesDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const dto = req.body as UpdateFinancialPreferencesDto;

        // Convert date string to Date if provided
        const updates = {
          ...dto,
          fiscalYearStart:
            dto.fiscalYearStart !== undefined ? new Date(dto.fiscalYearStart) : undefined,
        };

        const updated = await deps.updateFinancialPreferencesUseCase.execute({
          userId: authReq.user.id,
          updates,
        });

        res.json(updated);
      } catch (error) {
        next(error);
      }
    }
  );

  // Get notification settings
  router.get(
    '/notifications',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const settings = await deps.getNotificationSettingsUseCase.execute(authReq.user.id);

        if (settings === null) {
          res.status(404).json({ statusCode: 404, message: 'Notification settings not found' });
          return;
        }

        res.json(settings);
      } catch (error) {
        next(error);
      }
    }
  );

  // Update notification settings
  router.put(
    '/notifications',
    authMiddleware,
    validateBody(UpdateNotificationSettingsDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const dto = req.body as UpdateNotificationSettingsDto;

        const updated = await deps.updateNotificationSettingsUseCase.execute({
          userId: authReq.user.id,
          updates: dto,
        });

        res.json(updated);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
