/**
 * Automated Verification Script for Head-Check URL Health & Dead-Link Suppression
 */

import { urlHealthVerifierService } from './src/services/url-health-verifier.service';
import { deliveryExporterService, DELIVERY_HEADERS } from './src/services/delivery-exporter.service';
import assert from 'assert';

async function runTests() {
  console.log('🧪 Starting Automated Head-Check URL Health & Dead-Link Suppression Tests...\n');

  // Test 1: Verification of live valid URLs
  console.log('Test 1: Live valid URLs...');
  const liveCheck = await urlHealthVerifierService.verifyUrl('https://www.google.com', { expectedType: 'any' });
  console.log('Live Google Check:', { isValid: liveCheck.isValid, statusCode: liveCheck.statusCode });
  assert.strictEqual(liveCheck.isValid, true, 'Google should be a valid live URL');

  // Test 2: Dead / 404 Link Suppression
  console.log('Test 2: Dead / 404 Link Suppression...');
  const deadCheck = await urlHealthVerifierService.verifyUrl('https://httpstat.us/404', { expectedType: 'any' });
  console.log('404 Check:', { isValid: deadCheck.isValid, statusCode: deadCheck.statusCode, error: deadCheck.error });
  assert.strictEqual(deadCheck.isValid, false, '404 must be marked invalid');

  // Test 3: 500 Error Link Suppression
  console.log('Test 3: 500 Error Link Suppression...');
  const error500Check = await urlHealthVerifierService.verifyUrl('https://httpstat.us/500', { expectedType: 'any' });
  console.log('500 Check:', { isValid: error500Check.isValid, statusCode: error500Check.statusCode });
  assert.strictEqual(error500Check.isValid, false, '500 must be marked invalid');

  // Test 4: Malformed / Non-HTTP URLs
  console.log('Test 4: Malformed URL Handling...');
  const badUrlCheck = await urlHealthVerifierService.verifyUrl('not-a-url', { expectedType: 'any' });
  assert.strictEqual(badUrlCheck.isValid, false, 'Non-HTTP string must be invalid');

  const emptyUrlCheck = await urlHealthVerifierService.verifyUrl('', { expectedType: 'any' });
  assert.strictEqual(emptyUrlCheck.isValid, false, 'Empty string must be invalid');

  // Test 5: Image Content-Type Verification vs HTML Error Pages
  console.log('Test 5: Image Content-Type Validation...');
  // A standard webpage returning text/html must NOT be accepted as an image!
  const htmlAsImageCheck = await urlHealthVerifierService.verifyUrl('https://www.google.com', { expectedType: 'image' });
  console.log('HTML Page checked as Image:', { isValid: htmlAsImageCheck.isValid, error: htmlAsImageCheck.error });
  assert.strictEqual(htmlAsImageCheck.isValid, false, 'HTML page must be rejected as an image asset');

  // Test 6: 252-Column Delivery Row URL Sanitization
  console.log('Test 6: 252-Column Delivery Row URL Sanitization...');
  const rawRow: Record<string, string> = {};
  for (const h of DELIVERY_HEADERS) {
    rawRow[h] = '';
  }

  rawRow['PART_NUMBER'] = 'TEST-SKU-100';
  rawRow['MFR URL'] = 'https://httpstat.us/404'; // Dead MFR link
  rawRow['Ref URL 1'] = 'https://www.google.com'; // Live ref link
  rawRow['Ref URL 2'] = 'https://httpstat.us/500'; // Dead ref link
  rawRow['Product Image'] = 'https://httpstat.us/404'; // Dead image link
  rawRow['Alternate Image 1'] = 'https://www.google.com'; // HTML page masquerading as image -> should be dropped
  rawRow['Specification Sheet'] = 'https://httpstat.us/404'; // Dead PDF link
  rawRow['Actual Image (Yes/No)'] = 'Yes'; // Incorrect initial flag

  const sanitizedRow = await urlHealthVerifierService.sanitizeDeliveryRowUrls(rawRow);

  console.log('Sanitized Row Results:', {
    'MFR URL': sanitizedRow['MFR URL'],
    'Ref URL 1': sanitizedRow['Ref URL 1'],
    'Ref URL 2': sanitizedRow['Ref URL 2'],
    'Product Image': sanitizedRow['Product Image'],
    'Alternate Image 1': sanitizedRow['Alternate Image 1'],
    'Specification Sheet': sanitizedRow['Specification Sheet'],
    'Actual Image (Yes/No)': sanitizedRow['Actual Image (Yes/No)'],
  });

  assert.strictEqual(sanitizedRow['MFR URL'], '', 'Dead MFR URL must be suppressed to ""');
  assert.strictEqual(sanitizedRow['Ref URL 1'], 'https://www.google.com', 'Live Ref URL must be retained');
  assert.strictEqual(sanitizedRow['Ref URL 2'], '', 'Dead Ref URL must be suppressed to ""');
  assert.strictEqual(sanitizedRow['Product Image'], '', 'Dead Product Image must be suppressed to ""');
  assert.strictEqual(sanitizedRow['Alternate Image 1'], '', 'HTML page as image must be suppressed to ""');
  assert.strictEqual(sanitizedRow['Specification Sheet'], '', 'Dead Spec Sheet must be suppressed to ""');
  assert.strictEqual(sanitizedRow['Actual Image (Yes/No)'], 'No', 'Actual Image must be "No" when all images are invalid');

  // Test 7: 252-Column Excel & CSV Binary Generation
  console.log('Test 7: 252-Column Excel & CSV Export Verification...');
  const excelBuffer = deliveryExporterService.exportRowsToExcel([sanitizedRow]);
  assert.ok(excelBuffer.length > 0, 'Excel buffer must be non-empty');

  const csvBuffer = deliveryExporterService.exportRowsToCsv([sanitizedRow]);
  assert.ok(csvBuffer.length > 0, 'CSV buffer must be non-empty');
  const csvText = csvBuffer.toString('utf-8');
  assert.ok(csvText.includes('MFR URL'), 'CSV must include MFR URL header');
  assert.ok(csvText.includes('Actual Image (Yes/No)'), 'CSV must include Actual Image header');

  console.log('\n🎉 ALL 7 AUTOMATED HEAD-CHECK & DEAD-LINK SUPPRESSION TESTS PASSED SUCCESSFULLY!\n');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
