import type { User, Session } from '../../domain/entities/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: Session;
    }
  }
}
