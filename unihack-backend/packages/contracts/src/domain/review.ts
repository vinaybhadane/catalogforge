/**
 * Review Domain Models & Contracts (HITL)
 * Based on UniHack Backend Spec Sections 25-28, 45-46, 129-131
 */

import { ReviewStatus } from './enums';
import { EvidenceReference } from './product';

/**
 * List of Values (LOV) candidate match with confidence ranking.
 */
export interface LovMatch {
  value: string;
  score: number | null;
  selected: boolean;
}

/**
 * Single field under review with original generated value, confidence, and validation flags.
 */
export interface ReviewField {
  id?: number | string;
  reviewId?: string;
  fieldName: string;
  label?: string;
  generatedValue: string | null;
  confidence: number | null;
  validationFlags: string[];
  evidenceId: number | string | null;
  evidence: EvidenceReference | null;
  lovMatches: LovMatch[];
  editable: boolean;
  selectedLovValue: string | null;
}

/**
 * Human-in-the-Loop review item for a product failing confidence or validation checks.
 */
export interface ReviewItem {
  reviewId: string;
  productId: string;
  status: ReviewStatus;
  reason: string | null;
  rowConfidence: number | null;
  assignedTo: string | null;
  fields: ReviewField[];
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  resolvedAt: string | null; // ISO-8601
}
