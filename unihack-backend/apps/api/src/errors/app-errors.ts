/**
 * Application Domain Error Classes
 * Mapped to standard ErrorCode enums and HTTP status codes
 */

import { ErrorCode } from '@unihack/contracts';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly details: Record<string, unknown> | unknown[] | null;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message: string,
    details: Record<string, unknown> | unknown[] | null = null,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required to access this resource.', code: ErrorCode = 'AUTH_REQUIRED', details: Record<string, unknown> | null = null) {
    super(401, code, message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.', details: Record<string, unknown> | null = null) {
    super(403, 'FORBIDDEN', message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource', id?: string | number) {
    const msg = id ? `${resource} with id '${id}' was not found.` : `${resource} was not found.`;
    super(404, 'NOT_FOUND', msg, id ? { resource, id } : null);
  }
}

export class ValidationError extends AppError {
  constructor(message = 'Validation failed for the supplied input.', details: Record<string, unknown> | unknown[] | null = null) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'A resource conflict occurred.', details: Record<string, unknown> | null = null) {
    super(409, 'CONFLICT', message, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'A database operation failed.', details: Record<string, unknown> | null = null) {
    super(500, 'DATABASE_ERROR', message, details);
  }
}

export class InternalError extends AppError {
  constructor(message = 'An unexpected internal error occurred.', details: Record<string, unknown> | null = null) {
    super(500, 'INTERNAL_ERROR', message, details);
  }
}
