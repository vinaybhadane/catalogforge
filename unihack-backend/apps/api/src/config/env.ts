/**
 * Application Configuration & Environment Variable Validation
 * Validates process.env using Zod schema
 */

import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load .env from root or current directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // Azure SQL Database
  AZURE_SQL_CONNECTION_STRING: z.string().optional(),
  AZURE_SQL_SERVER: z.string().optional(),
  AZURE_SQL_PORT: z.coerce.number().default(1433),
  AZURE_SQL_DATABASE: z.string().optional(),
  AZURE_SQL_USER: z.string().optional(),
  AZURE_SQL_PASSWORD: z.string().optional(),
  AZURE_SQL_ENCRYPT: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
  AZURE_SQL_TRUST_SERVER_CERTIFICATE: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  AZURE_SQL_POOL_MAX: z.coerce.number().default(10),
  AZURE_SQL_POOL_MIN: z.coerce.number().default(0),
  AZURE_SQL_TIMEOUT_MS: z.coerce.number().default(30000),

  // Firebase Admin Auth
  FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),
  FIREBASE_CLIENT_EMAIL: z.string().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),

  // CORS & Security
  CORS_ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://127.0.0.1:3000')
    .transform((origins) => origins.split(',').map((o) => o.trim()).filter(Boolean)),

  // Dev Overrides
  ENABLE_MOCK_AUTH_IN_DEV: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(false),
  MOCK_AUTH_ROLE: z.enum(['admin', 'reviewer', 'viewer']).default('admin'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Format readable error message
  const errorDetails = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  // In development, warn if non-critical env vars are missing
  console.warn(`[Config] Environment validation warnings:\n${errorDetails}`);
}

export type EnvConfig = z.infer<typeof envSchema>;

export const env: EnvConfig = parsed.success
  ? parsed.data
  : envSchema.parse({
      ...process.env,
      NODE_ENV: process.env['NODE_ENV'] || 'development',
      PORT: process.env['PORT'] || '8000',
    });
