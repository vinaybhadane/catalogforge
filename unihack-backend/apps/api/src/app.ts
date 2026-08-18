/**
 * Fastify Application Factory
 * Assembles plugins, middleware, routes, and schemas into a reusable FastifyInstance
 */

import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { env } from './config/env';
import { globalErrorHandler } from './middleware/error-handler.middleware';
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { corsPlugin } from './plugins/cors.plugin';
import { dbPlugin } from './plugins/db.plugin';
import { multipartPlugin } from './plugins/multipart.plugin';
import { swaggerPlugin } from './plugins/swagger.plugin';
import { analyticsRoutes } from './routes/analytics/analytics.routes';
import { authRoutes } from './routes/auth/auth.routes';
import { configRoutes } from './routes/config/config.routes';
import { healthRoutes } from './routes/health/health.routes';
import { ingestionRoutes } from './routes/ingestion/ingestion.routes';
import { masterDataRoutes } from './routes/master-data/master-data.routes';
import { productRoutes } from './routes/products/product.routes';
import { reviewRoutes } from './routes/reviews/review.routes';
import { CurrentUserResponseSchema } from './schemas/auth.schemas';
import {
  ApiErrorResponseSchema,
  DependencyHealthResponseSchema,
  HealthResponseSchema,
} from './schemas/common.schemas';
import { BackendConfigResponseSchema } from './schemas/config.schemas';
import {
  IngestionJobDetailSchema,
  IngestionUploadResponseSchema,
  PreflightReportSchema,
} from './schemas/ingestion.schemas';
import {
  ProductDetailResponseSchema,
  ProductListResponseSchema,
  ProductSchema,
} from './schemas/product.schemas';

export async function buildApp(opts: FastifyServerOptions = {}): Promise<FastifyInstance> {
  const app = fastify({
    pluginTimeout: 60000,
    logger: {
      level: env.LOG_LEVEL,
    },
    disableRequestLogging: false,
    ...opts,
  });

  // 1. Request ID hook
  app.addHook('onRequest', requestIdMiddleware);

  // 2. Register shared schemas for Swagger / AJV reuse
  app.addSchema(ApiErrorResponseSchema);
  app.addSchema(HealthResponseSchema);
  app.addSchema(DependencyHealthResponseSchema);
  app.addSchema(CurrentUserResponseSchema);
  app.addSchema(IngestionUploadResponseSchema);
  app.addSchema(PreflightReportSchema);
  app.addSchema(IngestionJobDetailSchema);
  app.addSchema(BackendConfigResponseSchema);
  app.addSchema(ProductSchema);
  app.addSchema(ProductListResponseSchema);
  app.addSchema(ProductDetailResponseSchema);

  // 3. Register core plugins
  await app.register(corsPlugin);
  await app.register(multipartPlugin);
  await app.register(swaggerPlugin);
  await app.register(dbPlugin);

  // 4. Register global error handler
  app.setErrorHandler(globalErrorHandler);

  // 5. Register 404 Not Found handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route '${request.method} ${request.url}' not found.`,
        details: null,
        requestId: request.id || 'unknown',
      },
    });
  });

  // 6. Register routes
  await app.register(healthRoutes);
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(ingestionRoutes, { prefix: '/api/v1/ingestion' });
  await app.register(configRoutes, { prefix: '/api/v1/config' });
  await app.register(productRoutes, { prefix: '/api/v1/products' });
  await app.register(reviewRoutes, { prefix: '/api/v1/reviews' });
  await app.register(masterDataRoutes, { prefix: '/api/v1/master-data' });
  await app.register(analyticsRoutes, { prefix: '/api/v1/analytics' });

  return app;
}
