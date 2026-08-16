/**
 * Authentication Route Schemas
 * Schemas for GET /api/v1/auth/me and user context
 */

import { ApiErrorResponseSchema } from './common.schemas';

export const CurrentUserResponseSchema = {
  $id: 'CurrentUserResponse',
  type: 'object',
  required: ['uid', 'role', 'email', 'displayName'],
  properties: {
    uid: { type: 'string', example: 'fb_user_123456789' },
    role: { type: 'string', enum: ['admin', 'reviewer', 'viewer'], example: 'reviewer' },
    email: { type: 'string', nullable: true, example: 'reviewer@unihack.example.com' },
    displayName: { type: 'string', nullable: true, example: 'Lead Product Reviewer' },
  },
} as const;

export const GetCurrentUserRouteSchema = {
  description: 'Get current authenticated user identity and RBAC role',
  tags: ['Auth'],
  summary: 'Current User Profile',
  security: [{ bearerAuth: [] }],
  response: {
    200: CurrentUserResponseSchema,
    401: ApiErrorResponseSchema,
    500: ApiErrorResponseSchema,
  },
} as const;
