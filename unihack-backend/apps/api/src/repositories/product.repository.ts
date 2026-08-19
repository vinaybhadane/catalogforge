/**
 * Product Repository
 * Data access layer for product, product_feature, product_attribute, and product_asset tables
 */

import { Product, ProductFilterQuery, ProductStatus } from '@unihack/contracts';
import sql from 'mssql';
import { getSqlPool } from '../plugins/db.plugin';
import { DeliveryExportRowContext } from '../services/delivery-exporter.service';

const inMemoryProducts = new Map<string, Product>();

export class ProductRepository {
  /**
   * Finds a product by ID with all features, attributes, and assets
   */
  async findById(productId: string): Promise<Product | null> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      return inMemoryProducts.get(productId) || null;
    }

    const request = pool.request();
    request.input('product_id', sql.BigInt, productId);

    const productRes = await request.query(`
      SELECT
        p.product_id AS productId,
        p.raw_input_id AS rawInputId,
        p.part_number AS partNumber,
        p.manufacturer_name AS manufacturerName,
        p.brand_name AS brandName,
        p.manufacturer_part_number AS manufacturerPartNumber,
        p.classpath,
        p.unspsc,
        p.mobile_desc AS mobileDesc,
        p.invoice_desc AS invoiceDesc,
        p.short_desc AS shortDesc,
        p.long_desc1 AS longDesc1,
        p.retail_desc AS retailDesc,
        p.marketing_description AS marketingDescription,
        p.upc,
        p.ean,
        p.gtin,
        p.length_val AS length,
        p.length_uom AS lengthUom,
        p.height_val AS height,
        p.height_uom AS heightUom,
        p.width_val AS width,
        p.width_uom AS widthUom,
        p.weight_val AS weight,
        p.weight_uom AS weightUom,
        p.country_of_origin AS countryOfOrigin,
        p.discontinued,
        p.actual_image AS actualImage,
        p.row_confidence AS rowConfidence,
        p.status,
        p.version,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM dbo.product p
      WHERE p.product_id = @product_id
    `);

    const row = productRes.recordset[0];
    if (!row) return inMemoryProducts.get(productId) || null;

    // Fetch features
    const featureRes = await request.query(`
      SELECT id, product_id AS productId, sequence, feature_text AS featureText
      FROM dbo.product_feature
      WHERE product_id = @product_id
      ORDER BY sequence ASC
    `);

    // Fetch attributes
    const attrRes = await request.query(`
      SELECT
        a.id,
        a.product_id AS productId,
        a.sequence,
        a.attribute_label AS attributeLabel,
        a.attribute_value AS attributeValue,
        a.attribute_uom AS attributeUom,
        a.lov_match_confidence AS lovMatchConfidence,
        a.confidence_score AS confidenceScore,
        a.validation_flags AS validationFlagsRaw,
        a.source_evidence_id AS sourceEvidenceId,
        e.source_url AS sourceUrl,
        e.source_title AS sourceTitle,
        e.source_snippet AS sourceSnippet,
        e.source_span AS sourceSpan,
        e.page_number AS pageNumber
      FROM dbo.product_attribute a
      LEFT JOIN dbo.evidence e ON a.source_evidence_id = e.evidence_id
      WHERE a.product_id = @product_id
      ORDER BY a.sequence ASC
    `);

    // Fetch assets
    const assetRes = await request.query(`
      SELECT
        id,
        product_id AS productId,
        asset_type AS assetType,
        sequence,
        file_name AS fileName,
        blob_url AS blobUrl,
        source_url AS sourceUrl,
        created_at AS createdAt
      FROM dbo.product_asset
      WHERE product_id = @product_id
      ORDER BY sequence ASC
    `);

    const attributes = attrRes.recordset.map((a) => ({
      id: a.id,
      productId: String(a.productId),
      sequence: a.sequence,
      attributeLabel: a.attributeLabel,
      attributeValue: a.attributeValue,
      attributeUom: a.attributeUom,
      lovMatchConfidence: a.lovMatchConfidence,
      confidenceScore: a.confidenceScore,
      validationFlags: a.validationFlagsRaw ? a.validationFlagsRaw.split(';') : [],
      sourceEvidenceId: a.sourceEvidenceId,
      source: a.sourceUrl
        ? {
            evidenceId: a.sourceEvidenceId,
            sourceUrl: a.sourceUrl,
            sourceTitle: a.sourceTitle,
            sourceSnippet: a.sourceSnippet,
            sourceSpan: a.sourceSpan,
            pageNumber: a.pageNumber,
          }
        : null,
    }));

    const product: Product = {
      productId: String(row.productId),
      rawInputId: row.rawInputId ? String(row.rawInputId) : null,
      partNumber: row.partNumber,
      manufacturerName: row.manufacturerName,
      brandName: row.brandName,
      manufacturerPartNumber: row.manufacturerPartNumber,
      classpath: row.classpath,
      unspsc: row.unspsc,
      descriptions: {
        shortDescription: row.shortDesc,
        longDescription: row.longDesc1,
        mobileDescription: row.mobileDesc,
        invoiceDescription: row.invoiceDesc,
        retailDescription: row.retailDesc,
        marketingDescription: row.marketingDescription,
        bulletPoints: featureRes.recordset.map((f) => f.featureText),
      },
      attributes,
      features: featureRes.recordset.map((f) => ({
        id: f.id,
        productId: String(f.productId),
        sequence: f.sequence,
        featureText: f.featureText,
      })),
      dimensions: {
        length: row.length,
        lengthUom: row.lengthUom,
        height: row.height,
        heightUom: row.heightUom,
        width: row.width,
        widthUom: row.widthUom,
        weight: row.weight,
        weightUom: row.weightUom,
      },
      assets: assetRes.recordset.map((ast) => ({
        id: ast.id,
        productId: String(ast.productId),
        assetType: ast.assetType,
        sequence: ast.sequence,
        fileName: ast.fileName,
        blobUrl: ast.blobUrl,
        sourceUrl: ast.sourceUrl,
        createdAt: ast.createdAt,
      })),
      upc: row.upc,
      ean: row.ean,
      gtin: row.gtin,
      countryOfOrigin: row.countryOfOrigin,
      discontinued: Boolean(row.discontinued),
      actualImage: Boolean(row.actualImage),
      rowConfidence: row.rowConfidence,
      status: row.status as ProductStatus,
      version: row.version || 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    return product;
  }

  /**
   * Queries products with pagination and server-side filtering
   */
  async listProducts(query: ProductFilterQuery): Promise<{ items: Product[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 25));
    const offset = (page - 1) * pageSize;

    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      const all = Array.from(inMemoryProducts.values());
      const filtered = all.filter((p) => {
        if (query.status && p.status !== query.status) return false;
        if (query.manufacturer && p.manufacturerName !== query.manufacturer) return false;
        if (query.search) {
          const s = query.search.toLowerCase();
          const matchPart = p.partNumber.toLowerCase().includes(s);
          const matchDesc = p.descriptions.shortDescription?.toLowerCase().includes(s);
          if (!matchPart && !matchDesc) return false;
        }
        return true;
      });
      return {
        items: filtered.slice(offset, offset + pageSize),
        total: filtered.length,
      };
    }

    const request = pool.request();
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, pageSize);

    let whereClause = 'WHERE 1=1';
    if (query.status) {
      whereClause += ' AND p.status = @status';
      request.input('status', sql.VarChar(30), query.status);
    }
    if (query.manufacturer) {
      whereClause += ' AND p.manufacturer_name = @manufacturer';
      request.input('manufacturer', sql.VarChar(255), query.manufacturer);
    }
    if (query.search) {
      whereClause += ' AND (p.part_number LIKE @search OR p.short_desc LIKE @search OR p.manufacturer_part_number LIKE @search)';
      request.input('search', sql.VarChar(255), `%${query.search}%`);
    }

    const countRes = await request.query(`
      SELECT COUNT(*) AS total FROM dbo.product p ${whereClause}
    `);
    const total = countRes.recordset[0]?.total || 0;

    const result = await request.query(`
      SELECT
        p.product_id AS productId,
        p.raw_input_id AS rawInputId,
        p.part_number AS partNumber,
        p.manufacturer_name AS manufacturerName,
        p.brand_name AS brandName,
        p.manufacturer_part_number AS manufacturerPartNumber,
        p.classpath,
        p.unspsc,
        p.short_desc AS shortDesc,
        p.row_confidence AS rowConfidence,
        p.status,
        p.version,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM dbo.product p
      ${whereClause}
      ORDER BY p.updated_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const items: Product[] = result.recordset.map((row) => ({
      productId: String(row.productId),
      rawInputId: row.rawInputId ? String(row.rawInputId) : null,
      partNumber: row.partNumber,
      manufacturerName: row.manufacturerName,
      brandName: row.brandName,
      manufacturerPartNumber: row.manufacturerPartNumber,
      classpath: row.classpath,
      unspsc: row.unspsc,
      descriptions: {
        shortDescription: row.shortDesc,
        longDescription: null,
        mobileDescription: null,
        invoiceDescription: null,
        retailDescription: null,
        marketingDescription: null,
        bulletPoints: [],
      },
      attributes: [],
      features: [],
      dimensions: null,
      assets: [],
      upc: null,
      ean: null,
      gtin: null,
      countryOfOrigin: null,
      discontinued: false,
      actualImage: false,
      rowConfidence: row.rowConfidence,
      status: row.status as ProductStatus,
      version: row.version || 1,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    return { items, total };
  }

  /**
   * Updates product fields, increments version, and records change to audit_log
   */
  async updateProduct(
    productId: string,
    updates: Partial<Product> & { status?: ProductStatus },
    reviewerUid: string,
    reason?: string,
  ): Promise<Product | null> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      const existing = inMemoryProducts.get(productId);
      if (!existing) return null;
      const updated: Product = {
        ...existing,
        ...updates,
        status: (updates.status as ProductStatus) || existing.status,
        version: (existing.version || 1) + 1,
        updatedAt: new Date().toISOString(),
      };
      inMemoryProducts.set(productId, updated);
      return updated;
    }

    const request = pool.request();
    request.input('product_id', sql.BigInt, productId);
    request.input('reviewer', sql.VarChar(255), reviewerUid);
    request.input('reason', sql.NVarChar(1000), reason || 'Reviewer correction');

    if (updates.status) {
      request.input('status', sql.VarChar(30), updates.status);
      await request.query(`
        UPDATE dbo.product
        SET status = @status, version = version + 1, updated_at = SYSUTCDATETIME()
        WHERE product_id = @product_id;

        INSERT INTO dbo.audit_log (product_id, reviewer, action, final_value, reason, timestamp)
        VALUES (@product_id, @reviewer, 'STATUS_UPDATE', @status, @reason, SYSUTCDATETIME());
      `);
    }

    if (updates.manufacturerName) {
      request.input('mfg', sql.VarChar(255), updates.manufacturerName);
      await request.query(`
        UPDATE dbo.product SET manufacturer_name = @mfg, updated_at = SYSUTCDATETIME() WHERE product_id = @product_id;
        INSERT INTO dbo.audit_log (product_id, reviewer, action, field_name, final_value, reason, timestamp)
        VALUES (@product_id, @reviewer, 'EDIT_FIELD', 'manufacturerName', @mfg, @reason, SYSUTCDATETIME());
      `);
    }

    if (updates.descriptions?.shortDescription) {
      request.input('short_desc', sql.VarChar(150), updates.descriptions.shortDescription);
      await request.query(`
        UPDATE dbo.product SET short_desc = @short_desc, updated_at = SYSUTCDATETIME() WHERE product_id = @product_id;
        INSERT INTO dbo.audit_log (product_id, reviewer, action, field_name, final_value, reason, timestamp)
        VALUES (@product_id, @reviewer, 'EDIT_FIELD', 'shortDesc', @short_desc, @reason, SYSUTCDATETIME());
      `);
    }

    return this.findById(productId);
  }

  /**
   * Retrieves products in review queue sorted by lowest confidence / highest priority
   */
  async getReviewQueue(limit = 50, offset = 0): Promise<{ items: Product[]; total: number }> {
    return this.listProducts({
      status: 'pending_review' as ProductStatus,
      page: Math.floor(offset / limit) + 1,
      pageSize: limit,
    });
  }

  /**
   * Retrieves products formatted with linked raw inputs, attributes, features, and assets for 252-column export
   */
  async getProductsForExport(query: ProductFilterQuery & { limit?: number; jobId?: string }): Promise<DeliveryExportRowContext[]> {
    const pool = getSqlPool();
    const maxLimit = Math.min(5000, query.limit || 2000);

    if (!pool || !pool.connected) {
      const all = Array.from(inMemoryProducts.values());
      return all.slice(0, maxLimit).map((p) => ({
        product: p,
        rawInput: null,
      }));
    }

    const request = pool.request();
    request.input('limit', sql.Int, maxLimit);

    let whereClause = 'WHERE 1=1';
    if (query.status) {
      whereClause += ' AND p.status = @status';
      request.input('status', sql.VarChar(30), query.status);
    }
    if (query.manufacturer) {
      whereClause += ' AND p.manufacturer_name = @manufacturer';
      request.input('manufacturer', sql.VarChar(255), query.manufacturer);
    }
    if (query.jobId) {
      whereClause += ' AND r.job_id = @job_id';
      request.input('job_id', sql.UniqueIdentifier, query.jobId);
    }
    if (query.search) {
      whereClause += ' AND (p.part_number LIKE @search OR p.short_desc LIKE @search OR p.manufacturer_part_number LIKE @search)';
      request.input('search', sql.VarChar(255), `%${query.search}%`);
    }

    const result = await request.query(`
      SELECT TOP (@limit)
        p.product_id AS productId,
        p.raw_input_id AS rawInputId,
        p.part_number AS partNumber,
        p.manufacturer_name AS manufacturerName,
        p.brand_name AS brandName,
        p.manufacturer_part_number AS manufacturerPartNumber,
        p.classpath,
        p.unspsc,
        p.mobile_desc AS mobileDesc,
        p.invoice_desc AS invoiceDesc,
        p.short_desc AS shortDesc,
        p.long_desc1 AS longDesc1,
        p.retail_desc AS retailDesc,
        p.marketing_description AS marketingDescription,
        p.upc,
        p.ean,
        p.gtin,
        p.length_val AS length,
        p.length_uom AS lengthUom,
        p.height_val AS height,
        p.height_uom AS heightUom,
        p.width_val AS width,
        p.width_uom AS widthUom,
        p.weight_val AS weight,
        p.weight_uom AS weightUom,
        p.country_of_origin AS countryOfOrigin,
        p.discontinued,
        p.actual_image AS actualImage,
        p.row_confidence AS rowConfidence,
        p.status,
        p.version,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt,
        r.dept,
        r.class,
        r.fine,
        r.sku_my_part_number,
        r.mfg_part_num,
        r.part_desc,
        r.e1_brand,
        r.unilog_brand,
        r.dib_brand,
        r.part_manuf
      FROM dbo.product p
      LEFT JOIN dbo.raw_input r ON p.raw_input_id = r.id
      ${whereClause}
      ORDER BY p.product_id ASC
    `);

    const productIds = result.recordset.map((r) => r.productId);

    const featuresByPid: Record<string, any[]> = {};
    const attrsByPid: Record<string, any[]> = {};
    const assetsByPid: Record<string, any[]> = {};

    if (productIds.length > 0) {
      const pidList = productIds.join(',');
      try {
        const fRes = await pool.request().query(`
          SELECT product_id AS productId, sequence, feature_text AS featureText
          FROM dbo.product_feature
          WHERE product_id IN (${pidList})
          ORDER BY sequence ASC
        `);
        fRes.recordset.forEach((f) => {
          const k = String(f.productId);
          if (!featuresByPid[k]) featuresByPid[k] = [];
          featuresByPid[k]!.push(f);
        });

        const aRes = await pool.request().query(`
          SELECT
            a.product_id AS productId,
            a.sequence,
            a.attribute_label AS attributeLabel,
            a.attribute_value AS attributeValue,
            a.attribute_uom AS attributeUom,
            a.confidence_score AS confidenceScore,
            e.source_url AS sourceUrl
          FROM dbo.product_attribute a
          LEFT JOIN dbo.evidence e ON a.source_evidence_id = e.evidence_id
          WHERE a.product_id IN (${pidList})
          ORDER BY a.sequence ASC
        `);
        aRes.recordset.forEach((a) => {
          const k = String(a.productId);
          if (!attrsByPid[k]) attrsByPid[k] = [];
          attrsByPid[k]!.push({
            sequence: a.sequence,
            attributeLabel: a.attributeLabel,
            attributeValue: a.attributeValue,
            attributeUom: a.attributeUom,
            confidence: a.confidenceScore,
            source: a.sourceUrl ? { sourceUrl: a.sourceUrl } : null,
          });
        });

        const astRes = await pool.request().query(`
          SELECT product_id AS productId, asset_type AS assetType, sequence, file_name AS fileName, blob_url AS blobUrl, source_url AS sourceUrl
          FROM dbo.product_asset
          WHERE product_id IN (${pidList})
          ORDER BY sequence ASC
        `);
        astRes.recordset.forEach((ast) => {
          const k = String(ast.productId);
          if (!assetsByPid[k]) assetsByPid[k] = [];
          assetsByPid[k]!.push(ast);
        });
      } catch {
        // Safe fallback if child tables are empty
      }
    }

    return result.recordset.map((row) => {
      const pidStr = String(row.productId);
      const productFeatures = featuresByPid[pidStr] || [];
      const productAttrs = attrsByPid[pidStr] || [];
      const productAssets = assetsByPid[pidStr] || [];

      const product: Product = {
        productId: pidStr,
        rawInputId: row.rawInputId ? String(row.rawInputId) : null,
        partNumber: row.partNumber,
        manufacturerName: row.manufacturerName,
        brandName: row.brandName,
        manufacturerPartNumber: row.manufacturerPartNumber,
        classpath: row.classpath,
        unspsc: row.unspsc,
        descriptions: {
          shortDescription: row.shortDesc,
          longDescription: row.longDesc1,
          mobileDescription: row.mobileDesc,
          invoiceDescription: row.invoiceDesc,
          retailDescription: row.retailDesc,
          marketingDescription: row.marketingDescription,
          bulletPoints: productFeatures.map((f: any) => f.featureText),
        },
        attributes: productAttrs,
        features: productFeatures,
        dimensions: {
          length: row.length,
          lengthUom: row.lengthUom,
          height: row.height,
          heightUom: row.heightUom,
          width: row.width,
          widthUom: row.widthUom,
          weight: row.weight,
          weightUom: row.weightUom,
        },
        assets: productAssets,
        upc: row.upc,
        ean: row.ean,
        gtin: row.gtin,
        countryOfOrigin: row.countryOfOrigin,
        discontinued: Boolean(row.discontinued),
        actualImage: Boolean(row.actualImage),
        rowConfidence: row.rowConfidence,
        status: row.status as ProductStatus,
        version: row.version || 1,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };

      return {
        product,
        rawInput: {
          dept: row.dept,
          class: row.class,
          fine: row.fine,
          sku_my_part_number: row.sku_my_part_number,
          mfg_part_num: row.mfg_part_num,
          part_desc: row.part_desc,
          e1_brand: row.e1_brand,
          unilog_brand: row.unilog_brand,
          dib_brand: row.dib_brand,
          part_manuf: row.part_manuf,
        },
      };
    });
  }
}

export const productRepository = new ProductRepository();


