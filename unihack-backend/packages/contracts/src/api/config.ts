/**
 * Configuration REST API Request & Response Contracts
 * Based on UniHack Backend Spec Section 56
 */

/**
 * Upload policy configuration parameters.
 */
export interface UploadConfig {
  allowedExtensions: string[];
  maxFileSizeBytes: number | null;
  maxRowsPerFile: number;
}

/**
 * Review queue routing policy thresholds.
 */
export interface ReviewPolicyConfig {
  confidenceThreshold: number | null;
  autoPublishThreshold: number | null;
  requireHumanReviewOnWarning: boolean;
}

/**
 * UI Field metadata definition for schema-driven form rendering.
 */
export interface FieldDefinition {
  key: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'lov' | 'textarea' | 'array';
  group: 'Basic' | 'Descriptions' | 'Dimensions' | 'Identifiers' | 'Attributes';
  editable: boolean;
  charLimit: number | null;
  required: boolean;
  helpText?: string | null;
}

/**
 * System configuration response payload for GET /api/v1/config.
 */
export interface BackendConfigResponse {
  upload: UploadConfig;
  reviewPolicy: ReviewPolicyConfig;
  fieldsVersion: string;
  features: {
    enableAutoPublish: boolean;
    enableDomainAllowlist: boolean;
    enableStrictLov: boolean;
  };
}
