import { Request, Response, NextFunction } from 'express';
import { createLogger } from '@pfms/utils';

const logger = createLogger('ErrorHandler');

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error('Request error', {
    error: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
  });

  // Handle specific error types
  if (error.message.includes('not found')) {
    res.status(404).json({
      error: 'Not Found',
      message: error.message,
    });
    return;
  }

  if (error.message.includes('validation')) {
    res.status(400).json({
      error: 'Validation Error',
      message: error.message,
    });
    return;
  }

  // Default error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message,
  });
}
