/**
 * File Parser Service
 * Parses CSV and Excel XLSX spreadsheets into canonical 11-column raw input records
 */

import { PreflightSchemaReport } from '@unihack/contracts';
import { parse as parseCsvSync } from 'csv-parse/sync';
import * as xlsx from 'xlsx';
import { ValidationError } from '../errors/app-errors';

export const CANONICAL_COLUMNS = [
  'part_number',
  'dept',
  'class',
  'fine',
  'sku_my_part_number',
  'mfg_part_num',
  'part_desc',
  'e1_brand',
  'unilog_brand',
  'dib_brand',
  'part_manuf',
] as const;

export type CanonicalColumnKey = (typeof CANONICAL_COLUMNS)[number];

const HEADER_ALIASES: Record<string, CanonicalColumnKey> = {
  // Part Number
  part_number: 'part_number',
  partnumber: 'part_number',
  'part number': 'part_number',
  'part #': 'part_number',
  part_no: 'part_number',
  item_number: 'part_number',

  // Dept / Class / Fine
  dept: 'dept',
  department: 'dept',
  class: 'class',
  fine: 'fine',

  // SKU / My Part Number
  sku_my_part_number: 'sku_my_part_number',
  skumypartnumber: 'sku_my_part_number',
  sku: 'sku_my_part_number',
  'my part number': 'sku_my_part_number',
  my_part_num: 'sku_my_part_number',

  // MFG Part Num
  mfg_part_num: 'mfg_part_num',
  mfgpartnum: 'mfg_part_num',
  'mfg part num': 'mfg_part_num',
  'mfg part number': 'mfg_part_num',
  mpn: 'mfg_part_num',
  manufacturer_part_number: 'mfg_part_num',

  // Part Desc
  part_desc: 'part_desc',
  partdesc: 'part_desc',
  'part desc': 'part_desc',
  'part description': 'part_desc',
  description: 'part_desc',

  // Brands
  e1_brand: 'e1_brand',
  e1brand: 'e1_brand',
  unilog_brand: 'unilog_brand',
  unilogbrand: 'unilog_brand',
  dib_brand: 'dib_brand',
  dibbrand: 'dib_brand',

  // Part Manuf
  part_manuf: 'part_manuf',
  partmanuf: 'part_manuf',
  'part manuf': 'part_manuf',
  manufacturer: 'part_manuf',
  mfg: 'part_manuf',
};

export interface ParsedRawRow {
  part_number: string | null;
  dept: string | null;
  class: string | null;
  fine: string | null;
  sku_my_part_number: string | null;
  mfg_part_num: string | null;
  part_desc: string | null;
  e1_brand: string | null;
  unilog_brand: string | null;
  dib_brand: string | null;
  part_manuf: string | null;
}

export interface ParseResult {
  schemaReport: PreflightSchemaReport;
  rows: ParsedRawRow[];
  totalRows: number;
}

export class FileParserService {
  /**
   * Normalizes header name to canonical key if recognized
   */
  normalizeHeader(header: string): CanonicalColumnKey | null {
    const clean = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
    return HEADER_ALIASES[clean] || HEADER_ALIASES[header.trim().toLowerCase()] || null;
  }

  /**
   * Analyzes headers against the 11 canonical columns
   */
  analyzeHeaders(rawHeaders: string[]): {
    schemaReport: PreflightSchemaReport;
    headerMap: Map<number, CanonicalColumnKey>;
  } {
    const detectedColumns: string[] = [];
    const extraColumns: string[] = [];
    const headerMap = new Map<number, CanonicalColumnKey>();
    const recognizedCanonical = new Set<CanonicalColumnKey>();

    rawHeaders.forEach((header, index) => {
      const canonical = this.normalizeHeader(header);
      if (canonical) {
        headerMap.set(index, canonical);
        recognizedCanonical.add(canonical);
        detectedColumns.push(header);
      } else {
        extraColumns.push(header);
      }
    });

    const missingColumns = CANONICAL_COLUMNS.filter((col) => !recognizedCanonical.has(col));

    // A schema is valid if at least part_number and part_desc or core identifier columns exist
    const isValid = recognizedCanonical.has('part_number') || recognizedCanonical.has('part_desc');

    return {
      schemaReport: {
        valid: isValid,
        detectedColumns,
        missingColumns,
        extraColumns,
      },
      headerMap,
    };
  }

  /**
   * Parses CSV buffer into structured rows
   */
  parseCsv(buffer: Buffer): ParseResult {
    try {
      const records = parseCsvSync(buffer, {
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      }) as string[][];

      if (records.length === 0) {
        throw new ValidationError('The uploaded CSV file is empty.');
      }

      const rawHeaders = records[0] || [];
      const { schemaReport, headerMap } = this.analyzeHeaders(rawHeaders);

      const rows: ParsedRawRow[] = [];

      for (let i = 1; i < records.length; i++) {
        const record = records[i]!;
        const rowObj: Record<string, string | null> = {
          part_number: null,
          dept: null,
          class: null,
          fine: null,
          sku_my_part_number: null,
          mfg_part_num: null,
          part_desc: null,
          e1_brand: null,
          unilog_brand: null,
          dib_brand: null,
          part_manuf: null,
        };

        record.forEach((val, colIdx) => {
          const canonicalKey = headerMap.get(colIdx);
          if (canonicalKey) {
            rowObj[canonicalKey] = val !== undefined && val !== '' ? val : null;
          }
        });

        // Only include non-empty rows
        const hasAnyValue = Object.values(rowObj).some((v) => v !== null);
        if (hasAnyValue) {
          rows.push(rowObj as unknown as ParsedRawRow);
        }
      }

      return {
        schemaReport,
        rows,
        totalRows: rows.length,
      };
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      throw new ValidationError(`Failed to parse CSV file: ${(err as Error).message}`);
    }
  }

  /**
   * Parses Excel XLSX buffer into structured rows
   */
  parseXlsx(buffer: Buffer): ParseResult {
    try {
      const workbook = xlsx.read(buffer, { type: 'buffer' });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new ValidationError('The uploaded Excel workbook contains no worksheets.');
      }

      const worksheet = workbook.Sheets[firstSheetName]!;
      const records = xlsx.utils.sheet_to_json<string[]>(worksheet, {
        header: 1,
        defval: '',
        blankrows: false,
      });

      if (records.length === 0) {
        throw new ValidationError('The uploaded Excel worksheet is empty.');
      }

      const rawHeaders = (records[0] || []).map(String);
      const { schemaReport, headerMap } = this.analyzeHeaders(rawHeaders);

      const rows: ParsedRawRow[] = [];

      for (let i = 1; i < records.length; i++) {
        const record = records[i]!;
        const rowObj: Record<string, string | null> = {
          part_number: null,
          dept: null,
          class: null,
          fine: null,
          sku_my_part_number: null,
          mfg_part_num: null,
          part_desc: null,
          e1_brand: null,
          unilog_brand: null,
          dib_brand: null,
          part_manuf: null,
        };

        record.forEach((val, colIdx) => {
          const canonicalKey = headerMap.get(colIdx);
          if (canonicalKey) {
            const strVal = String(val).trim();
            rowObj[canonicalKey] = strVal.length > 0 ? strVal : null;
          }
        });

        const hasAnyValue = Object.values(rowObj).some((v) => v !== null);
        if (hasAnyValue) {
          rows.push(rowObj as unknown as ParsedRawRow);
        }
      }

      return {
        schemaReport,
        rows,
        totalRows: rows.length,
      };
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      throw new ValidationError(`Failed to parse Excel file: ${(err as Error).message}`);
    }
  }

  /**
   * Unified parser dispatcher based on filename extension
   */
  parseBuffer(buffer: Buffer, fileName: string): ParseResult {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'csv') {
      return this.parseCsv(buffer);
    }
    if (ext === 'xlsx' || ext === 'xls') {
      return this.parseXlsx(buffer);
    }
    throw new ValidationError(`Unsupported file extension '.${ext}'. Allowed: .csv, .xlsx, .xls`);
  }
}

export const fileParser = new FileParserService();
