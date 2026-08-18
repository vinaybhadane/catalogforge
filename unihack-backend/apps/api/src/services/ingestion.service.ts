/**
 * Ingestion Service
 * Orchestrates file upload parsing, schema validation, placeholder sanitization,
 * raw input persistence, and preflight analysis generation.
 */

import { PreflightPlaceholderFlag, PreflightReport, ProcessingJob } from '@unihack/contracts';
import { URL } from 'url';
import { ValidationError } from '../errors/app-errors';
import { jobRepository } from '../repositories/job.repository';
import { masterDataRepository } from '../repositories/master-data.repository';
import { rawInputRepository } from '../repositories/raw-input.repository';
import { aiPipelineService } from './ai-pipeline.service';
import { fileParser, ParsedRawRow } from './file-parser.service';
import { placeholderDetector } from './placeholder-detector.service';

export class IngestionService {
  /**
   * Processes multipart file upload, performs pre-flight scan, and extracts product intelligence
   */
  async processFileUpload(
    buffer: Buffer,
    fileName: string,
    user: string,
  ): Promise<{ job: ProcessingJob; preflight: PreflightReport }> {
    if (!buffer || buffer.length === 0) {
      throw new ValidationError('Uploaded file is empty.');
    }

    // 1. Parse spreadsheet or PDF buffer
    const parseResult = await fileParser.parseBuffer(buffer, fileName);
    const { schemaReport, rows } = parseResult;

    if (rows.length === 0) {
      throw new ValidationError('The file contains no readable data rows.');
    }

    // 2. Scan and sanitize placeholders row-by-row
    const sanitizedRows: ParsedRawRow[] = [];
    const allFlags: PreflightPlaceholderFlag[] = [];
    const affectedRowSet = new Set<number>();
    const warnings: string[] = [];
    const errors: string[] = [];

    if (!schemaReport.valid) {
      errors.push(
        `File header schema is missing critical identifier columns: [${schemaReport.missingColumns.join(', ')}]`,
      );
    }

    if (schemaReport.extraColumns.length > 0) {
      warnings.push(
        `Unrecognized non-canonical columns ignored: [${schemaReport.extraColumns.join(', ')}]`,
      );
    }

    rows.forEach((row, idx) => {
      const rowNumber = idx + 2; // Accounting for 1-based index and header row
      const { cleaned, flags } = placeholderDetector.scanRecord(row as unknown as Record<string, unknown>, rowNumber);

      if (flags.length > 0) {
        affectedRowSet.add(rowNumber);
        allFlags.push(...flags);
      }

      sanitizedRows.push(cleaned as unknown as ParsedRawRow);
    });

    if (allFlags.length > 0) {
      warnings.push(
        `Detected and sanitized ${allFlags.length} placeholder values across ${affectedRowSet.size} rows to NULL.`,
      );
    }

    const ext = fileName.toLowerCase().split('.').pop();
    const sourceType = ext === 'csv' ? 'csv_upload' : ext === 'pdf' ? 'pdf_upload' : 'xlsx_upload';

    // 3. Create Ingestion Job
    const job = await jobRepository.createJob({
      fileName,
      sourceType,
      rowCount: sanitizedRows.length,
      status: errors.length > 0 ? 'failed' : 'queued',
      stage: errors.length > 0 ? 'failed' : 'ingested',
      submittedBy: user,
    });

    // 4. Persist 11-column raw input rows
    const insertedRawIds = await rawInputRepository.insertBatch(job.jobId, sanitizedRows);

    // 5. Automatically extract, classify, normalize and persist products into Azure SQL
    if (errors.length === 0) {
      for (let i = 0; i < sanitizedRows.length; i++) {
        const raw = sanitizedRows[i]!;
        const rawInputId = insertedRawIds?.[i]?.id;
        try {
          const enriched = aiPipelineService.processRawInput({
            part_number: raw.part_number || raw.mfg_part_num || `PART-${i + 1}`,
            manufacturer: raw.part_manuf || undefined,
            brand: raw.e1_brand || raw.unilog_brand || raw.dib_brand || undefined,
            mfg_part_num: raw.mfg_part_num || undefined,
            part_title: raw.part_desc || undefined,
            short_description: raw.part_desc || undefined,
            long_description: raw.part_desc || undefined,
            category_name: raw.dept || raw.class || raw.fine || undefined,
            specs: raw.part_desc || undefined,
          });
          await aiPipelineService.persistProduct(enriched, rawInputId);
        } catch (err) {
          console.error('[Ingestion] Pipeline extraction error on row:', i, err);
        }
      }

      // Update job stage to completed
      await jobRepository.updateJob(job.jobId, {
        status: 'completed',
        stage: 'published',
        processedRows: sanitizedRows.length,
      });
    }

    // 6. Generate and persist preflight analysis report
    const preflightReport: PreflightReport = {
      jobId: job.jobId,
      status: errors.length > 0 ? 'failed' : 'completed',
      fileName,
      rowCount: sanitizedRows.length,
      schema: schemaReport,
      placeholderScan: {
        completed: true,
        affectedRows: affectedRowSet.size,
        totalPlaceholdersFound: allFlags.length,
        flags: allFlags.slice(0, 100), // Cap flag array for compact transfer
      },
      warnings,
      errors,
      createdAt: new Date().toISOString(),
    };

    await jobRepository.savePreflightReport(job.jobId, preflightReport);

    return {
      job,
      preflight: preflightReport,
    };
  }

  /**
   * Processes manufacturer source URL or PDF document ingestion
   */
  async processUrlIngestion(
    targetUrl: string,
    user: string,
    partNumber?: string | null,
    manufacturer?: string | null,
  ): Promise<ProcessingJob> {
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      throw new ValidationError(`Invalid URL format: '${targetUrl}'`);
    }

    // Check domain allowlist
    const hostname = parsedUrl.hostname;
    const isAllowed = await masterDataRepository.isDomainAllowed(hostname);

    if (!isAllowed) {
      throw new ValidationError(
        `Domain '${hostname}' is not in the approved manufacturer domain allowlist. External sourcing is restricted to authorized domains.`,
      );
    }

    const job = await jobRepository.createJob({
      fileName: targetUrl,
      sourceType: 'url_ingestion',
      rowCount: 1,
      status: 'queued',
      stage: 'retrieval',
      submittedBy: user,
    });

    // Insert dummy single row into raw_input for URL
    await rawInputRepository.insertBatch(job.jobId, [
      {
        part_number: partNumber || null,
        dept: null,
        class: null,
        fine: null,
        sku_my_part_number: null,
        mfg_part_num: partNumber || null,
        part_desc: null,
        e1_brand: null,
        unilog_brand: null,
        dib_brand: null,
        part_manuf: manufacturer || null,
      },
    ]);

    return job;
  }
}

export const ingestionService = new IngestionService();
