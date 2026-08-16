/**
 * Multipart File Upload Plugin
 * Registers @fastify/multipart with upload limits and streaming support
 */

import multipart from '@fastify/multipart';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

const multipartPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  await fastify.register(multipart, {
    limits: {
      fieldNameSize: 100,
      fieldSize: 1000000, // 1MB
      fields: 10,
      fileSize: 52428800, // 50MB
      files: 1,
    },
    attachFieldsToBody: false,
  });
};

export const multipartPlugin = fp(multipartPluginAsync, {
  name: 'multipart-plugin',
});
