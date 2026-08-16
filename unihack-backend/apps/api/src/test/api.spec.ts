/**
 * Fastify API Comprehensive Integration & Ingestion Test Suite
 */

import FormData from 'form-data';
import { buildApp } from '../app';
import { placeholderDetector } from '../services/placeholder-detector.service';
import { uomNormalizer } from '../services/uom-normalizer.service';

async function runTests() {
  console.log('=== Starting Fastify API & Ingestion Engine Test Suite ===\n');
  const app = await buildApp({ logger: false });
  await app.ready();

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, testName: string, detail?: unknown) => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  };

  try {
    // -------------------------------------------------------------------------
    // 1. Health Endpoints
    // -------------------------------------------------------------------------
    const healthRes = await app.inject({ method: 'GET', url: '/health' });
    assert(healthRes.statusCode === 200, 'GET /health returns 200 OK');
    const healthBody = JSON.parse(healthRes.payload);
    assert(healthBody.status === 'ok', 'GET /health status is ok');

    // -------------------------------------------------------------------------
    // 2. Configuration Endpoints
    // -------------------------------------------------------------------------
    const configRes = await app.inject({ method: 'GET', url: '/api/v1/config' });
    assert(configRes.statusCode === 200, 'GET /api/v1/config returns 200 OK');
    const configBody = JSON.parse(configRes.payload);
    assert(Array.isArray(configBody.upload.allowedExtensions), 'Config includes upload.allowedExtensions');
    assert(configBody.upload.allowedExtensions.includes('csv'), 'Config allowed extensions includes csv');
    assert(configBody.reviewPolicy.confidenceThreshold !== undefined, 'Config includes confidenceThreshold');

    const fieldsRes = await app.inject({ method: 'GET', url: '/api/v1/config/fields' });
    assert(fieldsRes.statusCode === 200, 'GET /api/v1/config/fields returns 200 OK');
    const fieldsBody = JSON.parse(fieldsRes.payload);
    assert(Array.isArray(fieldsBody.fields) && fieldsBody.fields.length > 0, 'Config returns UI field definitions');

    // -------------------------------------------------------------------------
    // 3. Normalizer & Placeholder Detector Unit Tests
    // -------------------------------------------------------------------------
    const ph1 = placeholderDetector.cleanValue('N/A');
    assert(ph1.value === null && ph1.isPlaceholder, 'PlaceholderDetector identifies "N/A" as placeholder');

    const ph2 = placeholderDetector.cleanValue('TBD');
    assert(ph2.value === null && ph2.isPlaceholder, 'PlaceholderDetector identifies "TBD" as placeholder');

    const ph3 = placeholderDetector.cleanValue('Square D');
    assert(ph3.value === 'Square D' && !ph3.isPlaceholder, 'PlaceholderDetector preserves real value "Square D"');

    const uom1 = uomNormalizer.normalizeUom('INCHES');
    assert(uom1 === 'in', 'UomNormalizer standardizes INCHES -> in');

    const frac1 = uomNormalizer.parseFraction('1/2');
    assert(frac1 === 0.5, 'UomNormalizer parses 1/2 -> 0.5');

    const frac2 = uomNormalizer.parseFraction('1-3/4');
    assert(frac2 === 1.75, 'UomNormalizer parses compound fraction 1-3/4 -> 1.75');

    const dim1 = uomNormalizer.parseDimensionString('1/2"');
    assert(dim1.value === 0.5 && dim1.uom === 'in', 'UomNormalizer parses 1/2" -> { value: 0.5, uom: "in" }');

    // -------------------------------------------------------------------------
    // 4. File Upload & Pre-flight Scan Test
    // -------------------------------------------------------------------------
    // Construct sample 11-column CSV with some real data and placeholders
    const sampleCsv = `Part_Number,Dept,Class,Fine,SKU_My_Part_Number,Mfg_Part_Num,Part_Desc,E1_Brand,UniLog_Brand,DIB_Brand,Part_Manuf
HOM2100,Electrical,Distribution,Circuit Breakers,SKU-001,HOM2100,100A 2-Pole Miniature Circuit Breaker,Square D,Square D,Square D,Square D
QO120,Electrical,Distribution,Circuit Breakers,SKU-002,QO120,20A 1-Pole Circuit Breaker,Square D,Square D,Square D,Schneider Electric
BR230,Electrical,Distribution,Circuit Breakers,N/A,BR230,30A 2-Pole Breaker,Eaton,Eaton,Eaton,TBD
DUMMY-01,Tools,Hand Tools,Pliers,-,DUMMY-01,Heavy Duty Diagonal Cutting Pliers,Klein Tools,Klein Tools,none,Klein Tools`;

    const form = new FormData();
    form.append('file', Buffer.from(sampleCsv, 'utf-8'), {
      filename: 'sample_products.csv',
      contentType: 'text/csv',
    });

    const uploadRes = await app.inject({
      method: 'POST',
      url: '/api/v1/ingestion/uploads',
      headers: {
        ...form.getHeaders(),
        authorization: 'Bearer dev-token',
      },
      payload: form.getBuffer(),
    });

    assert(uploadRes.statusCode === 201, 'POST /api/v1/ingestion/uploads returns 201 Created');
    const uploadBody = JSON.parse(uploadRes.payload);
    assert(Boolean(uploadBody.jobId), 'Upload returns valid jobId');
    assert(uploadBody.rowCount === 4, 'Upload detects 4 rows');

    const jobId = uploadBody.jobId;

    // -------------------------------------------------------------------------
    // 5. Pre-flight Analysis Endpoint
    // -------------------------------------------------------------------------
    const preflightRes = await app.inject({
      method: 'GET',
      url: `/api/v1/ingestion/jobs/${jobId}/preflight`,
      headers: { authorization: 'Bearer dev-token' },
    });

    assert(preflightRes.statusCode === 200, 'GET /api/v1/ingestion/jobs/:jobId/preflight returns 200 OK');
    const preflightBody = JSON.parse(preflightRes.payload);
    assert(preflightBody.status === 'completed', 'Preflight report status is completed');
    assert(preflightBody.schema.valid === true, 'Preflight report identifies schema as valid');
    assert(preflightBody.placeholderScan.totalPlaceholdersFound >= 3, 'Preflight report identified placeholder values');

    // -------------------------------------------------------------------------
    // 6. Job Detail Endpoint
    // -------------------------------------------------------------------------
    const jobDetailRes = await app.inject({
      method: 'GET',
      url: `/api/v1/ingestion/jobs/${jobId}`,
      headers: { authorization: 'Bearer dev-token' },
    });

    assert(jobDetailRes.statusCode === 200, 'GET /api/v1/ingestion/jobs/:jobId returns 200 OK');
    const jobDetailBody = JSON.parse(jobDetailRes.payload);
    assert(jobDetailBody.jobId === jobId, 'Job detail returns matching jobId');
    assert(jobDetailBody.fileName === 'sample_products.csv', 'Job detail returns fileName');
    assert(Array.isArray(jobDetailBody.pipeline), 'Job detail includes pipeline stage array');

    // -------------------------------------------------------------------------
    // 7. Job Rows Endpoint
    // -------------------------------------------------------------------------
    const rowsRes = await app.inject({
      method: 'GET',
      url: `/api/v1/ingestion/jobs/${jobId}/rows`,
      headers: { authorization: 'Bearer dev-token' },
    });

    assert(rowsRes.statusCode === 200, 'GET /api/v1/ingestion/jobs/:jobId/rows returns 200 OK');
    const rowsBody = JSON.parse(rowsRes.payload);
    assert(rowsBody.items.length === 4, 'Job rows returns 4 items');
    assert(rowsBody.items[0].partNumber === 'HOM2100', 'First row partNumber is HOM2100');

    // Verify placeholder was sanitized to null
    const row3 = rowsBody.items[2];
    assert(row3.rawInput.skuMyPartNumber === null, 'Row 3 SKU_My_Part_Number was sanitized from "N/A" to NULL');
    assert(row3.rawInput.partManuf === null, 'Row 3 Part_Manuf was sanitized from "TBD" to NULL');

    // -------------------------------------------------------------------------
    // 8. List Jobs Endpoint
    // -------------------------------------------------------------------------
    const listJobsRes = await app.inject({
      method: 'GET',
      url: '/api/v1/ingestion/jobs',
      headers: { authorization: 'Bearer dev-token' },
    });

    assert(listJobsRes.statusCode === 200, 'GET /api/v1/ingestion/jobs returns 200 OK');
    const listJobsBody = JSON.parse(listJobsRes.payload);
    assert(listJobsBody.items.length >= 1, 'Jobs list contains at least 1 job');

    // -------------------------------------------------------------------------
    // 9. URL Ingestion Endpoint
    // -------------------------------------------------------------------------
    const urlIngestRes = await app.inject({
      method: 'POST',
      url: '/api/v1/ingestion/url',
      headers: {
        authorization: 'Bearer dev-token',
        'content-type': 'application/json',
      },
      payload: JSON.stringify({
        url: 'https://se.com/us/en/product/HOM2100/miniature-circuit-breaker',
        partNumber: 'HOM2100',
        manufacturer: 'Square D',
      }),
    });

    assert(urlIngestRes.statusCode === 201, 'POST /api/v1/ingestion/url returns 201 Created');
    const urlIngestBody = JSON.parse(urlIngestRes.payload);
    assert(Boolean(urlIngestBody.jobId), 'URL ingestion returns valid jobId');

    console.log(`\n=== Test Suite Complete: ${passed} Passed, ${failed} Failed ===\n`);
  } finally {
    await app.close();
  }

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
