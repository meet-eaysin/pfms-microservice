/**
 * Common Type Definitions
 * Shared across all services
 */

export type UUID = string & { readonly __brand: 'UUID' };
export type Currency = 'USD' | 'EUR' | 'GBP' | 'BDT' | 'INR' | string;
export type Language = 'en' | 'bn' | 'hi' | 'es' | 'fr';
export type Timezone = string;

/**
 * Pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * API Response
 */
export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  timestamp: string;
}

/**
 * Service Status
 */
export type ServiceStatus = 'up' | 'down' | 'degraded' | 'maintenance';

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  uptime: number;
  timestamp: string;
  checks: {
    database?: boolean;
    cache?: boolean;
    messageQueue?: boolean;
  };
}

/**
 * Metadata
 */
export interface RequestMetadata {
  correlationId: string;
  userId?: UUID;
  timestamp: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface AuditLog {
  id: UUID;
  userId: UUID;
  action: string;
  entity: string;
  entityId: UUID;
  oldValue?: Record<string, any>;
  newValue: Record<string, any>;
  timestamp: string;
  metadata?: Record<string, any>;
}

// Error Types - Moved to @packages/errors
// AppError, ValidationError, etc. are now imported from @pfms/errors

// Enum Types - Moved to src/enums
// UserRole, ExchangeType, Status are now imported from ./enums

/**
 * Date/Time Utilities
 */
export type ISODateString = string & { readonly __brand: 'ISODateString' };

export function toISODate(date: Date): ISODateString {
  return date.toISOString() as ISODateString;
}

export function parseISODate(dateStr: string): Date {
  return new Date(dateStr);
}

/**
 * Financial Types
 */
export type Decimal = number;
export type Percentage = number; // 0-100

export interface Money {
  amount: Decimal;
  currency: Currency;
}

/**
 * Filter/Sort
 */
export interface SortParam {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterParam {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains';
  value: any;
}
