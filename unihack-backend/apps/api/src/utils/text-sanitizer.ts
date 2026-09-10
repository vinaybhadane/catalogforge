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
  const lowerTrimmed = trimmed.toLowerCase();
  if (
    lowerTrimmed === '-- unbranded --' ||
    lowerTrimmed === '-- no unilog brand --' ||
    lowerTrimmed === '-- no dib brand --' ||
    lowerTrimmed === '-- no brand --' ||
    lowerTrimmed === '-- none --' ||
    lowerTrimmed === '-- n/a --' ||
    lowerTrimmed === 'unbranded' ||
    lowerTrimmed === 'no unilog brand' ||
    lowerTrimmed === 'no dib brand' ||
    lowerTrimmed === 'no brand' ||
    lowerTrimmed === '---' ||
    lowerTrimmed === '—' ||
    lowerTrimmed === 'n/a' ||
    lowerTrimmed === 'null' ||
    lowerTrimmed === 'undefined' ||
    lowerTrimmed === 'none'
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

export interface ResolvedTaxonomy {
  dept: string;
  class: string;
  fine: string;
  classpath: string;
}

/**
 * Resolves authoritative 3-tier taxonomy hierarchy (Dept, Class, Fine) conforming to
 * catalog delivery standards and merchandise hierarchy.
 *
 * Example:
 * Dishwasher ->
 *   dept: 'appliances'
 *   class: 'large appliances'
 *   fine: 'dishwasher'
 */
export function resolveTaxonomyHierarchy(
  mfg?: string | null,
  partNumber?: string | null,
  titleOrDesc?: string | null,
  existingClasspath?: string | null,
  rawDept?: string | null,
  rawClass?: string | null,
  rawFine?: string | null,
): ResolvedTaxonomy {
  const cleanRawDept = sanitizeText(rawDept).toLowerCase().trim();
  const cleanRawClass = sanitizeText(rawClass).toLowerCase().trim();
  const cleanRawFine = sanitizeText(rawFine).toLowerCase().trim();

  // If raw input already provided explicit Dept, Class, Fine, preserve them
  if (cleanRawDept && cleanRawClass && cleanRawFine) {
    return {
      dept: cleanRawDept,
      class: cleanRawClass,
      fine: cleanRawFine,
      classpath: `${cleanRawDept} > ${cleanRawClass} > ${cleanRawFine}`,
    };
  }

  const cleanPart = sanitizeText(partNumber);
  const cleanMfg = sanitizeText(mfg);
  const cleanTitleOrDesc = sanitizeText(titleOrDesc);
  const text = `${cleanMfg} ${cleanPart} ${cleanTitleOrDesc}`.toLowerCase();
  const lowerMfg = cleanMfg.toLowerCase();

  // 1. APPLIANCES
  // Dishwashers
  if (
    text.includes('dishwasher') ||
    text.includes('dish washer') ||
    /^(?:kdfm|pdsh|pdt\d|ldph|wdts|pdd\d|kdts|kdps)/i.test(cleanPart)
  ) {
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine: 'dishwasher',
      classpath: 'appliances > large appliances > dishwasher',
    };
  }

  // Refrigerators, Freezers & Beverage Centers
  if (
    text.includes('refrigerator') ||
    text.includes('fridge') ||
    text.includes('freezer') ||
    text.includes('beverage center') ||
    /^(?:gde|fcm|gne|cve|prfs|pad\d|pge\d|erfd|lt18|euf\d|xou)/i.test(cleanPart)
  ) {
    const fine = text.includes('freezer')
      ? 'freezer'
      : text.includes('beverage center')
        ? 'beverage center'
        : 'refrigerator';
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine,
      classpath: `appliances > large appliances > ${fine}`,
    };
  }

  // Washers & Dryers
  if (
    text.includes('washer') ||
    text.includes('washing machine') ||
    text.includes('dryer') ||
    /^(?:tc50|tr70|tr50)/i.test(cleanPart)
  ) {
    const fine = text.includes('dryer') ? 'dryer' : 'washer';
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine,
      classpath: `appliances > large appliances > ${fine}`,
    };
  }

  // Ranges, Ovens & Cooktops
  if (
    text.includes('range') ||
    text.includes('cooktop') ||
    text.includes('wall oven') ||
    text.includes('stove') ||
    /^(?:wosp|pep\d|ces\d|ps96|pb90|pcfe|sler|lsel|kses|gcfg|wsgs|chp\d)/i.test(cleanPart)
  ) {
    const fine = text.includes('cooktop')
      ? 'cooktop'
      : text.includes('oven')
        ? 'wall oven'
        : 'range';
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine,
      classpath: `appliances > large appliances > ${fine}`,
    };
  }

  // Microwaves
  if (
    text.includes('microwave') ||
    /^(?:mser|gcst|pcwk|smc22|smd24|cvm5|pmos|wmms|kmmf)/i.test(cleanPart)
  ) {
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine: 'microwave',
      classpath: 'appliances > large appliances > microwave',
    };
  }

  // Small Appliances (Coffee Maker, Espresso Machine, Toaster)
  if (
    text.includes('toaster') ||
    text.includes('coffee maker') ||
    text.includes('espresso') ||
    text.includes('toast oven') ||
    /^(?:c7cda|c7cdb|c7ceb|c7ces|c9tma|c90aa)/i.test(cleanPart)
  ) {
    const fine = text.includes('espresso')
      ? 'espresso machine'
      : text.includes('coffee')
        ? 'coffee maker'
        : 'toaster';
    return {
      dept: 'appliances',
      class: 'small appliances',
      fine,
      classpath: `appliances > small appliances > ${fine}`,
    };
  }

  // General Appliance Cooperative / Parts
  if (lowerMfg.includes('appliance') || text.includes('appliance dealers')) {
    return {
      dept: 'appliances',
      class: 'appliance parts & accessories',
      fine: 'replacement parts',
      classpath: 'appliances > appliance parts & accessories > replacement parts',
    };
  }

  // 2. ABRASIVES
  if (
    text.includes('sanding belt') ||
    text.includes('abrasive belt') ||
    text.includes('cloth belt') ||
    text.includes('file sander belt') ||
    text.includes('dcb518') ||
    text.includes('784f')
  ) {
    return {
      dept: 'abrasives',
      class: 'sanding belts & discs',
      fine: 'sanding belts',
      classpath: 'abrasives > sanding belts & discs > sanding belts',
    };
  }

  if (
    text.includes('cut-off disc') ||
    text.includes('cut off disc') ||
    text.includes('grinding disc') ||
    text.includes('flap disc') ||
    text.includes('depressed center wheel') ||
    text.includes('abrasive wheel')
  ) {
    return {
      dept: 'abrasives',
      class: 'cutting & grinding wheels',
      fine: 'cut-off discs',
      classpath: 'abrasives > cutting & grinding wheels > cut-off discs',
    };
  }

  if (
    text.includes('sanding disc') ||
    text.includes('abranet') ||
    text.includes('stikit') ||
    text.includes('hookit') ||
    text.includes('film disc') ||
    text.includes('mesh disc') ||
    text.includes('paper disc') ||
    text.includes('775l') ||
    text.includes('5b-332') ||
    text.includes('9a-570')
  ) {
    return {
      dept: 'abrasives',
      class: 'sanding belts & discs',
      fine: 'sanding discs',
      classpath: 'abrasives > sanding belts & discs > sanding discs',
    };
  }

  if (
    text.includes('3mabr') ||
    text.includes('cubitron') ||
    text.includes('hiolit') ||
    text.includes('mirka') ||
    text.includes('abrasive')
  ) {
    return {
      dept: 'abrasives',
      class: 'surface preparation & finishing',
      fine: 'abrasives',
      classpath: 'abrasives > surface preparation & finishing > abrasives',
    };
  }

  // 3. ELECTRICAL
  if (
    text.includes('circuit breaker') ||
    text.includes('hom120') ||
    text.includes('qo120') ||
    /^(?:hom\d|qo\d|br\d|ch\d|qob\d)/i.test(cleanPart) ||
    text.includes('miniature circuit breaker') ||
    text.includes('moulded case breaker') ||
    text.includes('pole breaker')
  ) {
    return {
      dept: 'electrical',
      class: 'distribution equipment',
      fine: 'circuit breakers',
      classpath: 'electrical > distribution equipment > circuit breakers',
    };
  }

  if (
    text.includes('panelboard') ||
    text.includes('load center') ||
    text.includes('enclosure') ||
    text.includes('junction box') ||
    text.includes('conduit fitting')
  ) {
    return {
      dept: 'electrical',
      class: 'distribution equipment',
      fine: 'panelboards & load centers',
      classpath: 'electrical > distribution equipment > panelboards & load centers',
    };
  }

  if (
    text.includes('wire') ||
    text.includes('cable') ||
    text.includes('conduit') ||
    text.includes('southwire') ||
    text.includes('prime wire') ||
    text.includes('woods wire')
  ) {
    return {
      dept: 'electrical',
      class: 'wire, cable & conduit',
      fine: 'electrical wire & cable',
      classpath: 'electrical > wire, cable & conduit > electrical wire & cable',
    };
  }

  if (
    text.includes('receptacle') ||
    text.includes('dimmer') ||
    text.includes('wall plate') ||
    text.includes('leviton') ||
    text.includes('cooper wiring') ||
    text.includes('pass & seymour')
  ) {
    return {
      dept: 'electrical',
      class: 'wiring devices',
      fine: 'switches & receptacles',
      classpath: 'electrical > wiring devices > switches & receptacles',
    };
  }

  // 4. LIGHTING
  if (
    text.includes('lighting') ||
    text.includes('lamp') ||
    text.includes('floodlight') ||
    text.includes('bulb') ||
    text.includes('kichler') ||
    text.includes('lithonia') ||
    text.includes('feit electric') ||
    text.includes('satco') ||
    text.includes('keystone')
  ) {
    return {
      dept: 'lighting',
      class: 'fixtures & lamps',
      fine: 'led lighting & fixtures',
      classpath: 'lighting > fixtures & lamps > led lighting & fixtures',
    };
  }

  // 5. HARDWARE & FASTENERS
  if (
    text.includes('hex bolt') ||
    text.includes('socket screw') ||
    text.includes('cap screw') ||
    text.includes('machine screw') ||
    text.includes('anchor bolt') ||
    text.includes('flat washer') ||
    text.includes('lock washer') ||
    text.includes('hex nut') ||
    text.includes('national nail') ||
    text.includes('senco') ||
    text.includes('prebena') ||
    text.includes('fastener')
  ) {
    return {
      dept: 'hardware',
      class: 'fasteners',
      fine: 'bolts, screws & nails',
      classpath: 'hardware > fasteners > bolts, screws & nails',
    };
  }

  if (text.includes('hinge') || text.includes('hager hinge')) {
    return {
      dept: 'hardware',
      class: 'door & window hardware',
      fine: 'hinges & hardware',
      classpath: 'hardware > door & window hardware > hinges & hardware',
    };
  }

  // 6. TOOLS
  if (
    text.includes('drill bit') ||
    text.includes('hole saw') ||
    text.includes('saw blade') ||
    text.includes('carbide blade') ||
    text.includes('router bit') ||
    text.includes('sawstop') ||
    text.includes('wera') ||
    text.includes('vessel tools') ||
    text.includes('irwin') ||
    text.includes('kreg') ||
    text.includes('festool') ||
    text.includes('amana tool') ||
    text.includes('whiteside')
  ) {
    return {
      dept: 'tools',
      class: 'power tools & accessories',
      fine: 'blades, bits & cutting tools',
      classpath: 'tools > power tools & accessories > blades, bits & cutting tools',
    };
  }

  // 7. SAFETY & SECURITY
  if (
    text.includes('eyewear') ||
    text.includes('safety glasses') ||
    text.includes('smoke alarm') ||
    text.includes('smoke detector') ||
    text.includes('firewatch') ||
    text.includes('first alert') ||
    text.includes('radians')
  ) {
    return {
      dept: 'safety & security',
      class: 'personal protective equipment',
      fine: 'safety glasses & alarms',
      classpath: 'safety & security > personal protective equipment > safety glasses & alarms',
    };
  }

  // 8. BUILDING MATERIALS
  if (
    text.includes('lumber') ||
    text.includes('wood') ||
    text.includes('gypsum') ||
    text.includes('window') ||
    text.includes('skylight') ||
    text.includes('boise cascade') ||
    text.includes('certainteed') ||
    text.includes('provia') ||
    text.includes('velux') ||
    text.includes('united window')
  ) {
    return {
      dept: 'building materials',
      class: 'lumber, doors & windows',
      fine: 'building supplies & lumber',
      classpath: 'building materials > lumber, doors & windows > building supplies & lumber',
    };
  }

  // 9. PLUMBING & FLUID POWER
  if (
    text.includes('ball valve') ||
    text.includes('gate valve') ||
    text.includes('check valve') ||
    text.includes('solenoid valve') ||
    text.includes('pipe fitting') ||
    text.includes('faucet')
  ) {
    return {
      dept: 'plumbing & fluid power',
      class: 'valves & fittings',
      fine: 'valves & pipe fittings',
      classpath: 'plumbing & fluid power > valves & fittings > valves & pipe fittings',
    };
  }

  // 10. Existing Classpath Fallback
  const cleanExisting = sanitizeText(existingClasspath);
  if (cleanExisting && cleanExisting.includes('>')) {
    const parts = cleanExisting.split('>').map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (parts.length >= 3) {
      return {
        dept: parts[0]!,
        class: parts[1]!,
        fine: parts[2]!,
        classpath: `${parts[0]} > ${parts[1]} > ${parts[2]}`,
      };
    } else if (parts.length === 2) {
      return {
        dept: parts[0]!,
        class: parts[1]!,
        fine: parts[1]!,
        classpath: `${parts[0]} > ${parts[1]} > ${parts[1]}`,
      };
    } else if (parts.length === 1) {
      return {
        dept: parts[0]!,
        class: parts[0]!,
        fine: parts[0]!,
        classpath: `${parts[0]} > ${parts[0]} > ${parts[0]}`,
      };
    }
  }

  // If existing individual raw fields are partially available
  if (cleanRawDept || cleanRawClass || cleanRawFine) {
    const dept = cleanRawDept || 'industrial supplies';
    const cls = cleanRawClass || 'general industrial';
    const fine = cleanRawFine || 'components';
    return {
      dept,
      class: cls,
      fine,
      classpath: `${dept} > ${cls} > ${fine}`,
    };
  }

  // 11. Default General Industrial Fallback
  return {
    dept: 'industrial supplies',
    class: 'general industrial',
    fine: 'components',
    classpath: 'industrial supplies > general industrial > components',
  };
}

/**
 * Resolves authoritative leaf category classpath conforming strictly to taxonomy hierarchy
 */
export function resolveAuthoritativeClasspath(
  mfg?: string | null,
  partNumber?: string | null,
  titleOrDesc?: string | null,
  existingClasspath?: string | null,
): string {
  const taxonomy = resolveTaxonomyHierarchy(mfg, partNumber, titleOrDesc, existingClasspath);
  return taxonomy.classpath;
}
