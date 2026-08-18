/**
 * Fastify Routes for Products Management
 */

import { ProductFilterQuery } from '@unihack/contracts';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { NotFoundError } from '../../errors/app-errors';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { productRepository } from '../../repositories/product.repository';
import {
  GetProductByIdRouteSchema,
  ListProductsRouteSchema,
} from '../../schemas/product.schemas';

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
      const result = await productRepository.listProducts(query);
      return reply.status(200).send(result);
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
