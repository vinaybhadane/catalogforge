import * as xlsx from 'xlsx';
import path from 'path';
import { deliveryExporterService, DELIVERY_HEADERS } from '../services/delivery-exporter.service';

function runTest() {
  const goldenPath = path.resolve(__dirname, '../../../../../Unihack_Expected_Output_Delivery_Format.xlsx');
  const goldenWb = xlsx.readFile(goldenPath);
  const goldenSheet = goldenWb.Sheets[goldenWb.SheetNames[0]!];
  const goldenHeaders = (xlsx.utils.sheet_to_json(goldenSheet!, { header: 1 })[0] as string[]) || [];

  console.log('Golden headers count:', goldenHeaders.length);
  console.log('Service headers count:', DELIVERY_HEADERS.length);

  if (goldenHeaders.length !== DELIVERY_HEADERS.length) {
    throw new Error(`Length mismatch: expected ${goldenHeaders.length} but got ${DELIVERY_HEADERS.length}`);
  }

  let mismatches = 0;
  for (let i = 0; i < goldenHeaders.length; i++) {
    if (goldenHeaders[i] !== DELIVERY_HEADERS[i]) {
      console.error(`Mismatch at [${i}]: expected "${goldenHeaders[i]}" != got "${DELIVERY_HEADERS[i]}"`);
      mismatches++;
    }
  }

  if (mismatches > 0) {
    throw new Error(`Total header mismatches: ${mismatches}`);
  }

  console.log('✓ 100% PERFECT MATCH: All 252 headers match exactly in order!');

  const mockCtx = {
    product: {
      productId: '1',
      partNumber: 'SKU-fc3afb',
      manufacturerName: 'Whirlpool Corporation',
      brandName: 'Whirlpool®',
      manufacturerPartNumber: 'SKU-fc3afb',
      classpath: 'Industrial Supplies > General Industrial > Industrial Components',
      unspsc: '40151500',
      descriptions: {
        shortDescription: 'Whirlpool® Professional Series SKU-fc3afb',
        longDescription: 'Whirlpool® Industrial Hardware & Fasteners...',
        mobileDescription: 'Whirlpool Corporation Whirlpool, Industrial Hardware & Fasteners',
        invoiceDescription: 'INDUSTRIAL HARDWARE & FASTENERS',
        retailDescription: 'Whirlpool® Industrial Hardware & Fasteners, SKU-fc3afb',
        marketingDescription: 'Engineered for heavy-duty industrial use.',
        bulletPoints: ['Precision manufactured to Whirlpool® performance standards'],
      },
      attributes: [
        { sequence: 1, attributeLabel: 'Size', attributeValue: 'Standard Industrial', attributeUom: 'N/A', validationFlags: [], lovMatchConfidence: 0.95, confidenceScore: 0.95, sourceEvidenceId: null },
        { sequence: 2, attributeLabel: 'Material', attributeValue: 'Industrial Grade Metal/Plastic', attributeUom: 'N/A', validationFlags: [], lovMatchConfidence: 0.95, confidenceScore: 0.95, sourceEvidenceId: null },
        { sequence: 3, attributeLabel: 'Mounting Type', attributeValue: 'Standard', attributeUom: 'N/A', validationFlags: [], lovMatchConfidence: 0.95, confidenceScore: 0.95, sourceEvidenceId: null },
      ],
      features: [],
      dimensions: null,
      assets: [],
      rawInputId: null,
      upc: null,
      ean: null,
      gtin: null,
      countryOfOrigin: 'United States',
      discontinued: false,
      actualImage: true,
      rowConfidence: 0.95,
      status: 'published' as const,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    rawInput: {
      dept: '',
      class: '',
      fine: '',
      sku_my_part_number: 'SKU-FC3AFB',
      mfg_part_num: 'SKU-fc3afb',
      part_desc: 'Whirlpool® Professional Series SKU-fc3afb',
      part_manuf: 'Whirlpool Corporation',
    },
  };

  const buf = deliveryExporterService.exportToExcel([mockCtx]);
  const genWb = xlsx.read(buf, { type: 'buffer' });
  const genSheet = genWb.Sheets[genWb.SheetNames[0]!]!;
  const genHeaders = xlsx.utils.sheet_to_json(genSheet, { header: 1 })[0] as string[];
  const rows = xlsx.utils.sheet_to_json(genSheet) as any[];

  console.log('✓ Generated Sheet Name:', genWb.SheetNames[0]);
  console.log('✓ Generated Columns Count:', genHeaders.length);
  console.log('✓ Sample Row PART_NUMBER:', rows[0]['PART_NUMBER']);
  console.log('✓ Sample Row SKU - MY_PART_NUMBER:', rows[0]['SKU - MY_PART_NUMBER']);
  console.log('✓ Sample Row ATTRIBUTE_LABEL 1:', rows[0]['ATTRIBUTE_LABEL 1']);
  console.log('✓ Sample Row ATTRIBUTE_VALUE 1:', rows[0]['ATTRIBUTE_VALUE 1']);
  console.log('✓ Sample Row ATTRIBUTE_UOM 1:', rows[0]['ATTRIBUTE_UOM 1']);
  console.log('✓ Sample Row UNSPSC:', rows[0]['UNSPSC']);
  console.log('✓ Sample Row Product Image:', rows[0]['Product Image']);
  console.log('✓ Sample Row Specification Sheet:', rows[0]['Specification Sheet']);

  // ==========================================
  // Test: Dishwasher Taxonomy Resolution
  // ==========================================
  console.log('\n--- Testing Dishwasher Taxonomy Resolution ---');
  const dishwasherCtx = {
    product: {
      productId: 'dw-1',
      partNumber: 'KDFM404KPS',
      manufacturerName: 'KitchenAid',
      brandName: 'KitchenAid',
      manufacturerPartNumber: 'KDFM404KPS',
      classpath: null,
      unspsc: null,
      descriptions: {
        shortDescription: 'KitchenAid KDFM404KPS Built-In Dishwasher Stainless Steel',
        longDescription: 'Top control built-in dishwasher with third rack and printshield finish',
        mobileDescription: null,
        invoiceDescription: 'DISHWASHER BUILT IN',
        retailDescription: null,
        marketingDescription: null,
        bulletPoints: [],
      },
      attributes: [],
      features: [],
      dimensions: null,
      assets: [],
      rawInputId: null,
      upc: null,
      ean: null,
      gtin: null,
      countryOfOrigin: null,
      discontinued: false,
      actualImage: false,
      rowConfidence: 0.95,
      status: 'published' as const,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    rawInput: {
      dept: '',
      class: '',
      fine: '',
      part_desc: 'KDFM404KPS Dishwasher SS',
      mfg_part_num: 'KDFM404KPS',
    },
  };

  const dwRow = deliveryExporterService.buildDeliveryRow(dishwasherCtx);
  console.log('Dishwasher Dept:', dwRow['Dept']);
  console.log('Dishwasher Class:', dwRow['Class']);
  console.log('Dishwasher Fine:', dwRow['Fine']);

  if (dwRow['Dept'] !== 'appliances') {
    throw new Error(`Expected dishwasher Dept to be 'appliances' but got '${dwRow['Dept']}'`);
  }
  if (dwRow['Class'] !== 'large appliances') {
    throw new Error(`Expected dishwasher Class to be 'large appliances' but got '${dwRow['Class']}'`);
  }
  if (dwRow['Fine'] !== 'dishwasher') {
    throw new Error(`Expected dishwasher Fine to be 'dishwasher' but got '${dwRow['Fine']}'`);
  }
  console.log('✓ PASS: Dishwasher mapped to Dept: appliances, Class: large appliances, Fine: dishwasher');

  // ==========================================
  // Test: Multi-Product Export Sorted by Department
  // ==========================================
  console.log('\n--- Testing Multi-Product Export Sorted by Department ---');
  const circuitBreakerCtx = {
    product: {
      productId: 'cb-1',
      partNumber: 'HOM120',
      manufacturerName: 'Square D',
      brandName: 'Homeline',
      manufacturerPartNumber: 'HOM120',
      classpath: null,
      unspsc: null,
      descriptions: {
        shortDescription: 'Square D Homeline HOM120 Circuit Breaker 20A 1-Pole',
        longDescription: 'Miniature circuit breaker 120V 20A',
        mobileDescription: null,
        invoiceDescription: 'CKT BKR 120V 20A',
        retailDescription: null,
        marketingDescription: null,
        bulletPoints: [],
      },
      attributes: [],
      features: [],
      dimensions: null,
      assets: [],
      rawInputId: null,
      upc: null,
      ean: null,
      gtin: null,
      countryOfOrigin: null,
      discontinued: false,
      actualImage: false,
      rowConfidence: 0.95,
      status: 'published' as const,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    rawInput: {
      dept: '',
      class: '',
      fine: '',
      part_desc: 'HOM120 Circuit Breaker 1-Pole',
    },
  };

  const abrasiveCtx = {
    product: {
      productId: 'ab-1',
      partNumber: 'DCB518ASTS06G',
      manufacturerName: 'Freud Inc',
      brandName: 'Diablo',
      manufacturerPartNumber: 'DCB518ASTS06G',
      classpath: null,
      unspsc: null,
      descriptions: {
        shortDescription: 'Diablo Sanding Belt 1/2 in x 18 in',
        longDescription: 'Cloth abrasive sanding belt 6 pack',
        mobileDescription: null,
        invoiceDescription: 'SNDG BELT',
        retailDescription: null,
        marketingDescription: null,
        bulletPoints: [],
      },
      attributes: [],
      features: [],
      dimensions: null,
      assets: [],
      rawInputId: null,
      upc: null,
      ean: null,
      gtin: null,
      countryOfOrigin: null,
      discontinued: false,
      actualImage: false,
      rowConfidence: 0.95,
      status: 'published' as const,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    rawInput: {
      dept: '',
      class: '',
      fine: '',
      part_desc: 'DCB518ASTS06G Sanding Belt 6pc',
    },
  };

  // Pass in mixed order: Circuit Breaker (electrical), Dishwasher (appliances), Abrasive Belt (abrasives)
  const multiExportBuf = deliveryExporterService.exportToExcel([circuitBreakerCtx, dishwasherCtx, abrasiveCtx]);
  const multiWb = xlsx.read(multiExportBuf, { type: 'buffer' });
  const multiSheet = multiWb.Sheets[multiWb.SheetNames[0]!]!;
  const multiRows = xlsx.utils.sheet_to_json(multiSheet) as any[];

  console.log('Sorted export row count:', multiRows.length);
  multiRows.forEach((r, i) => {
    console.log(`Row ${i}: Dept = "${r['Dept']}", Class = "${r['Class']}", Fine = "${r['Fine']}", Part = "${r['PART_NUMBER']}"`);
  });

  if (multiRows.length !== 3) {
    throw new Error(`Expected 3 rows but got ${multiRows.length}`);
  }

  if (multiRows[0]['Dept'] !== 'abrasives') {
    throw new Error(`Expected row 0 Dept to be 'abrasives' but got '${multiRows[0]['Dept']}'`);
  }
  if (multiRows[1]['Dept'] !== 'appliances') {
    throw new Error(`Expected row 1 Dept to be 'appliances' but got '${multiRows[1]['Dept']}'`);
  }
  if (multiRows[2]['Dept'] !== 'electrical') {
    throw new Error(`Expected row 2 Dept to be 'electrical' but got '${multiRows[2]['Dept']}'`);
  }

  console.log('✓ PASS: Export rows strictly sorted alphabetically by Department (abrasives -> appliances -> electrical)!');
}

runTest();

