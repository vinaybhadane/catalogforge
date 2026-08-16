/**
 * Authentication Routes
 * Implements GET /api/v1/auth/me
 */

import { CurrentUserResponse } from '@unihack/contracts';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { authenticate } from '../../middleware/auth.middleware';
import { GetCurrentUserRouteSchema } from '../../schemas/auth.schemas';

export const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  /**
   * GET /api/v1/auth/me
   * Returns current authenticated user claims and profile
   */
  fastify.get<{ Reply: CurrentUserResponse }>(
    '/me',
    {
      preHandler: [authenticate],
      schema: GetCurrentUserRouteSchema,
    },
    async (request, reply) => {
      const user = request.user;

      const response: CurrentUserResponse = {
        uid: user.uid,
        role: user.role,
        email: user.email,
        displayName: user.displayName,
      };

      return reply.status(200).send(response);
    },
  );
};
