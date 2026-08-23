/**
 * UOM & Fraction Normalizer Service
 * Conforms strictly to Unilog_Master_UOM_Standards_Abbreviations_and_Terms.xlsx
 *
 * Rules enforced:
 * - Only approved UOM abbreviations are used (e.g. "in", "ft", "lb", "V", "A")
 * - There MUST be a space between the numeric value and the UOM token ("24 in" NOT "24in")
 * - Fractions are expanded from 1/64 to 63/64 (Decimal_Fraction.xlsx — all 63 exact conversions)
 * - Bidirectional: decimal→fraction (50.25 → "50-1/4") for buyer search compatibility
 */

// ─────────────────────────────────────────────────────────
// SECTION A: Approved Unilog UOM Abbreviation Map
// Maps any raw alias to the single canonical approved form.
// ─────────────────────────────────────────────────────────
const UOM_LOOKUP: Record<string, string> = {
  // ── Length ──────────────────────────────────────────────
  in: 'in',
  inch: 'in',
  inches: 'in',
  '"': 'in',
  'IN.': 'in',
  'IN': 'in',
  'in.': 'in',
  ft: 'ft',
  feet: 'ft',
  foot: 'ft',
  "'": 'ft',
  'FT': 'ft',
  'FT.': 'ft',
  yd: 'yd',
  yard: 'yd',
  yards: 'yd',
  mm: 'mm',
  millimeter: 'mm',
  millimeters: 'mm',
  millimetre: 'mm',
  millimetres: 'mm',
  cm: 'cm',
  centimeter: 'cm',
  centimeters: 'cm',
  centimetre: 'cm',
  m: 'm',
  meter: 'm',
  meters: 'm',
  metre: 'm',
  km: 'km',
  kilometer: 'km',
  kilometers: 'km',

  // ── Area ────────────────────────────────────────────────
  'sq in': 'sq in',
  'in2': 'sq in',
  'sq ft': 'sq ft',
  'ft2': 'sq ft',
  'sq yd': 'sq yd',
  'sq m': 'sq m',
  'm2': 'sq m',
  'sq mm': 'sq mm',
  'mm2': 'sq mm',
  'sq cm': 'sq cm',
  'cm2': 'sq cm',

  // ── Volume ──────────────────────────────────────────────
  'cu in': 'cu in',
  'in3': 'cu in',
  'cu ft': 'cu ft',
  'ft3': 'cu ft',
  'cu yd': 'cu yd',
  'cu m': 'cu m',
  'm3': 'cu m',
  gal: 'gal',
  gallon: 'gal',
  gallons: 'gal',
  qt: 'qt',
  quart: 'qt',
  quarts: 'qt',
  pt: 'pt',
  pint: 'pt',
  pints: 'pt',
  'fl oz': 'fl oz',
  'fluid oz': 'fl oz',
  'fluid ounce': 'fl oz',
  l: 'L',
  liter: 'L',
  liters: 'L',
  litre: 'L',
  litres: 'L',
  'L': 'L',
  ml: 'mL',
  milliliter: 'mL',
  milliliters: 'mL',
  'mL': 'mL',

  // ── Weight / Mass ────────────────────────────────────────
  lb: 'lb',
  lbs: 'lb',
  pound: 'lb',
  pounds: 'lb',
  'LB': 'lb',
  'LBS': 'lb',
  oz: 'oz',
  ounce: 'oz',
  ounces: 'oz',
  'OZ': 'oz',
  ton: 'ton',
  tons: 'ton',
  'short ton': 'ton',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  'KG': 'kg',
  g: 'g',
  gram: 'g',
  grams: 'g',
  mg: 'mg',
  milligram: 'mg',
  milligrams: 'mg',
  'metric ton': 'MT',
  'MT': 'MT',
  tonne: 'MT',

  // ── Electrical / Power ───────────────────────────────────
  v: 'V',
  volt: 'V',
  volts: 'V',
  'V': 'V',
  vac: 'VAC',
  'VAC': 'VAC',
  'v ac': 'VAC',
  'volt ac': 'VAC',
  vdc: 'VDC',
  'VDC': 'VDC',
  'v dc': 'VDC',
  kv: 'kV',
  kilovolt: 'kV',
  a: 'A',
  amp: 'A',
  amps: 'A',
  ampere: 'A',
  amperes: 'A',
  'A': 'A',
  ma: 'mA',
  milliamp: 'mA',
  milliamps: 'mA',
  milliampere: 'mA',
  'mA': 'mA',
  ka: 'kA',
  kiloamp: 'kA',
  'kA': 'kA',
  w: 'W',
  watt: 'W',
  watts: 'W',
  'W': 'W',
  kw: 'kW',
  kilowatt: 'kW',
  kilowatts: 'kW',
  'kW': 'kW',
  mw: 'MW',
  megawatt: 'MW',
  hp: 'HP',
  horsepower: 'HP',
  'HP': 'HP',
  hz: 'Hz',
  hertz: 'Hz',
  'Hz': 'Hz',
  khz: 'kHz',
  mhz: 'MHz',
  ghz: 'GHz',
  'ohm': 'Ohm',
  'ohms': 'Ohm',
  'Ω': 'Ohm',
  kohm: 'kOhm',
  mohm: 'mOhm',
  pf: 'pF',
  picofarad: 'pF',
  nf: 'nF',
  nanofarad: 'nF',
  uf: 'µF',
  'µf': 'µF',
  microfarad: 'µF',
  mf: 'mF',
  farad: 'F',
  'F': 'F',
  va: 'VA',
  'volt-amp': 'VA',
  'volt amp': 'VA',
  kva: 'kVA',

  // ── Pressure ─────────────────────────────────────────────
  psi: 'psi',
  'PSI': 'psi',
  'lb/in2': 'psi',
  bar: 'bar',
  'BAR': 'bar',
  mbar: 'mbar',
  pa: 'Pa',
  kpa: 'kPa',
  mpa: 'MPa',
  'in hg': 'in Hg',
  'inhg': 'in Hg',
  'mm hg': 'mm Hg',
  'mmhg': 'mm Hg',
  inws: 'in WC',
  'in wc': 'in WC',
  'in w.c.': 'in WC',

  // ── Temperature ──────────────────────────────────────────
  '°f': '°F',
  degf: '°F',
  'deg f': '°F',
  fahrenheit: '°F',
  '°c': '°C',
  degc: '°C',
  'deg c': '°C',
  celsius: '°C',
  centigrade: '°C',
  'k': 'K',
  kelvin: 'K',

  // ── Speed / Flow ─────────────────────────────────────────
  rpm: 'RPM',
  'RPM': 'RPM',
  'r/min': 'RPM',
  'rev/min': 'RPM',
  fps: 'fps',
  'ft/s': 'fps',
  'feet per second': 'fps',
  fpm: 'fpm',
  'ft/min': 'fpm',
  'feet per minute': 'fpm',
  mph: 'mph',
  'miles/hr': 'mph',
  'miles per hour': 'mph',
  mps: 'm/s',
  'm/s': 'm/s',
  'meters per second': 'm/s',
  cfm: 'CFM',
  'CFM': 'CFM',
  'cu ft/min': 'CFM',
  'cubic feet per minute': 'CFM',
  gpm: 'GPM',
  'GPM': 'GPM',
  'gal/min': 'GPM',
  'gallons per minute': 'GPM',
  lpm: 'LPM',
  'L/min': 'LPM',

  // ── Torque ───────────────────────────────────────────────
  'lb-ft': 'lb-ft',
  'lb ft': 'lb-ft',
  'foot-pound': 'lb-ft',
  'ft-lb': 'lb-ft',
  'ft lb': 'lb-ft',
  'lb-in': 'lb-in',
  'lb in': 'lb-in',
  'in-lb': 'lb-in',
  'nm': 'N·m',
  'n·m': 'N·m',
  'n-m': 'N·m',
  'newton meter': 'N·m',
  'newton-meter': 'N·m',
  'newton metre': 'N·m',
  'n·mm': 'N·mm',
  'n-mm': 'N·mm',

  // ── Force ────────────────────────────────────────────────
  'n': 'N',
  newton: 'N',
  newtons: 'N',
  'Newton': 'N',
  kn: 'kN',
  lbf: 'lbf',
  'lb-f': 'lbf',

  // ── Quantity / Count ─────────────────────────────────────
  ea: 'EA',
  each: 'EA',
  'EA': 'EA',
  pc: 'PC',
  pcs: 'PC',
  piece: 'PC',
  pieces: 'PC',
  'PC': 'PC',
  pair: 'PR',
  'PR': 'PR',
  pk: 'PK',
  pkg: 'PK',
  pack: 'PK',
  package: 'PK',
  'PK': 'PK',
  'PKG': 'PK',
  'disc/box': 'PKG',
  box: 'BX',
  boxes: 'BX',
  'BX': 'BX',
  cs: 'CS',
  case: 'CS',
  'CS': 'CS',
  'bag': 'BG',
  'BG': 'BG',
  roll: 'RL',
  'RL': 'RL',
  kit: 'KT',
  'KT': 'KT',
  set: 'SET',
  'SET': 'SET',

  // ── Angle ────────────────────────────────────────────────
  deg: '°',
  degree: '°',
  degrees: '°',
  'deg.': '°',
  '°': '°',
  rad: 'rad',
  radian: 'rad',

  // ── Thread & Pitch ───────────────────────────────────────
  tpi: 'TPI',
  'TPI': 'TPI',
  'threads per inch': 'TPI',
  pitch: 'pitch',

  // ── Decibels ─────────────────────────────────────────────
  db: 'dB',
  'dB': 'dB',
  dbm: 'dBm',
  dba: 'dBA',
  'dBA': 'dBA',

  // ── Luminosity ───────────────────────────────────────────
  lm: 'lm',
  lumen: 'lm',
  lumens: 'lm',
  lx: 'lx',
  lux: 'lx',
  cd: 'cd',
  candela: 'cd',

  // ── Percentage / Ratio ────────────────────────────────────
  '%': '%',
  percent: '%',
  pct: '%',

  // ── Misc ─────────────────────────────────────────────────
  'n/a': null as any,
  'N/A': null as any,
  na: null as any,
  none: null as any,
  null: null as any,
};

// ─────────────────────────────────────────────────────────
// SECTION B: Complete Inch Fraction Lookup (Decimal_Fraction.xlsx)
// All 63 exact inch conversions from 1/64 (0.015625) to 63/64 (0.984375)
// ─────────────────────────────────────────────────────────
const FRACTION_TO_DECIMAL: Record<string, number> = {
  '1/64': 0.015625,
  '2/64': 0.03125,
  '1/32': 0.03125,
  '3/64': 0.046875,
  '4/64': 0.0625,
  '1/16': 0.0625,
  '5/64': 0.078125,
  '6/64': 0.09375,
  '3/32': 0.09375,
  '7/64': 0.109375,
  '8/64': 0.125,
  '1/8': 0.125,
  '9/64': 0.140625,
  '10/64': 0.15625,
  '5/32': 0.15625,
  '11/64': 0.171875,
  '12/64': 0.1875,
  '3/16': 0.1875,
  '13/64': 0.203125,
  '14/64': 0.21875,
  '7/32': 0.21875,
  '15/64': 0.234375,
  '16/64': 0.25,
  '1/4': 0.25,
  '17/64': 0.265625,
  '18/64': 0.28125,
  '9/32': 0.28125,
  '19/64': 0.296875,
  '20/64': 0.3125,
  '5/16': 0.3125,
  '21/64': 0.328125,
  '22/64': 0.34375,
  '11/32': 0.34375,
  '23/64': 0.359375,
  '24/64': 0.375,
  '3/8': 0.375,
  '25/64': 0.390625,
  '26/64': 0.40625,
  '13/32': 0.40625,
  '27/64': 0.421875,
  '28/64': 0.4375,
  '7/16': 0.4375,
  '29/64': 0.453125,
  '30/64': 0.46875,
  '15/32': 0.46875,
  '31/64': 0.484375,
  '32/64': 0.5,
  '1/2': 0.5,
  '33/64': 0.515625,
  '34/64': 0.53125,
  '17/32': 0.53125,
  '35/64': 0.546875,
  '36/64': 0.5625,
  '9/16': 0.5625,
  '37/64': 0.578125,
  '38/64': 0.59375,
  '19/32': 0.59375,
  '39/64': 0.609375,
  '40/64': 0.625,
  '5/8': 0.625,
  '41/64': 0.640625,
  '42/64': 0.65625,
  '21/32': 0.65625,
  '43/64': 0.671875,
  '44/64': 0.6875,
  '11/16': 0.6875,
  '45/64': 0.703125,
  '46/64': 0.71875,
  '23/32': 0.71875,
  '47/64': 0.734375,
  '48/64': 0.75,
  '3/4': 0.75,
  '49/64': 0.765625,
  '50/64': 0.78125,
  '25/32': 0.78125,
  '51/64': 0.796875,
  '52/64': 0.8125,
  '13/16': 0.8125,
  '53/64': 0.828125,
  '54/64': 0.84375,
  '27/32': 0.84375,
  '55/64': 0.859375,
  '56/64': 0.875,
  '7/8': 0.875,
  '57/64': 0.890625,
  '58/64': 0.90625,
  '29/32': 0.90625,
  '59/64': 0.921875,
  '60/64': 0.9375,
  '15/16': 0.9375,
  '61/64': 0.953125,
  '62/64': 0.96875,
  '31/32': 0.96875,
  '63/64': 0.984375,
};

// ─────────────────────────────────────────────────────────
// SECTION C: Decimal → Preferred Fraction String
// Used for buyer-search format output (50.25 → "50-1/4 in")
// Uses simplified canonical fractions (1/16 resolution preferred)
// ─────────────────────────────────────────────────────────
const DECIMAL_TO_FRACTION_MAP: Array<[number, string]> = [
  [0.015625, '1/64'],
  [0.03125, '1/32'],
  [0.046875, '3/64'],
  [0.0625, '1/16'],
  [0.078125, '5/64'],
  [0.09375, '3/32'],
  [0.109375, '7/64'],
  [0.125, '1/8'],
  [0.140625, '9/64'],
  [0.15625, '5/32'],
  [0.171875, '11/64'],
  [0.1875, '3/16'],
  [0.203125, '13/64'],
  [0.21875, '7/32'],
  [0.234375, '15/64'],
  [0.25, '1/4'],
  [0.265625, '17/64'],
  [0.28125, '9/32'],
  [0.296875, '19/64'],
  [0.3125, '5/16'],
  [0.328125, '21/64'],
  [0.34375, '11/32'],
  [0.359375, '23/64'],
  [0.375, '3/8'],
  [0.390625, '25/64'],
  [0.40625, '13/32'],
  [0.421875, '27/64'],
  [0.4375, '7/16'],
  [0.453125, '29/64'],
  [0.46875, '15/32'],
  [0.484375, '31/64'],
  [0.5, '1/2'],
  [0.515625, '33/64'],
  [0.53125, '17/32'],
  [0.546875, '35/64'],
  [0.5625, '9/16'],
  [0.578125, '37/64'],
  [0.59375, '19/32'],
  [0.609375, '39/64'],
  [0.625, '5/8'],
  [0.640625, '41/64'],
  [0.65625, '21/32'],
  [0.671875, '43/64'],
  [0.6875, '11/16'],
  [0.703125, '45/64'],
  [0.71875, '23/32'],
  [0.734375, '47/64'],
  [0.75, '3/4'],
  [0.765625, '49/64'],
  [0.78125, '25/32'],
  [0.796875, '51/64'],
  [0.8125, '13/16'],
  [0.828125, '53/64'],
  [0.84375, '27/32'],
  [0.859375, '55/64'],
  [0.875, '7/8'],
  [0.890625, '57/64'],
  [0.90625, '29/32'],
  [0.921875, '59/64'],
  [0.9375, '15/16'],
  [0.953125, '61/64'],
  [0.96875, '31/32'],
  [0.984375, '63/64'],
];

// ─────────────────────────────────────────────────────────
// SECTION D: Exported Interfaces
// ─────────────────────────────────────────────────────────
export interface ParsedDimensionResult {
  value: number | null;
  uom: string | null;
  raw: string;
  /** Formatted string for delivery output: e.g. "1/2 in", "24 in" */
  formatted: string | null;
  /** Fraction representation for buyer search: e.g. "1-1/4 in" */
  fractionDisplay: string | null;
}

// ─────────────────────────────────────────────────────────
// SECTION E: UomNormalizerService class
// ─────────────────────────────────────────────────────────
export class UomNormalizerService {

  /**
   * Normalizes a raw UOM string to the single Unilog-approved abbreviation.
   * Returns null if the raw value is a placeholder (N/A, none, null).
   * e.g. "INCHES" → "in", "LBS" → "lb", "v ac" → "VAC"
   */
  normalizeUom(rawUom: string | null | undefined): string | null {
    if (!rawUom) return null;
    const clean = rawUom.trim();
    const lower = clean.toLowerCase();

    // Direct lookup using original casing first, then lowercase
    if (UOM_LOOKUP[clean] !== undefined) return UOM_LOOKUP[clean] ?? null;
    if (UOM_LOOKUP[lower] !== undefined) return UOM_LOOKUP[lower] ?? null;

    // Strip trailing punctuation and try again
    const stripped = clean.replace(/[.,;]+$/, '').trim();
    const strippedLower = stripped.toLowerCase();
    if (UOM_LOOKUP[stripped] !== undefined) return UOM_LOOKUP[stripped] ?? null;
    if (UOM_LOOKUP[strippedLower] !== undefined) return UOM_LOOKUP[strippedLower] ?? null;

    // Return cleaned original as fallback (do not invent)
    return stripped || null;
  }

  /**
   * Converts a fractional string (e.g. "1-1/2", "3/4", "2.5", "17/64") to a decimal number.
   * Supports all 63 exact Unilog fraction increments.
   */
  parseFraction(val: string): number | null {
    const trimmed = val.trim();
    if (!trimmed) return null;

    // Direct decimal number
    const directNum = Number(trimmed);
    if (!isNaN(directNum)) return directNum;

    // Direct fraction lookup (e.g. "3/4", "11/32", "17/64")
    if (FRACTION_TO_DECIMAL[trimmed] !== undefined) return FRACTION_TO_DECIMAL[trimmed]!;

    // Compound fraction: "1-1/2", "2 3/4", "1 3/8", "50-1/4"
    const compoundMatch = trimmed.match(/^(\d+)\s*[-\s]\s*(\d+\/\d+)$/);
    if (compoundMatch) {
      const whole = parseInt(compoundMatch[1]!, 10);
      const fracStr = compoundMatch[2]!;
      const fracVal = this.parseFraction(fracStr);
      if (fracVal !== null) return whole + fracVal;
    }

    // Generic slash fraction (e.g. "5/7", "7/9") — math fallback
    const slashMatch = trimmed.match(/^(\d+)\s*\/\s*(\d+)$/);
    if (slashMatch) {
      const num = parseInt(slashMatch[1]!, 10);
      const den = parseInt(slashMatch[2]!, 10);
      if (den !== 0) return num / den;
    }

    return null;
  }

  /**
   * Converts a decimal inch value to its preferred fraction string.
   * e.g. 0.5 → "1/2", 50.25 → "50-1/4", 1.375 → "1-3/8"
   *
   * This is the format buyers use to search (Decimal_Fraction.xlsx requirement).
   * Returns null if no exact 1/64-resolution match is found.
   */
  decimalToFraction(decimal: number): string | null {
    if (decimal === 0) return '0';
    const whole = Math.floor(decimal);
    const frac = parseFloat((decimal - whole).toFixed(6));

    // Find exact fraction match at 1/64 resolution
    const match = DECIMAL_TO_FRACTION_MAP.find(([d]) => Math.abs(d - frac) < 0.00001);

    if (frac === 0) {
      return whole > 0 ? `${whole}` : null;
    }
    if (!match) return null;

    const fracStr = match[1]!;
    return whole > 0 ? `${whole}-${fracStr}` : fracStr;
  }

  /**
   * Formats a measurement to Unilog delivery standard:
   * - Number and UOM MUST be separated by exactly one space
   * - Uses the approved canonical UOM abbreviation
   * e.g.: value=24, uom="inches" → "24 in"
   *       value=0.5, uom="in" → "1/2 in"  (fraction display for buyer)
   *       value=1.5, uom="in" → "1-1/2 in"
   */
  formatMeasurement(value: number | null, rawUom: string | null | undefined): string | null {
    if (value === null || value === undefined) return null;
    const normalizedUom = this.normalizeUom(rawUom);

    // For inch measurements, prefer fraction display (buyer-search compatible)
    if (normalizedUom === 'in') {
      const fracStr = this.decimalToFraction(value);
      if (fracStr !== null) {
        return `${fracStr} in`;
      }
    }

    // Format: <value> <uom>  (mandatory single space)
    const numStr = Number.isInteger(value) ? `${value}` : `${parseFloat(value.toFixed(6))}`;
    return normalizedUom ? `${numStr} ${normalizedUom}` : numStr;
  }

  /**
   * Formats a raw combined string like "1/2\"" or "24in" or "3.5 lbs" into:
   * { value, uom, raw, formatted, fractionDisplay }
   *
   * The 'formatted' field is always: "<value or fraction> <approved UOM>" with a space.
   */
  parseDimensionString(input: string | null | undefined): ParsedDimensionResult {
    const empty: ParsedDimensionResult = { value: null, uom: null, raw: input || '', formatted: null, fractionDisplay: null };
    if (!input || !input.trim()) return empty;

    const trimmed = input.trim();

    // Pattern: optional fraction/number, then optional UOM
    // Handles: "1/2"", "3.5 in", "24in", "10 lbs", "1-3/4 in", "5/8""
    const regex = /^([\d\s\-/.]+)\s*([a-zA-Z"'°µΩ·]+(?:\s+[a-zA-Z]+)?)?$/;
    const match = trimmed.match(regex);

    if (match) {
      const numPart = (match[1] || '').trim();
      const rawUomPart = match[2] ? match[2].trim() : null;
      const parsedVal = this.parseFraction(numPart);
      const normalizedUom = this.normalizeUom(rawUomPart);

      const formatted = parsedVal !== null ? this.formatMeasurement(parsedVal, normalizedUom) : null;
      const fractionDisplay = (parsedVal !== null && normalizedUom === 'in')
        ? this.decimalToFraction(parsedVal)
        : null;

      return {
        value: parsedVal,
        uom: normalizedUom,
        raw: trimmed,
        formatted,
        fractionDisplay,
      };
    }

    return { value: null, uom: null, raw: trimmed, formatted: null, fractionDisplay: null };
  }

  /**
   * Normalizes a full attribute value string that may contain embedded UOM.
   * Enforces the mandatory space rule per Unilog house style.
   * e.g. "24in" → "24 in", "120V" → "120 V", "10lbs" → "10 lb"
   */
  normalizeAttributeValue(rawValue: string | null | undefined): string {
    if (!rawValue || !rawValue.trim()) return '';
    const trimmed = rawValue.trim();

    // Try to split concatenated number+UOM (e.g. "120VAC", "24in", "10lbs")
    const concat = trimmed.match(/^([\d./-]+)\s*([a-zA-Z°%"'µ]+(?:\/[a-zA-Z]+)?)$/);
    if (concat) {
      const numStr = concat[1]!;
      const rawUom = concat[2]!;
      const parsedNum = this.parseFraction(numStr);
      const normUom = this.normalizeUom(rawUom);

      if (parsedNum !== null && normUom) {
        return this.formatMeasurement(parsedNum, normUom) || trimmed;
      }
      if (normUom) {
        return `${numStr} ${normUom}`;
      }
    }

    return trimmed;
  }
}

export const uomNormalizer = new UomNormalizerService();
