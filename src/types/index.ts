/**
 * Strict TypeScript Domain Models for CatalogForge
 * Based strictly on UniHack Build Specification Sections 45–52.
 */

// Section 47: Evidence Model
export interface EvidenceReference {
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceSnippet: string | null;
  sourceSpan: string | null;
}

// Section 46: Attribute Model
export interface ProductAttribute {
  id?: number | string;
  sequence: number;
  attributeLabel: string;
  attributeValue: string | null;
  attributeUom: string | null;
  confidence?: number | null;
  confidenceScore?: number | null;
  lovMatchConfidence?: number | null;
  validationFlags: string[];
  source?: EvidenceReference | null;
}

export interface ProductDescriptions {
  shortDescription: string | null;
  longDescription: string | null;
  bulletPoints: string[];
  mobileDescription?: string | null;
  invoiceDescription?: string | null;
  retailDescription?: string | null;
  marketingDescription?: string | null;
}

export interface ProductFeature {
  id?: number | string;
  featureId?: string;
  featureText: string;
  sequence: number;
}

export interface ProductDimensions {
  length?: number | null;
  lengthUom?: string | null;
  height: number | null;
  heightUom?: string | null;
  width: number | null;
  widthUom?: string | null;
  depth?: number | null;
  weight: number | null;
  weightUom?: string | null;
  unitOfMeasure?: string | null;
}

export type ProductAssetType = "image" | "manual" | "sds" | "drawing" | "catalog" | "spec_sheet";

export interface ProductAsset {
  id?: number | string;
  assetId?: string;
  assetType: ProductAssetType | string;
  assetUrl?: string;
  blobUrl?: string | null;
  sourceUrl?: string | null;
  fileName?: string | null;
  title?: string | null;
}

export type ProductStatus =
  | "ingested"
  | "classified"
  | "enriched"
  | "validated"
  | "published"
  | "needs_review"
  | "failed";

// Section 45: Product Domain Model
export interface Product {
  productId: string;
  rawInputId?: string | number | null;
  partNumber: string;
  manufacturerName: string | null;
  brandName: string | null;
  manufacturerPartNumber: string | null;
  classpath: string | null;
  unspsc: string | null;

  descriptions: ProductDescriptions;
  attributes: ProductAttribute[];
  features: ProductFeature[];
  dimensions: ProductDimensions | null;
  assets: ProductAsset[];

  confidence?: number | null;
  rowConfidence?: number | null;
  status: ProductStatus;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetailResponse {
  product: Product;
}

// Section 49: LOV Match Model
export interface LovMatch {
  value: string;
  score: number | null;
  selected: boolean;
}

export type ReviewStatus = "pending" | "approved" | "edited" | "rejected";

export interface ReviewField {
  fieldName: string;
  label: string;
  generatedValue: string | null;
  confidence: number | null;
  validationFlags: string[];
  evidence: EvidenceReference | null;
  lovMatches: LovMatch[];
  editable: boolean;
}

// Section 48: Review Model
export interface ReviewItem {
  reviewId: string;
  productId: string;
  status: ReviewStatus;
  rowConfidence: number | null;
  fields: ReviewField[];
}

// Section 50: Job Model
export type ProcessingStage =
  | "queued"
  | "ingested"
  | "classified"
  | "enriched"
  | "validated"
  | "published"
  | "needs_review"
  | "failed";

export interface ProcessingJob {
  jobId: string;
  fileName: string | null;
  rowCount: number | null;
  status: string;
  stage: ProcessingStage | null;
  progress: number | null;
  submittedAt: string;
  completedAt: string | null;
}

// Section 51: Analytics Model
export interface AnalyticsSummary {
  fieldLevelAccuracy: number | null;
  lovResolutionRate: number | null;
  characterComplianceRate: number | null;
  manufacturerMatchRate: number | null;
  reviewQueueSla: number | null;
  lastUpdatedAt: string | null;
}

// Section 52: Pagination Response Container
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number | null;
  totalPages: number | null;
}

// Normalized API Error Shape (Section 42 & Section 39)
export interface ApiErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  code: string;
  message: string;
  details?: ApiErrorDetail[];
  timestamp: string;
}
