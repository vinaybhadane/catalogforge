/**
 * Fastify Routes for Master Reference Data & LOVs
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { DEFAULT_MANUFACTURERS } from '../../constants/master-data.constants';
import { authenticate } from '../../middleware/auth.middleware';
import { masterDataRepository } from '../../repositories/master-data.repository';
import { DEFAULT_BRAND_LIST } from '../../services/ai-pipeline.service';

export const masterDataRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/master-data/fields - Get UI field definitions and limits
  fastify.get(
    '/fields',
    {
      preHandler: [authenticate],
    },
    async (_request, reply) => {
      const fields = await masterDataRepository.getFieldDefinitions();
      return reply.status(200).send({ fields });
    },
  );

  // GET /api/v1/master-data/brands - List authorized manufacturers and brands
  fastify.get(
    '/brands',
    {
      preHandler: [authenticate],
    },
    async (_request, reply) => {
      return reply.status(200).send({
        manufacturers: DEFAULT_MANUFACTURERS,
        brands: DEFAULT_BRAND_LIST,
      });
    },
  );

  // GET /api/v1/master-data/taxonomies - Standard classpath categories
  fastify.get(
    '/taxonomies',
    {
      preHandler: [authenticate],
    },
    async (_request, reply) => {
      return reply.status(200).send({
        taxonomies: [
          'Electrical > Distribution Equipment > Circuit Breakers',
          'Electrical > Wiring Devices > Receptacles',
          'Electrical > Wiring Devices > Wall Plates',
          'Lighting > Commercial Lighting > LED Troffers',
          'Tools > Hand Tools > Pliers & Cutters',
          'Tools > Power Tools > Cordless Drills',
          'HVAC > Controls > Thermostats',
        ],
      });
    },
  );
};
