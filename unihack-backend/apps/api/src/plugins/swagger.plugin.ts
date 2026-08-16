/**
 * Swagger & OpenAPI 3.0 Documentation Plugin
 * Exposes Swagger UI at /api/docs and OpenAPI JSON specification at /api/openapi.json
 */

import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const swaggerPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Register OpenAPI generator
  await fastify.register(swagger, {
    openapi: {
      openapi: '3.0.3',
      info: {
        title: 'UniHack AI Product Intelligence Platform API',
        description:
          'Enterprise REST API for industrial product data classification, attribute enrichment, deterministic validation, and human-in-the-loop review.',
        version: '1.0.0',
        contact: {
          name: 'UniHack Engineering Team',
        },
      },
      servers: [
        {
          url: 'http://localhost:8000',
          description: 'Local Development Server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'Firebase ID Token. Provide Bearer <token>',
          },
        },
      },
      tags: [
        { name: 'Health', description: 'System liveness and dependency health checks' },
        { name: 'Auth', description: 'Authentication and user profile endpoints' },
        { name: 'Products', description: 'Product intelligence management' },
        { name: 'Ingestion', description: 'Batch file upload and pipeline lifecycle' },
        { name: 'Reviews', description: 'Human-in-the-Loop review and approvals' },
      ],
    },
  });

  // Register Swagger UI
  await fastify.register(swaggerUi, {
    routePrefix: '/api/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
      displayRequestDuration: true,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  });

  // Expose raw OpenAPI JSON spec
  fastify.get('/api/openapi.json', { schema: { hide: true } }, async (_request, reply) => {
    return reply.send(fastify.swagger());
  });
};

export const swaggerPlugin = fp(swaggerPluginAsync, {
  name: 'swagger-plugin',
});
