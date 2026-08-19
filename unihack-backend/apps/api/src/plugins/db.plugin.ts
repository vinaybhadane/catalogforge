/**
 * Azure SQL Database Connection Plugin
 * Configures connection pooling using mssql with health check support
 */

import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import sql, { ConnectionPool, config as SqlConfig } from 'mssql';
import { env } from '../config/env';

declare module 'fastify' {
  interface FastifyInstance {
    sql: ConnectionPool | null;
    isDbConnected: () => boolean;
    pingDb: () => Promise<{ healthy: boolean; latencyMs: number; error?: string }>;
  }
}

let activePool: ConnectionPool | null = null;

export const getSqlPool = (): ConnectionPool | null => activePool;

const buildSqlConfig = (): SqlConfig | string | null => {
  if (env.AZURE_SQL_CONNECTION_STRING) {
    return env.AZURE_SQL_CONNECTION_STRING;
  }

  if (env.AZURE_SQL_SERVER && env.AZURE_SQL_DATABASE) {
    return {
      server: env.AZURE_SQL_SERVER,
      port: env.AZURE_SQL_PORT,
      database: env.AZURE_SQL_DATABASE,
      user: env.AZURE_SQL_USER || '',
      password: env.AZURE_SQL_PASSWORD || '',
      options: {
        encrypt: env.AZURE_SQL_ENCRYPT,
        trustServerCertificate: env.AZURE_SQL_TRUST_SERVER_CERTIFICATE,
        connectTimeout: env.AZURE_SQL_TIMEOUT_MS,
      },
      pool: {
        max: env.AZURE_SQL_POOL_MAX,
        min: env.AZURE_SQL_POOL_MIN,
        idleTimeoutMillis: 30000,
      },
    };
  }

  return null;
};

const dbPluginAsync: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const dbConfig = buildSqlConfig();

  if (!dbConfig) {
    fastify.log.warn('Azure SQL Database configuration is not set. Database operations will operate in offline/mock mode.');
    fastify.decorate('sql', null);
    fastify.decorate('isDbConnected', () => false);
    fastify.decorate('pingDb', async () => ({
      healthy: false,
      latencyMs: 0,
      error: 'Azure SQL credentials are not configured in environment.',
    }));
    return;
  }

  try {
    fastify.log.info('Initializing Azure SQL connection pool...');
    const connectPromise = sql.connect(dbConfig as SqlConfig);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Azure SQL connection timed out (fallback to offline/mock mode)')), 3500)
    );
    activePool = await Promise.race([connectPromise, timeoutPromise]);
    fastify.log.info('Azure SQL connection pool successfully established.');

    fastify.decorate('sql', activePool);
    fastify.decorate('isDbConnected', () => activePool?.connected ?? false);
    fastify.decorate('pingDb', async () => {
      if (!activePool || !activePool.connected) {
        return { healthy: false, latencyMs: 0, error: 'Database pool is not connected.' };
      }
      const start = Date.now();
      try {
        await activePool.request().query('SELECT 1 AS health_check');
        const latencyMs = Date.now() - start;
        return { healthy: true, latencyMs };
      } catch (err) {
        return {
          healthy: false,
          latencyMs: Date.now() - start,
          error: (err as Error).message,
        };
      }
    });

    fastify.addHook('onClose', async (instance) => {
      if (activePool) {
        instance.log.info('Closing Azure SQL connection pool...');
        await activePool.close();
        activePool = null;
      }
    });
  } catch (err) {
    fastify.log.warn((err as Error).message);
    fastify.decorate('sql', null);
    fastify.decorate('isDbConnected', () => false);
    fastify.decorate('pingDb', async () => ({
      healthy: false,
      latencyMs: 0,
      error: (err as Error).message,
    }));
  }
};

export const dbPlugin = fp(dbPluginAsync, {
  name: 'db-plugin',
});
