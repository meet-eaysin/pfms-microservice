export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

export class PaginationUtil {
  /**
   * Calculate pagination offset
   */
  static getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  /**
   * Create pagination metadata
   */
  static createMeta(page: number, limit: number, totalItems: number): PaginationMeta {
    const totalPages = Math.ceil(totalItems / limit);

    return {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Create paginated result
   */
  static createResult<T>(
    data: T[],
    page: number,
    limit: number,
    totalItems: number
  ): PaginatedResult<T> {
    return {
      data,
      meta: this.createMeta(page, limit, totalItems),
    };
  }

  /**
   * Validate pagination parameters
   */
  static validateParams(params: Partial<PaginationParams>): PaginationParams {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 10));

    return {
      page,
      limit,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder || 'desc',
    };
  }

  /**
   * Calculate pagination details
   */
  static calculatePagination(totalItems: number, page: number = 1, limit: number = 10) {
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      total: totalItems,
      pages: totalPages,
      offset,
    };
  }
}
