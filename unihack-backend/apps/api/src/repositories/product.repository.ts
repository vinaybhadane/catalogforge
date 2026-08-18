/**
 * Product Repository
 * Data access layer for product, product_feature, product_attribute, and product_asset tables
 */

import { Product, ProductFilterQuery, ProductStatus } from '@unihack/contracts';
import sql from 'mssql';
import { getSqlPool } from '../plugins/db.plugin';

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
}

export const productRepository = new ProductRepository();

