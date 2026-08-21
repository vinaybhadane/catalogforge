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

      // Check against configured allowed origins, Vercel domains, or local dev
      if (
        env.CORS_ALLOWED_ORIGINS.includes('*') ||
        env.CORS_ALLOWED_ORIGINS.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        env.NODE_ENV === 'development'
      ) {
        cb(null, true);
        return;
      }

      cb(null, true);
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
