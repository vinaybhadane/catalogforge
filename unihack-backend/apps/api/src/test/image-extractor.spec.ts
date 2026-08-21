import { describe, it } from 'node:test';
import assert from 'node:assert';
import { imageExtractorService } from '../services/image-extractor.service';

console.log('=== Starting Image Extractor & Vision Ingestion Test Suite ===\n');

function runTest(description: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${description}`);
  } catch (err: any) {
    console.error(`❌ FAIL: ${description}\n   Error: ${err.message}`);
    throw err;
  }
}

// 1. Structured Metadata Priority Tests (JSON-LD & OpenGraph)
runTest('Extracts images first from schema.org/Product JSON-LD image array', () => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": "Square D HOM2100 Circuit Breaker",
            "image": [
              "https://images.oem-electrical.com/products/HOM2100_primary_1200x1200.jpg",
              "https://images.oem-electrical.com/products/HOM2100_angle_1000x1000.jpg"
            ]
          }
        </script>
        <meta property="og:image" content="https://images.oem-electrical.com/og/HOM2100_og.jpg" />
      </head>
      <body>
        <div class="product-gallery">
          <img src="https://images.oem-electrical.com/dom/HOM2100_gallery.jpg" width="800" height="800" />
        </div>
      </body>
    </html>
  `;

  const result = imageExtractorService.extractProductImages(html, 'https://oem-electrical.com', {
    partNumber: 'HOM2100',
    title: 'Square D HOM2100 Circuit Breaker',
  });
  assert.ok(result.hasActualImage, 'Has actual image');
  assert.ok(result.primaryImage, 'Primary image exists');
  assert.strictEqual(result.primaryImage.source, 'json-ld', 'Primary image came from JSON-LD');
  assert.strictEqual(result.primaryImage.url, 'https://images.oem-electrical.com/products/HOM2100_primary_1200x1200.jpg');
});

runTest('Extracts ImageObject with contentUrl and dimensions from JSON-LD', () => {
  const html = `
    <html>
      <head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@type": "Product",
            "image": {
              "@type": "ImageObject",
              "contentUrl": "https://cdn.diablotools.com/DCB518ASTS06G_highres_1500x1500.jpg",
              "width": 1500,
              "height": 1500
            }
          }
        </script>
      </head>
    </html>
  `;

  const result = imageExtractorService.extractProductImages(html, 'https://diablotools.com', {
    partNumber: 'DCB518ASTS06G',
    title: 'Diablo Sanding Belt Pack DCB518ASTS06G',
  });
  assert.ok(result.primaryImage, 'Primary image extracted');
  assert.strictEqual(result.primaryImage.url, 'https://cdn.diablotools.com/DCB518ASTS06G_highres_1500x1500.jpg');
  assert.strictEqual(result.primaryImage.width, 1500);
  assert.strictEqual(result.primaryImage.height, 1500);
});

// 2. DOM Scope & Container Isolation Tests
runTest('Strictly isolates primary product media containers and discards recommendation/related product images', () => {
  const html = `
    <html>
      <body>
        <!-- Header to strip -->
        <header>
          <img src="https://site.com/header-logo.png" width="400" height="400" />
        </header>

        <!-- Primary Product Gallery -->
        <div class="product-media-gallery" data-gallery="pdp-main">
          <img src="https://site.com/products/HOM2100_main_breaker_1200x1200.jpg" width="1200" height="1200" alt="Main Breaker" />
          <img src="https://site.com/products/HOM2100_side_detail_1000x1000.jpg" width="1000" height="1000" alt="Side Detail" />
        </div>

        <!-- Recommended / Related Products that MUST be purged -->
        <div class="recommended-products-carousel">
          <h3>Customers Also Bought</h3>
          <img src="https://site.com/products/unrelated_safety_glasses_800x800.jpg" width="800" height="800" />
          <img src="https://site.com/products/unrelated_ear_muffs_800x800.jpg" width="800" height="800" />
        </div>

        <!-- Cross-sell sidebar that MUST be purged -->
        <div class="upsell-cross-sell-section">
          <img src="https://site.com/products/unrelated_power_drill_800x800.jpg" width="800" height="800" />
        </div>

        <!-- Also-viewed container -->
        <div class="also-viewed-similar-items">
          <img src="https://site.com/products/unrelated_router_bit_800x800.jpg" width="800" height="800" />
        </div>

        <!-- Footer to strip -->
        <footer>
          <img src="https://site.com/ssl-secure-badge.png" width="300" height="300" />
        </footer>
      </body>
    </html>
  `;

  const result = imageExtractorService.extractProductImages(html, 'https://site.com', {
    partNumber: 'HOM2100',
    title: 'Square D HOM2100 Circuit Breaker',
  });
  assert.ok(result.primaryImage, 'Primary image extracted');
  assert.strictEqual(result.primaryImage.url, 'https://site.com/products/HOM2100_main_breaker_1200x1200.jpg');

  // Verify none of the recommended, upsell, or cross-sell images are captured
  const allUrls = result.allValidImages.map((i) => i.url);
  assert.ok(!allUrls.some((u) => u.includes('unrelated_safety_glasses')), 'Purged safety glasses');
  assert.ok(!allUrls.some((u) => u.includes('unrelated_ear_muffs')), 'Purged ear muffs');
  assert.ok(!allUrls.some((u) => u.includes('unrelated_power_drill')), 'Purged power drill');
  assert.ok(!allUrls.some((u) => u.includes('unrelated_router_bit')), 'Purged router bit');
  assert.ok(!allUrls.some((u) => u.includes('header-logo')), 'Purged header logo');
  assert.ok(!allUrls.some((u) => u.includes('badge')), 'Purged footer badge');
});

// 3. Image Heuristics & Resolution Validation Tests
runTest('Rejects SVGs, tracking pixels, logos, badges, and avatars', () => {
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/vector.svg'), false, 'Rejects SVG');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/pixel.gif?track=1'), false, 'Rejects pixel');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/brand-logo.png'), false, 'Rejects logo');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/trust-badge.jpg'), false, 'Rejects badge');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/user-avatar.jpg'), false, 'Rejects avatar');
});

runTest('Rejects images smaller than 300x300 pixels', () => {
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/thumb_150x150.jpg', 150, 150), false, 'Rejects 150x150');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/thumb_250x250.jpg', 250, 250), false, 'Rejects 250x250');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/valid_400x400.jpg', 400, 400), true, 'Accepts 400x400');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/valid_1200x1200.jpg', 1200, 1200), true, 'Accepts 1200x1200');
});

runTest('Rejects images with extreme aspect ratio (> 2.5)', () => {
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/banner_1200x200.jpg', 1200, 200), false, 'Rejects banner aspect ratio 6.0');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/tall_strip_200x1000.jpg', 200, 1000), false, 'Rejects tall strip aspect ratio 5.0');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/normal_1200x800.jpg', 1200, 800), true, 'Accepts normal aspect ratio 1.5');
  assert.strictEqual(imageExtractorService.isValidProductImage('https://site.com/square_800x800.jpg', 800, 800), true, 'Accepts square aspect ratio 1.0');
});

// 4. Product-Specific Relevance & Conflicting Tool Rejection (Diablo DCB518ASTS06G Case)
runTest('Strictly eliminates unrelated product images (screws, extension rods) and retains only genuine SKU photos', () => {
  const candidateImages = [
    { url: 'https://static.zoro.com/img/screws/anchor_screw_1000x1000.jpg', width: 1000, height: 1000, alt: 'Anchor Screw' },
    { url: 'https://static.zoro.com/img/extension/extension_rod_1200x1200.jpg', width: 1200, height: 1200, alt: 'Extension Rod' },
    { url: 'https://static.zoro.com/img/abrasives/diablo_dcb518asts06g_sanding_belts_1200x1200.jpg', width: 1200, height: 1200, alt: 'Diablo DCB518ASTS06G Sanding Belts' },
    { url: 'https://static.zoro.com/img/abrasives/DCB518ASTS06G_packaging_1000x1000.jpg', width: 1000, height: 1000, alt: 'DCB518ASTS06G Packaging' },
  ];

  const context = {
    partNumber: 'DCB518ASTS06G',
    manufacturer: 'Freud Inc',
    brand: 'Diablo',
    title: 'Diablo 1/2" x 18" Detail File Sanding Belt Assorted Pack (6-pc) DCB518ASTS06G',
    category: 'Industrial > Abrasives > Sanding Belts',
  };

  const result = imageExtractorService.validateAndRankImages(candidateImages, '', context);

  // Exactly 2 genuine sanding belt images should be retained (the screws and extension rod must be rejected!)
  assert.strictEqual(result.allValidImages.length, 2, 'Retained exactly 2 genuine sanding belt images');
  assert.strictEqual(result.primaryImage?.url, 'https://static.zoro.com/img/abrasives/diablo_dcb518asts06g_sanding_belts_1200x1200.jpg');
  assert.strictEqual(result.alternateImages.length, 1, 'Only 1 alternate packaging photo');
  assert.strictEqual(result.alternateImages[0]?.url, 'https://static.zoro.com/img/abrasives/DCB518ASTS06G_packaging_1000x1000.jpg');

  // Verify screws and extension rod were purged
  const allUrls = result.allValidImages.map((i) => i.url);
  assert.ok(!allUrls.some((u) => u.includes('anchor_screw')), 'Anchor screw purged');
  assert.ok(!allUrls.some((u) => u.includes('extension_rod')), 'Extension rod purged');
});

// 5. Single Image Rule: If only single image related to product, show ONLY 1 (0 alternates)
runTest('Outputs ONLY 1 image (0 alternates) when only a single image is genuinely related to product', () => {
  const candidateImages = [
    { url: 'https://site.com/products/HOM2100_Circuit_Breaker_1200x1200.jpg', width: 1200, height: 1200, alt: 'HOM2100 Circuit Breaker' },
    { url: 'https://site.com/products/unrelated_extension_cord_1000x1000.jpg', width: 1000, height: 1000, alt: 'Extension Cord' },
    { url: 'https://site.com/products/unrelated_work_glove_800x800.jpg', width: 800, height: 800, alt: 'Work Glove' },
  ];

  const context = {
    partNumber: 'HOM2100',
    manufacturer: 'Square D',
    brand: 'Schneider Electric',
    title: 'Square D HOM2100 100A 2-Pole Circuit Breaker',
    category: 'Electrical > Distribution > Circuit Breakers',
  };

  const result = imageExtractorService.validateAndRankImages(candidateImages, '', context);

  assert.strictEqual(result.allValidImages.length, 1, 'Exactly 1 image retained');
  assert.ok(result.primaryImage, 'Primary image exists');
  assert.strictEqual(result.primaryImage.url, 'https://site.com/products/HOM2100_Circuit_Breaker_1200x1200.jpg');
  assert.strictEqual(result.alternateImages.length, 0, 'Zero alternate images (strictly 0, not padded)');
});

console.log('\n=== Image Extractor Test Suite Completed Successfully ===');
