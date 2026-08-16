/**
 * Global Error Handler Middleware
 * Normalizes all uncaught errors and validation failures into standard ApiErrorResponse
 */

import { ApiErrorResponse } from '@unihack/contracts';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-errors';

export const globalErrorHandler = (
  error: FastifyError | AppError | Error,
  request: FastifyRequest,
  reply: FastifyReply,
): void => {
  const requestId = request.id || 'unknown';

  // 1. Custom Application Domain Errors
  if (error instanceof AppError) {
    const response: ApiErrorResponse = {
      error: {
        code: error.code,
        message: error.message,
        details: (error.details as Record<string, unknown> | null) ?? null,
        requestId,
      },
    };
    reply.status(error.statusCode).send(response);
    return;
  }

  // 2. Zod Schema Validation Errors
  if (error instanceof ZodError) {
    const formattedDetails = error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));

    const response: ApiErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'The request payload failed schema validation.',
        details: { issues: formattedDetails },
        requestId,
      },
    };
    reply.status(400).send(response);
    return;
  }

  // 3. Fastify Validation Errors (AJV / Fastify Schemas)
  if ('validation' in error && error.validation) {
    const response: ApiErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message || 'Request validation failed.',
        details: { validation: error.validation },
        requestId,
      },
    };
    reply.status(400).send(response);
    return;
  }

  // 4. Fallback Unexpected / Internal Server Errors
  request.log.error(error, `Unhandled error on ${request.method} ${request.url}`);

  const statusCode = (error as FastifyError).statusCode || 500;
  const isProd = process.env['NODE_ENV'] === 'production';

  const response: ApiErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: isProd ? 'An unexpected server error occurred.' : error.message,
      details: isProd ? null : { stack: error.stack },
      requestId,
    },
  };

  reply.status(statusCode).send(response);
};
