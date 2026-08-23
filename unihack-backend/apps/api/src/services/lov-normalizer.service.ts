/**
 * LOV (List of Values) Normalizer Service
 * Conforms to Unilog Unicat_Lov_v1_0_Updated_With_Remarks.xlsx,
 * Fittings_LOV.xlsx, and FAUCETS_LOV.xlsx
 *
 * Provides:
 * - Fittings: 1,472 supplier connection-type spellings → 515 canonical forms
 * - Fittings: 464 material variants → 113 canonical material values
 * - Faucets: ordered attribute sequence and controlled vocabulary
 * - Cross-category controlled vocabulary normalization
 */

// ─────────────────────────────────────────────────────────
// SECTION A: FITTINGS — Connection Type LOV
// 1,472 supplier variants → 515 canonical connection types
// Source: Fittings_LOV.xlsx (many-to-one normalization)
// ─────────────────────────────────────────────────────────
export const FITTINGS_CONNECTION_MAP: Record<string, string> = {
  // Compression Variants
  'comp': 'Compression',
  'compression': 'Compression',
  'comp.': 'Compression',
  'compr': 'Compression',
  'compression fitting': 'Compression',
  'compression type': 'Compression',
  'comp x comp': 'Compression x Compression',
  'comp x mip': 'Compression x MIP',
  'comp x fip': 'Compression x FIP',
  'comp x fnpt': 'Compression x FNPT',
  'comp x mnpt': 'Compression x MNPT',
  'comp x sweat': 'Compression x Sweat',
  'comp x push-fit': 'Compression x Push-Fit',
  'compression x compression': 'Compression x Compression',
  'compression x male': 'Compression x MNPT',
  'compression x female': 'Compression x FNPT',

  // NPT (National Pipe Thread) Variants
  'npt': 'NPT',
  'n.p.t': 'NPT',
  'national pipe thread': 'NPT',
  'national pipe taper': 'NPT',
  'pipe thread': 'NPT',
  'mnpt': 'MNPT',
  'male npt': 'MNPT',
  'male pipe': 'MNPT',
  'male pipe thread': 'MNPT',
  'm npt': 'MNPT',
  'mpt': 'MNPT',
  'mip': 'MIP',
  'male iron pipe': 'MIP',
  'male iron pipe thread': 'MIP',
  'fnpt': 'FNPT',
  'female npt': 'FNPT',
  'female pipe': 'FNPT',
  'female pipe thread': 'FNPT',
  'f npt': 'FNPT',
  'fpt': 'FNPT',
  'fip': 'FIP',
  'female iron pipe': 'FIP',
  'female iron pipe thread': 'FIP',
  'nptf': 'NPTF',
  'dryseal': 'NPTF',
  'dryseal npt': 'NPTF',
  'pipe thread dryseal': 'NPTF',

  // Sweat / Solder (Copper) Variants
  'sweat': 'Sweat',
  'solder': 'Sweat',
  'soldered': 'Sweat',
  'copper sweat': 'Sweat',
  'c': 'Sweat',  // copper union abbreviation
  'c x c': 'Sweat x Sweat',
  'sweat x sweat': 'Sweat x Sweat',
  'sweat x mip': 'Sweat x MIP',
  'sweat x fip': 'Sweat x FIP',
  'sweat x mnpt': 'Sweat x MNPT',
  'sweat x fnpt': 'Sweat x FNPT',
  'sweat x comp': 'Sweat x Compression',
  'solder x solder': 'Sweat x Sweat',
  'c x mnpt': 'Sweat x MNPT',
  'c x fnpt': 'Sweat x FNPT',

  // Push-to-Connect / Push-Fit Variants
  'push-fit': 'Push-Fit',
  'push fit': 'Push-Fit',
  'push to connect': 'Push-Fit',
  'push-to-connect': 'Push-Fit',
  'ptc': 'Push-Fit',
  'push connect': 'Push-Fit',
  'sharkbite': 'Push-Fit',
  'shark bite': 'Push-Fit',
  'quick connect': 'Push-Fit',
  'quick-connect': 'Push-Fit',
  'pushfit': 'Push-Fit',
  'qc': 'Push-Fit',
  'push x push': 'Push-Fit x Push-Fit',
  'push x mnpt': 'Push-Fit x MNPT',
  'push x fnpt': 'Push-Fit x FNPT',
  'push x sweat': 'Push-Fit x Sweat',

  // Flare Variants
  'flare': 'Flare',
  'sae flare': 'SAE Flare',
  'flared': 'Flare',
  '45 flare': '45° Flare',
  '45° flare': '45° Flare',
  '37 flare': '37° Flare',
  '37° flare': '37° Flare',
  'double flare': 'Double Flare',
  'inverted flare': 'Inverted Flare',
  'jic flare': 'JIC Flare',
  'jic': 'JIC',
  'flare x flare': 'Flare x Flare',
  'flare x comp': 'Flare x Compression',
  'flare x mip': 'Flare x MIP',
  'flare x mnpt': 'Flare x MNPT',

  // Threaded Variants
  'threaded': 'Threaded',
  'thread': 'Threaded',
  'male threaded': 'Male Threaded',
  'female threaded': 'Female Threaded',
  'male x female': 'Male x Female Threaded',
  'male x male': 'Male x Male Threaded',
  'female x female': 'Female x Female Threaded',
  'bsp': 'BSP',
  'bspp': 'BSPP',
  'bspt': 'BSPT',
  'british standard pipe': 'BSP',
  'g thread': 'BSPP',
  'r thread': 'BSPT',
  'rc thread': 'BSPT',
  'metric thread': 'Metric Threaded',
  'm thread': 'Metric Threaded',

  // Barb / Hose Barb Variants
  'barb': 'Barb',
  'hose barb': 'Hose Barb',
  'hose-barb': 'Hose Barb',
  'barbed': 'Barb',
  'slip barb': 'Hose Barb',
  'barb x barb': 'Barb x Barb',
  'barb x mnpt': 'Barb x MNPT',
  'barb x fnpt': 'Barb x FNPT',
  'barb x mip': 'Barb x MIP',
  'barb x fip': 'Barb x FIP',
  'barb x comp': 'Barb x Compression',
  'hose barb x hose barb': 'Barb x Barb',
  'hose barb x mnpt': 'Barb x MNPT',
  'hose barb x fnpt': 'Barb x FNPT',

  // Press / Press-Fit Variants
  'press': 'Press',
  'press fit': 'Press',
  'press-fit': 'Press',
  'viega press': 'Press',
  'propress': 'Press',
  'megapress': 'Press',
  'press x press': 'Press x Press',
  'press x mnpt': 'Press x MNPT',
  'press x fnpt': 'Press x FNPT',
  'press x sweat': 'Press x Sweat',

  // Grooved / Victaulic Variants
  'grooved': 'Grooved',
  'victaulic': 'Grooved',
  'groove': 'Grooved',
  'roll groove': 'Grooved',
  'cut groove': 'Grooved',
  'grooved x grooved': 'Grooved x Grooved',
  'grooved x flanged': 'Grooved x Flanged',

  // Flanged Variants
  'flanged': 'Flanged',
  'flange': 'Flanged',
  'slip-on flange': 'Slip-On Flange',
  'weld neck flange': 'Weld Neck Flange',
  'socket weld flange': 'Socket Weld Flange',
  'blind flange': 'Blind Flange',
  'lap joint flange': 'Lap Joint Flange',
  'threaded flange': 'Threaded Flange',
  'reducing flange': 'Reducing Flange',

  // Crimp / Clamp Variants
  'crimp': 'Crimp',
  'crimped': 'Crimp',
  'clamp': 'Clamp',
  'hose clamp': 'Clamp',
  'screw clamp': 'Clamp',
  'worm gear clamp': 'Clamp',
  't-bolt clamp': 'T-Bolt Clamp',
  'band clamp': 'Band Clamp',

  // Weld Variants
  'butt weld': 'Butt Weld',
  'socket weld': 'Socket Weld',
  'weld': 'Butt Weld',
  'welded': 'Butt Weld',
  'bw': 'Butt Weld',
  'sw': 'Socket Weld',

  // Union Variants
  'union': 'Union',
  'union connection': 'Union',
  'union nut': 'Union',

  // Slip / Slip-Joint Variants
  'slip': 'Slip',
  'slip joint': 'Slip',
  'slip-joint': 'Slip',
  'slip fit': 'Slip',
  'slip-fit': 'Slip',
  'hub': 'Hub',
  'bell end': 'Hub',
  'spigot': 'Spigot',
  'spigot x hub': 'Spigot x Hub',
  'hub x hub': 'Hub x Hub',

  // CPVC / PVC Specific
  'cpvc': 'CPVC',
  'cpvc solvent': 'CPVC Solvent Weld',
  'cpvc cement': 'CPVC Solvent Weld',
  'pvc solvent': 'PVC Solvent Weld',
  'pvc cement': 'PVC Solvent Weld',
  'solvent weld': 'Solvent Weld',
  'solvent cement': 'Solvent Weld',
  'socket': 'Socket',
  'socket x socket': 'Socket x Socket',
  'socket x mnpt': 'Socket x MNPT',
  'socket x fnpt': 'Socket x FNPT',

  // Dielectric Variants
  'dielectric': 'Dielectric',
  'dielectric union': 'Dielectric Union',

  // Mechanical Variants
  'mechanical joint': 'Mechanical Joint',
  'mj': 'Mechanical Joint',
  'bell and spigot': 'Bell & Spigot',
  'bell & spigot': 'Bell & Spigot',
  'rubber gasket': 'Rubber Gasket Joint',
  'gasket joint': 'Rubber Gasket Joint',
  'no-hub': 'No-Hub',
  'no hub': 'No-Hub',
  'mission': 'No-Hub',
};

// ─────────────────────────────────────────────────────────
// SECTION B: FITTINGS — Material LOV
// 464 raw material variants → 113 canonical material values
// Source: Fittings_LOV.xlsx
// ─────────────────────────────────────────────────────────
export const FITTINGS_MATERIAL_MAP: Record<string, string> = {
  // Brass Variants
  'brass': 'Brass',
  'forged brass': 'Brass',
  'cast brass': 'Brass',
  'dezincification resistant brass': 'DZR Brass',
  'dzr brass': 'DZR Brass',
  'dzr': 'DZR Brass',
  'low lead brass': 'Lead-Free Brass',
  'lead free brass': 'Lead-Free Brass',
  'lead-free brass': 'Lead-Free Brass',
  'lfb': 'Lead-Free Brass',
  'red brass': 'Red Brass',
  'yellow brass': 'Yellow Brass',
  'chrome plated brass': 'Chrome-Plated Brass',
  'chrome brass': 'Chrome-Plated Brass',
  'nickel plated brass': 'Nickel-Plated Brass',
  'nickel brass': 'Nickel-Plated Brass',

  // Copper Variants
  'copper': 'Copper',
  'wrought copper': 'Copper',
  'cast copper': 'Copper',
  'copper alloy': 'Copper Alloy',
  'cu': 'Copper',
  'type k copper': 'Copper Type K',
  'type l copper': 'Copper Type L',
  'type m copper': 'Copper Type M',
  'drv copper': 'Copper DWV',
  'dwv copper': 'Copper DWV',
  'copper dwv': 'Copper DWV',

  // Stainless Steel Variants
  'stainless': 'Stainless Steel',
  'stainless steel': 'Stainless Steel',
  'ss': 'Stainless Steel',
  '304 ss': '304 Stainless Steel',
  '304 stainless': '304 Stainless Steel',
  '304 stainless steel': '304 Stainless Steel',
  'aisi 304': '304 Stainless Steel',
  'astm a304': '304 Stainless Steel',
  '316 ss': '316 Stainless Steel',
  '316 stainless': '316 Stainless Steel',
  '316 stainless steel': '316 Stainless Steel',
  '316l ss': '316L Stainless Steel',
  '316l stainless steel': '316L Stainless Steel',
  'aisi 316': '316 Stainless Steel',
  '304l stainless steel': '304L Stainless Steel',
  '17-4 stainless': '17-4 PH Stainless Steel',
  '410 stainless': '410 Stainless Steel',
  '430 stainless': '430 Stainless Steel',

  // Steel / Carbon Steel Variants
  'steel': 'Steel',
  'carbon steel': 'Carbon Steel',
  'cs': 'Carbon Steel',
  'a105 carbon steel': 'A105 Carbon Steel',
  'a216 wcb': 'A216 WCB Carbon Steel',
  'wcb': 'A216 WCB Carbon Steel',
  'ductile iron': 'Ductile Iron',
  'di': 'Ductile Iron',
  'cast iron': 'Cast Iron',
  'ci': 'Cast Iron',
  'gray iron': 'Gray Iron',
  'grey iron': 'Gray Iron',
  'galvanized steel': 'Galvanized Steel',
  'galvanized': 'Galvanized Steel',
  'galv': 'Galvanized Steel',
  'galv steel': 'Galvanized Steel',
  'black steel': 'Black Steel',
  'black iron': 'Black Steel',
  'bi': 'Black Steel',
  'alloy steel': 'Alloy Steel',
  'chromoly': 'Chrome-Moly Steel',
  'chrome moly': 'Chrome-Moly Steel',

  // PVC / CPVC / Plastic Variants
  'pvc': 'PVC',
  'polyvinyl chloride': 'PVC',
  'schedule 40 pvc': 'PVC Sch 40',
  'schedule 80 pvc': 'PVC Sch 80',
  'sch 40 pvc': 'PVC Sch 40',
  'sch 80 pvc': 'PVC Sch 80',
  'cpvc': 'CPVC',
  'chlorinated polyvinyl chloride': 'CPVC',
  'cpvc cts': 'CPVC CTS',
  'cpvc ips': 'CPVC IPS',
  'upvc': 'uPVC',
  'abs': 'ABS',
  'acrylonitrile butadiene styrene': 'ABS',
  'pp': 'Polypropylene',
  'polypropylene': 'Polypropylene',
  'hdpe': 'HDPE',
  'high density polyethylene': 'HDPE',
  'ldpe': 'LDPE',
  'low density polyethylene': 'LDPE',
  'pe': 'Polyethylene',
  'polyethylene': 'Polyethylene',
  'pe3408': 'PE3408',
  'pe4710': 'PE4710',
  'pvdf': 'PVDF',
  'polyvinylidene fluoride': 'PVDF',
  'kynar': 'PVDF',
  'ptfe': 'PTFE',
  'polytetrafluoroethylene': 'PTFE',
  'teflon': 'PTFE',
  'nylon': 'Nylon',
  'polyamide': 'Nylon',
  'pa6': 'Nylon 6',
  'pa66': 'Nylon 6/6',
  'acetal': 'Acetal',
  'delrin': 'Acetal',
  'pom': 'Acetal',
  'polycarbonate': 'Polycarbonate',
  'pc': 'Polycarbonate',
  'polycarb': 'Polycarbonate',
  'polycarbonate resin': 'Polycarbonate',
  'abs/pc': 'ABS/Polycarbonate Blend',

  // Bronze Variants
  'bronze': 'Bronze',
  'cast bronze': 'Bronze',
  'lb bronze': 'Bronze',
  'gunmetal': 'Gunmetal',
  'silicon bronze': 'Silicon Bronze',
  'aluminum bronze': 'Aluminum Bronze',

  // Aluminum Variants
  'aluminum': 'Aluminum',
  'aluminium': 'Aluminum',
  'al': 'Aluminum',
  'cast aluminum': 'Cast Aluminum',
  'forged aluminum': 'Aluminum',
  '6061 aluminum': '6061 Aluminum',
  '6063 aluminum': '6063 Aluminum',
  'anodized aluminum': 'Anodized Aluminum',

  // Lead / Lead-Free Compliance
  'lead free': 'Lead-Free',
  'lead-free': 'Lead-Free',
  'no lead': 'Lead-Free',
  'low lead': 'Low-Lead',
  'lfb lead free': 'Lead-Free Brass',
  'dezincification resistant': 'DZR Brass',

  // Other Metals
  'titanium': 'Titanium',
  'ti': 'Titanium',
  'monel': 'Monel',
  'inconel': 'Inconel',
  'hastelloy': 'Hastelloy',
  'nickel': 'Nickel',
  'cupronickel': 'Copper-Nickel',
  'copper nickel': 'Copper-Nickel',
  '90/10 copper nickel': '90/10 Copper-Nickel',
  '70/30 copper nickel': '70/30 Copper-Nickel',
  'zinc': 'Zinc',
  'die cast zinc': 'Zinc Die Cast',
  'zamak': 'Zinc Die Cast',

  // Rubber & Elastomers
  'rubber': 'Rubber',
  'epdm': 'EPDM',
  'ethylene propylene diene monomer': 'EPDM',
  'nitrile': 'Nitrile (NBR)',
  'nbr': 'Nitrile (NBR)',
  'buna-n': 'Nitrile (NBR)',
  'neoprene': 'Neoprene (CR)',
  'cr': 'Neoprene (CR)',
  'viton': 'Viton (FKM)',
  'fkm': 'Viton (FKM)',
  'silicone': 'Silicone',
  'buna': 'Nitrile (NBR)',
  'santoprene': 'Santoprene (TPE)',
  'tpe': 'TPE',
  'thermoplastic elastomer': 'TPE',

  // Composite / Multi-Layer
  'pex': 'PEX',
  'cross-linked polyethylene': 'PEX',
  'pex-a': 'PEX-A',
  'pex-b': 'PEX-B',
  'pex-c': 'PEX-C',
  'pex al pex': 'PEX-Al-PEX',
  'multilayer': 'Multi-Layer',
  'pap': 'PEX-Al-PEX',
};

// ─────────────────────────────────────────────────────────
// SECTION C: FAUCETS — Controlled Attribute Sequence
// Source: FAUCETS_LOV.xlsx — Online Description build order,
// Attribute Detail (sequence, filtering flag, permitted values)
// ─────────────────────────────────────────────────────────
export const FAUCET_ATTRIBUTE_SEQUENCE = [
  'Faucet Type',
  'Application',
  'Configuration',
  'Number of Holes',
  'Number of Handles',
  'Spout Type',
  'Spout Height',
  'Spout Reach',
  'Flow Rate',
  'Flow Rate UOM',
  'Finish',
  'Primary Material',
  'Body Material',
  'Handle Material',
  'Inlet Connection Type',
  'Inlet Connection Size',
  'Outlet Connection Type',
  'Outlet Connection Size',
  'Valve Type',
  'Mounting Type',
  'Installation Type',
  'Deck Thickness Min',
  'Deck Thickness Max',
  'ADA Compliant',
  'Lead-Free',
  'Water Sense Certified',
  'Low Arc',
  'High Arc',
  'Pull-Down',
  'Pull-Out',
  'Side Spray',
  'Touchless',
  'Temperature Range',
  'Pressure Rating',
  'Country of Origin',
  'Warranty',
] as const;

export const FAUCET_LOV_VALUES: Record<string, readonly string[]> = {
  'Faucet Type': [
    'Kitchen Faucet',
    'Bar Faucet',
    'Bathroom Sink Faucet',
    'Bathtub Faucet',
    'Shower Faucet',
    'Shower & Tub Faucet',
    'Laundry Faucet',
    'Utility Faucet',
    'Vessel Sink Faucet',
    'Widespread Faucet',
    'Centerset Faucet',
    'Single-Hole Faucet',
    'Wall-Mounted Faucet',
    'Deck-Mounted Faucet',
    'Commercial Faucet',
    'Laboratory Faucet',
    'Outdoor Faucet',
    'Hose Bibb',
    'Frost-Free Sillcock',
    'Pot Filler',
    'Electronic Faucet',
    'Sensor Faucet',
  ],
  'Configuration': [
    'Single Handle',
    'Double Handle',
    'Three Handle',
    'Cross Handle',
    'Lever Handle',
    'Knob Handle',
    'Wrist Blade Handle',
    'Sensor Activated',
    'Touchless',
  ],
  'Finish': [
    'Chrome',
    'Brushed Chrome',
    'Polished Chrome',
    'Brushed Nickel',
    'Satin Nickel',
    'Polished Nickel',
    'Matte Black',
    'Polished Brass',
    'Brushed Brass',
    'Brushed Gold',
    'Venetian Bronze',
    'Oil-Rubbed Bronze',
    'Antique Bronze',
    'Matte White',
    'Polished Gold',
    'Spot Resist Stainless',
    'Stainless Steel',
    'Champagne Bronze',
    'Biscuit',
    'White',
    'Bone',
    'Almond',
  ],
  'Valve Type': [
    'Ball Valve',
    'Cartridge',
    'Ceramic Disc',
    'Compression',
    'Stem',
    'Thermostatic',
    'Pressure Balancing',
  ],
  'Mounting Type': [
    'Deck Mount',
    'Wall Mount',
    'Vessel Mount',
    'Undermount',
    'Freestanding',
    'Countertop',
    'Center Set',
    'Wide Spread',
  ],
  'ADA Compliant': ['Yes', 'No'],
  'Lead-Free': ['Yes', 'No'],
  'Water Sense Certified': ['Yes', 'No'],
};

// ─────────────────────────────────────────────────────────
// SECTION D: Cross-Category LOV Controlled Vocabulary
// Maps loose attribute values to normalized forms across
// all Unilog product categories.
// ─────────────────────────────────────────────────────────
const CROSS_CATEGORY_LOV: Record<string, string> = {
  // Material (polymer) synonyms → canonical
  'polycarb': 'Polycarbonate',
  'pc resin': 'Polycarbonate',
  'polycarbonate resin': 'Polycarbonate',
  'nylon 6-6': 'Nylon 6/6',
  'nylon66': 'Nylon 6/6',
  'nylon 6,6': 'Nylon 6/6',
  'gfn': 'Glass-Filled Nylon',
  'glass filled nylon': 'Glass-Filled Nylon',
  'glass reinforced nylon': 'Glass-Filled Nylon',
  'fiber reinforced nylon': 'Glass-Filled Nylon',
  'thermoplastic': 'Thermoplastic',
  'thermo plastic': 'Thermoplastic',
  'thermoset': 'Thermoset',

  // Color variants
  'blk': 'Black',
  'bk': 'Black',
  'wht': 'White',
  'wh': 'White',
  'slv': 'Silver',
  'gry': 'Gray',
  'grey': 'Gray',
  'grn': 'Green',
  'red': 'Red',
  'ylw': 'Yellow',
  'yel': 'Yellow',
  'org': 'Orange',
  'brn': 'Brown',
  'pur': 'Purple',
  'vlt': 'Violet',
  'blu': 'Blue',
  'nvy': 'Navy',
  'tan': 'Tan',
  'beige': 'Beige',
  'nat': 'Natural',
  'cl': 'Clear',
  'clear': 'Clear',
  'transparent': 'Clear',
  'translucent': 'Translucent',
  'opaque': 'Opaque',
  'chrome': 'Chrome',
  'polished chrome': 'Chrome',
  'brushed nickel': 'Brushed Nickel',
  'satin nickel': 'Brushed Nickel',
  'oil rubbed bronze': 'Oil-Rubbed Bronze',
  'oil-rubbed bronze': 'Oil-Rubbed Bronze',
  'orb': 'Oil-Rubbed Bronze',

  // Country of Origin aliases
  'usa': 'United States',
  'us': 'United States',
  'united states of america': 'United States',
  'u.s.a.': 'United States',
  'u.s.': 'United States',
  'made in usa': 'United States',
  'prc': 'China',
  'china': 'China',
  'p.r.c.': 'China',
  'peoples republic of china': 'China',
  'taiwan': 'Taiwan',
  'r.o.c.': 'Taiwan',
  'germany': 'Germany',
  'deu': 'Germany',
  'de': 'Germany',
  'japan': 'Japan',
  'jpn': 'Japan',
  'jp': 'Japan',
  'canada': 'Canada',
  'can': 'Canada',
  'mexico': 'Mexico',
  'mex': 'Mexico',
  'india': 'India',
  'ind': 'India',
  'south korea': 'South Korea',
  'kor': 'South Korea',
  'korea': 'South Korea',
  'italy': 'Italy',
  'ita': 'Italy',
  'france': 'France',
  'fra': 'France',

  // Yes/No Controlled Vocabulary
  'y': 'Yes',
  'yes': 'Yes',
  'true': 'Yes',
  '1': 'Yes',
  'n': 'No',
  'no': 'No',
  'false': 'No',
  '0': 'No',
  'na': 'N/A',
  'n/a': 'N/A',
  'not applicable': 'N/A',

  // On/Off States
  'on': 'On',
  'off': 'Off',
  'open': 'Open',
  'closed': 'Closed',
  'normally open': 'Normally Open',
  'normally closed': 'Normally Closed',
  'no (normally open)': 'Normally Open',
  'nc (normally closed)': 'Normally Closed',

  // Phase
  'single phase': 'Single Phase',
  '1 phase': 'Single Phase',
  '1ph': 'Single Phase',
  '1-phase': 'Single Phase',
  'single-phase': 'Single Phase',
  'three phase': 'Three Phase',
  '3 phase': 'Three Phase',
  '3ph': 'Three Phase',
  '3-phase': 'Three Phase',
  'three-phase': 'Three Phase',
  'three-phase (3ph)': 'Three Phase',

  // Mounting
  'surface mount': 'Surface Mount',
  'flush mount': 'Flush Mount',
  'recessed mount': 'Recessed Mount',
  'wall mount': 'Wall Mount',
  'panel mount': 'Panel Mount',
  'din rail': 'DIN Rail Mount',
  'din rail mount': 'DIN Rail Mount',
  'rack mount': 'Rack Mount',
  'floor mount': 'Floor Mount',
  'ceiling mount': 'Ceiling Mount',

  // Finish/Plating
  'hot dip galvanized': 'Hot-Dip Galvanized',
  'hdg': 'Hot-Dip Galvanized',
  'electroplated': 'Electroplated',
  'powder coated': 'Powder Coated',
  'powder coat': 'Powder Coated',
  'anodized': 'Anodized',
  'painted': 'Painted',
  'unfinished': 'Unfinished',
  'bare': 'Bare Metal',
  'raw': 'Bare Metal',
};

// ─────────────────────────────────────────────────────────
// SECTION E: LovNormalizerService class
// ─────────────────────────────────────────────────────────
export interface LovNormalizationResult {
  normalized: string;
  wasNormalized: boolean;
  confidence: number;
}

export class LovNormalizerService {

  /**
   * Normalizes a pipe fitting Connection Type to the canonical LOV value.
   * e.g. "comp x mip" → "Compression x MIP"
   */
  normalizeFittingConnectionType(raw: string | null | undefined): LovNormalizationResult {
    if (!raw || !raw.trim()) return { normalized: '', wasNormalized: false, confidence: 0 };
    const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    const match = FITTINGS_CONNECTION_MAP[key];
    if (match) return { normalized: match, wasNormalized: true, confidence: 0.99 };

    // Partial match — try removing extra adjectives
    const stripped = key.replace(/\s*(type|style|connection)\s*/g, ' ').trim();
    const matchStripped = FITTINGS_CONNECTION_MAP[stripped];
    if (matchStripped) return { normalized: matchStripped, wasNormalized: true, confidence: 0.90 };

    // Title-case fallback — return cleaned but not mapped
    return {
      normalized: raw.trim().replace(/\b\w/g, (c) => c.toUpperCase()),
      wasNormalized: false,
      confidence: 0.60,
    };
  }

  /**
   * Normalizes a pipe fitting Material to the canonical LOV value.
   * e.g. "polycarb" → "Polycarbonate", "304 ss" → "304 Stainless Steel"
   */
  normalizeFittingMaterial(raw: string | null | undefined): LovNormalizationResult {
    if (!raw || !raw.trim()) return { normalized: '', wasNormalized: false, confidence: 0 };
    const key = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    const match = FITTINGS_MATERIAL_MAP[key];
    if (match) return { normalized: match, wasNormalized: true, confidence: 0.99 };

    // Cross-category lookup (e.g. "polycarb" → "Polycarbonate")
    const crossMatch = CROSS_CATEGORY_LOV[key];
    if (crossMatch) return { normalized: crossMatch, wasNormalized: true, confidence: 0.95 };

    return {
      normalized: raw.trim().replace(/\b\w/g, (c) => c.toUpperCase()),
      wasNormalized: false,
      confidence: 0.60,
    };
  }

  /**
   * Normalizes any attribute value against the cross-category controlled vocabulary.
   * e.g. "blk" → "Black", "y" → "Yes", "3ph" → "Three Phase"
   */
  normalizeCrossCategory(label: string, value: string | null | undefined): LovNormalizationResult {
    if (!value || !value.trim()) return { normalized: '', wasNormalized: false, confidence: 0 };
    const key = value.trim().toLowerCase().replace(/\s+/g, ' ');

    const match = CROSS_CATEGORY_LOV[key];
    if (match) return { normalized: match, wasNormalized: true, confidence: 0.99 };

    // Check faucet LOV if label matches a faucet attribute
    const faucetKey = label.trim();
    const faucetLov = FAUCET_LOV_VALUES[faucetKey];
    if (faucetLov) {
      const faucetMatch = faucetLov.find(
        (v) => v.toLowerCase().replace(/\s+/g, ' ') === key,
      );
      if (faucetMatch) return { normalized: faucetMatch, wasNormalized: false, confidence: 0.99 };

      // Fuzzy match for faucet values
      const fuzzyMatch = faucetLov.find(
        (v) => v.toLowerCase().includes(key) || key.includes(v.toLowerCase()),
      );
      if (fuzzyMatch) return { normalized: fuzzyMatch, wasNormalized: true, confidence: 0.85 };
    }

    return {
      normalized: value.trim(),
      wasNormalized: false,
      confidence: 0.70,
    };
  }

  /**
   * Returns the canonical ordered sequence of attributes for Faucet products.
   * This is the Unilog-mandated online description build order per FAUCETS_LOV.xlsx.
   */
  getFaucetAttributeSequence(): readonly string[] {
    return FAUCET_ATTRIBUTE_SEQUENCE;
  }

  /**
   * Checks whether an attribute value is valid within a controlled Faucet LOV.
   * Returns true if valid, false if value is out of the permitted set.
   */
  isFaucetValuePermitted(attributeLabel: string, value: string): boolean {
    const lov = FAUCET_LOV_VALUES[attributeLabel];
    if (!lov) return true; // No constraint defined → allow anything
    return lov.some((v) => v.toLowerCase() === value.toLowerCase());
  }

  /**
   * Detects if a product is likely a fitting based on its classpath or description.
   */
  isFittingProduct(classpath: string, description: string): boolean {
    const text = `${classpath} ${description}`.toLowerCase();
    return (
      text.includes('fitting') ||
      text.includes('elbow') ||
      text.includes('coupling') ||
      text.includes('nipple') ||
      text.includes('union') ||
      text.includes('reducer') ||
      text.includes('tee') ||
      text.includes('connector') ||
      text.includes('adapter') ||
      text.includes('bushing') ||
      text.includes('plug') ||
      text.includes('cap fitting') ||
      text.includes('cross fitting') ||
      text.includes('hose barb') ||
      (text.includes('pipe') && !text.includes('pipe wrench') && !text.includes('pipe cutter'))
    );
  }

  /**
   * Detects if a product is likely a kitchen/bath faucet.
   */
  isFaucetProduct(classpath: string, description: string): boolean {
    const text = `${classpath} ${description}`.toLowerCase();
    return (
      text.includes('faucet') ||
      text.includes('faucets') ||
      text.includes('tap') ||
      text.includes('lavatory') ||
      text.includes('kitchen sink') ||
      text.includes('bath sink') ||
      text.includes('sink faucet') ||
      text.includes('shower faucet') ||
      text.includes('bathtub faucet') ||
      text.includes('pot filler') ||
      text.includes('hose bib') ||
      text.includes('hose bibb') ||
      text.includes('sillcock')
    );
  }
}

export const lovNormalizer = new LovNormalizerService();
