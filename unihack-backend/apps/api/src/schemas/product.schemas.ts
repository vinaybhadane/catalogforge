/**
 * Fastify Schemas for Product Operations
 */

import { ApiErrorResponseSchema } from './common.schemas';

export const ProductSchema = {
  $id: 'Product',
  type: 'object',
  required: ['productId', 'partNumber', 'manufacturerName', 'status', 'version'],
  properties: {
    productId: { type: 'string' },
    rawInputId: { type: 'number', nullable: true },
    partNumber: { type: 'string' },
    manufacturerName: { type: 'string' },
    brandName: { type: 'string', nullable: true },
    manufacturerPartNumber: { type: 'string', nullable: true },
    classpath: { type: 'string', nullable: true },
    unspsc: { type: 'string', nullable: true },
    descriptions: {
      type: 'object',
      properties: {
        shortDesc: { type: 'string', nullable: true },
        mobileDesc: { type: 'string', nullable: true },
        invoiceDesc: { type: 'string', nullable: true },
        longDesc1: { type: 'string', nullable: true },
        retailDesc: { type: 'string', nullable: true },
        marketingDescription: { type: 'string', nullable: true },
      },
    },
    identifiers: {
      type: 'object',
      properties: {
        upc: { type: 'string', nullable: true },
        ean: { type: 'string', nullable: true },
        gtin: { type: 'string', nullable: true },
      },
    },
    dimensions: {
      type: 'object',
      properties: {
        length: { type: 'number', nullable: true },
        lengthUom: { type: 'string', nullable: true },
        height: { type: 'number', nullable: true },
        heightUom: { type: 'string', nullable: true },
        width: { type: 'number', nullable: true },
        widthUom: { type: 'string', nullable: true },
        weight: { type: 'number', nullable: true },
        weightUom: { type: 'string', nullable: true },
      },
    },
    metadata: {
      type: 'object',
      properties: {
        countryOfOrigin: { type: 'string', nullable: true },
        discontinued: { type: 'boolean' },
        actualImage: { type: 'boolean' },
      },
    },
    features: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          sequence: { type: 'number' },
          featureText: { type: 'string' },
        },
      },
    },
    attributes: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          sequence: { type: 'number' },
          attributeLabel: { type: 'string' },
          attributeValue: { type: 'string', nullable: true },
          attributeUom: { type: 'string', nullable: true },
          lovMatchConfidence: { type: 'number', nullable: true },
          confidenceScore: { type: 'number', nullable: true },
          validationFlags: { type: 'array', items: { type: 'string' } },
          evidence: {
            type: 'object',
            nullable: true,
            properties: {
              sourceUrl: { type: 'string', nullable: true },
              sourceTitle: { type: 'string', nullable: true },
              sourceSnippet: { type: 'string', nullable: true },
              sourceSpan: { type: 'string', nullable: true },
              pageNumber: { type: 'number', nullable: true },
            },
          },
        },
      },
    },
    assets: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          assetType: { type: 'string' },
          fileName: { type: 'string', nullable: true },
          blobUrl: { type: 'string', nullable: true },
          sourceUrl: { type: 'string', nullable: true },
        },
      },
    },
    rowConfidence: { type: 'number', nullable: true },
    status: { type: 'string' },
    version: { type: 'number' },
    createdAt: { type: 'string' },
    updatedAt: { type: 'string' },
  },
} as const;

export const ProductListResponseSchema = {
  $id: 'ProductListResponse',
  type: 'object',
  required: ['items', 'total', 'page', 'pageSize', 'totalPages'],
  properties: {
    items: {
      type: 'array',
      items: { $ref: 'Product#' },
    },
    total: { type: 'number' },
    page: { type: 'number' },
    pageSize: { type: 'number' },
    totalPages: { type: 'number' },
  },
} as const;

export const ProductDetailResponseSchema = {
  $id: 'ProductDetailResponse',
  type: 'object',
  required: ['product'],
  properties: {
    product: { $ref: 'Product#' },
  },
} as const;

export const ListProductsRouteSchema = {
  description: 'List and filter canonical products with pagination',
  tags: ['Products'],
  summary: 'List Products',
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'number', default: 1 },
      pageSize: { type: 'number', default: 20 },
      status: { type: 'string' },
      minConfidence: { type: 'number' },
      maxConfidence: { type: 'number' },
      manufacturer: { type: 'string' },
      brand: { type: 'string' },
      classpath: { type: 'string' },
      search: { type: 'string' },
    },
  },
  response: {
    200: ProductListResponseSchema,
    500: ApiErrorResponseSchema,
  },
} as const;

export const GetProductByIdRouteSchema = {
  description: 'Get full product details including attributes, evidence, and audit logs',
  tags: ['Products'],
  summary: 'Get Product By ID',
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string' },
    },
  },
  response: {
    200: ProductDetailResponseSchema,
    404: ApiErrorResponseSchema,
    500: ApiErrorResponseSchema,
  },
} as const;
