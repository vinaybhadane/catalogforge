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
}

runTest();
