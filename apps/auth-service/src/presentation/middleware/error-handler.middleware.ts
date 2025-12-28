import type { Request, Response, NextFunction } from 'express';
import { createLogger } from '@pfms/utils';

const logger = createLogger('ErrorHandler');

interface IErrorWithStatusCode extends Error {
  statusCode?: number;
}

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

  const errorWithStatus = err as IErrorWithStatusCode;
  const statusCode = errorWithStatus.statusCode ?? 500;
  const message =
    err.message.length > 0 ? err.message : 'Internal server error';

  res.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
}
