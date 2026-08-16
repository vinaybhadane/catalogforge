/**
 * CORS Fastify Plugin
 * Configures Cross-Origin Resource Sharing based on environment configuration
 */

import cors from '@fastify/cors';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { env } from '../config/env';

const corsPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) {
        cb(null, true);
        return;
      }

      // Check against configured allowed origins
      if (env.CORS_ALLOWED_ORIGINS.includes(origin) || env.NODE_ENV === 'development') {
        cb(null, true);
        return;
      }

      cb(new Error(`Origin '${origin}' not allowed by CORS policy`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'x-request-id',
    ],
    exposedHeaders: ['x-request-id', 'Content-Disposition'],
    credentials: true,
    maxAge: 86400,
  });
};

export const corsPlugin = fp(corsPluginAsync, {
  name: 'cors-plugin',
});
