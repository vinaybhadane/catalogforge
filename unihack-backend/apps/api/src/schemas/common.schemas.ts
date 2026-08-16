/**
 * Common Fastify JSON / Swagger Schemas
 * Standard schema definitions for errors, health, and pagination
 */

export const ApiErrorResponseSchema = {
  $id: 'ApiErrorResponse',
  type: 'object',
  required: ['error'],
  properties: {
    error: {
      type: 'object',
      required: ['code', 'message', 'requestId'],
      properties: {
        code: { type: 'string', example: 'VALIDATION_ERROR' },
        message: { type: 'string', example: 'Invalid request parameters' },
        details: {
          type: 'object',
          nullable: true,
          additionalProperties: true,
        },
        requestId: { type: 'string', example: 'd3b07384-d113-494d-91b5-5c0245a4a3bc' },
      },
    },
  },
} as const;

export const HealthResponseSchema = {
  $id: 'HealthResponse',
  type: 'object',
  required: ['status', 'service', 'version', 'timestamp'],
  properties: {
    status: { type: 'string', enum: ['ok', 'degraded', 'error'], example: 'ok' },
    service: { type: 'string', example: 'unihack-api' },
    version: { type: 'string', example: '1.0.0' },
    timestamp: { type: 'string', format: 'date-time', example: '2026-08-16T12:00:00.000Z' },
  },
} as const;

export const DependencyHealthResponseSchema = {
  $id: 'DependencyHealthResponse',
  type: 'object',
  required: ['status', 'service', 'version', 'timestamp', 'dependencies'],
  properties: {
    status: { type: 'string', enum: ['ok', 'degraded', 'error'], example: 'ok' },
    service: { type: 'string', example: 'unihack-api' },
    version: { type: 'string', example: '1.0.0' },
    timestamp: { type: 'string', format: 'date-time', example: '2026-08-16T12:00:00.000Z' },
    dependencies: {
      type: 'object',
      required: ['azureSql'],
      properties: {
        azureSql: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['healthy', 'unhealthy'], example: 'healthy' },
            latencyMs: { type: 'number', example: 12 },
            message: { type: 'string', nullable: true },
          },
        },
      },
      additionalProperties: true,
    },
  },
} as const;
