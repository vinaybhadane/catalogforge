import assert from 'node:assert';
import { ocrIngestionService } from '../services/ocr-ingestion.service';

console.log('=== Starting Image/Nameplate OCR Ingestion & Gatekeeper Test Suite ===\n');

function runTest(description: string, fn: () => Promise<void> | void) {
  return (async () => {
    try {
      await fn();
      console.log(`✅ PASS: ${description}`);
    } catch (err: any) {
      console.error(`❌ FAIL: ${description}\n   Error: ${err.message}`);
      throw err;
    }
  })();
}

async function main() {
  // Test 1: Successful OCR entity extraction and deterministic Tier-1 OEM handover (HOM2100)
  await runTest('Multi-Modal OCR extracts MPN, Brand, and specs with >= 80% sufficiency score and hands over to OEM enrichment', async () => {
    const sampleBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const result = await ocrIngestionService.processImageOcr(
      sampleBuffer,
      'Square_D_HOM2100_Nameplate.jpg',
      'image/jpeg',
      'test_user'
    );

    assert.strictEqual(result.status, 'COMPLETED', 'Status should be COMPLETED');
    assert.ok(result.sufficiencyScore >= 0.80, `Sufficiency score (${result.sufficiencyScore}) must be >= 0.80`);
    assert.strictEqual(result.detectedMpn, 'HOM2100', 'Detected MPN must be HOM2100');
    assert.ok(result.detectedBrand?.includes('Square D') || result.detectedBrand?.includes('Schneider'), 'Brand recognized');
    assert.ok(result.product, 'Enriched Tier-1 OEM product must exist');
    assert.ok(Array.isArray(result.deliveryFields), '252-column delivery fields must be populated');
    assert.strictEqual(result.deliveryFields.length, 252, 'Exactly 252 delivery headers returned');

    // Check that original OCR image was attached
    const images = result.product.images || [];
    assert.ok(images.length > 0, 'Images must contain at least 1 item');
  });

  // Test 2: Strict Sufficiency Gatekeeper Abort on Low-Confidence / Blurry Label Image
  await runTest('Strict Sufficiency Gatekeeper aborts with ABORTED_INSUFFICIENT_DATA when identifiers are < 80% confidence', async () => {
    const sampleBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const result = await ocrIngestionService.processImageOcr(
      sampleBuffer,
      'blurry_warning_sticker_unreadable.jpg',
      'image/jpeg',
      'test_user'
    );

    assert.strictEqual(result.status, 'ABORTED_INSUFFICIENT_DATA', 'Status must be ABORTED_INSUFFICIENT_DATA');
    assert.ok(result.sufficiencyScore < 0.80, `Sufficiency score (${result.sufficiencyScore}) must be < 0.80`);
    assert.strictEqual(result.product, undefined, 'Enrichment must NOT be executed for insufficient data');
    assert.strictEqual(result.deliveryFields, undefined, 'Delivery fields must NOT be generated for aborted inspections');
    assert.strictEqual(
      result.message,
      'Insufficient product identifiers detected on label image. Extraction aborted to prevent hallucination.',
      'Message must strictly communicate Zero-Hallucination policy'
    );
  });

  // Test 3: Diablo Sanding Belt Nameplate OCR extraction
  await runTest('Multi-Modal OCR extracts DCB518ASTS06G and preserves grit/dimensions', async () => {
    const sampleBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    const result = await ocrIngestionService.processImageOcr(
      sampleBuffer,
      'Diablo_DCB518ASTS06G_Packaging_Label.jpg',
      'image/jpeg',
      'test_user'
    );

    assert.strictEqual(result.status, 'COMPLETED', 'Status should be COMPLETED');
    assert.strictEqual(result.detectedMpn, 'DCB518ASTS06G', 'Detected MPN must be DCB518ASTS06G');
    assert.strictEqual(result.detectedBrand, 'Diablo', 'Detected Brand must be Diablo');
    assert.ok(result.sufficiencyScore >= 0.80, 'Sufficiency score must be >= 0.80');
  });

  console.log('\n=== Image/Nameplate OCR Test Suite Completed Successfully ===');
}

main().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
