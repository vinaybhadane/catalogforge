/**
 * Role-Based Access Control (RBAC) Guard Middleware
 * Restricts route access to specified UserRole permissions
 */

import { UserRole } from '@unihack/contracts';
import { FastifyReply, FastifyRequest, preHandlerHookHandler } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../errors/app-errors';

/**
 * Factory creating route-level preHandler hook to enforce required role(s)
 */
export const requireRole = (allowedRoles: UserRole[]): preHandlerHookHandler => {
  return async (request: FastifyRequest, _reply: FastifyReply): Promise<void> => {
    if (!request.user) {
      throw new UnauthorizedError('User must be authenticated to access this endpoint.');
    }

    const userRole = request.user.role;
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenError(
        `Access denied. Role '${userRole}' is not permitted to access this resource. Required one of: [${allowedRoles.join(', ')}]`,
      );
    }
  };
};

/**
 * Convenience guards
 */
export const requireAdmin = requireRole(['admin']);
export const requireReviewerOrAdmin = requireRole(['admin', 'reviewer']);
export const requireViewer = requireRole(['admin', 'reviewer', 'viewer']);
