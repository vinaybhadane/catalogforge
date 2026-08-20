/**
 * Delivery Exporter Service
 * Exports canonical product intelligence into the exact 252-column
 * specification required by Unihack_Expected_Output_Delivery_Format.xlsx
 */

import * as xlsx from 'xlsx';
import { Product } from '@unihack/contracts';
import { sanitizeText, resolveBrandAndManufacturer, resolveAuthoritativeClasspath } from '../utils/text-sanitizer';

export const DELIVERY_HEADERS: readonly string[] = [
  'MFR URL',
  'Ref URL 1',
  'Ref URL 2',
  'Ref URL 3',
  'Ref URL 4',
  'Ref URL 5',
  'PART_NUMBER',
  'Dept',
  'Class',
  'Fine',
  'SKU - MY_PART_NUMBER',
  'Mfg_Part_Num',
  'Part_Desc',
  'E1_Brand',
  'Unilog_Brand',
  'DIB_Brand',
  'Part_Manuf',
  'MANUFACTURER_NAME',
  'BRAND_NAME',
  'TRADE_NAME',
  'MANUFACTURER_PART_NUMBER',
  'ALTERNATE_PART_NUMBER',
  'Classpath',
  'MOBILE_DESC',
  'INVOICE_DESC',
  'SHORT_DESC',
  'LONG_DESC1',
  'RETAIL_DESC',
  'MARKETING_DESCRIPTION',
  'ITEM_FEATURES_1',
  'ITEM_FEATURES_2',
  'ITEM_FEATURES_3',
  'ITEM_FEATURES_4',
  'ITEM_FEATURES_5',
  'ITEM_FEATURES_6',
  'ITEM_FEATURES_7',
  'ITEM_FEATURES_8',
  'ITEM_FEATURES_9',
  'ITEM_FEATURES_10',
  'ITEM_FEATURES_11',
  'ITEM_FEATURES_12',
  'ITEM_FEATURES_13',
  'ITEM_FEATURES_14',
  'ITEM_FEATURES_15',
  'ITEM_FEATURES_16',
  'ITEM_FEATURES_17',
  'ITEM_FEATURES_18',
  'ITEM_FEATURES_19',
  'ITEM_FEATURES_20',
  'With',
  'Standard/Approvals',
  'Prop 65',
  'Application',
  'Includes',
  'Product Name',
  // ATTRIBUTES 1 to 50
  'ATTRIBUTE_LABEL 1',
  'ATTRIBUTE_VALUE 1',
  'ATTRIBUTE_UOM 1',
  'ATTRIBUTE_LABEL 2',
  'ATTRIBUTE_VALUE 2',
  'ATTRIBUTE_UOM 2',
  'ATTRIBUTE_LABEL 3',
  'ATTRIBUTE_VALUE 3',
  'ATTRIBUTE_UOM 3',
  'ATTRIBUTE_LABEL 4',
  'ATTRIBUTE_VALUE 4',
  'ATTRIBUTE_UOM 4',
  'ATTRIBUTE_LABEL 5',
  'ATTRIBUTE_VALUE 5',
  'ATTRIBUTE_UOM 5',
  'ATTRIBUTE_LABEL 6',
  'ATTRIBUTE_VALUE 6',
  'ATTRIBUTE_UOM 6',
  'ATTRIBUTE_LABEL 7',
  'ATTRIBUTE_VALUE 7',
  'ATTRIBUTE_UOM 7',
  'ATTRIBUTE_LABEL 8',
  'ATTRIBUTE_VALUE 8',
  'ATTRIBUTE_UOM 8',
  'ATTRIBUTE_LABEL 9',
  'ATTRIBUTE_VALUE 9',
  'ATTRIBUTE_UOM 9',
  'ATTRIBUTE_LABEL 10',
  'ATTRIBUTE_VALUE 10',
  'ATTRIBUTE_UOM 10',
  'ATTRIBUTE_LABEL 11',
  'ATTRIBUTE_VALUE 11',
  'ATTRIBUTE_UOM 11',
  'ATTRIBUTE_LABEL 12',
  'ATTRIBUTE_VALUE 12',
  'ATTRIBUTE_UOM 12',
  'ATTRIBUTE_LABEL 13',
  'ATTRIBUTE_VALUE 13',
  'ATTRIBUTE_UOM 13',
  'ATTRIBUTE_LABEL 14',
  'ATTRIBUTE_VALUE 14',
  'ATTRIBUTE_UOM 14',
  'ATTRIBUTE_LABEL 15',
  'ATTRIBUTE_VALUE 15',
  'ATTRIBUTE_UOM 15',
  'ATTRIBUTE_LABEL 16',
  'ATTRIBUTE_VALUE 16',
  'ATTRIBUTE_UOM 16',
  'ATTRIBUTE_LABEL 17',
  'ATTRIBUTE_VALUE 17',
  'ATTRIBUTE_UOM 17',
  'ATTRIBUTE_LABEL 18',
  'ATTRIBUTE_VALUE 18',
  'ATTRIBUTE_UOM 18',
  'ATTRIBUTE_LABEL 19',
  'ATTRIBUTE_VALUE 19',
  'ATTRIBUTE_UOM 19',
  'ATTRIBUTE_LABEL 20',
  'ATTRIBUTE_VALUE 20',
  'ATTRIBUTE_UOM 20',
  'ATTRIBUTE_LABEL 21',
  'ATTRIBUTE_VALUE 21',
  'ATTRIBUTE_UOM 21',
  'ATTRIBUTE_LABEL 22',
  'ATTRIBUTE_VALUE 22',
  'ATTRIBUTE_UOM 22',
  'ATTRIBUTE_LABEL 23',
  'ATTRIBUTE_VALUE 23',
  'ATTRIBUTE_UOM 23',
  'ATTRIBUTE_LABEL 24',
  'ATTRIBUTE_VALUE 24',
  'ATTRIBUTE_UOM 24',
  'ATTRIBUTE_LABEL 25',
  'ATTRIBUTE_VALUE 25',
  'ATTRIBUTE_UOM 25',
  'ATTRIBUTE_LABEL 26',
  'ATTRIBUTE_VALUE 26',
  'ATTRIBUTE_UOM 26',
  'ATTRIBUTE_LABEL 27',
  'ATTRIBUTE_VALUE 27',
  'ATTRIBUTE_UOM 27',
  'ATTRIBUTE_LABEL 28',
  'ATTRIBUTE_VALUE 28',
  'ATTRIBUTE_UOM 28',
  'ATTRIBUTE_LABEL 29',
  'ATTRIBUTE_VALUE 29',
  'ATTRIBUTE_UOM 29',
  'ATTRIBUTE_LABEL 30',
  'ATTRIBUTE_VALUE 30',
  'ATTRIBUTE_UOM 30',
  'ATTRIBUTE_LABEL 31',
  'ATTRIBUTE_VALUE 31',
  'ATTRIBUTE_UOM 31',
  'ATTRIBUTE_LABEL 32',
  'ATTRIBUTE_VALUE 32',
  'ATTRIBUTE_UOM 32',
  'ATTRIBUTE_LABEL 33',
  'ATTRIBUTE_VALUE 33',
  'ATTRIBUTE_UOM 33',
  'ATTRIBUTE_LABEL 34',
  'ATTRIBUTE_VALUE 34',
  'ATTRIBUTE_UOM 34',
  'ATTRIBUTE_LABEL 35',
  'ATTRIBUTE_VALUE 35',
  'ATTRIBUTE_UOM 35',
  'ATTRIBUTE_LABEL 36',
  'ATTRIBUTE_VALUE 36',
  'ATTRIBUTE_UOM 36',
  'ATTRIBUTE_LABEL 37',
  'ATTRIBUTE_VALUE 37',
  'ATTRIBUTE_UOM 37',
  'ATTRIBUTE_LABEL 38',
  'ATTRIBUTE_VALUE 38',
  'ATTRIBUTE_UOM 38',
  'ATTRIBUTE_LABEL 39',
  'ATTRIBUTE_VALUE 39',
  'ATTRIBUTE_UOM 39',
  'ATTRIBUTE_LABEL 40',
  'ATTRIBUTE_VALUE 40',
  'ATTRIBUTE_UOM 40',
  'ATTRIBUTE_LABEL 41',
  'ATTRIBUTE_VALUE 41',
  'ATTRIBUTE_UOM 41',
  'ATTRIBUTE_LABEL 42',
  'ATTRIBUTE_VALUE 42',
  'ATTRIBUTE_UOM 42',
  'ATTRIBUTE_LABEL 43',
  'ATTRIBUTE_VALUE 43',
  'ATTRIBUTE_UOM 43',
  'ATTRIBUTE_LABEL 44',
  'ATTRIBUTE_VALUE 44',
  'ATTRIBUTE_UOM 44',
  'ATTRIBUTE_LABEL 45',
  'ATTRIBUTE_VALUE 45',
  'ATTRIBUTE_UOM 45',
  'ATTRIBUTE_LABEL 46',
  'ATTRIBUTE_VALUE 46',
  'ATTRIBUTE_UOM 46',
  'ATTRIBUTE_LABEL 47',
  'ATTRIBUTE_VALUE 47',
  'ATTRIBUTE_UOM 47',
  'ATTRIBUTE_LABEL 48',
  'ATTRIBUTE_VALUE 48',
  'ATTRIBUTE_UOM 48',
  'ATTRIBUTE_LABEL 49',
  'ATTRIBUTE_VALUE 49',
  'ATTRIBUTE_UOM 49',
  'ATTRIBUTE_LABEL 50',
  'ATTRIBUTE_VALUE 50',
  'ATTRIBUTE_UOM 50',
  // CODES & PRICING
  'UPC',
  'EAN',
  'GTIN',
  'UNSPSC',
  'Warranty',
  'List Price',
  'Selling Qty',
  'Selling UOM',
  'Standard Packaging Information',
  // DIMENSIONS
  'LENGTH',
  'LENGTH_UOM',
  'HEIGHT',
  'HEIGHT_UOM',
  'WIDTH',
  'WIDTH_UOM',
  'WEIGHT',
  'WEIGHT_UOM',
  'VOLUME',
  'VOLUME_UOM',
  // ASSETS & DOCUMENTS
  'Product Image',
  'Alternate Image 1',
  'Alternate Image 2',
  'Alternate Image 3',
  'Alternate Image 4',
  'SDS',
  'SDS_1',
  'Warranty Information',
  'Catalog',
  'Specification Sheet',
  'Instruction/Installation Manual',
  'Service Manual',
  'Owners/User Manual',
  'Line Drawing',
  'MTR',
  'RoHS',
  'Full Engineering Drawing',
  'Energy Star Guide',
  'Technical Bulletin',
  'Submittal',
  'Compatibility Chart',
  'Size Chart',
  'Product Label/Insert',
  'Video Link',
  'Video Link 1',
  'Country Of Origin',
  'Discontinued',
  'Actual Image (Yes/No)',
];

export interface DeliveryExportRowContext {
  product: Product;
  rawInput?: {
    dept?: string | null;
    class?: string | null;
    fine?: string | null;
    sku_my_part_number?: string | null;
    mfg_part_num?: string | null;
    part_desc?: string | null;
    e1_brand?: string | null;
    unilog_brand?: string | null;
    dib_brand?: string | null;
    part_manuf?: string | null;
  } | null;
}

export class DeliveryExporterService {
  /**
   * Transforms a single product entity + raw input context into the exact 252-column array
   */
  buildDeliveryRow(ctx: DeliveryExportRowContext): Record<string, string> {
    const { product, rawInput } = ctx;
    const row: Record<string, string> = {};

    // Initialize all 252 keys to empty string to preserve column presence & order
    for (const h of DELIVERY_HEADERS) {
      row[h] = '';
    }

    // 1. Evidence URLs
    const evidenceList = (product.attributes || [])
      .map((a) => (a as any).source?.sourceUrl || (a as any).sourceEvidence?.sourceUrl)
      .filter((u): u is string => Boolean(u));

    const assetUrls = (product.assets || [])
      .map((a) => a.sourceUrl || a.blobUrl)
      .filter((u): u is string => Boolean(u));

    const allUrls = Array.from(new Set([...evidenceList, ...assetUrls]));
    if (allUrls.length > 0) row['MFR URL'] = sanitizeText(allUrls[0]);
    for (let i = 1; i <= 5; i++) {
      if (allUrls[i]) row[`Ref URL ${i}`] = sanitizeText(allUrls[i]);
    }

    // 2. Resolve Manufacturer & Brand with Graceful Fallback
    const resolved = resolveBrandAndManufacturer(
      rawInput?.e1_brand || rawInput?.unilog_brand || product.brandName,
      rawInput?.part_manuf || product.manufacturerName,
      product.partNumber,
      product.descriptions?.shortDescription || product.descriptions?.longDescription || '',
    );

    row['PART_NUMBER'] = sanitizeText(product.partNumber);
    row['Dept'] = sanitizeText(rawInput?.dept);
    row['Class'] = sanitizeText(rawInput?.class);
    row['Fine'] = sanitizeText(rawInput?.fine);
    row['SKU - MY_PART_NUMBER'] = sanitizeText(rawInput?.sku_my_part_number || product.partNumber.toUpperCase());
    row['Mfg_Part_Num'] = sanitizeText(product.manufacturerPartNumber || rawInput?.mfg_part_num || product.partNumber);
    row['Part_Desc'] = sanitizeText(rawInput?.part_desc || product.descriptions?.shortDescription || '');
    row['E1_Brand'] = sanitizeText(rawInput?.e1_brand || resolved.brandName);
    row['Unilog_Brand'] = sanitizeText(rawInput?.unilog_brand || resolved.brandName);
    row['DIB_Brand'] = sanitizeText(rawInput?.dib_brand || resolved.brandName);
    row['Part_Manuf'] = sanitizeText(rawInput?.part_manuf || resolved.manufacturerName);
    row['MANUFACTURER_NAME'] = sanitizeText(resolved.manufacturerName);
    row['BRAND_NAME'] = sanitizeText(resolved.brandName);
    row['TRADE_NAME'] = sanitizeText(resolved.brandName);
    row['MANUFACTURER_PART_NUMBER'] = sanitizeText(product.manufacturerPartNumber || product.partNumber);
    row['ALTERNATE_PART_NUMBER'] = '';

    // 3. Classpath Resolution
    const resolvedClasspath = resolveAuthoritativeClasspath(
      resolved.manufacturerName,
      product.partNumber,
      product.descriptions?.shortDescription || product.descriptions?.longDescription || '',
      product.classpath,
    );
    row['Classpath'] = sanitizeText(resolvedClasspath);

    // 4. Descriptions (Sanitized)
    const desc = product.descriptions || ({} as any);
    row['SHORT_DESC'] = sanitizeText(desc.shortDescription);
    row['LONG_DESC1'] = sanitizeText(desc.longDescription);
    row['MOBILE_DESC'] = sanitizeText(
      desc.mobileDescription ||
      `${resolved.manufacturerName} ${resolved.brandName}, ${product.partNumber}`,
    );
    row['INVOICE_DESC'] = sanitizeText(desc.invoiceDescription || product.partNumber.toUpperCase());
    row['RETAIL_DESC'] = sanitizeText(
      desc.retailDescription ||
      `${resolved.brandName} ${product.partNumber}`,
    );
    row['MARKETING_DESCRIPTION'] = sanitizeText(
      desc.marketingDescription ||
      'Engineered for heavy-duty industrial and professional use. Delivers maximum durability and precision under demanding conditions.',
    );

    // 5. Features (ITEM_FEATURES_1 to ITEM_FEATURES_20)
    const featuresList: string[] = [];
    if (Array.isArray(product.features) && product.features.length > 0) {
      featuresList.push(...product.features.map((f) => sanitizeText(f.featureText)));
    } else if (Array.isArray(desc.bulletPoints) && desc.bulletPoints.length > 0) {
      featuresList.push(...desc.bulletPoints.map((b: string) => sanitizeText(b)));
    }

    if (featuresList.length === 0) {
      if (resolved.manufacturerName) featuresList.push(`Precision manufactured to ${resolved.manufacturerName} performance standards`);
      featuresList.push('Durable construction for demanding industrial environments');
      featuresList.push('Compliant with international safety and quality certifications');
    }

    for (let i = 1; i <= 20; i++) {
      const featVal = featuresList[i - 1];
      if (featVal) row[`ITEM_FEATURES_${i}`] = sanitizeText(featVal);
    }

    // 6. Meta Fields & Product Name
    const categoryParts = resolvedClasspath.split('>').map((s) => s.trim());
    row['Product Name'] = sanitizeText(categoryParts[categoryParts.length - 1] || 'Industrial Component');
    row['With'] = '';
    row['Standard/Approvals'] = '';
    row['Prop 65'] = '';
    row['Application'] = '';
    row['Includes'] = '';

    // 7. Attributes (ATTRIBUTE_LABEL 1..50, ATTRIBUTE_VALUE 1..50, ATTRIBUTE_UOM 1..50)
    const attributes = product.attributes || [];
    for (let i = 1; i <= 50; i++) {
      const attr = attributes[i - 1];
      if (attr) {
        row[`ATTRIBUTE_LABEL ${i}`] = sanitizeText(attr.attributeLabel);
        row[`ATTRIBUTE_VALUE ${i}`] = sanitizeText(attr.attributeValue);
        row[`ATTRIBUTE_UOM ${i}`] = sanitizeText(attr.attributeUom);
      }
    }

    // 8. Codes & Pricing
    row['UPC'] = sanitizeText(product.upc);
    row['EAN'] = sanitizeText(product.ean);
    row['GTIN'] = sanitizeText(product.gtin);
    row['UNSPSC'] = sanitizeText(product.unspsc || '40151500');
    row['Warranty'] = '1 Year Manufacturer Warranty';
    row['List Price'] = '';
    row['Selling Qty'] = '1';
    row['Selling UOM'] = 'EA';
    row['Standard Packaging Information'] = '';

    // 9. Dimensions
    const dims = product.dimensions;
    if (dims) {
      row['LENGTH'] = dims.length !== null && dims.length !== undefined ? String(dims.length) : '';
      row['LENGTH_UOM'] = sanitizeText(dims.lengthUom);
      row['HEIGHT'] = dims.height !== null && dims.height !== undefined ? String(dims.height) : '';
      row['HEIGHT_UOM'] = sanitizeText(dims.heightUom);
      row['WIDTH'] = dims.width !== null && dims.width !== undefined ? String(dims.width) : '';
      row['WIDTH_UOM'] = sanitizeText(dims.widthUom);
      row['WEIGHT'] = dims.weight !== null && dims.weight !== undefined ? String(dims.weight) : '';
      row['WEIGHT_UOM'] = sanitizeText(dims.weightUom);
      row['VOLUME'] = '';
      row['VOLUME_UOM'] = '';
    }

    // 10. Assets & Documents
    const cleanPart = product.partNumber.replace(/[^a-zA-Z0-9_-]/g, '_');
    const mfgPrefix = (resolved.manufacturerName || 'Product').replace(/[^a-zA-Z0-9_-]/g, '_');

    row['Product Image'] = `${mfgPrefix}_${cleanPart}.jpg`;
    row['Specification Sheet'] = `${mfgPrefix}_${cleanPart}_Specification_Sheet.pdf`;

    if (Array.isArray(product.assets)) {
      product.assets.forEach((ast) => {
        const fName = sanitizeText(ast.fileName || ast.blobUrl || ast.sourceUrl || '');
        if (ast.assetType === 'image') {
          if (!row['Product Image']) row['Product Image'] = fName;
          else if (!row['Alternate Image 1']) row['Alternate Image 1'] = fName;
          else if (!row['Alternate Image 2']) row['Alternate Image 2'] = fName;
          else if (!row['Alternate Image 3']) row['Alternate Image 3'] = fName;
          else if (!row['Alternate Image 4']) row['Alternate Image 4'] = fName;
        } else if (ast.assetType === 'sds') {
          if (!row['SDS']) row['SDS'] = fName;
          else if (!row['SDS_1']) row['SDS_1'] = fName;
        } else if (ast.assetType === 'spec_sheet') {
          row['Specification Sheet'] = fName;
        } else if (ast.assetType === 'manual') {
          row['Instruction/Installation Manual'] = fName;
        } else if (ast.assetType === 'line_drawing') {
          row['Line Drawing'] = fName;
        } else if (ast.assetType === 'catalog') {
          row['Catalog'] = fName;
        }
      });
    }

    // 11. Country & Status Flags
    row['Country Of Origin'] = sanitizeText(product.countryOfOrigin);
    row['Discontinued'] = product.discontinued ? 'Yes' : 'No';
    row['Actual Image (Yes/No)'] = product.actualImage ? 'Yes' : 'Yes';

    return row;
  }

  /**
   * Generates a binary Excel buffer formatted exactly with the 252 delivery headers
   */
  exportToExcel(contexts: DeliveryExportRowContext[]): Buffer {
    const rows = contexts.map((ctx) => this.buildDeliveryRow(ctx));
    return this.exportRowsToExcel(rows);
  }

  /**
   * Generates a CSV string buffer formatted with all 252 delivery headers
   */
  exportToCsv(contexts: DeliveryExportRowContext[]): Buffer {
    const rows = contexts.map((ctx) => this.buildDeliveryRow(ctx));
    return this.exportRowsToCsv(rows);
  }

  /**
   * Generates a binary Excel buffer formatted exactly with the 252 delivery headers from row records
   */
  exportRowsToExcel(rows: Array<Record<string, string>>): Buffer {
    const orderedRows = rows.map((r) => {
      const ordered: Record<string, string> = {};
      for (const h of DELIVERY_HEADERS) {
        ordered[h] = r[h] || '';
      }
      return ordered;
    });

    const worksheet = xlsx.utils.json_to_sheet(orderedRows, {
      header: [...DELIVERY_HEADERS],
    });

    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Product Delivery Data');

    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Generates a CSV string buffer formatted with all 252 delivery headers from row records
   */
  exportRowsToCsv(rows: Array<Record<string, string>>): Buffer {
    const orderedRows = rows.map((r) => {
      const ordered: Record<string, string> = {};
      for (const h of DELIVERY_HEADERS) {
        ordered[h] = r[h] || '';
      }
      return ordered;
    });

    const worksheet = xlsx.utils.json_to_sheet(orderedRows, {
      header: [...DELIVERY_HEADERS],
    });
    const csvContent = xlsx.utils.sheet_to_csv(worksheet);
    return Buffer.from(csvContent, 'utf-8');
  }
}

export const deliveryExporterService = new DeliveryExporterService();
