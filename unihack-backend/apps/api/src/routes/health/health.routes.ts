/**
 * Health Check Routes
 * Implements GET /health and GET /health/dependencies
 */

import { DependencyHealthResponse, HealthResponse } from '@unihack/contracts';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { DependencyHealthResponseSchema, HealthResponseSchema } from '../../schemas/common.schemas';

export const healthRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  /**
   * GET /
   * Root welcome info & sitemap
   */
  fastify.get('/', async (_request, reply) => {
    return reply.status(200).send({
      name: 'CatalogForge UniHack AI Enterprise API',
      status: 'online',
      version: '1.0.0',
      documentation: '/api/docs',
      health: '/health',
      endpoints: {
        ocr: '/api/v1/ingestion/ocr',
        urlIngestion: '/api/v1/ingestion/url',
        batchFile: '/api/v1/ingestion/process-batch-file',
        searchLive: '/api/v1/products/search-live',
        products: '/api/v1/products',
      },
    });
  });

  /**
   * GET /health
   * Public lightweight liveness probe
   */
  fastify.get<{ Reply: HealthResponse }>(
    '/health',
    {
      schema: {
        description: 'Basic health and liveness probe',
        tags: ['Health'],
        summary: 'Liveness Check',
        response: {
          200: HealthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const response: HealthResponse = {
        status: 'ok',
        service: 'unihack-api',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      };
      return reply.status(200).send(response);
    },
  );

  /**
   * GET /health/dependencies
   * Comprehensive dependency readiness probe checking Azure SQL connectivity
   */
  fastify.get<{ Reply: DependencyHealthResponse }>(
    '/health/dependencies',
    {
      schema: {
        description: 'Detailed readiness probe verifying Azure SQL and critical subsystems',
        tags: ['Health'],
        summary: 'Dependency Readiness Check',
        response: {
          200: DependencyHealthResponseSchema,
          503: DependencyHealthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const dbPing = await fastify.pingDb();
      const isHealthy = dbPing.healthy;

      const response: DependencyHealthResponse = {
        status: isHealthy ? 'ok' : 'degraded',
        service: 'unihack-api',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        dependencies: {
          azureSql: {
            status: isHealthy ? 'healthy' : 'unhealthy',
            latencyMs: dbPing.latencyMs,
            message: dbPing.error,
          },
        },
      };

      const statusCode = isHealthy ? 200 : 503;
      return reply.status(statusCode).send(response);
    },
  );
};
