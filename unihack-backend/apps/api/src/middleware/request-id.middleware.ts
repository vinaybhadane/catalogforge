/**
 * Request ID Middleware
 * Assigns or propagates x-request-id correlation tracking header
 */

import crypto from 'crypto';
import { FastifyReply, FastifyRequest } from 'fastify';

export const requestIdMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> => {
  const headerId = request.headers['x-request-id'];
  const requestId = (typeof headerId === 'string' && headerId.trim())
    ? headerId.trim()
    : crypto.randomUUID();

  // Attach to fastify request and response header
  (request as unknown as { id: string }).id = requestId;
  reply.header('x-request-id', requestId);
};
