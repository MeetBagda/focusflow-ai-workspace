/**
 * @fileoverview Defines generic API response types.
 */

/**
 * Interface for a standard successful API response.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: true;
}

/**
 * Interface for a standard error API response.
 */
export interface ApiErrorResponse {
  error: string;
  details?: string;
  success: false;
  statusCode?: number;
}

/**
 * Type for common API parameters, especially for updates where fields can be partial.
 */
export type PartialUpdate<T> = Partial<Omit<T, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

/**
 * Type for a generic paginated response, useful if you implement pagination.
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
