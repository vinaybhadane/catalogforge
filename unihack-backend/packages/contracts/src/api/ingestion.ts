/**
 * Ingestion and Pre-flight REST API Request & Response Contracts
 * Based on UniHack Backend Spec Sections 58-63
 */

import { JobStatus, ProcessingStage } from '../domain/enums';
import { ProcessingJob, RawInputRecord } from '../domain/job';
import { PaginatedResponse, PaginationQuery } from './common';

/**
 * Pre-flight schema validation analysis report.
 */
export interface PreflightSchemaReport {
  valid: boolean;
  detectedColumns: string[];
  missingColumns: string[];
  extraColumns: string[];
}

/**
 * Pre-flight placeholder string scan results.
 */
export interface PreflightPlaceholderFlag {
  rowNumber: number;
  columnName: string;
  originalValue: string;
  cleanedValue: null;
  reason: string;
}

export interface PreflightPlaceholderReport {
  completed: boolean;
  affectedRows: number;
  totalPlaceholdersFound: number;
  flags: PreflightPlaceholderFlag[];
}

/**
 * Comprehensive pre-flight scan response.
 */
export interface PreflightReport {
  jobId: string;
  status: 'pending' | 'completed' | 'failed';
  fileName: string | null;
  rowCount: number;
  schema: PreflightSchemaReport;
  placeholderScan: PreflightPlaceholderReport;
  warnings: string[];
  errors: string[];
  createdAt: string;
}

/**
 * Response for POST /api/v1/ingestion/uploads
 */
export interface IngestionUploadResponse {
  jobId: string;
  status: JobStatus | string;
  stage: ProcessingStage | string;
  fileName: string;
  rowCount?: number;
}

/**
 * Request payload for POST /api/v1/ingestion/url
 */
export interface UrlIngestionRequest {
  url: string;
  partNumber?: string | null;
  manufacturer?: string | null;
}

/**
 * Response for POST /api/v1/ingestion/url
 */
export interface UrlIngestionResponse {
  jobId: string;
  status: JobStatus | string;
  stage: ProcessingStage | string;
  sourceUrl: string;
}

/**
 * Query filters for GET /api/v1/ingestion/jobs
 */
export interface IngestionJobFilterQuery extends PaginationQuery {
  status?: JobStatus;
  stage?: ProcessingStage;
  search?: string;
  submittedBy?: string;
  from?: string;
  to?: string;
}

/**
 * Paginated list of ingestion batch jobs.
 */
export type IngestionJobListResponse = PaginatedResponse<ProcessingJob>;

/**
 * Pipeline stage progress item.
 */
export interface PipelineStageProgress {
  stage: ProcessingStage | string;
  status: 'pending' | 'in_progress' | 'complete' | 'failed';
  startedAt?: string | null;
  completedAt?: string | null;
}

/**
 * Detailed ingestion job state with progress metrics.
 */
export interface IngestionJobDetailResponse {
  jobId: string;
  fileName: string | null;
  sourceType: string | null;
  rowCount: number | null;
  processedRows: number;
  publishedRows: number;
  reviewRows: number;
  failedRows: number;
  status: JobStatus | string;
  stage: ProcessingStage | string | null;
  progress: number;
  submittedBy: string;
  submittedAt: string;
  completedAt: string | null;
  updatedAt: string;
  pipeline: PipelineStageProgress[];
  preflight?: PreflightReport | null;
}

/**
 * Per-row processing status item.
 */
export interface IngestionRowItem {
  rowId: number;
  jobId: string;
  partNumber: string | null;
  partDesc: string | null;
  manufacturer: string | null;
  stage: ProcessingStage | string;
  status: string;
  rowConfidence: number | null;
  validationFlags: string[];
  rawInput: RawInputRecord;
}

/**
 * Paginated rows response for GET /api/v1/ingestion/jobs/:jobId/rows
 */
export type IngestionJobRowsResponse = PaginatedResponse<IngestionRowItem>;
