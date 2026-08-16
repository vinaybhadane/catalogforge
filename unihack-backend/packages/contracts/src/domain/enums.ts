/**
 * UniHack Domain Enums and Core String Literals
 * Based on UniHack Technical Architecture Guide & Backend Build Spec (Sections 29, 30, 53)
 */

/**
 * Processing stages for individual items and background batch pipeline jobs.
 */
export type ProcessingStage =
  | 'queued'
  | 'ingested'
  | 'classified'
  | 'retrieval'
  | 'enriched'
  | 'validated'
  | 'published'
  | 'needs_review'
  | 'failed';

export const PROCESSING_STAGES: readonly ProcessingStage[] = [
  'queued',
  'ingested',
  'classified',
  'retrieval',
  'enriched',
  'validated',
  'published',
  'needs_review',
  'failed',
] as const;

/**
 * Final and operational product lifecycle statuses.
 */
export type ProductStatus =
  | 'pending'
  | 'processing'
  | 'validated'
  | 'published'
  | 'pending_review'
  | 'rejected'
  | 'failed';

export const PRODUCT_STATUSES: readonly ProductStatus[] = [
  'pending',
  'processing',
  'validated',
  'published',
  'pending_review',
  'rejected',
  'failed',
] as const;

/**
 * Role-based access control roles.
 */
export type UserRole = 'admin' | 'reviewer' | 'viewer';

export const USER_ROLES: readonly UserRole[] = ['admin', 'reviewer', 'viewer'] as const;

/**
 * Status of a human-in-the-loop review item.
 */
export type ReviewStatus = 'pending' | 'approved' | 'edited' | 'rejected';

export const REVIEW_STATUSES: readonly ReviewStatus[] = [
  'pending',
  'approved',
  'edited',
  'rejected',
] as const;

/**
 * Asset types supported for product attachments and documentation.
 */
export type AssetType =
  | 'image'
  | 'spec_sheet'
  | 'manual'
  | 'sds'
  | 'line_drawing'
  | 'catalog';

export const ASSET_TYPES: readonly AssetType[] = [
  'image',
  'spec_sheet',
  'manual',
  'sds',
  'line_drawing',
  'catalog',
] as const;

/**
 * Audit log action categories.
 */
export type AuditAction =
  | 'create'
  | 'update'
  | 'approve'
  | 'reject'
  | 'override'
  | 'publish'
  | 'system_transition';

export const AUDIT_ACTIONS: readonly AuditAction[] = [
  'create',
  'update',
  'approve',
  'reject',
  'override',
  'publish',
  'system_transition',
] as const;

/**
 * Batch ingestion job status.
 */
export type JobStatus =
  | 'queued'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'partially_completed';

export const JOB_STATUSES: readonly JobStatus[] = [
  'queued',
  'processing',
  'completed',
  'failed',
  'partially_completed',
] as const;

/**
 * Standard API error codes matching Section 53 of Backend Spec.
 */
export type ErrorCode =
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_FILE'
  | 'INVALID_SCHEMA'
  | 'SOURCE_NOT_ALLOWED'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'AI_SERVICE_ERROR'
  | 'SEARCH_SERVICE_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR';

export const ERROR_CODES: readonly ErrorCode[] = [
  'AUTH_REQUIRED',
  'AUTH_INVALID',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_ERROR',
  'INVALID_FILE',
  'INVALID_SCHEMA',
  'SOURCE_NOT_ALLOWED',
  'CONFLICT',
  'RATE_LIMITED',
  'AI_SERVICE_ERROR',
  'SEARCH_SERVICE_ERROR',
  'DATABASE_ERROR',
  'INTERNAL_ERROR',
] as const;
