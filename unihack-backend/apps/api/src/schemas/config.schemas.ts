/**
 * Fastify Schemas for Configuration Route
 */

import { ApiErrorResponseSchema } from './common.schemas';

export const BackendConfigResponseSchema = {
  $id: 'BackendConfigResponse',
  type: 'object',
  required: ['upload', 'reviewPolicy', 'fieldsVersion', 'features'],
  properties: {
    upload: {
      type: 'object',
      required: ['allowedExtensions', 'maxRowsPerFile'],
      properties: {
        allowedExtensions: { type: 'array', items: { type: 'string' } },
        maxFileSizeBytes: { type: 'number', nullable: true },
        maxRowsPerFile: { type: 'number' },
      },
    },
    reviewPolicy: {
      type: 'object',
      properties: {
        confidenceThreshold: { type: 'number', nullable: true },
        autoPublishThreshold: { type: 'number', nullable: true },
        requireHumanReviewOnWarning: { type: 'boolean' },
      },
    },
    fieldsVersion: { type: 'string' },
    features: {
      type: 'object',
      properties: {
        enableAutoPublish: { type: 'boolean' },
        enableDomainAllowlist: { type: 'boolean' },
        enableStrictLov: { type: 'boolean' },
      },
    },
  },
} as const;

export const GetConfigRouteSchema = {
  description: 'Get system policy configuration and upload limits',
  tags: ['Config'],
  summary: 'System Configuration',
  response: {
    200: BackendConfigResponseSchema,
    500: ApiErrorResponseSchema,
  },
} as const;
