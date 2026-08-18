/**
 * AI Processing & Normalization Pipeline Service
 * Orchestrates raw input transformation, deterministic normalization, LOV validation,
 * confidence scoring, and review routing into Azure SQL
 */

import sql from 'mssql';
import { DEFAULT_MANUFACTURERS } from '../constants/master-data.constants';
import { getSqlPool } from '../plugins/db.plugin';
import { placeholderDetector } from './placeholder-detector.service';
import { uomNormalizer } from './uom-normalizer.service';

export const DEFAULT_BRAND_LIST = [
  { name: 'Square D', manufacturer_name: 'Square D', slug: 'square-d' },
  { name: 'Homeline', manufacturer_name: 'Square D', slug: 'homeline' },
  { name: 'QO', manufacturer_name: 'Square D', slug: 'qo' },
  { name: 'Cutler-Hammer', manufacturer_name: 'Eaton', slug: 'cutler-hammer' },
  { name: 'B-Line', manufacturer_name: 'Eaton', slug: 'b-line' },
  { name: 'Pass & Seymour', manufacturer_name: 'Legrand', slug: 'pass-and-seymour' },
  { name: 'Wiremold', manufacturer_name: 'Legrand', slug: 'wiremold' },
  { name: 'M18', manufacturer_name: 'Milwaukee Tool', slug: 'm18' },
  { name: 'M12', manufacturer_name: 'Milwaukee Tool', slug: 'm12' },
];

export interface RawInputRecord {
  part_number: string;
  manufacturer?: string;
  brand?: string;
  mfg_part_num?: string;
  part_title?: string;
  short_description?: string;
  long_description?: string;
  category_code?: string;
  category_name?: string;
  unspsc?: string;
  specs?: string;
}

export interface EnrichedProductOutput {
  partNumber: string;
  manufacturerName: string;
  brandName: string | null;
  manufacturerPartNumber: string | null;
  classpath: string;
  shortDesc: string;
  longDesc1: string | null;
  unspsc: string | null;
  rowConfidence: number;
  status: 'published' | 'pending_review';
  features: string[];
  attributes: Array<{
    label: string;
    value: string;
    uom: string | null;
    confidence: number;
  }>;
}

export class AiPipelineService {
  /**
   * Process and transform a raw product input
   */
  processRawInput(raw: RawInputRecord): EnrichedProductOutput {
    // 1. Clean placeholders
    const cleanTitle = placeholderDetector.cleanValue(raw.part_title || '').value || '';
    const cleanShortDesc = placeholderDetector.cleanValue(raw.short_description || '').value || '';
    const cleanLongDesc = placeholderDetector.cleanValue(raw.long_description || '').value || null;

    // 2. Resolve Manufacturer & Brand
    let mfgName = (raw.manufacturer || '').trim();
    let brandName = (raw.brand || '').trim() || null;

    const matchedMfg = DEFAULT_MANUFACTURERS.find(
      (m) =>
        m.name.toLowerCase() === mfgName.toLowerCase() ||
        (Array.isArray(m.aliases) && m.aliases.some((a) => a.toLowerCase() === mfgName.toLowerCase())),
    );
    if (matchedMfg) {
      mfgName = matchedMfg.name;
    }

    const matchedBrand = DEFAULT_BRAND_LIST.find(
      (b: { name: string; manufacturer_name: string; slug: string }) =>
        b.name.toLowerCase() === (brandName || '').toLowerCase(),
    );
    if (matchedBrand) {
      brandName = matchedBrand.name;
    }

    // 3. Classpath Resolution
    let classpath = 'Electrical > Distribution Equipment > Circuit Breakers';
    if (raw.category_name) {
      classpath = raw.category_name.includes('>')
        ? raw.category_name
        : `Industrial > General > ${raw.category_name}`;
    }

    // 4. Generate Standardized Short Description
    let generatedShortDesc = cleanShortDesc || cleanTitle || `${mfgName} ${raw.mfg_part_num || raw.part_number}`;
    generatedShortDesc = generatedShortDesc.substring(0, 150);

    // 5. Parse Specs into Attributes & Normalize UOM
    const attributes: Array<{ label: string; value: string; uom: string | null; confidence: number }> = [];
    if (raw.specs) {
      const specPairs = raw.specs.split(/[,;\n]/).map((s) => s.trim()).filter(Boolean);
      for (const pair of specPairs) {
        const parts = pair.split(/[:=]/);
        if (parts.length >= 2) {
          const label = parts[0]?.trim() || '';
          const rawVal = parts.slice(1).join(':').trim();
          const normResult = uomNormalizer.parseDimensionString(rawVal);
          attributes.push({
            label,
            value: normResult.value !== null ? `${normResult.value} ${normResult.uom || ''}`.trim() : rawVal,
            uom: normResult.uom,
            confidence: 0.92,
          });
        }
      }
    }

    // 6. Generate Bullet Features
    const features: string[] = [];
    if (cleanTitle) features.push(cleanTitle);
    if (cleanLongDesc) {
      const sentences = cleanLongDesc.split('.').map((s) => s.trim()).filter((s) => s.length > 10);
      features.push(...sentences.slice(0, 3));
    }

    // 7. Calculate Confidence Score
    let confidence = 0.80;
    if (matchedMfg) confidence += 0.08;
    if (matchedBrand) confidence += 0.05;
    if (generatedShortDesc.length > 15) confidence += 0.05;
    if (attributes.length > 0) confidence += 0.02;
    confidence = Math.min(0.99, Number(confidence.toFixed(2)));

    // 8. Auto-Publish vs Review Queue Routing
    const status: 'published' | 'pending_review' = confidence >= 0.85 ? 'published' : 'pending_review';

    return {
      partNumber: raw.part_number,
      manufacturerName: mfgName || 'Unknown Manufacturer',
      brandName,
      manufacturerPartNumber: raw.mfg_part_num || null,
      classpath,
      shortDesc: generatedShortDesc,
      longDesc1: cleanLongDesc,
      unspsc: raw.unspsc || null,
      rowConfidence: confidence,
      status,
      features,
      attributes,
    };
  }

  /**
   * Bulk persists enriched products into Azure SQL in a single fast operation
   */
  async persistProductBatch(
    items: Array<{ enriched: EnrichedProductOutput; rawInputId?: number }>,
  ): Promise<void> {
    const pool = getSqlPool();
    if (!pool || !pool.connected || items.length === 0) return;

    try {
      const table = new sql.Table('dbo.product');
      table.create = false;
      table.columns.add('raw_input_id', sql.BigInt, { nullable: true });
      table.columns.add('part_number', sql.VarChar(50), { nullable: false });
      table.columns.add('manufacturer_name', sql.VarChar(255), { nullable: true });
      table.columns.add('brand_name', sql.VarChar(255), { nullable: true });
      table.columns.add('manufacturer_part_number', sql.VarChar(100), { nullable: true });
      table.columns.add('classpath', sql.VarChar(500), { nullable: true });
      table.columns.add('short_desc', sql.VarChar(150), { nullable: true });
      table.columns.add('long_desc1', sql.NVarChar(sql.MAX), { nullable: true });
      table.columns.add('unspsc', sql.VarChar(50), { nullable: true });
      table.columns.add('row_confidence', sql.Decimal(5, 2), { nullable: true });
      table.columns.add('status', sql.VarChar(30), { nullable: false });

      items.forEach(({ enriched, rawInputId }) => {
        table.rows.add(
          rawInputId || null,
          (enriched.partNumber || 'UNKNOWN').substring(0, 50),
          enriched.manufacturerName ? enriched.manufacturerName.substring(0, 255) : null,
          enriched.brandName ? enriched.brandName.substring(0, 255) : null,
          enriched.manufacturerPartNumber ? enriched.manufacturerPartNumber.substring(0, 100) : null,
          enriched.classpath ? enriched.classpath.substring(0, 500) : null,
          enriched.shortDesc ? enriched.shortDesc.substring(0, 150) : null,
          enriched.longDesc1 || null,
          enriched.unspsc ? enriched.unspsc.substring(0, 50) : null,
          enriched.rowConfidence,
          enriched.status,
        );
      });

      const request = pool.request();
      await request.bulk(table);
    } catch (err) {
      console.error('[AiPipeline] Failed to bulk persist products:', err);
    }
  }

  /**
   * Persists an enriched product into Azure SQL
   */
  async persistProduct(enriched: EnrichedProductOutput, rawInputId?: number): Promise<number | null> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) return null;

    try {
      const req = pool.request();
      req.input('raw_input_id', sql.BigInt, rawInputId || null);
      req.input('part_number', sql.VarChar(50), enriched.partNumber.substring(0, 50));
      req.input('manufacturer_name', sql.VarChar(255), enriched.manufacturerName.substring(0, 255));
      req.input('brand_name', sql.VarChar(255), enriched.brandName ? enriched.brandName.substring(0, 255) : null);
      req.input('manufacturer_part_number', sql.VarChar(100), enriched.manufacturerPartNumber ? enriched.manufacturerPartNumber.substring(0, 100) : null);
      req.input('classpath', sql.VarChar(500), enriched.classpath ? enriched.classpath.substring(0, 500) : null);
      req.input('short_desc', sql.VarChar(150), enriched.shortDesc ? enriched.shortDesc.substring(0, 150) : null);
      req.input('long_desc1', sql.NVarChar(sql.MAX), enriched.longDesc1);
      req.input('unspsc', sql.VarChar(50), enriched.unspsc ? enriched.unspsc.substring(0, 50) : null);
      req.input('row_confidence', sql.Decimal(5, 2), enriched.rowConfidence);
      req.input('status', sql.VarChar(30), enriched.status);

      const res = await req.query(`
        INSERT INTO dbo.product (
          raw_input_id, part_number, manufacturer_name, brand_name, manufacturer_part_number,
          classpath, short_desc, long_desc1, unspsc, row_confidence, status
        )
        OUTPUT INSERTED.product_id
        VALUES (
          @raw_input_id, @part_number, @manufacturer_name, @brand_name, @manufacturer_part_number,
          @classpath, @short_desc, @long_desc1, @unspsc, @row_confidence, @status
        );
      `);

      const productId = res.recordset[0]?.product_id;

      // If pending review, create review item
      if (enriched.status === 'pending_review' && productId) {
        const revReq = pool.request();
        revReq.input('product_id', sql.BigInt, productId);
        revReq.input('reason', sql.VarChar(1000), `Confidence score (${enriched.rowConfidence}) below 0.85 threshold`);
        revReq.input('row_confidence', sql.Decimal(5, 2), enriched.rowConfidence);
        await revReq.query(`
          INSERT INTO dbo.review_item (product_id, status, reason, row_confidence)
          VALUES (@product_id, 'pending', @reason, @row_confidence);
        `);
      }

      return productId;
    } catch (err) {
      console.error('[AiPipeline] Failed to persist product:', err);
      return null;
    }
  }
}

export const aiPipelineService = new AiPipelineService();
