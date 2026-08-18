/**
 * Master Data Seeder for Azure SQL Database
 * Seeds default backend configuration, manufacturers, brands, and UOM standards
 */

import dotenv from 'dotenv';
import sql from 'mssql';
import path from 'path';
import {
  DEFAULT_CONFIG_SEEDS,
  FRACTION_SEEDS,
  MANUFACTURER_SEEDS,
  UOM_SEEDS,
} from './master_data_seeds';

dotenv.config({ path: path.resolve(__dirname, '../../apps/api/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectionString = process.env.AZURE_SQL_CONNECTION_STRING;

async function runSeed() {
  if (!connectionString) {
    console.error('AZURE_SQL_CONNECTION_STRING is not set in environment.');
    process.exit(1);
  }

  console.log('Connecting to Azure SQL Database for seeding...');
  const pool = await sql.connect(connectionString);
  console.log('Connected. Starting master data seeding...');

  try {
    // 1. Seed Backend Config
    console.log('Seeding backend_config...');
    for (const conf of DEFAULT_CONFIG_SEEDS) {
      const req = pool.request();
      req.input('key', sql.VarChar(150), conf.config_key);
      req.input('val', sql.NVarChar(sql.MAX), conf.config_value);
      req.input('type', sql.VarChar(30), conf.value_type);
      await req.query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.backend_config WHERE config_key = @key)
        BEGIN
          INSERT INTO dbo.backend_config (config_key, config_value, value_type)
          VALUES (@key, @val, @type);
        END;
      `);
    }

    // 2. Seed Default Admin User
    console.log('Seeding default administrator user...');
    const userReq = pool.request();
    userReq.input('uid', sql.VarChar(255), 'admin-user-001');
    userReq.input('email', sql.VarChar(255), 'admin@catalogforge.local');
    userReq.input('name', sql.VarChar(255), 'CatalogForge Admin');
    userReq.input('role', sql.VarChar(30), 'admin');
    await userReq.query(`
      IF NOT EXISTS (SELECT 1 FROM dbo.app_user WHERE uid = @uid)
      BEGIN
        INSERT INTO dbo.app_user (uid, email, display_name, role)
        VALUES (@uid, @email, @name, @role);
      END;
    `);

    console.log('Master data seeding completed successfully!');
  } catch (err) {
    console.error('Seeding encountered an error:', err);
  } finally {
    await pool.close();
    process.exit(0);
  }
}

runSeed();
