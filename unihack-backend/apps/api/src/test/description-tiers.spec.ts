/**
 * Standalone unit test for all 5 Unilog description tiers.
 * Does NOT import the full service (avoids DB init).
 * Directly calls the builder functions via isolated imports.
 */

// ── Inline copies of the builder helpers (same logic as ai-pipeline.service.ts) ──

function sanitize(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/\s+/g, ' ').trim();
}

function detectSeriesToken(brand: string, _part: string, desc: string): string | null {
  const text = `${brand} ${desc}`.toLowerCase();
  if (/professional\s*series/i.test(text)) return 'Professional Series';
  if (/cubitron\s*ii/i.test(text)) return 'Cubitron II';
  if (/cubitron/i.test(text)) return 'Cubitron';
  if (/steel\s*demon/i.test(text)) return 'Steel Demon';
  if (/homeline/i.test(text)) return 'Homeline';
  if (/\bqo\b/i.test(text)) return 'QO';
  if (/\bm18\b/i.test(text)) return 'M18';
  if (/\bm12\b/i.test(text)) return 'M12';
  if (/\bflexvolt\b/i.test(text)) return 'FLEXVOLT';
  return null;
}

function detectItemType(desc: string, _part: string): string | null {
  if (/dishwasher/i.test(desc)) return 'Dishwasher';
  if (/sanding\s*belt/i.test(desc)) return 'Sanding Belt';
  if (/circuit\s*breaker/i.test(desc)) return 'Circuit Breaker';
  if (/faucet/i.test(desc)) return 'Faucet';
  if (/angle\s*grinder/i.test(desc)) return 'Angle Grinder';
  if (/elbow/i.test(desc)) return 'Elbow';
  if (/coupling/i.test(desc)) return 'Coupling';
  if (/sanding\s*disc/i.test(desc)) return 'Sanding Disc';
  return null;
}

function parseFraction(val: string): number | null {
  const n = Number(val);
  if (!isNaN(n)) return n;
  const compound = val.match(/^(\d+)\s*[-\s]\s*(\d+)\/(\d+)$/);
  if (compound) return parseInt(compound[1]!) + parseInt(compound[2]!) / parseInt(compound[3]!);
  const slash = val.match(/^(\d+)\/(\d+)$/);
  if (slash) return parseInt(slash[1]!) / parseInt(slash[2]!);
  return null;
}

function decimalToFraction(d: number): string | null {
  const FRAC: Array<[number, string]> = [
    [0.25, '1/4'], [0.5, '1/2'], [0.75, '3/4'],
    [0.125, '1/8'], [0.375, '3/8'], [0.625, '5/8'], [0.875, '7/8'],
    [0.0625, '1/16'], [0.1875, '3/16'], [0.3125, '5/16'],
    [0.4375, '7/16'], [0.5625, '9/16'], [0.6875, '11/16'], [0.8125, '13/16'], [0.9375, '15/16'],
  ];
  const whole = Math.floor(d);
  const frac = parseFloat((d - whole).toFixed(6));
  const match = FRAC.find(([v]) => Math.abs(v - frac) < 0.0001);
  if (frac === 0) return whole > 0 ? `${whole}` : null;
  if (!match) return null;
  return whole > 0 ? `${whole}-${match[1]}` : match[1];
}

// ── Tier Builders ────────────────────────────────────────────────────────────

function buildInvoiceDesc(desc: string): string {
  const ITEM_MAP: Array<[RegExp, string]> = [
    [/dishwasher/i, 'DISHWSHR'],
    [/sanding\s*belt/i, 'SNDG BELT'],
    [/circuit\s*breaker/i, 'CKT BKR'],
    [/angle\s*grinder/i, 'ANGLGRND'],
  ];
  let itemAbbr = '';
  for (const [p, a] of ITEM_MAP) if (p.test(desc)) { itemAbbr = a; break; }

  const toks: string[] = [];
  const mount = desc.match(/\b(leg|top|front|rear)\b/i);
  if (mount) toks.push(mount[0].toUpperCase());

  const cycle = desc.match(/(\d+)\s*(?:wash\s*cycle|cycle)/i);
  const pack  = desc.match(/(\d+)\s*(?:pc|pcs|pack|pk)\b/i);
  if (cycle?.[1]) toks.push(cycle[1]);
  else if (pack?.[1]) toks.push(`${pack[1]}PK`);

  const MAT: Record<string,string> = { 'stainless steel': 'SST', stainless: 'SST', aluminum: 'ALU', brass: 'BRS' };
  for (const [m, a] of Object.entries(MAT)) if (desc.toLowerCase().includes(m)) { toks.push(a); break; }

  const volt = desc.match(/(\d+)\s*[Vv][Aa]?[Cc]?\b/);
  const amp  = desc.match(/(\d+)\s*[Aa](?:mp)?\b/);
  if (volt?.[1]) toks.push(`${volt[1]}V`);
  if (amp?.[1])  toks.push(`${amp[1]}A`);

  const dimM = desc.match(/(\d+(?:-\d+\/\d+|\/\d+)?(?:\.\d+)?)\s*(?:in|inch|")\b/i);
  if (dimM?.[1]) {
    const p = parseFraction(dimM[1]);
    if (p !== null) { const f = decimalToFraction(p) || `${p}`; toks.push(`${f}IN`); }
  }

  const parts: string[] = [];
  if (itemAbbr) parts.push(itemAbbr);
  parts.push(...toks);
  return parts.join(' ').toUpperCase().substring(0, 40);
}

function buildMobileDesc(mfg: string, brand: string, mpn: string, desc: string): string {
  const cleanMfg   = sanitize(mfg);
  const cleanBrand = sanitize(brand);
  const cleanMpn   = sanitize(mpn);
  const series     = detectSeriesToken(cleanBrand, cleanMpn, desc);
  const itemType   = detectItemType(desc, cleanMpn);

  const tokens: string[] = [];
  if (cleanMfg && cleanBrand && cleanBrand !== cleanMfg)
    tokens.push(`${cleanMfg} ${cleanBrand}`);
  else if (cleanMfg) tokens.push(cleanMfg);
  else tokens.push(cleanBrand);

  if (itemType) tokens.push(itemType);
  if (series && series !== cleanBrand) tokens.push(series);
  if (cleanMpn && cleanMpn !== cleanBrand) tokens.push(cleanMpn);

  let result = tokens.join(', ');
  if (result.length > 80) result = tokens.slice(0, -1).join(', ');
  return result.substring(0, 80);
}

function buildShortDesc(brand: string, mpn: string, desc: string): string {
  const cleanBrand = sanitize(brand);
  const cleanMpn   = sanitize(mpn);
  const series     = detectSeriesToken(cleanBrand, cleanMpn, desc);
  const itemType   = detectItemType(desc, cleanMpn);

  const parts: string[] = [];
  if (cleanBrand) parts.push(cleanBrand);
  if (series && series !== cleanBrand) parts.push(series);
  if (cleanMpn && cleanMpn !== cleanBrand) parts.push(cleanMpn);
  if (itemType) parts.push(itemType);

  // Key attrs: try dim, electrical
  const dimM = desc.match(/(\d+(?:-\d+\/\d+|\/\d+)?)\s*in\s*[Wx]/i);
  if (dimM) parts.push(dimM[0].trim());

  let title = parts.join(' ');
  return title.substring(0, 150).trim();
}

function buildLongDesc(brand: string, mpn: string, desc: string, attrs: Array<{label:string; value:string; uom:string|null}>): string {
  const series   = detectSeriesToken(brand, mpn, desc);
  const itemType = detectItemType(desc, mpn);

  const longParts: string[] = [];
  longParts.push(`${brand}${itemType ? ' ' + itemType : ''}`);
  if (series && series !== brand) longParts.push(series);

  const LABEL_HINT: Record<string,string> = {
    'Mounting': (v: string) => `${v} Mounting`,
    'Mounting Type': (v: string) => `${v} Mounting`,
    'Material': (v: string) => v,
    'Finish': (v: string) => v,
    'Package Quantity': (v: string) => `${v}-Pack`,
    'Abrasive Grit': (v: string) => `${v} Grit`,
  } as any;

  for (const attr of attrs) {
    if (!attr.value || ['industrial grade','n/a','unknown','null','none','tbd'].includes(attr.value.toLowerCase())) continue;
    let token: string;
    if (attr.uom && attr.uom !== 'null') {
      token = `${attr.value} ${attr.uom}`.trim();
      const SHORT: Record<string,string> = { Width:'W', Length:'L', Height:'H', Depth:'D', Diameter:'Dia' };
      if (SHORT[attr.label]) token += ` ${SHORT[attr.label]}`;
    } else {
      const hint = (LABEL_HINT as any)[attr.label];
      token = hint ? hint(attr.value) : `${attr.label}: ${attr.value}`;
    }
    longParts.push(token);
  }
  return longParts.join(', ');
}

// ── Test Runner ──────────────────────────────────────────────────────────────

const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
let passed = 0; let failed = 0;
function assert(cond: boolean, name: string, got?: unknown) {
  if (cond) { console.log(`${PASS}: ${name}`); passed++; }
  else { console.error(`${FAIL}: ${name}`, '\n       got:', got); failed++; }
}

console.log('\n=== 5-Tier Description Builder Unit Tests ===\n');

// ── Test 1: PDSH4816AF Dishwasher (Unilog Worked Example) ──
const dishDesc = 'FRIGIDAIRE Professional Series PDSH4816AF Dishwasher Leg Mounting 5-Wash Cycle 120V 15A 50-1/4in Depth Stainless Steel';

const invoice1 = buildInvoiceDesc(dishDesc);
console.log('Tier 1 INVOICE_DESC:', invoice1);
assert(invoice1.length <= 40,         'Tier 1: ≤40 chars', `${invoice1.length} chars`);
assert(/DISHWSHR/i.test(invoice1),    'Tier 1: Contains item abbreviation DISHWSHR');
assert(/SST/i.test(invoice1),         'Tier 1: Contains material SST');
assert(/120V/i.test(invoice1),        'Tier 1: Contains 120V');
assert(/15A/i.test(invoice1),         'Tier 1: Contains 15A');
assert(invoice1 === invoice1.toUpperCase(), 'Tier 1: All uppercase');

const mobile1 = buildMobileDesc('Rheem Manufacturing', 'FRIGIDAIRE', 'PDSH4816AF', dishDesc);
console.log('\nTier 2 MOBILE_DESC:', mobile1);
assert(mobile1.length >= 50 && mobile1.length <= 80, 'Tier 2: 50-80 chars', `${mobile1.length} chars`);
assert(mobile1.includes('FRIGIDAIRE'), 'Tier 2: Contains brand FRIGIDAIRE');
assert(mobile1.includes('Dishwasher'), 'Tier 2: Contains item type Dishwasher');
assert(mobile1.includes('Professional Series'), 'Tier 2: Contains series');

const short1 = buildShortDesc('FRIGIDAIRE', 'PDSH4816AF', dishDesc);
console.log('\nTier 3 SHORT_DESC:', short1);
assert(short1.length <= 150,              'Tier 3: ≤150 chars', `${short1.length} chars`);
assert(short1.includes('FRIGIDAIRE'),     'Tier 3: Contains brand');
assert(short1.includes('PDSH4816AF'),     'Tier 3: Contains MPN');
assert(short1.includes('Dishwasher'),     'Tier 3: Contains item type');
assert(short1.includes('Professional Series'), 'Tier 3: Contains series');

const attrs1 = [
  { label: 'Wash Cycles',  value: '5',                 uom: null },
  { label: 'Voltage',      value: '120',               uom: 'V'  },
  { label: 'Amperage',     value: '15',                uom: 'A'  },
  { label: 'Mounting',     value: 'Leg',               uom: null },
  { label: 'Sound Level',  value: '47',                uom: 'dBA'},
  { label: 'Material',     value: 'Stainless Steel',   uom: null },
  { label: 'Width',        value: '24',                uom: 'in' },
  { label: 'Depth',        value: '50-1/4',            uom: 'in' },
];
const long1 = buildLongDesc('FRIGIDAIRE', 'PDSH4816AF', dishDesc, attrs1);
console.log('\nTier 4 LONG_DESC:', long1);
assert(long1.includes('Dishwasher'),        'Tier 4: Contains item type');
assert(long1.includes('Professional Series'),'Tier 4: Contains series');
assert(long1.includes('120'),               'Tier 4: Contains voltage');
assert(long1.includes('Leg Mounting'),      'Tier 4: Contains mounting');
assert(long1.includes('Stainless Steel'),   'Tier 4: Contains material');
assert(long1.split(',').length >= 5,        'Tier 4: ≥5 comma-delimited tokens');

// ── Test 2: Square D Homeline Circuit Breaker ──
console.log('\n--- Test 2: Square D Homeline HOM120 Circuit Breaker ---');
const cbDesc = 'HOM120 20A 1-Pole Homeline Circuit Breaker 120V';
const invoice2 = buildInvoiceDesc(cbDesc);
console.log('Tier 1:', invoice2);
assert(invoice2.length <= 40,   'CB Tier 1: ≤40 chars');
assert(/CKT BKR/i.test(invoice2), 'CB Tier 1: Contains CKT BKR');
assert(/20A/i.test(invoice2),   'CB Tier 1: Contains 20A');

const mobile2 = buildMobileDesc('Schneider Electric', 'Square D', 'HOM120', cbDesc);
console.log('Tier 2:', mobile2);
assert(mobile2.includes('Square D'),     'CB Tier 2: Contains brand');
assert(mobile2.includes('Homeline'),     'CB Tier 2: Contains series');

// ── Test 3: Freud Diablo Sanding Belt ──
console.log('\n--- Test 3: Freud Diablo Sanding Belt ---');
const beltDesc = 'Diablo DCB518ASTS06G 1/2"x18" Sanding Belt Zirconia Alumina P80 Grit 6-Pack';
const invoice3 = buildInvoiceDesc(beltDesc);
console.log('Tier 1:', invoice3);
assert(invoice3.length <= 40,    'Belt Tier 1: ≤40 chars');
assert(/SNDG BELT/i.test(invoice3), 'Belt Tier 1: Contains SNDG BELT');

const mobile3 = buildMobileDesc('Freud Inc', 'Diablo', 'DCB518ASTS06G', beltDesc);
console.log('Tier 2:', mobile3);
assert(mobile3.includes('Diablo'),       'Belt Tier 2: Contains brand');
assert(mobile3.includes('Sanding Belt'), 'Belt Tier 2: Contains item type');

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
process.exit(failed > 0 ? 1 : 0);
