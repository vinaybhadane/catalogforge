/**
 * Authentication Service
 * Verifies Firebase ID tokens, manages user profile synchronization with Azure SQL
 */

import { UserClaims, UserRole } from '@unihack/contracts';
import * as admin from 'firebase-admin';
import fs from 'fs';
import { env } from '../config/env';
import { UnauthorizedError } from '../errors/app-errors';
import { userRepository } from '../repositories/user.repository';

let firebaseInitialized = false;

function initializeFirebase(): void {
  if (firebaseInitialized || admin.apps.length > 0) {
    firebaseInitialized = true;
    return;
  }

  try {
    if (env.FIREBASE_SERVICE_ACCOUNT_PATH && fs.existsSync(env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
      const serviceAccount = JSON.parse(fs.readFileSync(env.FIREBASE_SERVICE_ACCOUNT_PATH, 'utf8'));
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
      });
      firebaseInitialized = true;
      console.log('[Auth] Firebase Admin initialized with service account file.');
      return;
    }

    if (env.FIREBASE_PROJECT_ID && env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY) {
      const privateKey = env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.FIREBASE_PROJECT_ID,
          clientEmail: env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
        projectId: env.FIREBASE_PROJECT_ID,
      });
      firebaseInitialized = true;
      console.log('[Auth] Firebase Admin initialized with environment credentials.');
      return;
    }

    console.warn('[Auth] Firebase Admin credentials not supplied. Token verification will operate in mock mode if ENABLE_MOCK_AUTH_IN_DEV is active.');
  } catch (err) {
    console.error('[Auth] Failed to initialize Firebase Admin SDK:', err);
  }
}

// Initialize on module load
initializeFirebase();

export class AuthService {
  /**
   * Verify Bearer token and return normalized UserClaims
   */
  async verifyToken(token: string): Promise<UserClaims> {
    if (!token || typeof token !== 'string') {
      throw new UnauthorizedError('Authorization token is missing or malformed.');
    }

    // Dev mock token support
    if (env.ENABLE_MOCK_AUTH_IN_DEV && (token === 'dev-token' || token.startsWith('mock-'))) {
      const mockRole: UserRole = env.MOCK_AUTH_ROLE || 'admin';
      return {
        uid: 'dev-user-001',
        email: 'dev.reviewer@unihack.local',
        role: mockRole,
        displayName: 'Dev Reviewer',
      };
    }

    if (!firebaseInitialized) {
      // If mock auth is enabled and firebase is unconfigured, provide fallback
      if (env.ENABLE_MOCK_AUTH_IN_DEV || env.NODE_ENV === 'development') {
        return {
          uid: 'dev-fallback-user',
          email: 'dev@unihack.local',
          role: env.MOCK_AUTH_ROLE || 'admin',
          displayName: 'Local Dev User',
        };
      }
      throw new UnauthorizedError('Authentication service is not configured on the server.', 'AUTH_INVALID');
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const uid = decodedToken.uid;
      const email = decodedToken.email || null;
      const displayName = decodedToken.name || null;

      // Extract custom role claim if present, otherwise look up in Azure SQL app_user
      let role: UserRole = 'viewer';
      if (decodedToken['role'] === 'admin' || decodedToken['role'] === 'reviewer' || decodedToken['role'] === 'viewer') {
        role = decodedToken['role'];
      } else {
        const dbUser = await userRepository.findByUid(uid);
        if (dbUser) {
          role = dbUser.role;
        } else {
          // Sync new user to app_user table with default role
          const createdUser = await userRepository.upsertUser({
            uid,
            email,
            displayName,
            role: 'viewer',
          });
          role = createdUser.role;
        }
      }

      return {
        uid,
        email,
        displayName,
        role,
      };
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'auth/id-token-expired') {
        throw new UnauthorizedError('The authentication token has expired. Please log in again.', 'AUTH_INVALID');
      }
      if (err.code === 'auth/argument-error' || err.code === 'auth/invalid-id-token') {
        throw new UnauthorizedError('The authentication token is invalid or corrupt.', 'AUTH_INVALID');
      }
      throw new UnauthorizedError(`Authentication failed: ${err.message || 'Token verification failed'}`, 'AUTH_INVALID');
    }
  }
}

export const authService = new AuthService();
