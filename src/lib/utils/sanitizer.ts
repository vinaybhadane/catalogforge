/**
 * Client-side Text Sanitization and Delivery Normalization Utilities
 * Conforms to Unilog UniHack Catalog Delivery Standards
 */

export function sanitizeText(val: any): string {
  if (val === null || val === undefined) return '';
  let str = String(val);

  // Replace common corrupted UTF-8 mojibake patterns
  str = str
    .replace(/â€“/g, '-')
    .replace(/â€”/g, '-')
    .replace(/â€™/g, "'")
    .replace(/â€˜/g, "'")
    .replace(/â€œ/g, '"')
    .replace(/â€ /g, '"')
    .replace(/â€/g, '"')
    .replace(/Â®/g, '®')
    .replace(/â„¢/g, '™')
    .replace(/Â/g, '')
    .replace(/Ã©/g, 'é')
    .replace(/Ã¨/g, 'è')
    .replace(/Ã /g, 'à')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã¼/g, 'ü')
    .replace(/Ã¶/g, 'ö')
    .replace(/Ã¤/g, 'ä')
    .replace(/Ã/g, '');

  const trimmed = str.trim();
  if (
    trimmed === '-- Unbranded --' ||
    trimmed === 'Unbranded' ||
    trimmed === '---' ||
    trimmed === '—' ||
    trimmed === 'N/A' ||
    trimmed === 'null' ||
    trimmed === 'undefined'
  ) {
    return '';
  }

  return trimmed;
}

export function getCleanBrandName(brandName?: string | null, manufacturerName?: string | null): string {
  const cleanBrand = sanitizeText(brandName);
  const cleanMfg = sanitizeText(manufacturerName);

  if (cleanBrand && cleanBrand.toLowerCase() !== 'unbranded' && !cleanBrand.startsWith('--')) {
    return cleanBrand;
  }
  return cleanMfg || 'Industrial Standard';
}

export function getCleanManufacturerName(manufacturerName?: string | null, brandName?: string | null): string {
  const cleanMfg = sanitizeText(manufacturerName);
  const cleanBrand = sanitizeText(brandName);

  if (cleanMfg && !cleanMfg.toLowerCase().includes('jam industrial supply')) {
    return cleanMfg;
  }
  return cleanBrand || 'Industrial Standard';
}

export function calculateConfidenceScore(product: {
  confidence?: number | null;
  rowConfidence?: number | null;
  attributes?: Array<{ confidenceScore?: number | null }>;
}): number {
  let score = product.confidence ?? product.rowConfidence ?? null;
  if (score === null && product.attributes && product.attributes.length > 0) {
    const sum = product.attributes.reduce((acc, a) => acc + (a.confidenceScore ?? 0.95), 0);
    score = sum / product.attributes.length;
  }
  if (score === null || score === undefined) {
    score = 0.96;
  }
  return score > 1 ? Math.round(score) : Math.round(score * 100);
}
