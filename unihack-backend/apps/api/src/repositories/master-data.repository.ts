/**
 * Master Data Repository
 * Queries master manufacturers, brands, LOV taxonomies, domain allowlists, and field definitions
 */

import { FieldDefinition } from '@unihack/contracts';
import sql from 'mssql';
import { DEFAULT_FIELD_DEFINITIONS, DEFAULT_MANUFACTURERS } from '../constants/master-data.constants';
import { getSqlPool } from '../plugins/db.plugin';

export class MasterDataRepository {
  /**
   * Retrieves UI field metadata definitions
   */
  async getFieldDefinitions(): Promise<FieldDefinition[]> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      return DEFAULT_FIELD_DEFINITIONS.map((f) => ({
        key: f.field_key,
        label: f.label,
        type: f.field_type as FieldDefinition['type'],
        group: f.field_group as FieldDefinition['group'],
        editable: f.editable,
        charLimit: f.char_limit,
        required: f.required,
        helpText: f.help_text,
      }));
    }

    try {
      const request = pool.request();
      const result = await request.query(`
        SELECT
          field_key AS [key],
          label,
          field_type AS [type],
          field_group AS [group],
          editable,
          char_limit AS charLimit,
          required,
          help_text AS helpText
        FROM dbo.field_definition
      `);

      if (result.recordset.length === 0) {
        return DEFAULT_FIELD_DEFINITIONS.map((f) => ({
          key: f.field_key,
          label: f.label,
          type: f.field_type as FieldDefinition['type'],
          group: f.field_group as FieldDefinition['group'],
          editable: f.editable,
          charLimit: f.char_limit,
          required: f.required,
          helpText: f.help_text,
        }));
      }

      return result.recordset;
    } catch {
      return DEFAULT_FIELD_DEFINITIONS.map((f) => ({
        key: f.field_key,
        label: f.label,
        type: f.field_type as FieldDefinition['type'],
        group: f.field_group as FieldDefinition['group'],
        editable: f.editable,
        charLimit: f.char_limit,
        required: f.required,
        helpText: f.help_text,
      }));
    }
  }

  /**
   * Verifies if a domain is on the approved manufacturer source allowlist
   */
  async isDomainAllowed(domain: string): Promise<boolean> {
    const cleanDomain = domain.toLowerCase().replace(/^www\./, '');

    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      const allowedStatic = DEFAULT_MANUFACTURERS.some((m) => m.website_domain === cleanDomain);
      return allowedStatic || cleanDomain.includes('se.com') || cleanDomain.includes('eaton.com') || cleanDomain.includes('siemens.com');
    }

    try {
      const request = pool.request();
      request.input('domain', sql.VarChar(255), cleanDomain);
      const result = await request.query(`
        SELECT 1 AS allowed FROM dbo.manufacturer_domain_allowlist
        WHERE domain = @domain AND is_trusted = 1
      `);
      return result.recordset.length > 0;
    } catch {
      return true;
    }
  }
}

export const masterDataRepository = new MasterDataRepository();
