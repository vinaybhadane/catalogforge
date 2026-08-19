/**
 * Fastify Routes for Products Management & Live Web Enrichment
 */

import { ProductFilterQuery } from '@unihack/contracts';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { NotFoundError, ValidationError } from '../../errors/app-errors';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { productRepository } from '../../repositories/product.repository';
import {
  GetProductByIdRouteSchema,
  ListProductsRouteSchema,
} from '../../schemas/product.schemas';
import { braveSearchService } from '../../services/brave-search.service';

export const productRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/products - List products with filters and pagination
  fastify.get<{ Querystring: ProductFilterQuery }>(
    '/',
    {
      schema: ListProductsRouteSchema,
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const query = request.query;
      const page = Number(query.page) || 1;
      const pageSize = Number(query.pageSize) || 20;

      const result = await productRepository.listProducts(query);
      const totalPages = Math.ceil(result.total / pageSize);

      return reply.status(200).send({
        items: result.items,
        total: result.total,
        page,
        pageSize,
        totalPages: totalPages > 0 ? totalPages : 1,
      });
    },
  );

  // POST /api/v1/products/search-live - Live Brave Web Search with Sourcing Governance
  fastify.post<{ Body: { partNumber: string; manufacturer?: string } }>(
    '/search-live',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Perform live Brave Search intelligence extraction with strict source governance',
        tags: ['Products', 'Enrichment'],
        summary: 'Live Web Intelligence Search',
        body: {
          type: 'object',
          required: ['partNumber'],
          properties: {
            partNumber: { type: 'string' },
            manufacturer: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const { partNumber, manufacturer } = request.body;
      if (!partNumber || !partNumber.trim()) {
        throw new ValidationError('partNumber parameter is required.');
      }

      const intelligence = await braveSearchService.searchProduct(partNumber, manufacturer);
      return reply.status(200).send(intelligence);
    },
  );

  // GET /api/v1/products/:id - Get single product detail
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: GetProductByIdRouteSchema,
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { id } = request.params;
      const product = await productRepository.findById(id);

      if (!product) {
        throw new NotFoundError(`Product with ID '${id}' was not found.`);
      }

      return reply.status(200).send({ product });
    },
  );

  // POST /api/v1/products/:id/enrich-live - Trigger live Brave Search enrichment for a product
  fastify.post<{ Params: { id: string } }>(
    '/:id/enrich-live',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Live enrich product with Brave Search, official manufacturer spec sheets, PDFs, and warranty documents',
        tags: ['Products', 'Enrichment'],
        summary: 'Live Enrich Product',
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const product = await productRepository.findById(id);

      if (!product) {
        throw new NotFoundError(`Product with ID '${id}' was not found.`);
      }

      const intelligence = await braveSearchService.searchProduct(
        product.partNumber,
        product.manufacturerName || undefined,
      );

      return reply.status(200).send({
        productId: id,
        partNumber: product.partNumber,
        manufacturer: product.manufacturerName,
        intelligence,
      });
    },
  );

  // POST /api/v1/products/:id/publish - Approve and publish product
  fastify.post<{ Params: { id: string } }>(
    '/:id/publish',
    {
      preHandler: [authenticate, requireRole(['admin', 'reviewer'])],
    },
    async (request, reply) => {
      const { id } = request.params;
      const product = await productRepository.findById(id);

      if (!product) {
        throw new NotFoundError(`Product with ID '${id}' was not found.`);
      }

      const updated = await productRepository.updateProduct(
        id,
        { status: 'published' },
        request.user?.uid || 'reviewer',
        'Manual reviewer approval for publication',
      );

      return reply.status(200).send({
        success: true,
        message: 'Product successfully published.',
        product: updated,
      });
    },
  );
};
