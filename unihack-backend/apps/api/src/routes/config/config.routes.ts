/**
 * System Configuration Routes
 * Implements GET /api/v1/config and GET /api/v1/config/fields
 */

import { BackendConfigResponse, FieldDefinition } from '@unihack/contracts';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { configRepository } from '../../repositories/config.repository';
import { masterDataRepository } from '../../repositories/master-data.repository';
import { GetConfigRouteSchema } from '../../schemas/config.schemas';

export const configRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  /**
   * GET /api/v1/config
   * Returns system policy configurations, feature flags, and upload constraints
   */
  fastify.get<{ Reply: BackendConfigResponse }>(
    '/',
    {
      schema: GetConfigRouteSchema,
    },
    async (_request, reply) => {
      const config = await configRepository.getConfig();
      return reply.status(200).send(config);
    },
  );

  /**
   * GET /api/v1/config/fields
   * Returns dynamic UI field definitions for form builders and tabular review
   */
  fastify.get<{ Reply: { version: string; fields: FieldDefinition[] } }>(
    '/fields',
    {
      schema: {
        description: 'Get schema-driven UI field metadata definitions',
        tags: ['Config'],
        summary: 'Get Field Definitions',
      },
    },
    async (_request, reply) => {
      const fields = await masterDataRepository.getFieldDefinitions();
      return reply.status(200).send({
        version: 'v1.0.0',
        fields,
      });
    },
  );
};
