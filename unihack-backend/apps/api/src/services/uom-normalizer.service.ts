/**
 * UOM & Fraction Normalizer Service
 * Standardizes units of measure and parses fractional dimensions into numeric decimals
 */

const UOM_LOOKUP: Record<string, string> = {
  // Length
  in: 'in',
  inch: 'in',
  inches: 'in',
  '"': 'in',
  ft: 'ft',
  feet: 'ft',
  foot: 'ft',
  "'": 'ft',
  mm: 'mm',
  cm: 'cm',
  m: 'm',
  meter: 'm',
  meters: 'm',

  // Weight
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  kg: 'kg',
  g: 'g',
  gram: 'g',
  grams: 'g',

  // Electrical & Power
  v: 'V',
  volt: 'V',
  volts: 'V',
  vac: 'VAC',
  vdc: 'VDC',
  a: 'A',
  amp: 'A',
  amps: 'A',
  ampere: 'A',
  w: 'W',
  watt: 'W',
  watts: 'W',
  kw: 'kW',
  hp: 'HP',
  hz: 'Hz',
};

const FRACTION_LOOKUP: Record<string, number> = {
  '1/16': 0.0625,
  '1/8': 0.125,
  '3/16': 0.1875,
  '1/4': 0.25,
  '5/16': 0.3125,
  '3/8': 0.375,
  '7/16': 0.4375,
  '1/2': 0.5,
  '9/16': 0.5625,
  '5/8': 0.625,
  '11/16': 0.6875,
  '3/4': 0.75,
  '13/16': 0.8125,
  '7/8': 0.875,
  '15/16': 0.9375,
  '1/32': 0.03125,
  '1/64': 0.015625,
};

export interface ParsedDimensionResult {
  value: number | null;
  uom: string | null;
  raw: string;
}

export class UomNormalizerService {
  /**
   * Normalizes a raw UOM string to standard code (e.g. 'INCHES' -> 'in')
   */
  normalizeUom(rawUom: string | null | undefined): string | null {
    if (!rawUom) return null;
    const clean = rawUom.trim().toLowerCase();
    return UOM_LOOKUP[clean] || rawUom.trim();
  }

  /**
   * Converts a fractional string representation (e.g. "1-1/2", "3/4", "2.5") to a number.
   */
  parseFraction(val: string): number | null {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Direct decimal number
    const directNum = Number(trimmed);
    if (!isNaN(directNum)) {
      return directNum;
    }

    // Direct fraction (e.g. "3/4")
    if (FRACTION_LOOKUP[trimmed] !== undefined) {
      return FRACTION_LOOKUP[trimmed]!;
    }

    // Compound fraction (e.g. "1 1/2", "1-1/2", "2-3/4")
    const compoundMatch = trimmed.match(/^(\d+)\s*[- ]\s*(\d+\/\d+)$/);
    if (compoundMatch) {
      const whole = parseInt(compoundMatch[1]!, 10);
      const fracStr = compoundMatch[2]!;
      const fracVal = this.parseFraction(fracStr);
      if (fracVal !== null) {
        return whole + fracVal;
      }
    }

    // Generic slash fraction (e.g. "5/32")
    const slashMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (slashMatch) {
      const num = parseInt(slashMatch[1]!, 10);
      const den = parseInt(slashMatch[2]!, 10);
      if (den !== 0) {
        return num / den;
      }
    }

    return null;
  }

  /**
   * Extracts both value and UOM from a combined string (e.g. '1/2" ', '3.5 in', '10 lbs')
   */
  parseDimensionString(input: string | null | undefined): ParsedDimensionResult {
    if (!input || !input.trim()) {
      return { value: null, uom: null, raw: input || '' };
    }

    const trimmed = input.trim();

    // Match number/fraction + trailing UOM
    const regex = /^([\d\s\-/.]+)\s*([a-zA-Z"']+)?$/;
    const match = trimmed.match(regex);

    if (match) {
      const numPart = match[1]!.trim();
      const uomPart = match[2] ? match[2].trim() : null;
      const parsedVal = this.parseFraction(numPart);
      const normalizedUom = this.normalizeUom(uomPart);

      return {
        value: parsedVal,
        uom: normalizedUom,
        raw: trimmed,
      };
    }

    return {
      value: null,
      uom: null,
      raw: trimmed,
    };
  }
}

export const uomNormalizer = new UomNormalizerService();
