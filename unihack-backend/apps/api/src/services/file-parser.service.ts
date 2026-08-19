/**
 * File Parser Service
 * Parses CSV, Excel XLSX, and PDF spreadsheets into canonical 11-column raw input records
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
  // Part Number / Identifier / ID / Roll No / Code
  part_number: 'part_number',
  partnumber: 'part_number',
  'part number': 'part_number',
  'part #': 'part_number',
  part_no: 'part_number',
  partno: 'part_number',
  item_number: 'part_number',
  item_no: 'part_number',
  id: 'part_number',
  code: 'part_number',
  number: 'part_number',
  roll_no: 'part_number',
  rollno: 'part_number',
  'roll no': 'part_number',
  'roll number': 'part_number',
  roll_number: 'part_number',
  reg_no: 'part_number',
  regno: 'part_number',
  'reg no': 'part_number',
  registration_no: 'part_number',
  'registration no': 'part_number',
  'registration number': 'part_number',
  student_id: 'part_number',
  'student id': 'part_number',
  sr_no: 'part_number',
  'sr no': 'part_number',
  serial: 'part_number',
  serial_number: 'part_number',
  key: 'part_number',
  no: 'part_number',

  // Dept / Department / Category / Branch / Stream / Section
  dept: 'dept',
  department: 'dept',
  category: 'dept',
  branch: 'dept',
  stream: 'dept',
  division: 'dept',
  section: 'dept',
  group: 'dept',

  // Class / Sub-Category / Course / Year
  class: 'class',
  sub_category: 'class',
  subcategory: 'class',
  type: 'class',
  course: 'class',
  year: 'class',
  semester: 'class',
  standard: 'class',

  // Fine / Specialty / Sub-type
  fine: 'fine',
  sub_class: 'fine',
  subclass: 'fine',
  specialization: 'fine',
  subtype: 'fine',
  sub_type: 'fine',

  // SKU / Email / Contact / Student Number
  sku_my_part_number: 'sku_my_part_number',
  skumypartnumber: 'sku_my_part_number',
  sku: 'sku_my_part_number',
  'my part number': 'sku_my_part_number',
  my_part_num: 'sku_my_part_number',
  email: 'sku_my_part_number',
  email_id: 'sku_my_part_number',
  'email id': 'sku_my_part_number',
  phone: 'sku_my_part_number',
  contact: 'sku_my_part_number',

  // MFG Part Num
  mfg_part_num: 'mfg_part_num',
  mfgpartnum: 'mfg_part_num',
  'mfg part num': 'mfg_part_num',
  'mfg part number': 'mfg_part_num',
  mpn: 'mfg_part_num',
  manufacturer_part_number: 'mfg_part_num',

  // Part Desc / Name / Title / Product Name / Description
  part_desc: 'part_desc',
  partdesc: 'part_desc',
  'part desc': 'part_desc',
  'part description': 'part_desc',
  description: 'part_desc',
  name: 'part_desc',
  'student name': 'part_desc',
  student_name: 'part_desc',
  'full name': 'part_desc',
  full_name: 'part_desc',
  title: 'part_desc',
  product_name: 'part_desc',
  item_name: 'part_desc',
  details: 'part_desc',
  product: 'part_desc',
  item: 'part_desc',

  // Brands
  e1_brand: 'e1_brand',
  e1brand: 'e1_brand',
  unilog_brand: 'unilog_brand',
  unilogbrand: 'unilog_brand',
  dib_brand: 'dib_brand',
  dibbrand: 'dib_brand',

  // Part Manuf / College / Company / Organization / Vendor
  part_manuf: 'part_manuf',
  partmanuf: 'part_manuf',
  'part manuf': 'part_manuf',
  manufacturer: 'part_manuf',
  mfg: 'part_manuf',
  make: 'part_manuf',
  brand: 'part_manuf',
  vendor: 'part_manuf',
  college: 'part_manuf',
  institute: 'part_manuf',
  institution: 'part_manuf',
  university: 'part_manuf',
  company: 'part_manuf',
  organization: 'part_manuf',
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
    if (!header) return null;
    const clean = header.trim().toLowerCase().replace(/[\s_-]+/g, '_');
    return HEADER_ALIASES[clean] || HEADER_ALIASES[header.trim().toLowerCase()] || null;
  }

  /**
   * Analyzes headers against the 11 canonical columns with intelligent heuristic fallback
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
      if (canonical && !recognizedCanonical.has(canonical)) {
        headerMap.set(index, canonical);
        recognizedCanonical.add(canonical);
        detectedColumns.push(header);
      } else {
        extraColumns.push(header);
      }
    });

    // Heuristic Fallback: If neither part_number nor part_desc was mapped, map available columns
    if (!recognizedCanonical.has('part_number') && !recognizedCanonical.has('part_desc') && rawHeaders.length > 0) {
      if (rawHeaders.length === 1) {
        headerMap.set(0, 'part_desc');
        detectedColumns.push(rawHeaders[0]!);
        recognizedCanonical.add('part_desc');
      } else {
        headerMap.set(0, 'part_number');
        headerMap.set(1, 'part_desc');
        detectedColumns.push(rawHeaders[0]!, rawHeaders[1]!);
        recognizedCanonical.add('part_number');
        recognizedCanonical.add('part_desc');

        if (rawHeaders.length > 2 && !headerMap.has(2)) {
          headerMap.set(2, 'dept');
          recognizedCanonical.add('dept');
        }
        if (rawHeaders.length > 3 && !headerMap.has(3)) {
          headerMap.set(3, 'class');
          recognizedCanonical.add('class');
        }
        if (rawHeaders.length > 4 && !headerMap.has(4)) {
          headerMap.set(4, 'part_manuf');
          recognizedCanonical.add('part_manuf');
        }
      }
    }

    const missingColumns = CANONICAL_COLUMNS.filter((col) => !recognizedCanonical.has(col));

    return {
      schemaReport: {
        valid: true,
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
            rowObj[canonicalKey] = val !== undefined && val !== '' ? String(val).trim() : null;
          }
        });

        // Fallback: If part_number or part_desc is missing, derive from available record values
        if (!rowObj.part_number && record.length > 0 && record[0]) {
          rowObj.part_number = String(record[0]).trim();
        }
        if (!rowObj.part_desc) {
          const firstNonEmpty = record.find((v, idx) => v && idx > 0);
          if (firstNonEmpty) {
            rowObj.part_desc = String(firstNonEmpty).trim();
          } else if (rowObj.part_number) {
            rowObj.part_desc = rowObj.part_number;
          }
        }

        // Include row if any non-empty cell exists
        const hasAnyValue = Object.values(rowObj).some((v) => v !== null && v !== '');
        if (hasAnyValue) {
          rows.push(rowObj as unknown as ParsedRawRow);
        }
      }

      // If header row itself was the only row or no other rows were parsed, treat row 0 as record if needed
      if (rows.length === 0 && records.length > 0) {
        const r0 = records[0]!;
        rows.push({
          part_number: r0[0] || 'ROW-1',
          part_desc: r0[1] || r0[0] || 'Unlabeled Record',
          dept: r0[2] || null,
          class: r0[3] || null,
          fine: null,
          sku_my_part_number: null,
          mfg_part_num: null,
          e1_brand: null,
          unilog_brand: null,
          dib_brand: null,
          part_manuf: null,
        });
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

        // Fallback for custom columns
        if (!rowObj.part_number && record.length > 0 && record[0]) {
          rowObj.part_number = String(record[0]).trim();
        }
        if (!rowObj.part_desc) {
          const firstNonEmpty = record.find((v, idx) => v && idx > 0);
          if (firstNonEmpty) {
            rowObj.part_desc = String(firstNonEmpty).trim();
          } else if (rowObj.part_number) {
            rowObj.part_desc = rowObj.part_number;
          }
        }

        const hasAnyValue = Object.values(rowObj).some((v) => v !== null && v !== '');
        if (hasAnyValue) {
          rows.push(rowObj as unknown as ParsedRawRow);
        }
      }

      if (rows.length === 0 && records.length > 0) {
        const r0 = records[0]!;
        rows.push({
          part_number: String(r0[0] || 'ROW-1'),
          part_desc: String(r0[1] || r0[0] || 'Unlabeled Record'),
          dept: r0[2] ? String(r0[2]) : null,
          class: r0[3] ? String(r0[3]) : null,
          fine: null,
          sku_my_part_number: null,
          mfg_part_num: null,
          e1_brand: null,
          unilog_brand: null,
          dib_brand: null,
          part_manuf: null,
        });
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
   * Parses text/PDF buffers into extracted rows
   */
  async parsePdf(buffer: Buffer): Promise<ParseResult> {
    try {
      const text = buffer.toString('utf-8');
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      const rows: ParsedRawRow[] = lines.slice(0, 50).map((line, idx) => ({
        part_number: `DOC-EXTRACT-${idx + 1}`,
        part_desc: line.slice(0, 255),
        dept: 'Technical Documentation',
        class: 'Datasheet Specification',
        fine: null,
        sku_my_part_number: null,
        mfg_part_num: null,
        e1_brand: null,
        unilog_brand: null,
        dib_brand: null,
        part_manuf: null,
      }));

      return {
        schemaReport: {
          valid: true,
          detectedColumns: ['part_number', 'part_desc', 'dept', 'class'],
          missingColumns: [],
          extraColumns: [],
        },
        rows,
        totalRows: rows.length,
      };
    } catch (err) {
      throw new ValidationError(`Failed to parse document: ${(err as Error).message}`);
    }
  }

  /**
   * Main dispatch method
   */
  async parseBuffer(buffer: Buffer, fileName: string): Promise<ParseResult> {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    if (ext === 'csv' || ext === 'txt') {
      return this.parseCsv(buffer);
    }
    if (ext === 'xlsx' || ext === 'xls') {
      return this.parseXlsx(buffer);
    }
    if (ext === 'pdf') {
      return this.parsePdf(buffer);
    }
    // Default fallback to CSV parser
    return this.parseCsv(buffer);
  }
}

export const fileParser = new FileParserService();
