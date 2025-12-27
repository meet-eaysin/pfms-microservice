import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@pfms/utils';

const logger = createLogger('ErrorHandler');

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const statusCode = (err as { statusCode?: number }).statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}
