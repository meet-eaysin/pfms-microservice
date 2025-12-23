/**
 * Base error class for all application errors
 * Provides consistent error structure across the application
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Converts error to JSON format for API responses
   */
  toJSON() {
    const result: {
      error: {
        code: string;
        message: string;
        statusCode: number;
        details?: unknown;
      };
    } = {
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
      },
    };

    if (this.details !== undefined) {
      result.error.details = this.details;
    }

    return result;
  }

  /**
   * Checks if an error is an instance of AppError
   */
  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(400, message, 'VALIDATION_ERROR', details);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized - Authentication required') {
    super(401, message, 'UNAUTHORIZED');
  }
}

/**
 * 403 Forbidden - Insufficient permissions
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden - Insufficient permissions') {
    super(403, message, 'FORBIDDEN');
  }
}

/**
 * 404 Not Found - Resource not found
 */
export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} not found: ${id}` : `${resource} not found`;
    super(404, message, 'NOT_FOUND', { resource, id });
  }
}

/**
 * 409 Conflict - Resource already exists or conflict
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(409, message, 'CONFLICT', details);
  }
}

/**
 * 422 Unprocessable Entity - Business logic validation failed
 */
export class UnprocessableEntityError extends AppError {
  constructor(message: string, details?: unknown) {
    super(422, message, 'UNPROCESSABLE_ENTITY', details);
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded
 */
export class RateLimitError extends AppError {
  constructor(message = 'Too many requests - Rate limit exceeded', retryAfter?: number) {
    super(429, message, 'RATE_LIMIT_EXCEEDED', { retryAfter });
  }
}

/**
 * 500 Internal Server Error - Unexpected server error
 */
export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: unknown) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details);
  }
}

/**
 * 503 Service Unavailable - Service temporarily unavailable
 */
export class ServiceUnavailableError extends AppError {
  constructor(message = 'Service temporarily unavailable', retryAfter?: number) {
    super(503, message, 'SERVICE_UNAVAILABLE', { retryAfter });
  }
}

/**
 * Database-specific errors
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(500, message, 'DATABASE_ERROR', details);
  }
}

/**
 * External service errors
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, details?: Record<string, unknown>) {
    const errorDetails = details ? { service, ...details } : { service };
    super(
      502,
      `External service error: ${service} - ${message}`,
      'EXTERNAL_SERVICE_ERROR',
      errorDetails
    );
  }
}

/**
 * Error handler utility for Express/NestJS
 */
export function formatError(error: unknown): {
  statusCode: number;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
} {
  if (AppError.isAppError(error)) {
    const result: {
      statusCode: number;
      error: {
        code: string;
        message: string;
        details?: unknown;
      };
    } = {
      statusCode: error.statusCode,
      error: {
        code: error.code,
        message: error.message,
      },
    };

    if (error.details !== undefined) {
      result.error.details = error.details;
    }

    return result;
  }

  // Handle unknown errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return {
    statusCode: 500,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message,
    },
  };
}

/**
 * Async error wrapper for Express route handlers
 */
export function asyncHandler<T>(
  fn: (req: any, res: any, next: any) => Promise<T>
): (req: any, res: any, next: any) => void {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
