/**
 * Placeholder Detector Service
 * Identifies and normalizes non-informative placeholder strings to clean nulls
 */

import { PreflightPlaceholderFlag } from '@unihack/contracts';

const EXACT_PLACEHOLDERS = new Set([
  'n/a',
  'na',
  'n.a.',
  'n / a',
  'tbd',
  'tba',
  'to be determined',
  'to be added',
  'same as above',
  'same',
  'as above',
  'see above',
  'none',
  'null',
  'nil',
  'unknown',
  'unk',
  'undefined',
  'pending',
  'placeholder',
  'no info',
  'no information',
  'not available',
  'not applicable',
  'see description',
  'various',
  'default',
  '0',
  '-',
  '--',
  '---',
  '/',
  '.',
  '..',
  '...',
  '?',
  '??',
  '???',
  '*',
  '**',
  '***',
  '#',
  '##',
]);

export interface CleanedFieldResult {
  value: string | null;
  isPlaceholder: boolean;
  reason?: string;
}

export class PlaceholderDetectorService {
  /**
   * Evaluates if a given string or value is a placeholder.
   * If placeholder, returns { value: null, isPlaceholder: true, reason }
   * Otherwise returns original trimmed string.
   */
  cleanValue(val: unknown): CleanedFieldResult {
    if (val === null || val === undefined) {
      return { value: null, isPlaceholder: false };
    }

    const str = String(val).trim();

    if (str.length === 0) {
      return { value: null, isPlaceholder: false };
    }

    const lower = str.toLowerCase();

    // 1. Direct Set lookup
    if (EXACT_PLACEHOLDERS.has(lower)) {
      return {
        value: null,
        isPlaceholder: true,
        reason: `Matched common placeholder pattern '${str}'`,
      };
    }

    // 2. Repetitive punctuation / dummy characters
    if (/^[-._*?#/\\+=~`!@$%^&()|<>]{1,10}$/.test(str)) {
      return {
        value: null,
        isPlaceholder: true,
        reason: `Symbol-only placeholder string '${str}'`,
      };
    }

    // 3. Phrasing patterns
    if (
      lower.startsWith('see ') ||
      lower.startsWith('same as ') ||
      lower.includes('to be determined') ||
      lower.includes('not applicable')
    ) {
      return {
        value: null,
        isPlaceholder: true,
        reason: `Generic placeholder phrase '${str}'`,
      };
    }

    return { value: str, isPlaceholder: false };
  }

  /**
   * Scans a full 11-column record and collects placeholder flags
   */
  scanRecord(
    record: Record<string, unknown>,
    rowNumber: number,
  ): { cleaned: Record<string, string | null>; flags: PreflightPlaceholderFlag[] } {
    const cleaned: Record<string, string | null> = {};
    const flags: PreflightPlaceholderFlag[] = [];

    for (const [key, value] of Object.entries(record)) {
      const result = this.cleanValue(value);
      cleaned[key] = result.value;

      if (result.isPlaceholder) {
        flags.push({
          rowNumber,
          columnName: key,
          originalValue: String(value),
          cleanedValue: null,
          reason: result.reason || 'Placeholder detected',
        });
      }
    }

    return { cleaned, flags };
  }
}

export const placeholderDetector = new PlaceholderDetectorService();
