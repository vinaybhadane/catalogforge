/**
 * Authentication Middleware
 * Reads Authorization header, verifies JWT, attaches UserClaims to FastifyRequest
 */

import { UserClaims } from '@unihack/contracts';
import { FastifyReply, FastifyRequest } from 'fastify';
import { UnauthorizedError } from '../errors/app-errors';
import { authService } from '../services/auth.service';

declare module 'fastify' {
  interface FastifyRequest {
    user: UserClaims;
  }
}

export const authenticate = async (
  request: FastifyRequest,
  _reply: FastifyReply,
): Promise<void> => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or malformed Authorization header. Expected format: Bearer <token>');
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    throw new UnauthorizedError('Bearer token value is empty.');
  }

  const claims = await authService.verifyToken(token);
  request.user = claims;
};
