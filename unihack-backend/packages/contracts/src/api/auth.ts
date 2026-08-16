/**
 * Authentication and User Contracts
 * Based on UniHack Backend Spec Section 55 & Section 4
 */

import { UserRole } from '../domain/enums';

/**
 * Token payload and session user claims.
 */
export interface UserClaims {
  uid: string;
  email: string | null;
  role: UserRole;
  displayName: string | null;
}

/**
 * Current user profile response for GET /api/v1/auth/me.
 */
export interface CurrentUserResponse {
  uid: string;
  role: UserRole;
  email: string | null;
  displayName: string | null;
}

/**
 * Database representation of user profile stored in app_user.
 */
export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
