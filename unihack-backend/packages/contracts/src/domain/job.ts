/**
 * Ingestion Job and Stage Execution Contracts
 * Based on UniHack Backend Spec Sections 37, 42, 47, 132
 */

import { JobStatus, ProcessingStage } from './enums';

/**
 * Ingestion batch job lifecycle tracking entity.
 */
export interface ProcessingJob {
  jobId: string;
  fileName: string | null;
  sourceType: string | null;
  rowCount: number | null;
  processedRows: number;
  publishedRows: number;
  reviewRows: number;
  failedRows: number;
  status: JobStatus | string;
  stage: ProcessingStage | null;
  progress: number | null;
  submittedBy: string;
  submittedAt: string; // ISO-8601
  completedAt: string | null; // ISO-8601
  updatedAt: string; // ISO-8601
}

/**
 * Execution record for a single stage attempt of a row or job.
 */
export interface StageExecution {
  id: number;
  jobId: string;
  rowId: number | null;
  stage: ProcessingStage | string;
  attempt: number;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  startedAt: string | null; // ISO-8601
  completedAt: string | null; // ISO-8601
}

/**
 * 11-column raw input row as ingested before normalization.
 */
export interface RawInputRecord {
  id: number;
  jobId: string;
  partNumber: string | null;
  dept: string | null;
  class: string | null;
  fine: string | null;
  skuMyPartNumber: string | null;
  mfgPartNum: string | null;
  partDesc: string | null;
  e1Brand: string | null;
  unilogBrand: string | null;
  dibBrand: string | null;
  partManuf: string | null;
  ingestedAt: string;
}
