import type { Request, Response, NextFunction } from 'express';

export interface IAuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

// Simple auth middleware - in production, this would verify JWT from auth-service
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      statusCode: 401,
      message: 'Unauthorized - No token provided',
    });
    return;
  }

  // TODO: Verify token with auth-service
  // For now, we'll extract userId from a mock token
  const token = authHeader.substring(7);

  // Mock user extraction (in production, decode and verify JWT)
  (req as IAuthenticatedRequest).user = {
    id: token, // Temporary: using token as userId
    email: 'user@example.com',
  };

  next();
}
