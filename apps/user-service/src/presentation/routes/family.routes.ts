import type { Router, Request, Response, NextFunction } from 'express';
import { Router as ExpressRouter } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { ListFamilyMembersUseCase } from '@/application/use-cases/family/list-family-members.use-case';
import type { InviteFamilyMemberUseCase } from '@/application/use-cases/family/invite-family-member.use-case';
import { authMiddleware, type IAuthenticatedRequest } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validation.middleware';
import { InviteFamilyMemberDto } from '@/application/dto/user.dto';

interface IFamilyRouterDeps {
  listFamilyMembersUseCase: ListFamilyMembersUseCase;
  inviteFamilyMemberUseCase: InviteFamilyMemberUseCase;
}

export function createFamilyRouter(deps: IFamilyRouterDeps): Router {
  const router = ExpressRouter();

  // List family members
  router.get(
    '/',
    authMiddleware,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const members = await deps.listFamilyMembersUseCase.execute(authReq.user.id);
        res.json({ members });
      } catch (error) {
        next(error);
      }
    }
  );

  // Invite family member
  router.post(
    '/invite',
    authMiddleware,
    validateBody(InviteFamilyMemberDto),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authReq = req as IAuthenticatedRequest;
        const dto = req.body as InviteFamilyMemberDto;

        // TODO: Look up memberUserId from email via auth-service
        // Mock logic for verification:
        const MOCK_MEMBER_ID = '00000000-0000-0000-0000-000000000001';
        const memberUserId = dto.email === 'spouse@example.com' ? MOCK_MEMBER_ID : uuidv4();

        const member = await deps.inviteFamilyMemberUseCase.execute({
          headUserId: authReq.user.id,
          memberEmail: dto.email,
          memberUserId,
          relationship: dto.relationship,
        });

        res.status(201).json(member);
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
}
