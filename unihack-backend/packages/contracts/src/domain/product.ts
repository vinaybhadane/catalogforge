/**
 * Product Domain Models & Contracts
 * Based on UniHack Backend Spec Sections 38-41, 44, 126-128
 */

import { AssetType, ProductStatus } from './enums';

/**
 * Source citation and grounded evidence model.
 */
export interface EvidenceReference {
  evidenceId?: number | string | null;
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceSnippet: string | null;
  sourceSpan: string | null;
  documentType?: string | null;
  pageNumber?: number | null;
  manufacturer?: string | null;
  partNumber?: string | null;
  retrievedAt?: string | null;
}

/**
 * Normalized product attribute triplet with validation & confidence metrics.
 */
export interface ProductAttribute {
  id?: number | string;
  productId?: string;
  sequence: number;
  attributeLabel: string;
  attributeValue: string | null;
  attributeUom: string | null;
  lovMatchConfidence: number | null;
  confidenceScore: number | null;
  validationFlags: string[];
  sourceEvidenceId: number | string | null;
  source?: EvidenceReference | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Multi-format product marketing and operational descriptions.
 */
export interface ProductDescriptions {
  shortDescription: string | null;
  longDescription: string | null;
  mobileDescription: string | null;
  invoiceDescription: string | null;
  retailDescription: string | null;
  marketingDescription: string | null;
  bulletPoints: string[];
}

/**
 * Individual ordered marketing bullet feature.
 */
export interface ProductFeature {
  id?: number | string;
  productId?: string;
  sequence: number;
  featureText: string;
}

/**
 * Physical product dimensions and weight metrics.
 */
export interface ProductDimensions {
  length: number | null;
  lengthUom: string | null;
  height: number | null;
  heightUom: string | null;
  width: number | null;
  widthUom: string | null;
  weight: number | null;
  weightUom: string | null;
}

/**
 * Digital asset, image, or technical document attachment.
 */
export interface ProductAsset {
  id?: number | string;
  productId?: string;
  assetType: AssetType;
  sequence: number | null;
  fileName: string | null;
  blobUrl: string | null;
  sourceUrl: string | null;
  createdAt?: string;
}

/**
 * Comprehensive Product entity contract.
 */
export interface Product {
  productId: string;
  rawInputId: number | string | null;
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

  upc: string | null;
  ean: string | null;
  gtin: string | null;
  countryOfOrigin: string | null;
  discontinued: boolean;
  actualImage: boolean;

  rowConfidence: number | null;
  status: ProductStatus;
  version: number;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}
