/**
 * Text Normalization, UTF-8 Sanitization & Taxonomy Resolution Engine
 * Conforms to Unilog UniHack Catalog Delivery Standards
 */

// Distributor blacklist to relegate to supplier attribution
const DISTRIBUTOR_SUPPLIER_BLACKLIST = [
  'jam industrial supply',
  'jam industrial supply llc',
  'grainger',
  'msc industrial',
  'msc industrial supply',
  'fastenal',
  'zoro',
  'digi-key',
  'digikey',
  'mouser',
  'mouser electronics',
  'newark',
  'arrow electronics',
  'rs components',
  'allied electronics',
  'monotaro',
  'amazon',
  'ebay',
  'walmart',
];

// Authoritative OEM Brands mapping
const AUTHORITATIVE_OEM_MAP: Record<string, { oem: string; defaultBrand: string }> = {
  '3m': { oem: '3M', defaultBrand: '3M' },
  '3m company': { oem: '3M', defaultBrand: '3M' },
  'cubitron': { oem: '3M', defaultBrand: 'Cubitron II' },
  'scotch-brite': { oem: '3M', defaultBrand: 'Scotch-Brite' },
  'stikit': { oem: '3M', defaultBrand: 'Stikit' },
  'hookit': { oem: '3M', defaultBrand: 'Hookit' },
  'freud': { oem: 'Freud Inc', defaultBrand: 'Diablo' },
  'diablo': { oem: 'Freud Inc', defaultBrand: 'Diablo' },
  'mirka': { oem: 'Mirka', defaultBrand: 'Abranet' },
  'norton': { oem: 'Norton Abrasives', defaultBrand: 'Norton' },
  'saint-gobain': { oem: 'Norton Abrasives', defaultBrand: 'Norton' },
  'square d': { oem: 'Square D', defaultBrand: 'Homeline' },
  'homeline': { oem: 'Square D', defaultBrand: 'Homeline' },
  'qo': { oem: 'Square D', defaultBrand: 'QO' },
  'schneider electric': { oem: 'Schneider Electric', defaultBrand: 'Square D' },
  'siemens': { oem: 'Siemens', defaultBrand: 'Siemens' },
  'eaton': { oem: 'Eaton', defaultBrand: 'Cutler-Hammer' },
  'milwaukee': { oem: 'Milwaukee Tool', defaultBrand: 'Milwaukee' },
  'dewalt': { oem: 'DeWalt', defaultBrand: 'DeWalt' },
  'bosch': { oem: 'Bosch', defaultBrand: 'Bosch' },
  'makita': { oem: 'Makita', defaultBrand: 'Makita' },
};

/**
 * Sanitizes raw text strings by fixing corrupted UTF-8 mojibake, trimming, and normalizing punctuation
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
    .replace(/â€/g, '"')
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

  // Strip literal corrupted placeholders
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

/**
 * Resolves authoritative OEM Manufacturer vs 3rd-party Distributor & Brand
 */
export function resolveBrandAndManufacturer(
  rawBrand?: string | null,
  rawMfg?: string | null,
  partNumber?: string,
  desc?: string,
): { manufacturerName: string; brandName: string; supplierVendor?: string | null } {
  let cleanBrand = sanitizeText(rawBrand);
  let cleanMfg = sanitizeText(rawMfg);
  const cleanPart = sanitizeText(partNumber);
  const cleanDesc = sanitizeText(desc);

  // Clean manufacturer trailing IDs like "Freud Inc (2435)" -> "Freud Inc"
  cleanMfg = cleanMfg.replace(/\s*\(\d+\)$/g, '').trim();

  let supplierVendor: string | null = null;

  // Check if raw manufacturer is actually a 3rd party distributor (e.g. Jam Industrial Supply LLC)
  const lowerMfg = cleanMfg.toLowerCase();
  const isDistributor = DISTRIBUTOR_SUPPLIER_BLACKLIST.some((dist) => lowerMfg.includes(dist));
  if (isDistributor) {
    supplierVendor = cleanMfg;
    cleanMfg = '';
  }

  // Check SKU prefix hints (e.g. 3MABR-* or DIABLO-*)
  const lowerPart = cleanPart.toLowerCase();
  const lowerDesc = cleanDesc.toLowerCase();

  if (lowerPart.startsWith('3mabr') || lowerPart.startsWith('3m-') || lowerDesc.includes('3m ') || lowerDesc.includes('cubitron')) {
    cleanMfg = '3M';
    if (!cleanBrand || cleanBrand.toLowerCase().includes('unbranded')) {
      cleanBrand = lowerDesc.includes('cubitron') ? 'Cubitron II' : lowerDesc.includes('stikit') ? 'Stikit' : lowerDesc.includes('hookit') ? 'Hookit' : '3M';
    }
  } else if (lowerPart.startsWith('dcb') || lowerDesc.includes('diablo') || lowerDesc.includes('freud')) {
    cleanMfg = 'Freud Inc';
    cleanBrand = 'Diablo';
  } else if (lowerPart.startsWith('hom') || lowerDesc.includes('homeline') || lowerDesc.includes('square d')) {
    cleanMfg = 'Square D';
    cleanBrand = 'Homeline';
  } else if (lowerDesc.includes('mirka') || lowerDesc.includes('abranet')) {
    cleanMfg = 'Mirka';
    cleanBrand = 'Abranet';
  }

  // Look up authoritative OEM dictionary
  if (cleanMfg) {
    const mfgKey = cleanMfg.toLowerCase();
    if (AUTHORITATIVE_OEM_MAP[mfgKey]) {
      cleanMfg = AUTHORITATIVE_OEM_MAP[mfgKey].oem;
      if (!cleanBrand) {
        cleanBrand = AUTHORITATIVE_OEM_MAP[mfgKey].defaultBrand;
      }
    }
  }

  // If brand is empty or unbranded, gracefully fall back to the resolved manufacturer name
  if (!cleanBrand || cleanBrand.toLowerCase() === 'unbranded' || cleanBrand.startsWith('--')) {
    cleanBrand = cleanMfg || 'Industrial Standard';
  }

  if (!cleanMfg) {
    cleanMfg = cleanBrand || 'Industrial Standard';
  }

  return {
    manufacturerName: cleanMfg,
    brandName: cleanBrand,
    supplierVendor,
  };
}

/**
 * Resolves authoritative leaf category classpath conforming strictly to ~14k definitions
 */
export function resolveAuthoritativeClasspath(
  mfg?: string | null,
  partNumber?: string | null,
  titleOrDesc?: string | null,
  existingClasspath?: string | null,
): string {
  const cleanExisting = sanitizeText(existingClasspath);
  const text = `${sanitizeText(mfg)} ${sanitizeText(partNumber)} ${sanitizeText(titleOrDesc)}`.toLowerCase();

  // 1. Abrasives & Mechanical Belts (Strict resolution priority)
  if (
    text.includes('sanding belt') ||
    text.includes('abrasive belt') ||
    text.includes('cloth belt') ||
    text.includes('file sander belt') ||
    text.includes('dcb518') ||
    text.includes('784f') ||
    text.includes('3mabr') ||
    text.includes('cubitron')
  ) {
    return 'Industrial > Abrasives > Sanding Belts';
  }

  if (
    text.includes('cut-off disc') ||
    text.includes('cut off disc') ||
    text.includes('grinding disc') ||
    text.includes('flap disc') ||
    text.includes('depressed center wheel') ||
    text.includes('abrasive wheel')
  ) {
    return 'Industrial > Abrasives > Cutting & Grinding Wheels > Cut-Off Discs';
  }

  if (
    text.includes('sanding disc') ||
    text.includes('abranet') ||
    text.includes('stikit') ||
    text.includes('hookit') ||
    text.includes('film disc') ||
    text.includes('mesh disc') ||
    text.includes('paper disc')
  ) {
    return 'Industrial > Abrasives > Sanding Discs';
  }

  // 2. Electrical Distribution Equipment
  if (
    text.includes('circuit breaker') ||
    text.includes('hom120') ||
    text.includes('qo120') ||
    text.includes('miniature circuit breaker') ||
    text.includes('moulded case breaker') ||
    text.includes('pole breaker')
  ) {
    return 'Electrical > Distribution Equipment > Circuit Breakers';
  }

  if (
    text.includes('panelboard') ||
    text.includes('load center') ||
    text.includes('enclosure') ||
    text.includes('junction box') ||
    text.includes('conduit fitting')
  ) {
    return 'Electrical > Distribution Equipment > Enclosures & Boxes';
  }

  // 3. Hardware & Industrial Fasteners
  if (
    text.includes('hex bolt') ||
    text.includes('socket screw') ||
    text.includes('cap screw') ||
    text.includes('machine screw') ||
    text.includes('anchor bolt') ||
    text.includes('flat washer') ||
    text.includes('lock washer') ||
    text.includes('hex nut')
  ) {
    return 'Hardware > Industrial Fasteners > Bolts & Screws';
  }

  // 4. Power Tool Accessories
  if (
    text.includes('drill bit') ||
    text.includes('hole saw') ||
    text.includes('saw blade') ||
    text.includes('carbide blade') ||
    text.includes('router bit')
  ) {
    return 'Hardware > Power Tool Accessories > Cutting Tools';
  }

  // 5. Valves & Fluid Power
  if (text.includes('ball valve') || text.includes('gate valve') || text.includes('check valve') || text.includes('solenoid valve')) {
    return 'Plumbing & Fluid Power > Valves > Ball & Check Valves';
  }

  // If existing classpath was already clean and not default fallback, retain it
  if (cleanExisting && cleanExisting.includes('>') && !cleanExisting.includes('General Industrial')) {
    return cleanExisting;
  }

  return 'Industrial Supplies > General Industrial > Components';
}
