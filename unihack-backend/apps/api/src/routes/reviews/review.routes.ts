/**
 * Fastify Routes for Review Queue and HITL Workflow
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { NotFoundError } from '../../errors/app-errors';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { productRepository } from '../../repositories/product.repository';

export const reviewRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/reviews/queue - Get review queue items
  fastify.get<{ Querystring: { page?: number; pageSize?: number } }>(
    '/queue',
    {
      preHandler: [authenticate, requireRole(['admin', 'reviewer'])],
    },
    async (request, reply) => {
      const page = request.query.page || 1;
      const pageSize = request.query.pageSize || 25;
      const offset = (page - 1) * pageSize;

      const result = await productRepository.getReviewQueue(pageSize, offset);

      return reply.status(200).send({
        items: result.items,
        total: result.total,
        page,
        pageSize,
        totalPages: Math.ceil(result.total / pageSize) || 1,
      });
    },
  );

  // PUT /api/v1/reviews/:id/decision - Submit reviewer correction or approval
  fastify.put<{
    Params: { id: string };
    Body: {
      action: 'APPROVE' | 'REJECT' | 'CORRECT';
      reason?: string;
      manufacturerName?: string;
      shortDescription?: string;
    };
  }>(
    '/:id/decision',
    {
      preHandler: [authenticate, requireRole(['admin', 'reviewer'])],
    },
    async (request, reply) => {
      const { id } = request.params;
      const { action, reason, manufacturerName, shortDescription } = request.body;

      const product = await productRepository.findById(id);
      if (!product) {
        throw new NotFoundError(`Review item with Product ID '${id}' not found.`);
      }

      const statusMap = {
        APPROVE: 'published' as const,
        REJECT: 'rejected' as const,
        CORRECT: 'pending_review' as const,
      };

      const updated = await productRepository.updateProduct(
        id,
        {
          status: statusMap[action] || 'pending_review',
          manufacturerName,
          descriptions: shortDescription
            ? { ...product.descriptions, shortDescription }
            : product.descriptions,
        },
        request.user?.uid || 'reviewer',
        reason || `Reviewer action: ${action}`,
      );

      return reply.status(200).send({
        success: true,
        message: `Review decision '${action}' recorded.`,
        product: updated,
      });
    },
  );
};
