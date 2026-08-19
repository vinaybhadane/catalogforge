/**
 * Source Governance Service
 * Enforces strict sourcing rules:
 * - Tier 1: Official Manufacturer Website (Primary source - mandatory for images, spec sheets, PDFs, and warranty files)
 * - Tier 2: Reputed Industrial Distributors (Fallback for text specs only if manufacturer data is missing)
 * - Blacklist: E-commerce and consumer retail websites are strictly prohibited.
 */

export type SourceTier = 'manufacturer' | 'reputed_distributor' | 'prohibited_ecommerce' | 'other_web';

export interface SourceClassification {
  url: string;
  domain: string;
  tier: SourceTier;
  isAllowed: boolean;
  isAuthoritativeForAssets: boolean; // true ONLY for manufacturer websites
  isProhibited: boolean;
  rejectionReason?: string;
  sourceLabel: string;
}

// ─────────────────────────────────────────────────────────────
// Strictly Prohibited E-Commerce & Consumer Marketplace Domains
// ─────────────────────────────────────────────────────────────
export const PROHIBITED_ECOMMERCE_DOMAINS = [
  'amazon.com',
  'amazon.co.uk',
  'amazon.de',
  'amazon.in',
  'amazon.ca',
  'ebay.com',
  'ebay.co.uk',
  'ebay.de',
  'walmart.com',
  'aliexpress.com',
  'alibaba.com',
  'temu.com',
  'flipkart.com',
  'etsy.com',
  'target.com',
  'bestbuy.com',
  'overstock.com',
  'wayfair.com',
  'wish.com',
  'dhgate.com',
  'shopee.com',
  'lazada.com',
  'rakuten.com',
  'mercadolibre.com',
  'poshmark.com',
  'mercari.com',
  'ubuy.com',
  'desertcart.com',
  'indiamart.com',
  'tradeindia.com',
  'gearbest.com',
  'banggood.com',
];

// ─────────────────────────────────────────────────────────────
// Tier 2: Reputed Industrial & Electronic Catalog Distributors
// Allowed ONLY for text specifications/attributes if manufacturer data is absent.
// Prohibited from supplying images, spec PDFs, or warranty files.
// ─────────────────────────────────────────────────────────────
export const REPUTED_DISTRIBUTOR_DOMAINS = [
  'grainger.com',
  'mcmaster.com',
  'mouser.com',
  'digikey.com',
  'rs-online.com',
  'newark.com',
  'farnell.com',
  'alliedelec.com',
  'automationdirect.com',
  'galco.com',
  'radwell.com',
  'platt.com',
  'rexel.com',
  'wesco.com',
  'graybar.com',
  'fastenal.com',
  'zoro.com',
  'motionindustries.com',
  'jamindustrialsupply.com',
  'element14.com',
  'arrow.com',
  'misumi.com',
  'sonepar.com',
];

// ─────────────────────────────────────────────────────────────
// Known Manufacturer Domain Registry (Tier 1 Primary Sources)
// ─────────────────────────────────────────────────────────────
export const KNOWN_MANUFACTURER_DOMAINS: Record<string, string[]> = {
  'freud inc': ['diablotools.com', 'freudtools.com'],
  'diablo': ['diablotools.com', 'freudtools.com'],
  '3m': ['3m.com', 'multimedia.3m.com'],
  'mirka': ['mirka.com', 'mirkausa.com'],
  'milwaukee': ['milwaukeetool.com', 'milwaukeetool.eu'],
  'square d': ['se.com', 'schneider-electric.com'],
  'schneider electric': ['se.com', 'schneider-electric.com'],
  'siemens': ['siemens.com', 'automation.siemens.com'],
  'eaton': ['eaton.com'],
  'abb': ['abb.com'],
  'dewalt': ['dewalt.com'],
  'bosch': ['boschtools.com', 'bosch.com'],
  'hubbell': ['hubbell.com'],
  'leviton': ['leviton.com'],
  'klein tools': ['kleintools.com'],
  'fluke': ['fluke.com'],
  'greenlee': ['greenlee.com'],
  'southwire': ['southwire.com'],
  'legrand': ['legrand.us', 'legrand.com'],
  'festo': ['festo.com'],
  'allen-bradley': ['rockwellautomation.com'],
  'rockwell automation': ['rockwellautomation.com'],
};

export class SourceGovernorService {
  /**
   * Extracts clean root domain from URL or hostname
   */
  extractDomain(urlOrHost: string): string {
    try {
      let hostname = urlOrHost.trim().toLowerCase();
      if (hostname.startsWith('http://') || hostname.startsWith('https://')) {
        hostname = new URL(hostname).hostname.toLowerCase();
      }
      // Remove leading www. or m.
      hostname = hostname.replace(/^(www\d*|m)\./, '');
      return hostname;
    } catch {
      return urlOrHost.toLowerCase().trim();
    }
  }

  /**
   * Classifies a URL against governance tiers
   */
  classifySource(
    url: string,
    manufacturerName?: string,
    manufacturerDomain?: string,
  ): SourceClassification {
    const domain = this.extractDomain(url);

    // 1. Check Prohibited E-Commerce Blacklist
    const isProhibited = PROHIBITED_ECOMMERCE_DOMAINS.some(
      (bDomain) => domain === bDomain || domain.endsWith(`.${bDomain}`) || domain.includes(bDomain),
    );

    if (isProhibited) {
      return {
        url,
        domain,
        tier: 'prohibited_ecommerce',
        isAllowed: false,
        isAuthoritativeForAssets: false,
        isProhibited: true,
        rejectionReason: `STRICT PROHIBITION: E-commerce and consumer marketplace domain '${domain}' is strictly disallowed.`,
        sourceLabel: 'Prohibited E-Commerce Marketplace',
      };
    }

    // 2. Check Manufacturer Primary Source (Tier 1)
    let isManufacturer = false;

    // Check specific known manufacturer domain if provided
    if (manufacturerDomain) {
      const cleanMfgDomain = this.extractDomain(manufacturerDomain);
      if (domain === cleanMfgDomain || domain.endsWith(`.${cleanMfgDomain}`)) {
        isManufacturer = true;
      }
    }

    // Check against manufacturer name registry
    if (!isManufacturer && manufacturerName) {
      const cleanName = manufacturerName.toLowerCase().trim();
      for (const [key, domains] of Object.entries(KNOWN_MANUFACTURER_DOMAINS)) {
        if (cleanName.includes(key) || key.includes(cleanName)) {
          if (domains.some((d) => domain === d || domain.endsWith(`.${d}`))) {
            isManufacturer = true;
            break;
          }
        }
      }

      // Check if domain name itself contains the manufacturer core token (e.g. milwaukeetool, diablotools)
      const sanitizedMfgToken = cleanName.replace(/[^a-z0-9]/g, '');
      if (!isManufacturer && sanitizedMfgToken.length >= 4 && domain.replace(/[^a-z0-9]/g, '').includes(sanitizedMfgToken)) {
        isManufacturer = true;
      }
    }

    if (isManufacturer) {
      return {
        url,
        domain,
        tier: 'manufacturer',
        isAllowed: true,
        isAuthoritativeForAssets: true, // ONLY Manufacturer websites can provide images, spec PDFs, and warranty files
        isProhibited: false,
        sourceLabel: 'Official Manufacturer Website (Primary Source)',
      };
    }

    // 3. Check Reputed Industrial Distributor (Tier 2)
    const isDistributor = REPUTED_DISTRIBUTOR_DOMAINS.some(
      (dDomain) => domain === dDomain || domain.endsWith(`.${dDomain}`),
    );

    if (isDistributor) {
      return {
        url,
        domain,
        tier: 'reputed_distributor',
        isAllowed: true,
        isAuthoritativeForAssets: false, // Prohibited from providing digital assets; text specs only
        isProhibited: false,
        sourceLabel: 'Reputed Industrial Distributor (Secondary Source - Specs Only)',
      };
    }

    // 4. Other Web Source (Allowed for text specs only if non-ecommerce)
    return {
      url,
      domain,
      tier: 'other_web',
      isAllowed: true,
      isAuthoritativeForAssets: false,
      isProhibited: false,
      sourceLabel: 'Third-Party Technical Domain',
    };
  }

  /**
   * Validates whether a digital asset (image, spec sheet, warranty doc) is allowed from this source.
   * Rule: MUST ONLY come from the official manufacturer website.
   */
  isAssetAllowedFromSource(url: string, manufacturerName?: string, manufacturerDomain?: string): boolean {
    const classification = this.classifySource(url, manufacturerName, manufacturerDomain);
    return classification.isAllowed && classification.isAuthoritativeForAssets;
  }

  /**
   * Generates search exclusions string to append to Brave Search queries
   */
  getSearchExclusionQuery(): string {
    const topBlacklist = ['amazon.com', 'ebay.com', 'walmart.com', 'aliexpress.com', 'temu.com', 'flipkart.com', 'target.com'];
    return topBlacklist.map((d) => `-site:${d}`).join(' ');
  }
}

export const sourceGovernor = new SourceGovernorService();
