/**
 * Product Repository
 * Data access layer for product, product_feature, product_attribute, and product_asset tables
 */

import { Product, ProductFilterQuery, ProductStatus } from '@unihack/contracts';
import sql from 'mssql';
import { getSqlPool } from '../plugins/db.plugin';
import { DeliveryExportRowContext } from '../services/delivery-exporter.service';

const inMemoryProducts = new Map<string, Product>();

export const DEFAULT_CATALOG_PRODUCTS: Product[] = [
  {
    productId: '101',
    rawInputId: null,
    partNumber: 'DCB518ASTS06G',
    manufacturerName: 'Freud Inc',
    brandName: 'Diablo',
    manufacturerPartNumber: 'DCB518ASTS06G',
    classpath: 'Industrial > Abrasives > Sanding Belts',
    unspsc: '40151500',
    descriptions: {
      shortDescription: 'Diablo 1/2 in. x 18 in. Sanding Belt Assorted Grits (6-Pack)',
      longDescription: 'Freud Inc Diablo DCB518ASTS06G specifications include 1/2 in width, 18 in length, and 50, 80, 120 grit sizes. Built with premium aluminum oxide grain for high material removal rate and longer sanding life. Backed by 5-Year Limited Manufacturer Warranty.',
      mobileDescription: 'Diablo DCB518ASTS06G 1/2x18 in Sanding Belt 6PK',
      invoiceDescription: 'DIABLO DCB518ASTS06G BELT 6PK',
      retailDescription: 'Diablo Assorted Grits Sanding Belt 6-Pack for file sanders',
      marketingDescription: 'Delivers maximum durability, clog-resistance, and precision material removal across wood, metal, and plastic.',
      bulletPoints: [
        'Dimensions: 1/2 in. width by 18 in. length',
        'Assorted grit pack includes 50, 80, and 120 grit belts',
        'Designed for portable belt file sanders',
        'Heavy-duty cloth backing resists tearing under load',
        'Backed by Freud 5-Year Limited Warranty',
      ],
    },
    attributes: [
      { id: 1, productId: '101', sequence: 1, attributeLabel: 'Width', attributeValue: '1/2', attributeUom: 'IN', confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 2, productId: '101', sequence: 2, attributeLabel: 'Length', attributeValue: '18', attributeUom: 'IN', confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 3, productId: '101', sequence: 3, attributeLabel: 'Grit Sizes', attributeValue: '50, 80, 120', attributeUom: null, confidenceScore: 0.99, lovMatchConfidence: 0.98, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 4, productId: '101', sequence: 4, attributeLabel: 'Package Quantity', attributeValue: '6', attributeUom: 'PK', confidenceScore: 0.98, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 5, productId: '101', sequence: 5, attributeLabel: 'Abrasive Material', attributeValue: 'Aluminum Oxide', attributeUom: null, confidenceScore: 0.97, lovMatchConfidence: 0.97, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 6, productId: '101', sequence: 6, attributeLabel: 'Backing Weight', attributeValue: 'X-Weight Cloth', attributeUom: null, confidenceScore: 0.95, lovMatchConfidence: 0.95, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
    ],
    features: [
      { id: 1, productId: '101', sequence: 1, featureText: 'Dimensions: 1/2 in. width by 18 in. length' },
      { id: 2, productId: '101', sequence: 2, featureText: 'Assorted grit pack includes 50, 80, and 120 grit belts' },
      { id: 3, productId: '101', sequence: 3, featureText: 'Designed for portable belt file sanders' },
      { id: 4, productId: '101', sequence: 4, featureText: 'Backed by Freud 5-Year Limited Warranty' },
    ],
    dimensions: {
      length: 18,
      lengthUom: 'IN',
      width: 0.5,
      widthUom: 'IN',
      height: 0.5,
      heightUom: 'IN',
      weight: 0.35,
      weightUom: 'LBS',
    },
    assets: [
      {
        id: 1,
        productId: '101',
        assetType: 'image',
        sequence: 1,
        fileName: 'Diablo_DCB518ASTS06G_Primary.jpg',
        sourceUrl: 'https://www.diablotools.com/images/DCB518ASTS06G.jpg',
        blobUrl: null,
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        productId: '101',
        assetType: 'spec_sheet',
        sequence: 1,
        fileName: 'Diablo_DCB518ASTS06G_Specification_Sheet.pdf',
        sourceUrl: 'https://www.diablotools.com/docs/DCB518ASTS06G_Spec.pdf',
        blobUrl: null,
        createdAt: new Date().toISOString(),
      },
    ],
    upc: '008925145892',
    ean: null,
    gtin: '00008925145892',
    countryOfOrigin: 'Switzerland',
    discontinued: false,
    actualImage: true,
    rowConfidence: 0.98,
    status: 'published' as ProductStatus,
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '102',
    rawInputId: null,
    partNumber: '7100075678',
    manufacturerName: '3M',
    brandName: 'Cubitron II',
    manufacturerPartNumber: '784F-80',
    classpath: 'Industrial > Abrasives > Sanding Belts',
    unspsc: '40151500',
    descriptions: {
      shortDescription: '3M Cubitron II Cloth Belt 784F, 80+ YF-weight, 1/2 in x 18 in',
      longDescription: '3M Cubitron II Cloth Belt 784F features 3M Precision-Shaped Grain for rapid cut and extended life on stainless steel and carbon steel. Water resistant polyester backing.',
      mobileDescription: '3M Cubitron II 784F Belt 1/2x18 in 80+',
      invoiceDescription: '3M 7100075678 CUBITRON II BELT',
      retailDescription: '3M Cubitron II Industrial Heavy Duty Cloth Belt',
      marketingDescription: 'Engineered with revolutionary ceramic precision-shaped grain technology.',
      bulletPoints: [
        'Precision-Shaped Grain continuously fractures into sharp points',
        'Significantly longer life compared to conventional ceramic belts',
        'Features grinding aid for cooler running on heat-sensitive alloys',
      ],
    },
    attributes: [
      { id: 7, productId: '102', sequence: 1, attributeLabel: 'Width', attributeValue: '1/2', attributeUom: 'IN', confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 8, productId: '102', sequence: 2, attributeLabel: 'Length', attributeValue: '18', attributeUom: 'IN', confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 9, productId: '102', sequence: 3, attributeLabel: 'Grit', attributeValue: '80+', attributeUom: null, confidenceScore: 0.98, lovMatchConfidence: 0.98, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 10, productId: '102', sequence: 4, attributeLabel: 'Mineral Type', attributeValue: 'Precision Shaped Ceramic', attributeUom: null, confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
    ],
    features: [
      { id: 5, productId: '102', sequence: 1, featureText: 'Precision-Shaped Grain continuously fractures into sharp points' },
      { id: 6, productId: '102', sequence: 2, featureText: 'Significantly longer life compared to conventional ceramic belts' },
    ],
    dimensions: {
      length: 18,
      lengthUom: 'IN',
      width: 0.5,
      widthUom: 'IN',
      height: 0.5,
      heightUom: 'IN',
      weight: 0.28,
      weightUom: 'LBS',
    },
    assets: [
      {
        id: 3,
        productId: '102',
        assetType: 'image',
        sequence: 1,
        fileName: '3M_7100075678_Primary.jpg',
        sourceUrl: 'https://multimedia.3m.com/mws/media/12345/cubitron-belt.jpg',
        blobUrl: null,
        createdAt: new Date().toISOString(),
      },
    ],
    upc: '051141549881',
    ean: null,
    gtin: '00051141549881',
    countryOfOrigin: 'USA',
    discontinued: false,
    actualImage: true,
    rowConfidence: 0.99,
    status: 'published' as ProductStatus,
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '103',
    rawInputId: null,
    partNumber: 'QO120',
    manufacturerName: 'Schneider Electric',
    brandName: 'Square D',
    manufacturerPartNumber: 'QO120',
    classpath: 'Electrical > Distribution Equipment > Circuit Breakers',
    unspsc: '39121603',
    descriptions: {
      shortDescription: 'Square D QO 20 Amp Single-Pole Circuit Breaker, 120/240V, 10kA',
      longDescription: 'Square D by Schneider Electric QO 20 Amp One-Pole Circuit Breaker provides thermal-magnetic protection and features the Visi-Trip red indicator for fast identification of tripped circuits.',
      mobileDescription: 'Square D QO120 20A 1-Pole Circuit Breaker',
      invoiceDescription: 'SQD QO120 20A 1P BREAKER',
      retailDescription: 'Square D QO 20-Amp Single-Pole Circuit Breaker with Visi-Trip',
      marketingDescription: 'Industry leader in residential and commercial circuit protection with exclusive Visi-Trip indicator.',
      bulletPoints: [
        '20 Amp single-pole standard circuit breaker',
        '120/240 VAC; 10,000 AIR interrupt rating',
        'Visi-Trip indicator makes tripped breaker easy to spot',
        'Plug-on design fits Square D QO load centers and panelboards',
      ],
    },
    attributes: [
      { id: 11, productId: '103', sequence: 1, attributeLabel: 'Amperage Rating', attributeValue: '20', attributeUom: 'A', confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 12, productId: '103', sequence: 2, attributeLabel: 'Voltage Rating', attributeValue: '120/240', attributeUom: 'V', confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 13, productId: '103', sequence: 3, attributeLabel: 'Number of Poles', attributeValue: '1', attributeUom: null, confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 14, productId: '103', sequence: 4, attributeLabel: 'Interrupt Rating', attributeValue: '10', attributeUom: 'kA', confidenceScore: 0.98, lovMatchConfidence: 0.98, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
    ],
    features: [
      { id: 7, productId: '103', sequence: 1, featureText: '20 Amp single-pole standard circuit breaker' },
      { id: 8, productId: '103', sequence: 2, featureText: 'Visi-Trip indicator makes tripped breaker easy to spot' },
    ],
    dimensions: {
      length: 3,
      lengthUom: 'IN',
      width: 0.75,
      widthUom: 'IN',
      height: 2.91,
      heightUom: 'IN',
      weight: 0.3,
      weightUom: 'LBS',
    },
    assets: [
      {
        id: 4,
        productId: '103',
        assetType: 'image',
        sequence: 1,
        fileName: 'Schneider_QO120_Primary.jpg',
        sourceUrl: 'https://www.se.com/images/QO120.jpg',
        blobUrl: null,
        createdAt: new Date().toISOString(),
      },
    ],
    upc: '785901400103',
    ean: null,
    gtin: '00785901400103',
    countryOfOrigin: 'Mexico',
    discontinued: false,
    actualImage: true,
    rowConfidence: 0.99,
    status: 'published' as ProductStatus,
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '104',
    rawInputId: null,
    partNumber: '9A-125-180',
    manufacturerName: 'Mirka',
    brandName: 'Abranet',
    manufacturerPartNumber: '9A-125-180',
    classpath: 'Industrial > Abrasives > Sanding Discs',
    unspsc: '40151500',
    descriptions: {
      shortDescription: 'Mirka Abranet 5 in. Mesh Grip Discs, 180 Grit (50-Pack)',
      longDescription: 'Mirka Abranet 5-inch hook and loop mesh sanding discs offer dust-free sanding across wood, primer, and composite surfaces.',
      mobileDescription: 'Mirka Abranet 5in 180 Grit Discs 50PK',
      invoiceDescription: 'MIRKA 9A-125-180 5IN 180G 50PK',
      retailDescription: 'Mirka Abranet Dust-Free Sanding Discs 50-Pack',
      marketingDescription: 'Original dust-free net sanding abrasive for cleaner working environment and uniform finish.',
      bulletPoints: [
        '5 in. diameter mesh abrasive disc',
        '180 Grit fine finishing abrasive',
        'Net structure eliminates clogging and dust build-up',
        'Hook and loop backing for quick attachment',
      ],
    },
    attributes: [
      { id: 15, productId: '104', sequence: 1, attributeLabel: 'Diameter', attributeValue: '5', attributeUom: 'IN', confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 16, productId: '104', sequence: 2, attributeLabel: 'Grit', attributeValue: '180', attributeUom: null, confidenceScore: 0.99, lovMatchConfidence: 0.99, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
      { id: 17, productId: '104', sequence: 3, attributeLabel: 'Package Quantity', attributeValue: '50', attributeUom: 'PK', confidenceScore: 0.98, lovMatchConfidence: 0.98, validationFlags: ['LOV_MATCH_EXACT'], sourceEvidenceId: null },
    ],
    features: [
      { id: 9, productId: '104', sequence: 1, featureText: '5 in. diameter mesh abrasive disc' },
      { id: 10, productId: '104', sequence: 2, featureText: 'Net structure eliminates clogging and dust build-up' },
    ],
    dimensions: {
      length: 5,
      lengthUom: 'IN',
      width: 5,
      widthUom: 'IN',
      height: 2,
      heightUom: 'IN',
      weight: 0.65,
      weightUom: 'LBS',
    },
    assets: [
      {
        id: 5,
        productId: '104',
        assetType: 'image',
        sequence: 1,
        fileName: 'Mirka_9A_125_180_Primary.jpg',
        sourceUrl: 'https://www.mirka.com/images/9A-125-180.jpg',
        blobUrl: null,
        createdAt: new Date().toISOString(),
      },
    ],
    upc: '842028042185',
    ean: null,
    gtin: '00842028042185',
    countryOfOrigin: 'Finland',
    discontinued: false,
    actualImage: true,
    rowConfidence: 0.97,
    status: 'published' as ProductStatus,
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '105',
    rawInputId: null,
    partNumber: 'HOM120',
    manufacturerName: 'Square D',
    brandName: 'Homeline',
    manufacturerPartNumber: 'HOM120',
    classpath: 'Electrical > Distribution Equipment > Circuit Breakers',
    unspsc: '39121603',
    descriptions: {
      shortDescription: 'Homeline 20 Amp Single-Pole Circuit Breaker, 120/240V, 10kA AIR',
      longDescription: 'Square D Homeline 20-Amp Single-Pole Circuit Breaker is designed for overload and short-circuit protection of residential electrical systems.',
      mobileDescription: 'Square D Homeline 20A 1-Pole Breaker',
      invoiceDescription: 'SQD HOM120 20A 1P BREAKER',
      retailDescription: 'Square D Homeline 20-Amp Standard Circuit Breaker',
      marketingDescription: 'Engineered for value-minded contractors and homeowners.',
      bulletPoints: [
        '20 Amp single-pole circuit breaker',
        '120/240 Volt AC; 10,000 AIR',
        'Plug-on design fits Homeline load centers',
      ],
    },
    attributes: [
      { id: 18, productId: '105', sequence: 1, attributeLabel: 'Amperage Rating', attributeValue: '20', attributeUom: 'A', confidenceScore: 0.88, lovMatchConfidence: 0.88, validationFlags: ['REVIEW_FLAG_CONFIDENCE_THRESHOLD'], sourceEvidenceId: null },
      { id: 19, productId: '105', sequence: 2, attributeLabel: 'Voltage Rating', attributeValue: '120/240', attributeUom: 'V', confidenceScore: 0.85, lovMatchConfidence: 0.85, validationFlags: ['REVIEW_FLAG_CONFIDENCE_THRESHOLD'], sourceEvidenceId: null },
      { id: 20, productId: '105', sequence: 3, attributeLabel: 'Interrupt Rating', attributeValue: '10', attributeUom: 'kA', confidenceScore: 0.82, lovMatchConfidence: 0.82, validationFlags: [], sourceEvidenceId: null },
    ],
    features: [
      { id: 11, productId: '105', sequence: 1, featureText: '20 Amp single-pole circuit breaker' },
    ],
    dimensions: {
      length: 3.13,
      lengthUom: 'IN',
      width: 1,
      widthUom: 'IN',
      height: 2.98,
      heightUom: 'IN',
      weight: 0.32,
      weightUom: 'LBS',
    },
    assets: [
      {
        id: 6,
        productId: '105',
        assetType: 'image',
        sequence: 1,
        fileName: 'SquareD_HOM120_Primary.jpg',
        sourceUrl: 'https://www.se.com/images/HOM120.jpg',
        blobUrl: null,
        createdAt: new Date().toISOString(),
      },
    ],
    upc: '785901065203',
    ean: null,
    gtin: '00785901065203',
    countryOfOrigin: 'Mexico',
    discontinued: false,
    actualImage: true,
    rowConfidence: 0.85,
    status: 'pending_review' as ProductStatus,
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    productId: '106',
    rawInputId: null,
    partNumber: '20408',
    manufacturerName: '3M',
    brandName: 'Stikit',
    manufacturerPartNumber: '255L-P80',
    classpath: 'Industrial > Abrasives > Sanding Discs',
    unspsc: '40151500',
    descriptions: {
      shortDescription: '3M Stikit Gold Film Disc Roll 255L, 6 in x NH, P80 Grit (125/Roll)',
      longDescription: '3M Stikit Gold Film Disc Roll 255L offers fast cutting and uniform finish on paint, clear coat, and fiberglass.',
      mobileDescription: '3M Stikit Gold 6in P80 Disc Roll',
      invoiceDescription: '3M 20408 STIKIT DISC ROLL P80',
      retailDescription: '3M Stikit Gold Film Disc Roll 125 Discs',
      marketingDescription: 'Pressure-sensitive adhesive backing for easy peel-and-stick application.',
      bulletPoints: [
        '6 in. diameter film disc',
        'P80 Grit aluminum oxide mineral',
        '125 Discs per roll',
      ],
    },
    attributes: [
      { id: 21, productId: '106', sequence: 1, attributeLabel: 'Diameter', attributeValue: '6', attributeUom: 'IN', confidenceScore: 0.84, lovMatchConfidence: 0.84, validationFlags: ['REVIEW_FLAG_CONFIDENCE_THRESHOLD'], sourceEvidenceId: null },
      { id: 22, productId: '106', sequence: 2, attributeLabel: 'Grit', attributeValue: 'P80', attributeUom: null, confidenceScore: 0.82, lovMatchConfidence: 0.82, validationFlags: [], sourceEvidenceId: null },
      { id: 23, productId: '106', sequence: 3, attributeLabel: 'Roll Quantity', attributeValue: '125', attributeUom: 'EA', confidenceScore: 0.80, lovMatchConfidence: 0.80, validationFlags: [], sourceEvidenceId: null },
    ],
    features: [
      { id: 12, productId: '106', sequence: 1, featureText: '6 in. diameter film disc' },
    ],
    dimensions: {
      length: 6,
      lengthUom: 'IN',
      width: 6,
      widthUom: 'IN',
      height: 3,
      heightUom: 'IN',
      weight: 1.2,
      weightUom: 'LBS',
    },
    assets: [
      {
        id: 7,
        productId: '106',
        assetType: 'image',
        sequence: 1,
        fileName: '3M_20408_Primary.jpg',
        sourceUrl: 'https://multimedia.3m.com/mws/media/stikit-255l.jpg',
        blobUrl: null,
        createdAt: new Date().toISOString(),
      },
    ],
    upc: '051144204084',
    ean: null,
    gtin: '00051144204084',
    countryOfOrigin: 'USA',
    discontinued: false,
    actualImage: true,
    rowConfidence: 0.82,
    status: 'pending_review' as ProductStatus,
    version: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Initialize default products in memory
for (const p of DEFAULT_CATALOG_PRODUCTS) {
  inMemoryProducts.set(p.productId, p);
}

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
        p.completeness_rate AS completenessRate,
        p.completeness_score AS completenessScore,
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
      completenessRate: row.completenessRate ?? null,
      completenessScore: row.completenessScore ?? row.completenessRate ?? null,
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

    if (total === 0 && !query.search && !query.status && !query.manufacturer) {
      const all = Array.from(inMemoryProducts.values());
      return {
        items: all.slice(offset, offset + pageSize),
        total: all.length,
      };
    }

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
        p.completeness_rate AS completenessRate,
        p.completeness_score AS completenessScore,
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
      completenessRate: row.completenessRate ?? null,
      completenessScore: row.completenessScore ?? row.completenessRate ?? null,
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
        p.completeness_rate AS completenessRate,
        p.completeness_score AS completenessScore,
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
        completenessRate: row.completenessRate ?? null,
        completenessScore: row.completenessScore ?? row.completenessRate ?? null,
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


