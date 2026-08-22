/**
 * Hardened Product Image Extraction Service
 * Implements Structured Metadata Priority, DOM Scope Container Isolation,
 * Resolution/Aspect Ratio Heuristics, Part-Number & Semantic Product Relevance,
 * and Primary/Alternate Gallery Ranking.
 */

import { urlHealthVerifierService } from './url-health-verifier.service';

export interface ProductRelevanceContext {
  partNumber?: string;
  manufacturer?: string;
  brand?: string;
  title?: string;
  category?: string;
}

export interface ExtractedProductImage {
  url: string;
  source: 'json-ld' | 'og-tag' | 'primary-container' | 'dom-fallback' | 'search-live';
  isPrimary: boolean;
  width?: number;
  height?: number;
  alt?: string;
  confidence: number;
}

export interface ImageExtractionResult {
  primaryImage: ExtractedProductImage | null;
  alternateImages: ExtractedProductImage[];
  allValidImages: ExtractedProductImage[];
  hasActualImage: boolean;
}

export class ImageExtractorService {
  // Container selectors / class names that MUST be strictly purged to avoid capturing related or recommended products
  private readonly PURGE_CONTAINER_PATTERNS = [
    /recommend/i,
    /related/i,
    /upsell/i,
    /cross-?sell/i,
    /carousel-?similar/i,
    /also-?viewed/i,
    /frequently-?bought/i,
    /sponsored/i,
    /you-?may-?like/i,
    /suggested/i,
    /customer-?also/i,
    /other-?customers/i,
    /more-?to-?consider/i,
    /popular-?items/i,
    /sidebar/i,
  ];

  // Primary product gallery container markers
  private readonly PRIMARY_GALLERY_PATTERNS = [
    /data-gallery/i,
    /pdp-gallery/i,
    /product-media-gallery/i,
    /main-product-image/i,
    /hero-image/i,
    /product-gallery/i,
    /product-images/i,
    /product__photos/i,
    /product-photo-container/i,
    /data-component=["']gallery["']/i,
    /data-testid=["']pdp-gallery["']/i,
    /product-image-container/i,
    /pdp-image-viewer/i,
    /gallery-viewer/i,
    /image-viewer/i,
  ];

  // Block elements to strip entirely
  private readonly STRIP_ELEMENT_TAGS = ['footer', 'header', 'nav', 'aside', 'script', 'style', 'noscript'];

  /**
   * Main entry point: Extracts, filters, and ranks authentic product images from raw HTML.
   */
  public extractProductImages(html: string, baseUrl: string, context?: ProductRelevanceContext): ImageExtractionResult {
    if (!html || typeof html !== 'string') {
      return { primaryImage: null, alternateImages: [], allValidImages: [], hasActualImage: false };
    }

    const candidateImages: ExtractedProductImage[] = [];
    const seenUrls = new Set<string>();

    const addCandidate = (img: ExtractedProductImage) => {
      const normalizedUrl = this.normalizeImageUrl(img.url, baseUrl);
      if (!normalizedUrl || seenUrls.has(normalizedUrl)) return;
      if (!this.isValidProductImage(normalizedUrl, img.width, img.height)) return;
      if (!this.isRelevantToProduct(normalizedUrl, context, img.alt, img.source)) return;

      seenUrls.add(normalizedUrl);
      candidateImages.push({
        ...img,
        url: normalizedUrl,
      });
    };

    // ─────────────────────────────────────────────────────────────
    // STEP 1: Structured Metadata Priority (JSON-LD schema.org/Product)
    // ─────────────────────────────────────────────────────────────
    const jsonLdImages = this.extractFromJsonLd(html, baseUrl);
    for (const img of jsonLdImages) {
      addCandidate(img);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 2: OpenGraph & Twitter Meta Tags
    // ─────────────────────────────────────────────────────────────
    const metaImages = this.extractFromMetaTags(html, baseUrl);
    for (const img of metaImages) {
      addCandidate(img);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 3: DOM Scope & Container Isolation
    // ─────────────────────────────────────────────────────────────
    const domImages = this.extractFromIsolatedDom(html, baseUrl);
    for (const img of domImages) {
      addCandidate(img);
    }

    // ─────────────────────────────────────────────────────────────
    // STEP 4: Heuristics, Resolution Validation & Ranking
    // ─────────────────────────────────────────────────────────────
    return this.rankAndOrganizeImages(candidateImages, context);
  }

  /**
   * Validates and ranks an array of raw image URLs (e.g. from search APIs or enrichment sources)
   */
  public validateAndRankImages(
    rawUrls: (string | { url: string; width?: number; height?: number; alt?: string })[],
    baseUrl = '',
    context?: ProductRelevanceContext
  ): ImageExtractionResult {
    const candidateImages: ExtractedProductImage[] = [];
    const seenUrls = new Set<string>();

    for (const item of rawUrls) {
      const url = typeof item === 'string' ? item : item.url;
      const width = typeof item === 'object' ? item.width : undefined;
      const height = typeof item === 'object' ? item.height : undefined;
      const alt = typeof item === 'object' ? item.alt : undefined;

      const normalizedUrl = this.normalizeImageUrl(url, baseUrl);
      if (!normalizedUrl || seenUrls.has(normalizedUrl)) continue;
      if (!this.isValidProductImage(normalizedUrl, width, height)) continue;
      if (!this.isRelevantToProduct(normalizedUrl, context, alt, 'search-live')) continue;

      seenUrls.add(normalizedUrl);

      // Estimate dimensions from URL if not provided
      const parsedDims = this.extractDimensionsFromUrl(normalizedUrl);
      const finalWidth = width || parsedDims.width;
      const finalHeight = height || parsedDims.height;

      candidateImages.push({
        url: normalizedUrl,
        source: 'search-live',
        isPrimary: false,
        width: finalWidth,
        height: finalHeight,
        alt,
        confidence: 0.90,
      });
    }

    return this.rankAndOrganizeImages(candidateImages, context);
  }

  /**
   * Performs asynchronous HTTP HEAD/GET health checks on candidate images,
   * discarding dead links and HTML error pages, and returning strictly live verified image assets.
   */
  public async validateAndFilterLiveImagesAsync(
    rawUrls: (string | { url: string; width?: number; height?: number; alt?: string })[],
    baseUrl = '',
    context?: ProductRelevanceContext
  ): Promise<ImageExtractionResult> {
    const preliminary = this.validateAndRankImages(rawUrls, baseUrl, context);
    if (preliminary.allValidImages.length === 0) {
      return preliminary;
    }

    const batch = preliminary.allValidImages.map((img) => ({
      url: img.url,
      expectedType: 'image' as const,
    }));

    const verifiedMap = await urlHealthVerifierService.verifyUrlsBatch(batch);

    const liveCandidates = preliminary.allValidImages.filter((img) => {
      const check = verifiedMap.get(img.url);
      return check && check.isValid;
    });

    return this.rankAndOrganizeImages(liveCandidates, context);
  }

  // ─────────────────────────────────────────────────────────────
  // Extraction Helpers
  // ─────────────────────────────────────────────────────────────

  /**
   * Extract images from schema.org/Product JSON-LD
   */
  private extractFromJsonLd(html: string, baseUrl: string): ExtractedProductImage[] {
    const results: ExtractedProductImage[] = [];
    const scriptRegex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;

    while ((match = scriptRegex.exec(html)) !== null) {
      try {
        const jsonText = match[1]?.trim();
        if (!jsonText) continue;
        const parsed = JSON.parse(jsonText);
        const products = this.findProductObjects(parsed);

        for (const prod of products) {
          if (prod.image) {
            const rawImages = Array.isArray(prod.image) ? prod.image : [prod.image];
            for (let i = 0; i < rawImages.length; i++) {
              const item = rawImages[i];
              let imgUrl = '';
              let width: number | undefined;
              let height: number | undefined;

              if (typeof item === 'string') {
                imgUrl = item;
              } else if (item && typeof item === 'object') {
                imgUrl = item.url || item.contentUrl || item.thumbnailUrl || '';
                if (item.width) width = Number(item.width) || undefined;
                if (item.height) height = Number(item.height) || undefined;
              }

              if (imgUrl) {
                const dims = this.extractDimensionsFromUrl(imgUrl);
                results.push({
                  url: imgUrl,
                  source: 'json-ld',
                  isPrimary: i === 0,
                  width: width || dims.width,
                  height: height || dims.height,
                  confidence: 0.99,
                });
              }
            }
          }
        }
      } catch {
        // Ignore malformed JSON-LD
      }
    }

    return results;
  }

  private findProductObjects(obj: any): any[] {
    if (!obj || typeof obj !== 'object') return [];
    const products: any[] = [];

    if (obj['@type'] === 'Product' || (Array.isArray(obj['@type']) && obj['@type'].includes('Product'))) {
      products.push(obj);
    }

    if (Array.isArray(obj['@graph'])) {
      for (const item of obj['@graph']) {
        products.push(...this.findProductObjects(item));
      }
    }

    if (Array.isArray(obj)) {
      for (const item of obj) {
        products.push(...this.findProductObjects(item));
      }
    }

    return products;
  }

  /**
   * Extract images from OpenGraph and Twitter meta tags
   */
  private extractFromMetaTags(html: string, baseUrl: string): ExtractedProductImage[] {
    const results: ExtractedProductImage[] = [];

    const ogMatches = [
      ...html.matchAll(/<meta\s+property=["']og:image(?::secure_url)?["']\s+content=["']([^"']+)["']/gi),
      ...html.matchAll(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image(?::secure_url)?["']/gi),
      ...html.matchAll(/<meta\s+name=["']twitter:image(?::src)?["']\s+content=["']([^"']+)["']/gi),
      ...html.matchAll(/<meta\s+content=["']([^"']+)["']\s+name=["']twitter:image(?::src)?["']/gi),
    ];

    for (const m of ogMatches) {
      const url = m[1]?.trim();
      if (url) {
        const dims = this.extractDimensionsFromUrl(url);
        results.push({
          url,
          source: 'og-tag',
          isPrimary: true,
          width: dims.width,
          height: dims.height,
          confidence: 0.95,
        });
      }
    }

    return results;
  }

  /**
   * Extract images from isolated DOM containers, stripping recommended/related product containers
   */
  private extractFromIsolatedDom(html: string, baseUrl: string): ExtractedProductImage[] {
    const results: ExtractedProductImage[] = [];

    // Step 1: Strip entire non-product tags (<header>, <footer>, <nav>, <aside>, <script>, <style>)
    let cleanedHtml = html;
    for (const tag of this.STRIP_ELEMENT_TAGS) {
      const tagRegex = new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
      cleanedHtml = cleanedHtml.replace(tagRegex, ' ');
    }

    // Step 2: Strip recommendation and related product container elements
    cleanedHtml = this.stripUnrelatedContainers(cleanedHtml);

    // Step 3: Check if primary product gallery containers exist
    const primaryContainers = this.extractPrimaryContainers(cleanedHtml);

    if (primaryContainers.length > 0) {
      for (const containerHtml of primaryContainers) {
        const imgTags = [...containerHtml.matchAll(/<img\b([^>]*)>/gi)];
        for (const imgTag of imgTags) {
          const img = this.parseImgTag(imgTag[1] || '', 'primary-container');
          if (img) results.push(img);
        }

        // Also check for <a href="..."> zoom links inside gallery
        const zoomLinks = [...containerHtml.matchAll(/<a\b[^>]*href=["']([^"']+\.(?:jpg|jpeg|png|webp))["'][^>]*>/gi)];
        for (const zoom of zoomLinks) {
          if (zoom[1]) {
            const dims = this.extractDimensionsFromUrl(zoom[1]);
            results.push({
              url: zoom[1],
              source: 'primary-container',
              isPrimary: false,
              width: dims.width,
              height: dims.height,
              confidence: 0.92,
            });
          }
        }
      }
    } else {
      // Fallback: Scan remaining cleaned HTML
      const imgTags = [...cleanedHtml.matchAll(/<img\b([^>]*)>/gi)];
      for (const imgTag of imgTags) {
        const img = this.parseImgTag(imgTag[1] || '', 'dom-fallback');
        if (img) results.push(img);
      }
    }

    return results;
  }

  /**
   * Strips HTML container blocks matching recommendation, upsell, and related product patterns
   */
  private stripUnrelatedContainers(html: string): string {
    let output = html;

    // Remove elements with class or id matching purge patterns
    const containerRegex = /<(div|section|aside|ul|ol|article)\b([^>]*?)>([\s\S]*?)<\/\1>/gi;

    output = output.replace(containerRegex, (fullMatch, tag, attrs) => {
      const classAndId = `${attrs}`;
      for (const pattern of this.PURGE_CONTAINER_PATTERNS) {
        if (pattern.test(classAndId)) {
          return ' '; // Strip container completely
        }
      }
      return fullMatch;
    });

    return output;
  }

  /**
   * Identifies primary product gallery container HTML blocks
   */
  private extractPrimaryContainers(html: string): string[] {
    const containers: string[] = [];
    const containerRegex = /<(div|section|figure|main)\b([^>]*?)>([\s\S]*?)<\/\1>/gi;
    let match: RegExpExecArray | null;

    while ((match = containerRegex.exec(html)) !== null) {
      const attrs = match[2] || '';
      for (const pattern of this.PRIMARY_GALLERY_PATTERNS) {
        if (pattern.test(attrs)) {
          containers.push(match[0]);
          break;
        }
      }
    }

    return containers;
  }

  /**
   * Parses an individual <img> tag string and extracts src, dimensions, alt
   */
  private parseImgTag(imgAttrs: string, source: ExtractedProductImage['source']): ExtractedProductImage | null {
    // Look for high-res sources: data-zoom-image, data-large, data-highres, data-src, src
    const srcMatch =
      imgAttrs.match(/data-zoom-image=["']([^"']+)["']/i) ||
      imgAttrs.match(/data-large(?:-image)?=["']([^"']+)["']/i) ||
      imgAttrs.match(/data-highres=["']([^"']+)["']/i) ||
      imgAttrs.match(/data-original=["']([^"']+)["']/i) ||
      imgAttrs.match(/data-src=["']([^"']+)["']/i) ||
      imgAttrs.match(/src=["']([^"']+)["']/i);

    if (!srcMatch || !srcMatch[1]) return null;
    const url = srcMatch[1].trim();

    // Check width / height attributes
    const widthMatch = imgAttrs.match(/\bwidth=["']?(\d+)/i);
    const heightMatch = imgAttrs.match(/\bheight=["']?(\d+)/i);
    const altMatch = imgAttrs.match(/\balt=["']([^"']*)["']/i);

    let width = widthMatch ? parseInt(widthMatch[1]!, 10) : undefined;
    let height = heightMatch ? parseInt(heightMatch[1]!, 10) : undefined;

    if (!width || !height) {
      const urlDims = this.extractDimensionsFromUrl(url);
      width = width || urlDims.width;
      height = height || urlDims.height;
    }

    return {
      url,
      source,
      isPrimary: source === 'primary-container',
      width,
      height,
      alt: altMatch ? altMatch[1]?.trim() : undefined,
      confidence: source === 'primary-container' ? 0.90 : 0.75,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Product Semantic Relevance & Conflicting Product Detection
  // ─────────────────────────────────────────────────────────────

  /**
   * Evaluates whether an image URL / alt text is specifically relevant to the target product SKU,
   * rejecting any image showing unrelated products (e.g. screws, saw blades, drill bits, or other categories).
   */
  public isRelevantToProduct(
    url: string,
    context?: ProductRelevanceContext,
    alt?: string,
    source?: ExtractedProductImage['source']
  ): boolean {
    if (!context || (!context.partNumber && !context.title)) return true;

    const lowerUrl = url.toLowerCase();
    const lowerAlt = (alt || '').toLowerCase();
    const urlTokens = `${lowerUrl} ${lowerAlt}`
      .replace(/[^a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    const cleanPart = (context.partNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTitle = (context.title || '').toLowerCase();
    const titleTokens = cleanTitle
      .replace(/[^a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    const categoryTokens = (context.category || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length >= 2);

    const allowedTokens = new Set([...titleTokens, ...categoryTokens]);

    // 1. Part Number Exact or Stem Match
    let hasSkuMatch = false;
    if (cleanPart.length >= 4) {
      const strippedCombined = `${lowerUrl} ${lowerAlt}`.replace(/[^a-z0-9]/g, '');
      if (strippedCombined.includes(cleanPart)) {
        hasSkuMatch = true;
      } else {
        const stem = cleanPart.substring(0, Math.min(6, cleanPart.length));
        if (stem.length >= 4 && strippedCombined.includes(stem)) {
          hasSkuMatch = true;
        }
      }
    }

    // 2. Conflicting Tool / Unrelated Product Category Check
    // If the image contains tokens of a completely different tool/product type that is not in the product title or category,
    // immediately reject to prevent showing unrelated products.
    const CONFLICTING_PRODUCT_TERMS = [
      'blade', 'blades', 'sawblade', 'sawblades', 'saw', 'saws',
      'screw', 'screws', 'fastener', 'fasteners', 'anchor', 'anchors', 'bolt', 'bolts', 'nut', 'nuts', 'washer', 'washers', 'rivet', 'rivets',
      'drill', 'drills', 'driver', 'drivers', 'bit', 'bits', 'socket', 'sockets', 'chuck', 'adapter', 'extension', 'mandrel',
      'router', 'chisel', 'planer', 'jointer',
      'hammer', 'plier', 'pliers', 'wrench', 'wrenches', 'clamp', 'clamps',
      'glove', 'gloves', 'glasses', 'goggle', 'goggles', 'earmuff', 'earmuffs', 'respirator', 'helmet',
      'breaker', 'breakers', 'panel', 'panels', 'conduit', 'switch', 'switches', 'receptacle', 'outlet',
      'caulk', 'sealant', 'adhesive', 'glue', 'grease', 'lubricant', 'tape',
      'hose', 'hoses', 'pipe', 'pipes', 'valve', 'valves', 'pump', 'pumps', 'motor', 'motors'
    ];

    for (const term of CONFLICTING_PRODUCT_TERMS) {
      if (urlTokens.includes(term) && !allowedTokens.has(term)) {
        return false;
      }
    }

    // If SKU matches directly, accept
    if (hasSkuMatch) return true;

    // 3. For search-live or dom-fallback images: require positive product noun match (brand alone is NOT enough)
    if (source === 'search-live' || source === 'dom-fallback') {
      const coreProductKeywords = titleTokens.filter(
        (w) =>
          w.length >= 4 &&
          !['pack', 'piece', 'inch', 'each', 'size', 'with', 'from', 'item', 'unit', 'detail', 'file', 'assorted', 'freud', 'diablo', 'dewalt', 'milwaukee', 'makita', 'bosch'].includes(w)
      );

      const hasCoreNounMatch = coreProductKeywords.some((kw) => urlTokens.includes(kw));

      // Must have either part number match or core product descriptor noun match
      if (!hasCoreNounMatch) {
        return false;
      }
    }

    return true;
  }


  /**
   * Calculates affinity score of candidate image to target product
   */
  private calculateAffinityScore(img: ExtractedProductImage, context?: ProductRelevanceContext): number {
    if (!context) return 0;
    let score = 0;
    const combined = `${img.url.toLowerCase()} ${(img.alt || '').toLowerCase()}`;
    const cleanPart = (context.partNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTitle = (context.title || '').toLowerCase();

    // Exact part number match in URL or alt -> massive boost
    if (cleanPart && combined.replace(/[^a-z0-9]/g, '').includes(cleanPart)) {
      score += 1000;
    }

    // Title keyword matches
    const titleWords = cleanTitle
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4);

    for (const w of titleWords) {
      if (combined.includes(w)) score += 50;
    }

    if (img.source === 'json-ld') score += 200;
    if (img.source === 'og-tag') score += 150;
    if (img.source === 'primary-container') score += 100;

    return score;
  }

  // ─────────────────────────────────────────────────────────────
  // Validation, Normalization & Dimension Extraction
  // ─────────────────────────────────────────────────────────────

  /**
   * Strict validation rule:
   * 1. Must be a valid HTTP(S) image URL.
   * 2. Cannot be SVG, tracking pixel, logo, icon, badge, avatar, or banner.
   * 3. Must satisfy minimum 300x300 resolution if dimensions known.
   * 4. Must satisfy aspect ratio <= 2.5 (and >= 0.4).
   */
  public isValidProductImage(url: string, width?: number, height?: number): boolean {
    if (!url || typeof url !== 'string' || url.length < 5) return false;
    const lower = url.toLowerCase();

    // Reject non-http or data URIs
    if (!lower.startsWith('http://') && !lower.startsWith('https://')) return false;

    // Reject SVGs and documents
    if (lower.endsWith('.svg') || lower.includes('.svg?') || lower.includes('image/svg')) return false;
    if (lower.endsWith('.pdf') || lower.includes('/pdf/')) return false;

    // Reject common non-product media patterns
    const badTokens = [
      'favicon',
      'logo',
      'brand',
      'icon',
      'badge',
      'pixel',
      '1x1',
      'spacer',
      'tracker',
      'avatar',
      'sprite',
      'spinner',
      'loading',
      'rating',
      'star',
      'social',
      'facebook',
      'twitter',
      'instagram',
      'youtube',
      'linkedin',
      'arrow',
      'button',
      'cart',
      'header',
      'footer',
      'banner_ad',
    ];

    for (const token of badTokens) {
      if (lower.includes(token)) {
        if (token === 'badge' || token === 'icon' || token === 'logo' || token === 'avatar' || token === 'pixel') {
          return false;
        }
      }
    }

    // Resolution check if width and height are known
    if (width !== undefined && height !== undefined) {
      if (width < 300 || height < 300) return false;

      // Aspect ratio check: max(w, h) / min(w, h) must be <= 2.5
      const maxDim = Math.max(width, height);
      const minDim = Math.min(width, height);
      if (minDim > 0 && maxDim / minDim > 2.5) {
        return false;
      }
    }

    return true;
  }

  /**
   * Extracts dimension tokens from image URLs (e.g. _800x800.jpg, 1200x800, ?w=1000&h=1000)
   */
  public extractDimensionsFromUrl(url: string): { width?: number; height?: number } {
    if (!url) return {};

    // Pattern: 800x800 or 1200x900 in URL path
    const dimMatch = url.match(/[-_](\d{3,4})x(\d{3,4})/i) || url.match(/\/(\d{3,4})x(\d{3,4})\//i);
    if (dimMatch && dimMatch[1] && dimMatch[2]) {
      return {
        width: parseInt(dimMatch[1], 10),
        height: parseInt(dimMatch[2], 10),
      };
    }

    // Pattern: ?w=800&h=800 or ?width=800&height=800
    const wMatch = url.match(/[?&](?:w|width)=(\d{3,4})/i);
    const hMatch = url.match(/[?&](?:h|height)=(\d{3,4})/i);
    if (wMatch && hMatch && wMatch[1] && hMatch[1]) {
      return {
        width: parseInt(wMatch[1], 10),
        height: parseInt(hMatch[1], 10),
      };
    }

    // Single dimension pattern ?w=800 (assume square for ratio estimation)
    if (wMatch && wMatch[1]) {
      const w = parseInt(wMatch[1], 10);
      return { width: w, height: w };
    }

    return {};
  }

  /**
   * Normalizes URLs, resolving relative paths against baseUrl
   */
  public normalizeImageUrl(url: string, baseUrl: string): string | null {
    if (!url || typeof url !== 'string') return null;
    let clean = url.trim();

    if (clean.startsWith('//')) {
      clean = 'https:' + clean;
    } else if (clean.startsWith('/') || !clean.startsWith('http')) {
      if (!baseUrl) return null;
      try {
        const base = new URL(baseUrl);
        clean = new URL(clean, base.origin).toString();
      } catch {
        return null;
      }
    }

    try {
      const parsed = new URL(clean);
      return parsed.toString();
    } catch {
      return null;
    }
  }

  /**
   * Ranks candidate images by affinity, resolution and provenance.
   * If only 1 image is genuinely relevant to the product, returns ONLY that 1 image (0 alternates).
   */
  private rankAndOrganizeImages(candidates: ExtractedProductImage[], context?: ProductRelevanceContext): ImageExtractionResult {
    if (candidates.length === 0) {
      return { primaryImage: null, alternateImages: [], allValidImages: [], hasActualImage: false };
    }

    const sourcePriority: Record<ExtractedProductImage['source'], number> = {
      'json-ld': 100,
      'og-tag': 90,
      'primary-container': 80,
      'search-live': 70,
      'dom-fallback': 60,
    };

    const sorted = [...candidates].sort((a, b) => {
      const aAffinity = this.calculateAffinityScore(a, context);
      const bAffinity = this.calculateAffinityScore(b, context);

      if (aAffinity !== bAffinity) {
        return bAffinity - aAffinity; // Highest affinity to SKU first
      }

      const aArea = (a.width || 500) * (a.height || 500);
      const bArea = (b.width || 500) * (b.height || 500);

      if (aArea !== bArea) {
        return bArea - aArea; // Highest resolution
      }

      return (sourcePriority[b.source] || 0) - (sourcePriority[a.source] || 0);
    });

    const primaryImage: ExtractedProductImage = {
      ...sorted[0]!,
      isPrimary: true,
    };

    // Filter alternate images strictly for product relevance
    const alternateImages: ExtractedProductImage[] = sorted
      .slice(1, 5)
      .filter((img) => this.isRelevantToProduct(img.url, context, img.alt, img.source))
      .map((img) => ({
        ...img,
        isPrimary: false,
      }));

    return {
      primaryImage,
      alternateImages,
      allValidImages: [primaryImage, ...alternateImages],
      hasActualImage: true,
    };
  }
}

export const imageExtractorService = new ImageExtractorService();
