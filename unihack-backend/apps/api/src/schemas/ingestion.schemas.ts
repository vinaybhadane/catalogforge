/**
 * Fastify Schemas for Ingestion Routes
 */

import { ApiErrorResponseSchema } from './common.schemas';

export const IngestionUploadResponseSchema = {
  $id: 'IngestionUploadResponse',
  type: 'object',
  required: ['jobId', 'status', 'stage', 'fileName'],
  properties: {
    jobId: { type: 'string', format: 'uuid' },
    status: { type: 'string' },
    stage: { type: 'string' },
    fileName: { type: 'string' },
    rowCount: { type: 'number', nullable: true },
  },
} as const;

export const PreflightReportSchema = {
  $id: 'PreflightReport',
  type: 'object',
  required: ['jobId', 'status', 'rowCount', 'schema', 'placeholderScan'],
  properties: {
    jobId: { type: 'string', format: 'uuid' },
    status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
    fileName: { type: 'string', nullable: true },
    rowCount: { type: 'number' },
    schema: {
      type: 'object',
      required: ['valid', 'detectedColumns', 'missingColumns', 'extraColumns'],
      properties: {
        valid: { type: 'boolean' },
        detectedColumns: { type: 'array', items: { type: 'string' } },
        missingColumns: { type: 'array', items: { type: 'string' } },
        extraColumns: { type: 'array', items: { type: 'string' } },
      },
    },
    placeholderScan: {
      type: 'object',
      required: ['completed', 'affectedRows', 'totalPlaceholdersFound', 'flags'],
      properties: {
        completed: { type: 'boolean' },
        affectedRows: { type: 'number' },
        totalPlaceholdersFound: { type: 'number' },
        flags: {
          type: 'array',
          items: {
            type: 'object',
            required: ['rowNumber', 'columnName', 'originalValue', 'cleanedValue', 'reason'],
            properties: {
              rowNumber: { type: 'number' },
              columnName: { type: 'string' },
              originalValue: { type: 'string' },
              cleanedValue: { type: 'null' },
              reason: { type: 'string' },
            },
          },
        },
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
    errors: { type: 'array', items: { type: 'string' } },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const IngestionJobDetailSchema = {
  $id: 'IngestionJobDetail',
  type: 'object',
  required: ['jobId', 'status', 'stage', 'submittedBy', 'submittedAt'],
  properties: {
    jobId: { type: 'string', format: 'uuid' },
    fileName: { type: 'string', nullable: true },
    sourceType: { type: 'string', nullable: true },
    rowCount: { type: 'number', nullable: true },
    processedRows: { type: 'number' },
    publishedRows: { type: 'number' },
    reviewRows: { type: 'number' },
    failedRows: { type: 'number' },
    status: { type: 'string' },
    stage: { type: 'string', nullable: true },
    progress: { type: 'number' },
    submittedBy: { type: 'string' },
    submittedAt: { type: 'string', format: 'date-time' },
    completedAt: { type: 'string', format: 'date-time', nullable: true },
    updatedAt: { type: 'string', format: 'date-time' },
    pipeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stage: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
    preflight: { type: 'object', nullable: true, additionalProperties: true },
  },
} as const;

export const UploadRouteSchema = {
  description: 'Upload product spreadsheet (CSV / XLSX) for ingestion and preflight scan',
  tags: ['Ingestion'],
  summary: 'Upload Product Spreadsheet',
  security: [{ bearerAuth: [] }],
  consumes: ['multipart/form-data'],
  response: {
    201: IngestionUploadResponseSchema,
    400: ApiErrorResponseSchema,
    401: ApiErrorResponseSchema,
  },
} as const;
