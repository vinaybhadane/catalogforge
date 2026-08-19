/**
 * AI Processing & Normalization Pipeline Service
 * Orchestrates raw input transformation, Brave Search web enrichment, LOV validation,
 * strict manufacturer primary asset extraction, and database persistence.
 */

import sql from 'mssql';
import { DEFAULT_MANUFACTURERS } from '../constants/master-data.constants';
import { getSqlPool } from '../plugins/db.plugin';
import { braveSearchService, ExtractedProductIntelligence } from './brave-search.service';
import { placeholderDetector } from './placeholder-detector.service';
import { sourceGovernor } from './source-governor.service';
import { uomNormalizer } from './uom-normalizer.service';

export const DEFAULT_BRAND_LIST = [
  { name: 'Square D', manufacturer_name: 'Square D', slug: 'square-d' },
  { name: 'Diablo', manufacturer_name: 'Freud Inc', slug: 'diablo' },
  { name: 'Cubitron II', manufacturer_name: '3M', slug: 'cubitron-ii' },
  { name: 'Stikit', manufacturer_name: '3M', slug: 'stikit' },
  { name: 'HIOLIT', manufacturer_name: 'Mirka Abrasives Inc', slug: 'hiolit' },
  { name: 'Abranet', manufacturer_name: 'Mirka Abrasives Inc', slug: 'abranet' },
  { name: 'Steel Demon', manufacturer_name: 'Freud Inc', slug: 'steel-demon' },
  { name: 'Speed Demon', manufacturer_name: 'Freud Inc', slug: 'speed-demon' },
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
  assets?: Array<{
    assetType: string;
    fileName: string;
    sourceUrl: string;
    isFromManufacturer: boolean;
  }>;
  evidence?: any[];
}

export class AiPipelineService {
  /**
   * Process and transform a raw product input with deterministic parsing
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
        b.name.toLowerCase() === (brandName || '').toLowerCase() ||
        (cleanTitle && cleanTitle.toLowerCase().includes(b.name.toLowerCase())),
    );
    if (matchedBrand) {
      brandName = matchedBrand.name;
      if (!matchedMfg && matchedBrand.manufacturer_name) {
        mfgName = matchedBrand.manufacturer_name;
      }
    }

    // 3. Classpath Resolution (Abrasives, Distribution, Industrial)
    let classpath = 'Industrial > Abrasives > Sanding & Grinding Discs';
    const textSample = `${cleanTitle} ${cleanShortDesc} ${raw.category_name || ''}`.toLowerCase();

    if (textSample.includes('circuit breaker') || textSample.includes('120v') || textSample.includes('panelboard')) {
      classpath = 'Electrical > Distribution Equipment > Circuit Breakers';
    } else if (textSample.includes('sanding belt') || textSample.includes('diablo')) {
      classpath = 'Industrial > Abrasives > Sanding Belts';
    } else if (textSample.includes('cut off disc') || textSample.includes('cut-off')) {
      classpath = 'Industrial > Abrasives > Cut-Off Discs & Wheels';
    } else if (textSample.includes('film') || textSample.includes('cubitron') || textSample.includes('abranet') || textSample.includes('hiolit')) {
      classpath = 'Industrial > Abrasives > Abrasive Discs & Sandpaper';
    } else if (raw.category_name) {
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

    // 6. Extract inline attributes from descriptions (Grit, dimensions, pack count)
    const gritMatch = textSample.match(/\b(p\d{2,4}|\d{2,4}\s*grit)\b/i);
    if (gritMatch && !attributes.some((a) => a.label.toLowerCase() === 'grit')) {
      attributes.push({
        label: 'Grit',
        value: gritMatch[1]!.toUpperCase(),
        uom: null,
        confidence: 0.95,
      });
    }

    const dimMatch = textSample.match(/(\d+(?:\/\d+)?(?:\.\d+)?)\s*(?:x|\*|by)\s*(\d+(?:\/\d+)?(?:\.\d+)?)\s*(?:inch|in|""|mm)?/i);
    if (dimMatch && !attributes.some((a) => a.label.toLowerCase() === 'dimensions')) {
      attributes.push({
        label: 'Dimensions',
        value: `${dimMatch[1]}" x ${dimMatch[2]}"`,
        uom: 'IN',
        confidence: 0.94,
      });
    }

    // 7. Generate Bullet Features
    const features: string[] = [];
    if (cleanTitle) features.push(cleanTitle);
    if (brandName) features.push(`Engineered by ${mfgName || 'OEM'} under ${brandName} line`);
    if (cleanLongDesc) {
      const sentences = cleanLongDesc.split('.').map((s) => s.trim()).filter((s) => s.length > 10);
      features.push(...sentences.slice(0, 3));
    }

    // 8. Calculate Confidence Score
    let confidence = 0.82;
    if (matchedMfg) confidence += 0.08;
    if (matchedBrand) confidence += 0.04;
    if (generatedShortDesc.length > 15) confidence += 0.04;
    if (attributes.length > 0) confidence += 0.02;
    confidence = Math.min(0.99, Number(confidence.toFixed(2)));

    // 9. Auto-Publish vs Review Queue Routing
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
   * Enriches a product using live Brave Search API with strict manufacturer primary sourcing
   */
  async enrichProductWithLiveSearch(
    partNumber: string,
    manufacturer?: string,
  ): Promise<ExtractedProductIntelligence> {
    return braveSearchService.searchProduct(partNumber, manufacturer);
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
   * Persists an enriched product into Azure SQL with features, attributes, and manufacturer assets
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

      if (productId) {
        // Persist bullet features
        if (enriched.features && enriched.features.length > 0) {
          for (let i = 0; i < enriched.features.length; i++) {
            const fReq = pool.request();
            fReq.input('product_id', sql.BigInt, productId);
            fReq.input('sequence', sql.Int, i + 1);
            fReq.input('feature_text', sql.NVarChar(sql.MAX), enriched.features[i]);
            await fReq.query(`
              INSERT INTO dbo.product_feature (product_id, sequence, feature_text)
              VALUES (@product_id, @sequence, @feature_text);
            `).catch(() => null);
          }
        }

        // Persist attributes
        if (enriched.attributes && enriched.attributes.length > 0) {
          for (let i = 0; i < enriched.attributes.length; i++) {
            const attr = enriched.attributes[i]!;
            const aReq = pool.request();
            aReq.input('product_id', sql.BigInt, productId);
            aReq.input('sequence', sql.Int, i + 1);
            aReq.input('attribute_label', sql.VarChar(100), attr.label);
            aReq.input('attribute_value', sql.NVarChar(sql.MAX), attr.value);
            aReq.input('attribute_uom', sql.VarChar(50), attr.uom);
            aReq.input('confidence_score', sql.Decimal(5, 2), attr.confidence);
            await aReq.query(`
              INSERT INTO dbo.product_attribute (product_id, sequence, attribute_label, attribute_value, attribute_uom, confidence_score)
              VALUES (@product_id, @sequence, @attribute_label, @attribute_value, @attribute_uom, @confidence_score);
            `).catch(() => null);
          }
        }

        // If pending review, create review item
        if (enriched.status === 'pending_review') {
          const revReq = pool.request();
          revReq.input('product_id', sql.BigInt, productId);
          revReq.input('reason', sql.VarChar(1000), `Confidence score (${enriched.rowConfidence}) below 0.85 threshold`);
          revReq.input('row_confidence', sql.Decimal(5, 2), enriched.rowConfidence);
          await revReq.query(`
            INSERT INTO dbo.review_item (product_id, status, reason, row_confidence)
            VALUES (@product_id, 'pending', @reason, @row_confidence);
          `).catch(() => null);
        }
      }

      return productId;
    } catch (err) {
      console.error('[AiPipeline] Failed to persist product:', err);
      return null;
    }
  }
}

export const aiPipelineService = new AiPipelineService();
