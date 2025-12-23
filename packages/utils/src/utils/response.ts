export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: any;
  timestamp: string;
}

import { PaginationMeta } from './pagination';

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

export class ResponseUtil {
  /**
   * Create success response
   */
  static success<T>(data: T, message?: string, meta?: Record<string, any>): ApiResponse<T> {
    return {
      success: true,
      message: message || 'Operation successful',
      data,
      meta,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create error response
   */
  static error(code: string, message: string, details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create paginated response
   */
  static paginated<T>(
    data: T[],
    currentPage: number,
    itemsPerPage: number,
    totalItems: number,
    message?: string
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    return {
      success: true,
      message: message || 'Data retrieved successfully',
      data,
      meta: {
        currentPage,
        itemsPerPage,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create created response (201)
   */
  static created<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      message: message || 'Resource created successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create updated response
   */
  static updated<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      message: message || 'Resource updated successfully',
      data,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create deleted response
   */
  static deleted(message?: string): ApiResponse {
    return {
      success: true,
      message: message || 'Resource deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create validation error response
   */
  static validationError(errors: Record<string, string | string[]>, message?: string): ApiResponse {
    return {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: message || 'Validation failed',
        details: errors,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create conflict response (409)
   */
  static conflict(message: string, code?: string): ApiResponse {
    return {
      success: false,
      error: {
        code: code || 'CONFLICT',
        message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create unauthorized response (401)
   */
  static unauthorized(message: string = 'Unauthorized access'): ApiResponse {
    return {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create forbidden response (403)
   */
  static forbidden(message: string = 'Forbidden'): ApiResponse {
    return {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create not found response (404)
   */
  static notFound(message: string = 'Resource not found'): ApiResponse {
    return {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Create server error response (500)
   */
  static serverError(message: string = 'Internal server error', details?: any): ApiResponse {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
