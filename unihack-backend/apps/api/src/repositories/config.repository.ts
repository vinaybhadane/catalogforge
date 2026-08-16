/**
 * Backend Configuration Repository
 * Manages system thresholds, upload policies, and feature flags in backend_config
 */

import { BackendConfigResponse } from '@unihack/contracts';
import sql from 'mssql';
import { getSqlPool } from '../plugins/db.plugin';

const defaultConfig: BackendConfigResponse = {
  upload: {
    allowedExtensions: ['csv', 'xlsx', 'pdf'],
    maxFileSizeBytes: 52428800, // 50MB
    maxRowsPerFile: 10000,
  },
  reviewPolicy: {
    confidenceThreshold: 0.85,
    autoPublishThreshold: 0.9,
    requireHumanReviewOnWarning: true,
  },
  fieldsVersion: 'v1.0.0',
  features: {
    enableAutoPublish: true,
    enableDomainAllowlist: true,
    enableStrictLov: true,
  },
};

export class ConfigRepository {
  /**
   * Retrieves unified system configuration
   */
  async getConfig(): Promise<BackendConfigResponse> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      return defaultConfig;
    }

    try {
      const request = pool.request();
      const result = await request.query(`
        SELECT config_key AS configKey, config_value AS configValue, value_type AS valueType
        FROM dbo.backend_config
      `);

      const configMap = new Map<string, string>();
      result.recordset.forEach((row) => {
        configMap.set(row.configKey, row.configValue);
      });

      const confThreshold = configMap.get('review.confidenceThreshold');
      const autoPubThreshold = configMap.get('review.autoPublishThreshold');
      const maxFileSize = configMap.get('upload.maxFileSizeBytes');
      const allowedExtsRaw = configMap.get('upload.allowedExtensions');

      return {
        upload: {
          allowedExtensions: allowedExtsRaw
            ? JSON.parse(allowedExtsRaw)
            : defaultConfig.upload.allowedExtensions,
          maxFileSizeBytes: maxFileSize ? parseInt(maxFileSize, 10) : defaultConfig.upload.maxFileSizeBytes,
          maxRowsPerFile: defaultConfig.upload.maxRowsPerFile,
        },
        reviewPolicy: {
          confidenceThreshold: confThreshold ? parseFloat(confThreshold) : defaultConfig.reviewPolicy.confidenceThreshold,
          autoPublishThreshold: autoPubThreshold ? parseFloat(autoPubThreshold) : defaultConfig.reviewPolicy.autoPublishThreshold,
          requireHumanReviewOnWarning: defaultConfig.reviewPolicy.requireHumanReviewOnWarning,
        },
        fieldsVersion: defaultConfig.fieldsVersion,
        features: {
          enableAutoPublish: configMap.get('features.enableAutoPublish') === 'true',
          enableDomainAllowlist: configMap.get('features.enableDomainAllowlist') !== 'false',
          enableStrictLov: configMap.get('features.enableStrictLov') !== 'false',
        },
      };
    } catch {
      return defaultConfig;
    }
  }

  /**
   * Sets or updates a config key
   */
  async setConfig(key: string, value: string, valueType = 'string', user = 'system'): Promise<void> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) return;

    const request = pool.request();
    request.input('key', sql.VarChar(150), key);
    request.input('value', sql.NVarChar(sql.MAX), value);
    request.input('type', sql.VarChar(30), valueType);
    request.input('user', sql.VarChar(255), user);

    await request.query(`
      MERGE dbo.backend_config AS target
      USING (SELECT @key AS config_key, @value AS config_value, @type AS value_type, @user AS updated_by) AS source
      ON target.config_key = source.config_key
      WHEN MATCHED THEN
        UPDATE SET
          config_value = source.config_value,
          value_type = source.value_type,
          version = target.version + 1,
          updated_at = SYSUTCDATETIME(),
          updated_by = source.updated_by
      WHEN NOT MATCHED THEN
        INSERT (config_key, config_value, value_type, version, updated_at, updated_by)
        VALUES (source.config_key, source.config_value, source.value_type, 1, SYSUTCDATETIME(), source.updated_by);
    `);
  }
}

export const configRepository = new ConfigRepository();
