/**
 * User Repository
 * Data access layer for app_user table in Azure SQL
 */

import { AppUser, UserRole } from '@unihack/contracts';
import sql from 'mssql';
import { getSqlPool } from '../plugins/db.plugin';

export class UserRepository {
  /**
   * Find user record by Firebase UID
   */
  async findByUid(uid: string): Promise<AppUser | null> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      return null;
    }

    const request = pool.request();
    request.input('uid', sql.VarChar(255), uid);

    const result = await request.query<AppUser>(`
      SELECT
        uid,
        email,
        display_name AS displayName,
        role,
        active,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM dbo.app_user
      WHERE uid = @uid
    `);

    return result.recordset[0] || null;
  }

  /**
   * Find user record by email
   */
  async findByEmail(email: string): Promise<AppUser | null> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      return null;
    }

    const request = pool.request();
    request.input('email', sql.VarChar(255), email);

    const result = await request.query<AppUser>(`
      SELECT
        uid,
        email,
        display_name AS displayName,
        role,
        active,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM dbo.app_user
      WHERE email = @email
    `);

    return result.recordset[0] || null;
  }

  /**
   * Upsert user on login / token verification
   */
  async upsertUser(user: {
    uid: string;
    email: string | null;
    displayName: string | null;
    role?: UserRole;
  }): Promise<AppUser> {
    const pool = getSqlPool();
    const defaultRole: UserRole = user.role || 'viewer';

    if (!pool || !pool.connected) {
      // In-memory fallback if SQL is unavailable during development
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: defaultRole,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    const request = pool.request();
    request.input('uid', sql.VarChar(255), user.uid);
    request.input('email', sql.VarChar(255), user.email);
    request.input('displayName', sql.VarChar(255), user.displayName);
    request.input('role', sql.VarChar(30), defaultRole);

    const result = await request.query<AppUser>(`
      MERGE dbo.app_user AS target
      USING (SELECT @uid AS uid, @email AS email, @displayName AS display_name, @role AS role) AS source
      ON target.uid = source.uid
      WHEN MATCHED THEN
        UPDATE SET
          email = COALESCE(source.email, target.email),
          display_name = COALESCE(source.display_name, target.display_name),
          updated_at = SYSUTCDATETIME()
      WHEN NOT MATCHED THEN
        INSERT (uid, email, display_name, role, active, created_at, updated_at)
        VALUES (source.uid, source.email, source.display_name, source.role, 1, SYSUTCDATETIME(), SYSUTCDATETIME())
      OUTPUT
        inserted.uid,
        inserted.email,
        inserted.display_name AS displayName,
        inserted.role,
        inserted.active,
        inserted.created_at AS createdAt,
        inserted.updated_at AS updatedAt;
    `);

    const savedUser = result.recordset[0];
    if (!savedUser) {
      throw new Error(`Failed to upsert user record for uid: ${user.uid}`);
    }

    return savedUser;
  }
}

export const userRepository = new UserRepository();
