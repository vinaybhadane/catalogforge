/**
 * Product REST API Request & Response Contracts
 */

import { ProductStatus } from '../domain/enums';
import { Product } from '../domain/product';
import { PaginatedResponse, PaginationQuery } from './common';

/**
 * Filter query parameters for GET /api/v1/products.
 */
export interface ProductFilterQuery extends PaginationQuery {
  status?: ProductStatus;
  minConfidence?: number;
  maxConfidence?: number;
  manufacturer?: string;
  brand?: string;
  classpath?: string;
  search?: string;
}

/**
 * Paginated product listing response.
 */
export type ProductListResponse = PaginatedResponse<Product>;

/**
 * Detailed single product response.
 */
export interface ProductDetailResponse {
  product: Product;
}

/**
 * Partial update payload for a product entity.
 */
export interface ProductUpdateRequest {
  manufacturerName?: string | null;
  brandName?: string | null;
  manufacturerPartNumber?: string | null;
  classpath?: string | null;
  unspsc?: string | null;
  descriptions?: Partial<Product['descriptions']>;
  dimensions?: Partial<NonNullable<Product['dimensions']>> | null;
  status?: ProductStatus;
}
