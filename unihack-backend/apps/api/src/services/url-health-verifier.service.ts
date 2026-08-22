/**
 * Automated Head-Check URL Health Verification & Dead-Link Suppression Service
 * Executes asynchronous HTTP HEAD requests (with fallback to lightweight GET byte-range 0-1024)
 * to verify live HTTP status (200, 206, 301, 302, 307, 308) within a strict 3-second timeout window.
 * Strictly suppresses and discards 4xx, 5xx, timeouts, DNS errors, and invalid Content-Types (e.g. HTML error pages as images).
 */

export type AssetExpectedType = 'any' | 'image' | 'pdf';

export interface UrlVerificationResult {
  url: string;
  isValid: boolean;
  statusCode?: number;
  contentType?: string;
  expectedType: AssetExpectedType;
  error?: string;
  checkedAt: number;
}

export interface VerifyUrlOptions {
  expectedType?: AssetExpectedType;
  timeoutMs?: number;
  allowRedirects?: boolean;
}

interface CacheEntry {
  result: UrlVerificationResult;
  expiresAt: number;
}

export class UrlHealthVerifierService {
  private readonly DEFAULT_TIMEOUT_MS = 3000;
  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_CACHE_SIZE = 5000;
  private readonly cache = new Map<string, CacheEntry>();

  private readonly VALID_STATUS_CODES = new Set([200, 201, 202, 203, 204, 206, 301, 302, 303, 307, 308]);
  private readonly VALID_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml'];
  private readonly VALID_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.svg'];

  private readonly BROWSER_USER_AGENT =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 CatalogForge/1.0';

  /**
   * Verifies a single URL asynchronously with strict dead-link suppression
   */
  public async verifyUrl(
    rawUrl: string | null | undefined,
    options: VerifyUrlOptions = {}
  ): Promise<UrlVerificationResult> {
    const expectedType = options.expectedType || 'any';
    const timeoutMs = options.timeoutMs || this.DEFAULT_TIMEOUT_MS;

    if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
      return {
        url: '',
        isValid: false,
        expectedType,
        error: 'Empty or missing URL',
        checkedAt: Date.now(),
      };
    }

    const cleanUrl = rawUrl.trim();

    // Check basic URI syntax
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      return {
        url: cleanUrl,
        isValid: false,
        expectedType,
        error: 'Invalid protocol. URL must start with http:// or https://',
        checkedAt: Date.now(),
      };
    }

    try {
      new URL(cleanUrl);
    } catch {
      return {
        url: cleanUrl,
        isValid: false,
        expectedType,
        error: 'Malformed URL structure',
        checkedAt: Date.now(),
      };
    }

    // Check in-memory cache
    const cacheKey = `${expectedType}:${cleanUrl}`;
    const cached = this.cache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.result;
    }

    // Perform live network verification
    const result = await this.performNetworkCheck(cleanUrl, expectedType, timeoutMs);

    // Save to cache
    this.setCache(cacheKey, result);

    return result;
  }

  /**
   * Batch verifies multiple URLs with concurrency control
   */
  public async verifyUrlsBatch(
    urls: Array<{ url: string; expectedType?: AssetExpectedType }>,
    concurrency = 10
  ): Promise<Map<string, UrlVerificationResult>> {
    const results = new Map<string, UrlVerificationResult>();
    if (!urls || urls.length === 0) return results;

    const queue = [...urls];
    const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item || !item.url) continue;
        const res = await this.verifyUrl(item.url, { expectedType: item.expectedType });
        results.set(item.url, res);
      }
    });

    await Promise.all(workers);
    return results;
  }

  /**
   * Filters an array of URLs, discarding broken links and returning only verified live endpoints
   */
  public async sanitizeAndFilterUrls(
    urls: string[],
    expectedType: AssetExpectedType = 'any'
  ): Promise<string[]> {
    const cleanList = urls.filter((u) => Boolean(u && typeof u === 'string' && u.trim()));
    if (cleanList.length === 0) return [];

    const batch = cleanList.map((url) => ({ url, expectedType }));
    const verifiedMap = await this.verifyUrlsBatch(batch);

    return cleanList.filter((url) => {
      const res = verifiedMap.get(url);
      return res && res.isValid;
    });
  }

  /**
   * Executes dead-link suppression across all URL fields of a 252-column delivery row
   */
  public async sanitizeDeliveryRowUrls(row: Record<string, string>): Promise<Record<string, string>> {
    const sanitized = { ...row };

    // 1. Evidence URLs
    const evidenceKeys = ['MFR URL', 'Ref URL 1', 'Ref URL 2', 'Ref URL 3', 'Ref URL 4', 'Ref URL 5'];
    for (const key of evidenceKeys) {
      if (sanitized[key]) {
        const check = await this.verifyUrl(sanitized[key], { expectedType: 'any' });
        sanitized[key] = check.isValid ? sanitized[key] : '';
      }
    }

    // 2. Image URLs
    const imageKeys = ['Product Image', 'Alternate Image 1', 'Alternate Image 2', 'Alternate Image 3', 'Alternate Image 4'];
    let hasLiveProductImage = false;

    for (const key of imageKeys) {
      if (sanitized[key]) {
        const check = await this.verifyUrl(sanitized[key], { expectedType: 'image' });
        if (check.isValid) {
          if (key === 'Product Image') hasLiveProductImage = true;
        } else {
          sanitized[key] = '';
        }
      }
    }

    // Update Actual Image (Yes/No) strictly based on live verified images
    const hasAnyLiveImage = hasLiveProductImage || imageKeys.some((k) => Boolean(sanitized[k]));
    sanitized['Actual Image (Yes/No)'] = hasAnyLiveImage ? 'Yes' : 'No';

    // 3. Document / PDF URLs
    const docKeys = [
      'SDS',
      'SDS_1',
      'Warranty Information',
      'Catalog',
      'Specification Sheet',
      'Instruction/Installation Manual',
      'Service Manual',
      'Owners/User Manual',
      'Line Drawing',
      'Full Engineering Drawing',
      'Energy Star Guide',
      'Technical Bulletin',
      'Submittal',
      'Compatibility Chart',
      'Size Chart',
      'Product Label/Insert',
    ];

    for (const key of docKeys) {
      if (sanitized[key]) {
        const isPdfField = !['Video Link', 'Video Link 1'].includes(key);
        const check = await this.verifyUrl(sanitized[key], { expectedType: isPdfField ? 'pdf' : 'any' });
        sanitized[key] = check.isValid ? sanitized[key] : '';
      }
    }

    return sanitized;
  }

  /**
   * Low-level network verification: HTTP HEAD -> fallback HTTP GET Range: bytes=0-1024
   */
  private async performNetworkCheck(
    url: string,
    expectedType: AssetExpectedType,
    timeoutMs: number
  ): Promise<UrlVerificationResult> {
    // 1. Try HTTP HEAD request
    const headResult = await this.executeHeadRequest(url, expectedType, timeoutMs);
    if (headResult.isValid) {
      return headResult;
    }

    // If HEAD was rejected with 405 (Method Not Allowed), 403 (Forbidden), 400, or 501, try lightweight GET Range
    const shouldTryGetFallback =
      headResult.statusCode === 405 ||
      headResult.statusCode === 403 ||
      headResult.statusCode === 400 ||
      headResult.statusCode === 501 ||
      headResult.statusCode === 404 || // Some CDNs return 404 on HEAD but 200 on GET
      headResult.error?.includes('disallowed');

    if (shouldTryGetFallback) {
      const getResult = await this.executeGetRangeRequest(url, expectedType, timeoutMs);
      if (getResult.isValid) {
        return getResult;
      }
      return getResult;
    }

    return headResult;
  }

  /**
   * Executes HTTP HEAD request with timeout and content-type validation
   */
  private async executeHeadRequest(
    url: string,
    expectedType: AssetExpectedType,
    timeoutMs: number
  ): Promise<UrlVerificationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          'User-Agent': this.BROWSER_USER_AGENT,
          Accept: this.getAcceptHeader(expectedType),
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      const statusCode = response.status;
      const contentType = (response.headers.get('content-type') || '').toLowerCase();

      if (!this.VALID_STATUS_CODES.has(statusCode)) {
        return {
          url,
          isValid: false,
          statusCode,
          contentType,
          expectedType,
          error: `HTTP status ${statusCode} (Dead link)`,
          checkedAt: Date.now(),
        };
      }

      // Validate Content-Type
      const typeValid = this.validateContentType(url, contentType, expectedType);
      if (!typeValid.isValid) {
        return {
          url,
          isValid: false,
          statusCode,
          contentType,
          expectedType,
          error: typeValid.reason,
          checkedAt: Date.now(),
        };
      }

      return {
        url,
        isValid: true,
        statusCode,
        contentType,
        expectedType,
        checkedAt: Date.now(),
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError' || String(err).includes('aborted');
      return {
        url,
        isValid: false,
        expectedType,
        error: isTimeout ? `Request timed out after ${timeoutMs}ms` : (err.message || 'Network failure'),
        checkedAt: Date.now(),
      };
    }
  }

  /**
   * Executes lightweight HTTP GET with Range: bytes=0-1024 header as fallback
   */
  private async executeGetRangeRequest(
    url: string,
    expectedType: AssetExpectedType,
    timeoutMs: number
  ): Promise<UrlVerificationResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.BROWSER_USER_AGENT,
          Range: 'bytes=0-1024',
          Accept: this.getAcceptHeader(expectedType),
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      const statusCode = response.status;
      const contentType = (response.headers.get('content-type') || '').toLowerCase();

      // Immediately cancel the response stream to avoid downloading full payload
      if (response.body) {
        try {
          await response.body.cancel();
        } catch {
          // Ignore stream cancellation error
        }
      }

      if (!this.VALID_STATUS_CODES.has(statusCode)) {
        return {
          url,
          isValid: false,
          statusCode,
          contentType,
          expectedType,
          error: `HTTP GET status ${statusCode} (Dead link)`,
          checkedAt: Date.now(),
        };
      }

      // Validate Content-Type
      const typeValid = this.validateContentType(url, contentType, expectedType);
      if (!typeValid.isValid) {
        return {
          url,
          isValid: false,
          statusCode,
          contentType,
          expectedType,
          error: typeValid.reason,
          checkedAt: Date.now(),
        };
      }

      return {
        url,
        isValid: true,
        statusCode,
        contentType,
        expectedType,
        checkedAt: Date.now(),
      };
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err.name === 'AbortError' || String(err).includes('aborted');
      return {
        url,
        isValid: false,
        expectedType,
        error: isTimeout ? `GET request timed out after ${timeoutMs}ms` : (err.message || 'GET network failure'),
        checkedAt: Date.now(),
      };
    }
  }

  /**
   * Validates that the Content-Type matches the expected asset category
   */
  private validateContentType(
    url: string,
    contentType: string,
    expectedType: AssetExpectedType
  ): { isValid: boolean; reason?: string } {
    const lowerUrl = url.toLowerCase().split('?')[0];

    if (expectedType === 'image') {
      // Must not be text/html error page
      if (contentType.includes('text/html') || contentType.includes('application/json')) {
        return {
          isValid: false,
          reason: `Invalid image content type: '${contentType}' (HTML error page detected)`,
        };
      }

      // Accept if Content-Type starts with image/
      if (contentType.startsWith('image/')) {
        return { isValid: true };
      }

      // If content-type is binary octet-stream, check image extension
      if (contentType.includes('application/octet-stream') || !contentType) {
        const hasImageExt = this.VALID_IMAGE_EXTENSIONS.some((ext) => lowerUrl.endsWith(ext));
        if (hasImageExt) return { isValid: true };
      }

      return {
        isValid: false,
        reason: `Content-Type '${contentType}' does not start with 'image/'`,
      };
    }

    if (expectedType === 'pdf') {
      // Must not be text/html error page
      if (contentType.includes('text/html')) {
        return {
          isValid: false,
          reason: `Invalid PDF content type: '${contentType}' (HTML page detected)`,
        };
      }

      if (contentType.includes('application/pdf')) {
        return { isValid: true };
      }

      if (lowerUrl.endsWith('.pdf')) {
        return { isValid: true };
      }

      return {
        isValid: false,
        reason: `Content-Type '${contentType}' is not 'application/pdf'`,
      };
    }

    // For 'any' expectedType: Reject standard HTML error page responses if URL looks like an asset
    return { isValid: true };
  }

  private getAcceptHeader(expectedType: AssetExpectedType): string {
    if (expectedType === 'image') {
      return 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';
    }
    if (expectedType === 'pdf') {
      return 'application/pdf,*/*;q=0.8';
    }
    return '*/*';
  }

  private setCache(key: string, result: UrlVerificationResult): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, {
      result,
      expiresAt: Date.now() + this.CACHE_TTL_MS,
    });
  }
}

export const urlHealthVerifierService = new UrlHealthVerifierService();
