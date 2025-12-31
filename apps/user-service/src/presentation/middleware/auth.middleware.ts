import type { Request, Response, NextFunction } from 'express';

export interface IAuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

// Simple auth middleware - in production, this would verify JWT from auth-service
// Auth middleware - Trusts that API Gateway has already verified the token signature
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (authHeader === undefined || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      statusCode: 401,
      message: 'Unauthorized - No token provided',
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    // Basic JWT decode (Gateway already verified signature)
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      throw new Error('Invalid token format');
    }
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf-8');
    const payload = JSON.parse(jsonPayload);

    (req as IAuthenticatedRequest).user = {
      id: payload.sub || payload.userId || payload.id, // Fallback for different claim names
      email: payload.email || '',
    };

    // Add Kong-injected headers if available for extra security/context
    if (req.headers['x-consumer-username']) {
      // Only if we want to rely on Kong Consumer mapping
    }

    next();
  } catch (error) {
    res.status(401).json({
      statusCode: 401,
      message: 'Unauthorized - Invalid token format',
    });
  }
}
