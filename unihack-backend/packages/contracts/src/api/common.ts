/**
 * Common REST API Request & Response Contracts
 * Based on UniHack Backend Spec Sections 52-54
 */

import { ErrorCode } from '../domain/enums';

/**
 * Standard paginated collection envelope.
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number | null;
  totalPages: number | null;
}

/**
 * Standard query parameters for pagination and sorting.
 */
export interface PaginationQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Granular error description item.
 */
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
  [key: string]: unknown;
}

/**
 * Unified API error response payload according to Section 53.
 */
export interface ApiErrorResponse {
  error: {
    code: ErrorCode | string;
    message: string;
    details?: Record<string, unknown> | ApiErrorDetail[] | null;
    requestId: string;
  };
}

/**
 * Basic health endpoint response.
 */
export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  service: string;
  version: string;
  timestamp: string; // ISO-8601
}

/**
 * Dependency health detail component.
 */
export interface DependencyStatus {
  status: 'healthy' | 'unhealthy';
  latencyMs?: number;
  message?: string;
}

/**
 * Comprehensive health report for internal / admin operations.
 */
export interface DependencyHealthResponse extends HealthResponse {
  dependencies: {
    azureSql: DependencyStatus;
    [key: string]: DependencyStatus;
  };
}
