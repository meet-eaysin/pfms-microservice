import type { Router, Request, Response, NextFunction } from 'express';
import { Router as ExpressRouter } from 'express';
import { parseISO } from '@pfms/date';
import type { GetProfileUseCase } from '@/application/use-cases/profile/get-profile.use-case';
import type { UpdateProfileUseCase } from '@/application/use-cases/profile/update-profile.use-case';
import type { UploadAvatarUseCase } from '@/application/use-cases/profile/upload-avatar.use-case';
import {
  authMiddleware,
  type IAuthenticatedRequest,
} from '@/presentation/middleware/auth.middleware';
import { validateBody } from '@/presentation/middleware/validation.middleware';
import { uploadSingle, handleMulterError } from '@/presentation/middleware/file-upload.middleware';
import { UpdateProfileDto } from '@/application/dto/user.dto';

interface IProfileRouterDeps {
  getProfileUseCase: GetProfileUseCase;
  updateProfileUseCase: UpdateProfileUseCase;
  uploadAvatarUseCase: UploadAvatarUseCase;
}

export function createProfileRouter(deps: IProfileRouterDeps): Router {
  const router = ExpressRouter();

  // Get profile
  router.get(
    '/',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const profile = await deps.getProfileUseCase.execute(authReq.user.id);

        if (profile === null) {
          res.status(404).json({ statusCode: 404, message: 'Profile not found' });
          return;
        }

        res.json(profile);
      } catch (error) {
        next(error);
      }
    }
  );

  // Update profile
  router.put(
    '/',
    authMiddleware,
    validateBody(UpdateProfileDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const dto = req.body as UpdateProfileDto;

        // Convert date string to Date if provided
        const updates = {
          ...dto,
          dateOfBirth: dto.dateOfBirth !== undefined ? parseISO(dto.dateOfBirth) : undefined,
        };

        const updated = await deps.updateProfileUseCase.execute({
          userId: authReq.user.id,
          updates,
        });

        res.json(updated);
      } catch (error) {
        next(error);
      }
    }
  );

  // Upload avatar
  router.post(
    '/avatar',
    authMiddleware,
    uploadSingle,
    handleMulterError,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (req.file === undefined) {
          res.status(400).json({ statusCode: 400, message: 'No file uploaded' });
          return;
        }

        const authReq = req as IAuthenticatedRequest;
        const url = await deps.uploadAvatarUseCase.execute({
          userId: authReq.user.id,
          file: req.file.buffer,
          mimetype: req.file.mimetype,
        });

        res.json({ url });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
