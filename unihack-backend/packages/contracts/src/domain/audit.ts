/**
 * Audit Log, Analytics, and Configuration Contracts
 * Based on UniHack Backend Spec Sections 43, 48, 51, 133
 */

import { AuditAction } from './enums';

/**
 * Immutable audit trail log for every modification or HITL decision.
 */
export interface AuditLogEntry {
  id?: number;
  productId: string | null;
  jobId: string | null;
  fieldName: string | null;
  generatedValue: string | null;
  sourceSnippet: string | null;
  confidenceScore: number | null;
  validationFlags: string | null;
  reviewer: string;
  action: AuditAction | string;
  previousValue: string | null;
  finalValue: string | null;
  reason: string | null;
  timestamp: string; // ISO-8601
}

/**
 * High-level system quality, accuracy, and SLA metrics.
 */
export interface AnalyticsSummary {
  fieldLevelAccuracy: number | null;
  lovResolutionRate: number | null;
  characterComplianceRate: number | null;
  manufacturerMatchRate: number | null;
  reviewQueueSla: number | null;
  lastUpdatedAt: string | null; // ISO-8601
}

/**
 * Dynamic backend configuration key-value pair.
 */
export interface BackendConfig {
  configKey: string;
  configValue: string | null;
  valueType: string;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
}

/**
 * Transactional Outbox event pattern contract.
 */
export interface OutboxEvent {
  id?: number;
  eventType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  publishedAt: string | null;
  attempts: number;
}
