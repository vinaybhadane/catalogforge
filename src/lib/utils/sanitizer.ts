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

export interface ResolvedTaxonomy {
  dept: string;
  class: string;
  fine: string;
  classpath: string;
}

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

  if (
    text.includes('refrigerator') ||
    text.includes('fridge') ||
    text.includes('freezer') ||
    text.includes('beverage center') ||
    /^(?:gde|fcm|gne|cve|prfs|pad\d|pge\d|erfd|lt18|euf\d|xou)/i.test(cleanPart)
  ) {
    const fine = text.includes('freezer') ? 'freezer' : text.includes('beverage center') ? 'beverage center' : 'refrigerator';
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine,
      classpath: `appliances > large appliances > ${fine}`,
    };
  }

  if (text.includes('washer') || text.includes('washing machine') || text.includes('dryer') || /^(?:tc50|tr70|tr50)/i.test(cleanPart)) {
    const fine = text.includes('dryer') ? 'dryer' : 'washer';
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine,
      classpath: `appliances > large appliances > ${fine}`,
    };
  }

  if (text.includes('range') || text.includes('cooktop') || text.includes('wall oven') || text.includes('stove') || /^(?:wosp|pep\d|ces\d|ps96|pb90|pcfe|sler|lsel|kses|gcfg|wsgs|chp\d)/i.test(cleanPart)) {
    const fine = text.includes('cooktop') ? 'cooktop' : text.includes('oven') ? 'wall oven' : 'range';
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine,
      classpath: `appliances > large appliances > ${fine}`,
    };
  }

  if (text.includes('microwave') || /^(?:mser|gcst|pcwk|smc22|smd24|cvm5|pmos|wmms|kmmf)/i.test(cleanPart)) {
    return {
      dept: 'appliances',
      class: 'large appliances',
      fine: 'microwave',
      classpath: 'appliances > large appliances > microwave',
    };
  }

  if (text.includes('toaster') || text.includes('coffee maker') || text.includes('espresso') || text.includes('toast oven') || /^(?:c7cda|c7cdb|c7ceb|c7ces|c9tma|c90aa)/i.test(cleanPart)) {
    const fine = text.includes('espresso') ? 'espresso machine' : text.includes('coffee') ? 'coffee maker' : 'toaster';
    return {
      dept: 'appliances',
      class: 'small appliances',
      fine,
      classpath: `appliances > small appliances > ${fine}`,
    };
  }

  if (lowerMfg.includes('appliance') || text.includes('appliance dealers')) {
    return {
      dept: 'appliances',
      class: 'appliance parts & accessories',
      fine: 'replacement parts',
      classpath: 'appliances > appliance parts & accessories > replacement parts',
    };
  }

  // 2. ABRASIVES
  if (text.includes('sanding belt') || text.includes('abrasive belt') || text.includes('cloth belt') || text.includes('file sander belt') || text.includes('dcb518') || text.includes('784f')) {
    return {
      dept: 'abrasives',
      class: 'sanding belts & discs',
      fine: 'sanding belts',
      classpath: 'abrasives > sanding belts & discs > sanding belts',
    };
  }

  if (text.includes('cut-off disc') || text.includes('cut off disc') || text.includes('grinding disc') || text.includes('flap disc') || text.includes('abrasive wheel')) {
    return {
      dept: 'abrasives',
      class: 'cutting & grinding wheels',
      fine: 'cut-off discs',
      classpath: 'abrasives > cutting & grinding wheels > cut-off discs',
    };
  }

  if (text.includes('sanding disc') || text.includes('abranet') || text.includes('stikit') || text.includes('hookit') || text.includes('film disc') || text.includes('775l') || text.includes('5b-332') || text.includes('9a-570')) {
    return {
      dept: 'abrasives',
      class: 'sanding belts & discs',
      fine: 'sanding discs',
      classpath: 'abrasives > sanding belts & discs > sanding discs',
    };
  }

  if (text.includes('3mabr') || text.includes('cubitron') || text.includes('hiolit') || text.includes('mirka') || text.includes('abrasive')) {
    return {
      dept: 'abrasives',
      class: 'surface preparation & finishing',
      fine: 'abrasives',
      classpath: 'abrasives > surface preparation & finishing > abrasives',
    };
  }

  // 3. ELECTRICAL
  if (text.includes('circuit breaker') || text.includes('hom120') || text.includes('qo120') || /^(?:hom\d|qo\d|br\d|ch\d|qob\d)/i.test(cleanPart) || text.includes('miniature circuit breaker') || text.includes('pole breaker')) {
    return {
      dept: 'electrical',
      class: 'distribution equipment',
      fine: 'circuit breakers',
      classpath: 'electrical > distribution equipment > circuit breakers',
    };
  }

  if (text.includes('panelboard') || text.includes('load center') || text.includes('enclosure') || text.includes('junction box') || text.includes('conduit fitting')) {
    return {
      dept: 'electrical',
      class: 'distribution equipment',
      fine: 'panelboards & load centers',
      classpath: 'electrical > distribution equipment > panelboards & load centers',
    };
  }

  if (text.includes('wire') || text.includes('cable') || text.includes('conduit') || text.includes('southwire') || text.includes('prime wire') || text.includes('woods wire')) {
    return {
      dept: 'electrical',
      class: 'wire, cable & conduit',
      fine: 'electrical wire & cable',
      classpath: 'electrical > wire, cable & conduit > electrical wire & cable',
    };
  }

  if (text.includes('receptacle') || text.includes('dimmer') || text.includes('wall plate') || text.includes('leviton') || text.includes('cooper wiring') || text.includes('pass & seymour')) {
    return {
      dept: 'electrical',
      class: 'wiring devices',
      fine: 'switches & receptacles',
      classpath: 'electrical > wiring devices > switches & receptacles',
    };
  }

  // 4. LIGHTING
  if (text.includes('lighting') || text.includes('lamp') || text.includes('floodlight') || text.includes('bulb') || text.includes('kichler') || text.includes('lithonia') || text.includes('feit electric') || text.includes('satco') || text.includes('keystone')) {
    return {
      dept: 'lighting',
      class: 'fixtures & lamps',
      fine: 'led lighting & fixtures',
      classpath: 'lighting > fixtures & lamps > led lighting & fixtures',
    };
  }

  // 5. HARDWARE & FASTENERS
  if (text.includes('hex bolt') || text.includes('socket screw') || text.includes('cap screw') || text.includes('machine screw') || text.includes('anchor bolt') || text.includes('flat washer') || text.includes('lock washer') || text.includes('hex nut') || text.includes('national nail') || text.includes('senco') || text.includes('prebena') || text.includes('fastener')) {
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
  if (text.includes('drill bit') || text.includes('hole saw') || text.includes('saw blade') || text.includes('router bit') || text.includes('sawstop') || text.includes('wera') || text.includes('vessel tools') || text.includes('irwin') || text.includes('kreg') || text.includes('festool') || text.includes('amana tool') || text.includes('whiteside')) {
    return {
      dept: 'tools',
      class: 'power tools & accessories',
      fine: 'blades, bits & cutting tools',
      classpath: 'tools > power tools & accessories > blades, bits & cutting tools',
    };
  }

  // 7. SAFETY & SECURITY
  if (text.includes('eyewear') || text.includes('safety glasses') || text.includes('smoke alarm') || text.includes('smoke detector') || text.includes('firewatch') || text.includes('first alert') || text.includes('radians')) {
    return {
      dept: 'safety & security',
      class: 'personal protective equipment',
      fine: 'safety glasses & alarms',
      classpath: 'safety & security > personal protective equipment > safety glasses & alarms',
    };
  }

  // 8. BUILDING MATERIALS
  if (text.includes('lumber') || text.includes('wood') || text.includes('gypsum') || text.includes('window') || text.includes('skylight') || text.includes('boise cascade') || text.includes('certainteed') || text.includes('provia') || text.includes('velux') || text.includes('united window')) {
    return {
      dept: 'building materials',
      class: 'lumber, doors & windows',
      fine: 'building supplies & lumber',
      classpath: 'building materials > lumber, doors & windows > building supplies & lumber',
    };
  }

  // 9. PLUMBING & FLUID POWER
  if (text.includes('ball valve') || text.includes('gate valve') || text.includes('check valve') || text.includes('solenoid valve') || text.includes('pipe fitting') || text.includes('faucet')) {
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
    }
  }

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

  return {
    dept: 'industrial supplies',
    class: 'general industrial',
    fine: 'components',
    classpath: 'industrial supplies > general industrial > components',
  };
}
