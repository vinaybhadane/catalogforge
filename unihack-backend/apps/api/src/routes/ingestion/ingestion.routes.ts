/**
 * Ingestion REST API Routes
 * Implements upload, URL ingestion, job status, preflight report, and row queries
 */

import {
  IngestionJobDetailResponse,
  IngestionJobFilterQuery,
  IngestionJobListResponse,
  IngestionJobRowsResponse,
  IngestionUploadResponse,
  PreflightReport,
  UrlIngestionRequest,
  UrlIngestionResponse,
} from '@unihack/contracts';
import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { NotFoundError, ValidationError } from '../../errors/app-errors';
import { authenticate } from '../../middleware/auth.middleware';
import { jobRepository } from '../../repositories/job.repository';
import { rawInputRepository } from '../../repositories/raw-input.repository';
import {
  IngestionJobDetailSchema,
  PreflightReportSchema,
  UploadRouteSchema,
} from '../../schemas/ingestion.schemas';
import { ingestionService } from '../../services/ingestion.service';
import { ocrIngestionService } from '../../services/ocr-ingestion.service';
import { urlHealthVerifierService } from '../../services/url-health-verifier.service';

export const ingestionRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  /**
   * POST /api/v1/ingestion/uploads
   * Uploads spreadsheet (CSV or XLSX) and performs pre-flight scan
   */
  fastify.post<{ Reply: IngestionUploadResponse }>(
    '/uploads',
    {
      preHandler: [authenticate],
      schema: UploadRouteSchema,
    },
    async (request, reply) => {
      const data = await request.file();
      if (!data) {
        throw new ValidationError('No file was uploaded in the multipart request.');
      }

      const buffer = await data.toBuffer();
      const fileName = data.filename;
      const user = request.user?.email || request.user?.uid || 'anonymous';

      const result = await ingestionService.processFileUpload(buffer, fileName, user);

      const response: IngestionUploadResponse = {
        jobId: result.job.jobId,
        status: result.job.status,
        stage: result.job.stage || 'ingested',
        fileName: result.job.fileName || fileName,
        rowCount: result.job.rowCount ?? undefined,
      };

      return reply.status(201).send(response);
    },
  );

  /**
   * GET /api/v1/ingestion/uploads
   * Informational endpoint for browser navigation
   */
  fastify.get(
    '/uploads',
    {
      schema: {
        description: 'Upload endpoint information. To upload datasets, submit a POST request with multipart/form-data.',
        tags: ['Ingestion'],
        summary: 'Upload Endpoint Info',
      },
    },
    async (_request, reply) => {
      return reply.status(200).send({
        service: 'CatalogForge Ingestion Upload API',
        methodRequired: 'POST',
        acceptedFormats: ['.csv', '.xlsx', '.pdf'],
        instructions: 'Submit a POST request with multipart/form-data containing the `file` parameter.',
        uploadEndpoint: 'POST /api/v1/ingestion/uploads',
        jobsEndpoint: 'GET /api/v1/ingestion/jobs',
        webUploadInterface: 'http://localhost:3000/upload',
        swaggerDocsUrl: 'http://localhost:8000/api/docs',
      });
    },
  );

  /**
   * POST /api/v1/ingestion/url
   * Sourcing ingestion from manufacturer domain URL or technical PDF
   */
  fastify.post<{ Body: UrlIngestionRequest; Reply: UrlIngestionResponse }>(
    '/url',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Ingest product intelligence directly from an approved manufacturer URL or datasheet',
        tags: ['Ingestion'],
        summary: 'Ingest from Manufacturer URL',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string', format: 'uri' },
            partNumber: { type: 'string', nullable: true },
            manufacturer: { type: 'string', nullable: true },
          },
        },
      },
    },
    async (request, reply) => {
      const { url, partNumber, manufacturer } = request.body;
      const user = request.user?.email || request.user?.uid || 'anonymous';

      const job = await ingestionService.processUrlIngestion(url, user, partNumber, manufacturer);

      const response: UrlIngestionResponse = {
        jobId: job.jobId,
        status: job.status,
        stage: job.stage || 'retrieval',
        sourceUrl: url,
      };

      return reply.status(201).send(response);
    },
  );

  /**
   * GET /api/v1/ingestion/jobs
   * Paginated list of ingestion batch jobs
   */
  fastify.get<{ Querystring: IngestionJobFilterQuery; Reply: IngestionJobListResponse }>(
    '/jobs',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get paginated list of ingestion batch jobs with status filters',
        tags: ['Ingestion'],
        summary: 'List Ingestion Jobs',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const page = request.query.page ? Number(request.query.page) : 1;
      const pageSize = request.query.pageSize ? Number(request.query.pageSize) : 20;

      const result = await jobRepository.listJobs({
        ...request.query,
        page,
        pageSize,
      });

      const totalPages = Math.ceil(result.total / pageSize);

      const response: IngestionJobListResponse = {
        items: result.items,
        page,
        pageSize,
        total: result.total,
        totalPages,
      };

      return reply.status(200).send(response);
    },
  );

  /**
   * GET /api/v1/ingestion/jobs/:jobId
   * Detailed ingestion job status and progress
   */
  fastify.get<{ Params: { jobId: string }; Reply: IngestionJobDetailResponse }>(
    '/jobs/:jobId',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get detailed processing progress and row metrics for an ingestion job',
        tags: ['Ingestion'],
        summary: 'Get Ingestion Job Detail',
        security: [{ bearerAuth: [] }],
        response: {
          200: IngestionJobDetailSchema,
        },
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;
      const job = await jobRepository.findById(jobId);

      if (!job) {
        throw new NotFoundError('Ingestion Job', jobId);
      }

      const preflight = await jobRepository.getPreflightReport(jobId);

      const response: IngestionJobDetailResponse = {
        jobId: job.jobId,
        fileName: job.fileName,
        sourceType: job.sourceType,
        rowCount: job.rowCount,
        processedRows: job.processedRows,
        publishedRows: job.publishedRows,
        reviewRows: job.reviewRows,
        failedRows: job.failedRows,
        status: job.status,
        stage: job.stage,
        progress: job.progress || 0,
        submittedBy: job.submittedBy,
        submittedAt: job.submittedAt,
        completedAt: job.completedAt,
        updatedAt: job.updatedAt,
        pipeline: [
          { stage: 'queued', status: 'complete' },
          { stage: 'ingested', status: job.stage === 'ingested' ? 'in_progress' : 'complete' },
          { stage: 'classified', status: 'pending' },
          { stage: 'enriched', status: 'pending' },
          { stage: 'validated', status: 'pending' },
        ],
        preflight,
      };

      return reply.status(200).send(response);
    },
  );

  /**
   * GET /api/v1/ingestion/jobs/:jobId/preflight
   * Detailed pre-flight scan results
   */
  fastify.get<{ Params: { jobId: string }; Reply: PreflightReport }>(
    '/jobs/:jobId/preflight',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get pre-flight schema analysis and placeholder scan report',
        tags: ['Ingestion'],
        summary: 'Get Pre-flight Report',
        security: [{ bearerAuth: [] }],
        response: {
          200: PreflightReportSchema,
        },
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;
      const preflight = await jobRepository.getPreflightReport(jobId);

      if (!preflight) {
        throw new NotFoundError('Pre-flight Report for Job', jobId);
      }

      return reply.status(200).send(preflight);
    },
  );

  /**
   * GET /api/v1/ingestion/jobs/:jobId/rows
   * Per-row raw input and processing state
   */
  fastify.get<{
    Params: { jobId: string };
    Querystring: { page?: number; pageSize?: number };
    Reply: IngestionJobRowsResponse;
  }>(
    '/jobs/:jobId/rows',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Get paginated rows of an ingestion job with raw 11-column data',
        tags: ['Ingestion'],
        summary: 'Get Ingestion Job Rows',
        security: [{ bearerAuth: [] }],
      },
    },
    async (request, reply) => {
      const { jobId } = request.params;
      const page = request.query.page ? Number(request.query.page) : 1;
      const pageSize = request.query.pageSize ? Number(request.query.pageSize) : 50;

      const job = await jobRepository.findById(jobId);
      if (!job) {
        throw new NotFoundError('Ingestion Job', jobId);
      }

      const result = await rawInputRepository.findByJobId(jobId, page, pageSize);
      const totalPages = Math.ceil(result.total / pageSize);

      const items = result.items.map((row) => ({
        rowId: row.id,
        jobId: row.jobId,
        partNumber: row.partNumber,
        partDesc: row.partDesc,
        manufacturer: row.partManuf || row.e1Brand || row.unilogBrand,
        stage: job.stage || 'ingested',
        status: job.status,
        rowConfidence: null,
        validationFlags: [],
        rawInput: row,
      }));

      const response: IngestionJobRowsResponse = {
        items,
        page,
        pageSize,
        total: result.total,
        totalPages,
      };

      return reply.status(200).send(response);
    },
  );

  /**
   * POST /api/v1/ingestion/single-product
   * Directly saves a single AI-grounded product into catalog database
   */
  fastify.post<{
    Body: {
      partNumber: string;
      manufacturer?: string;
      brand?: string;
      officialTitle?: string;
      officialDescription?: string;
      classpath?: string;
      features?: string[];
      attributes?: Array<{ label: string; value: string; uom?: string | null; confidence?: number }>;
      assets?: Array<{ assetType: string; fileName: string; sourceUrl: string }>;
    };
  }>(
    '/single-product',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Directly ingest an AI-enriched single product into the catalog',
        tags: ['Ingestion', 'Products'],
        summary: 'Ingest Single Product',
        body: {
          type: 'object',
          required: ['partNumber'],
          properties: {
            partNumber: { type: 'string' },
            manufacturer: { type: 'string' },
            brand: { type: 'string' },
            officialTitle: { type: 'string' },
            officialDescription: { type: 'string' },
            classpath: { type: 'string' },
            features: { type: 'array', items: { type: 'string' } },
            attributes: { type: 'array' },
            assets: { type: 'array' },
          },
        },
      },
    },
    async (request, reply) => {
      const b = request.body;
      if (!b.partNumber || !b.partNumber.trim()) {
        throw new ValidationError('partNumber is required.');
      }

      const { aiPipelineService } = await import('../../services/ai-pipeline.service');

      const productId = await aiPipelineService.persistProduct({
        partNumber: b.partNumber.trim(),
        manufacturerName: b.manufacturer || 'Unknown Manufacturer',
        brandName: b.brand || null,
        manufacturerPartNumber: b.partNumber.trim(),
        classpath: b.classpath || 'Industrial > Abrasives > General',
        shortDesc: (b.officialTitle || b.partNumber).substring(0, 150),
        longDesc1: b.officialDescription || null,
        unspsc: null,
        rowConfidence: 0.95,
        status: 'published',
        features: b.features || [],
        attributes: (b.attributes || []).map((a) => ({
          label: a.label,
          value: a.value,
          uom: a.uom || null,
          confidence: a.confidence || 0.95,
        })),
        assets: (b.assets || []).map((a) => ({
          assetType: a.assetType,
          fileName: a.fileName,
          sourceUrl: a.sourceUrl,
          isFromManufacturer: true,
        })),
      });

      return reply.status(201).send({
        success: true,
        message: 'Product successfully ingested and published.',
        productId,
        partNumber: b.partNumber,
      });
    },
  );

  /**
   * POST /api/v1/ingestion/extract-url
   * Live extracts 252-column product specifications and assets directly from Manufacturer URL
   */
  fastify.post<{
    Body: { url: string; saveToCatalog?: boolean };
  }>(
    '/extract-url',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Live extract verified product intelligence and 252-column delivery specifications from a Manufacturer URL with zero-hallucination policy',
        tags: ['Ingestion', 'Products'],
        summary: 'Extract Product Intelligence from URL',
        body: {
          type: 'object',
          required: ['url'],
          properties: {
            url: { type: 'string' },
            saveToCatalog: { type: 'boolean' },
          },
        },
      },
    },
    async (request, reply) => {
      const { url, saveToCatalog } = request.body;
      if (!url || !url.trim()) {
        throw new ValidationError('URL parameter is required.');
      }

      const { urlExtractorService } = await import('../../services/url-extractor.service');
      const extraction = await urlExtractorService.extractFromUrl(url.trim());

      let savedProductId: number | null = null;
      if (saveToCatalog) {
        const { aiPipelineService } = await import('../../services/ai-pipeline.service');
        savedProductId = await aiPipelineService.persistProduct({
          partNumber: extraction.partNumber,
          manufacturerName: extraction.manufacturerName,
          brandName: extraction.brandName,
          manufacturerPartNumber: extraction.mfgPartNum,
          classpath: extraction.classpath,
          shortDesc: extraction.shortDesc,
          longDesc1: extraction.longDesc1,
          mobileDesc: extraction.mobileDesc,
          invoiceDesc: extraction.invoiceDesc,
          retailDesc: extraction.retailDesc,
          marketingDescription: extraction.marketingDescription,
          unspsc: extraction.unspsc || '40151500',
          upc: extraction.upc,
          ean: extraction.ean,
          gtin: extraction.gtin,
          dimensions: extraction.dimensions,
          countryOfOrigin: extraction.countryOfOrigin,
          discontinued: false,
          actualImage: extraction.images.length > 0,
          rowConfidence: 0.98,
          status: 'published',
          features: extraction.features,
          attributes: extraction.attributes,
          assets: [
            ...extraction.images.map((img) => ({
              assetType: 'image',
              fileName: `${extraction.manufacturerName}_${extraction.partNumber}.jpg`,
              sourceUrl: img.url,
              isFromManufacturer: true,
            })),
            ...extraction.documents.map((doc) => ({
              assetType: doc.assetType,
              fileName: doc.fileName,
              sourceUrl: doc.sourceUrl,
              isFromManufacturer: true,
            })),
          ],
        });
      }

      return reply.status(200).send({
        success: true,
        data: extraction,
        savedProductId,
      });
    },
  );

  /**
   * POST /api/v1/ingestion/extract-url/export-excel
   * Exports a single extracted product URL into the exact 252-column Excel format
   */
  fastify.post<{
    Body: { url: string; deliveryRow?: Record<string, string> };
  }>(
    '/extract-url/export-excel',
    {
      schema: {
        description: 'Export extracted URL product to 252-column delivery Excel spreadsheet (.xlsx)',
        tags: ['Ingestion', 'Export'],
        summary: 'Export Extracted URL to Excel',
      },
    },
    async (request, reply) => {
      const { url, deliveryRow } = request.body;
      const { deliveryExporterService } = await import('../../services/delivery-exporter.service');

      let rowToExport: Record<string, string> = {};

      if (deliveryRow && typeof deliveryRow === 'object') {
        rowToExport = deliveryRow;
      } else if (url) {
        const { urlExtractorService } = await import('../../services/url-extractor.service');
        const extraction = await urlExtractorService.extractFromUrl(url.trim());
        rowToExport = extraction.deliveryRow;
      } else {
        throw new ValidationError('Either `url` or `deliveryRow` must be provided.');
      }

      const buffer = deliveryExporterService.exportRowsToExcel([rowToExport]);

      return reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', 'attachment; filename="Unihack_Extracted_Product_Delivery.xlsx"')
        .send(buffer);
    },
  );

  /**
   * POST /api/v1/ingestion/extract-url/export-csv
   * Exports a single extracted product URL into the exact 252-column CSV format
   */
  fastify.post<{ Body: { url?: string; deliveryRow?: Record<string, string> } }>(
    '/extract-url/export-csv',
    {
      schema: {
        description: 'Export extracted URL product to 252-column delivery CSV spreadsheet (.csv)',
        tags: ['Ingestion', 'Export'],
        summary: 'Export Extracted URL to CSV',
      },
    },
    async (request, reply) => {
      const { url, deliveryRow } = request.body;
      const { deliveryExporterService } = await import('../../services/delivery-exporter.service');

      let rowToExport: Record<string, string> = {};

      if (deliveryRow && typeof deliveryRow === 'object') {
        rowToExport = deliveryRow;
      } else if (url) {
        const { urlExtractorService } = await import('../../services/url-extractor.service');
        const extraction = await urlExtractorService.extractFromUrl(url.trim());
        rowToExport = extraction.deliveryRow;
      } else {
        throw new ValidationError('Either `url` or `deliveryRow` must be provided.');
      }

      const buffer = deliveryExporterService.exportRowsToCsv([rowToExport]);

      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="Unihack_Extracted_Product_Delivery.csv"')
        .send(buffer);
    },
  );

  /**
   * POST /api/v1/ingestion/process-batch-file
   * Enriches multiple products from an uploaded spreadsheet (CSV/XLSX) or PDF with live AI intelligence and 252-column schema
   */
  fastify.post(
    '/process-batch-file',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Upload a batch manufacturer catalog (CSV/XLSX/PDF) to extract live AI product intelligence, images, warranties, and 252-column delivery schemas (quota-guarded to 7 items)',
        tags: ['Ingestion', 'AI Batch'],
        summary: 'Process Batch Catalog File with Live AI Enrichment',
      },
    },
    async (request, reply) => {
      const data = await request.file();
      if (!data) {
        throw new ValidationError('No file was uploaded in the multipart request.');
      }

      const buffer = await data.toBuffer();
      const fileName = data.filename;

      const { batchFileEnricherService } = await import('../../services/batch-file-enricher.service');
      const { emailService } = await import('../../services/email.service');

      const result = await batchFileEnricherService.processBatchFile(buffer, fileName, 7);

      // Resolve recipient email: from query param, authenticated user claims, or configured Brevo default
      const user = (request as any).user;
      const queryEmail = (request.query as any)?.email;
      const queryName = (request.query as any)?.name;
      const targetEmail = (queryEmail || user?.email || process.env.BREVO_SENDER_EMAIL || 'vinaybhadane06@gmail.com').trim();
      const userName = queryName || user?.displayName || user?.name || (targetEmail ? targetEmail.split('@')[0] : 'User');

      // Asynchronously trigger completion notification email with interactive direct link
      if (targetEmail) {
        try {
          const summary = (result.products || []).map((p) => ({
            partNumber: p.partNumber,
            mfg: p.manufacturerName,
            brand: p.brandName,
            title: p.officialTitle || p.shortDesc,
            imageCount: (p.images || []).length,
            docCount: (p.documents || []).length,
            filledColumns: p.nonEmptyColumnsCount || 0,
          }));

          const emailRes = await emailService.sendBatchExtractionCompleteEmail(
            targetEmail,
            result.batchId,
            fileName,
            result.totalRowsInFile,
            result.processedCount,
            summary,
            userName,
          );

          result.emailNotificationSent = emailRes.success;
          result.emailRecipient = targetEmail;
          batchFileEnricherService.saveBatchResult(result);
        } catch (emailErr) {
          console.warn('[BatchIngestion] Email notification dispatch note:', emailErr);
        }
      }

      return reply.status(200).send(result);
    },
  );

  /**
   * GET /api/v1/ingestion/batch-result/:batchId
   * Retrieves stored enriched batch dataset across page refreshes or from direct email links
   */
  fastify.get<{
    Params: { batchId: string };
  }>(
    '/batch-result/:batchId',
    {
      schema: {
        description: 'Get persistent batch enrichment dataset by batch ID',
        tags: ['Ingestion'],
        summary: 'Get Stored Batch Result',
      },
    },
    async (request, reply) => {
      const { batchId } = request.params;
      const { batchFileEnricherService } = await import('../../services/batch-file-enricher.service');
      const batch = batchFileEnricherService.getBatchResult(batchId);

      if (!batch) {
        throw new NotFoundError('Batch Dataset Result', batchId);
      }

      return reply.status(200).send(batch);
    },
  );

  /**
   * GET /api/v1/ingestion/user-uploads
   * Retrieves all Firebase user accounts and all data (batches, jobs, products) uploaded/processed
   */
  fastify.get<{
    Querystring: { email?: string };
  }>(
    '/user-uploads',
    {
      schema: {
        description: 'Retrieve all Firebase user accounts, batches, jobs, and products uploaded/processed',
        tags: ['Ingestion'],
        summary: 'Retrieve User Uploaded Data By Email',
        querystring: {
          type: 'object',
          properties: {
            email: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const queryEmail = (request.query as any)?.email?.trim();
      const { batchFileEnricherService } = await import('../../services/batch-file-enricher.service');
      const { jobRepository } = await import('../../repositories/job.repository');
      const { authService } = await import('../../services/auth.service');
      const { getSqlPool } = await import('../../plugins/db.plugin');
      const sql = (await import('mssql')).default;

      // 1. Fetch all registered Firebase Accounts
      const firebaseUsers = await authService.getAllFirebaseUsers();

      // 2. Fetch distinct submitters and activity stats from Azure SQL
      const pool = getSqlPool();
      let dbSubmitterStats: Record<string, { jobsCount: number; totalRows: number }> = {};
      let appUsersList: Array<{ uid: string; email: string; displayName: string; role: string }> = [];

      if (pool && pool.connected) {
        try {
          const statsRes = await pool.request().query(`
            SELECT
              submitted_by,
              COUNT(*) AS jobs_count,
              SUM(ISNULL(row_count, 0)) AS total_rows
            FROM dbo.ingestion_job
            GROUP BY submitted_by
          `);
          statsRes.recordset.forEach((r: any) => {
            if (r.submitted_by) {
              dbSubmitterStats[r.submitted_by.toLowerCase()] = {
                jobsCount: r.jobs_count || 0,
                totalRows: r.total_rows || 0,
              };
            }
          });

          const usersRes = await pool.request().query(`
            SELECT uid, email, display_name AS displayName, role
            FROM dbo.app_user
          `);
          appUsersList = usersRes.recordset || [];
        } catch (dbErr) {
          console.warn('[UserUploads] DB stats query warning:', dbErr);
        }
      }

      // 3. Assemble unified Accounts List (Firebase + Azure SQL + In-Memory)
      const accountMap = new Map<string, {
        email: string;
        displayName: string;
        uid?: string;
        creationTime?: string;
        lastSignInTime?: string;
        jobsCount: number;
        totalRows: number;
        source: string;
      }>();

      // Add Firebase users
      firebaseUsers.forEach((fu) => {
        if (!fu.email) return;
        const norm = fu.email.toLowerCase();
        const stats = dbSubmitterStats[norm] || { jobsCount: 0, totalRows: 0 };
        accountMap.set(norm, {
          email: fu.email,
          displayName: fu.displayName || fu.email.split('@')[0],
          uid: fu.uid,
          creationTime: fu.creationTime,
          lastSignInTime: fu.lastSignInTime,
          jobsCount: stats.jobsCount,
          totalRows: stats.totalRows,
          source: 'Firebase Auth',
        });
      });

      // Add Azure SQL app_user entries
      appUsersList.forEach((au) => {
        if (!au.email) return;
        const norm = au.email.toLowerCase();
        if (!accountMap.has(norm)) {
          const stats = dbSubmitterStats[norm] || { jobsCount: 0, totalRows: 0 };
          accountMap.set(norm, {
            email: au.email,
            displayName: au.displayName || au.email.split('@')[0],
            uid: au.uid,
            jobsCount: stats.jobsCount,
            totalRows: stats.totalRows,
            source: 'Database User',
          });
        }
      });

      // Add submitters found in jobs if not yet in map
      Object.keys(dbSubmitterStats).forEach((subEmail) => {
        if (!accountMap.has(subEmail)) {
          const stats = dbSubmitterStats[subEmail];
          accountMap.set(subEmail, {
            email: subEmail,
            displayName: subEmail.split('@')[0],
            jobsCount: stats.jobsCount,
            totalRows: stats.totalRows,
            source: 'Upload Activity',
          });
        }
      });

      // Also ensure default admins exist
      ['vinaybhadane06@gmail.com', 'admin@catalogforge.tech'].forEach((adm) => {
        if (!accountMap.has(adm.toLowerCase())) {
          accountMap.set(adm.toLowerCase(), {
            email: adm,
            displayName: adm.split('@')[0],
            jobsCount: 0,
            totalRows: 0,
            source: 'System Admin',
          });
        }
      });

      const accounts = Array.from(accountMap.values()).sort((a, b) => b.jobsCount - a.jobsCount);

      // 4. Retrieve Batches (from BatchFileEnricher in-memory)
      const allBatches = batchFileEnricherService.getAllBatches();
      const batches = queryEmail && queryEmail !== 'all'
        ? allBatches.filter((b) => b.emailRecipient && b.emailRecipient.trim().toLowerCase() === queryEmail.toLowerCase())
        : allBatches;

      // 5. Retrieve Jobs (from Azure SQL and In-Memory)
      let jobs: any[] = [];
      if (pool && pool.connected) {
        try {
          const jobReq = pool.request();
          let jobSql = `
            SELECT
              job_id AS [jobId],
              file_name AS [fileName],
              source_type AS [sourceType],
              row_count AS [rowCount],
              processed_rows AS [processedRows],
              published_rows AS [publishedRows],
              review_rows AS [reviewRows],
              failed_rows AS [failedRows],
              status,
              stage,
              submitted_by AS [submittedBy],
              submitted_at AS [submittedAt],
              completed_at AS [completedAt],
              updated_at AS [updatedAt]
            FROM dbo.ingestion_job
          `;
          if (queryEmail && queryEmail !== 'all') {
            jobSql += ` WHERE LOWER(submitted_by) = @email OR submitted_by LIKE '%' + @email + '%'`;
            jobReq.input('email', sql.VarChar(255), queryEmail.toLowerCase());
          }
          jobSql += ` ORDER BY submitted_at DESC`;
          const jobRes = await jobReq.query(jobSql);
          jobs = jobRes.recordset.map((row: any) => {
            const rowCount = row.rowCount || 0;
            const processed = row.processedRows || 0;
            const progress = rowCount > 0 ? Math.round((processed / rowCount) * 100) : (row.status === 'completed' ? 100 : 0);
            return { ...row, progress };
          });
        } catch (jErr) {
          console.warn('[UserUploads] Failed to query SQL jobs:', jErr);
        }
      }

      if (jobs.length === 0) {
        jobs = await jobRepository.getJobsByEmail(queryEmail || undefined);
      }

      // 6. Retrieve Products (from Azure SQL DB product + assets + attributes)
      let dbProducts: any[] = [];
      if (pool && pool.connected) {
        try {
          const prodReq = pool.request();
          let prodSql = `
            SELECT TOP 150
              p.product_id AS id,
              p.product_id AS productId,
              p.part_number AS partNumber,
              p.manufacturer_name AS manufacturerName,
              p.brand_name AS brandName,
              p.manufacturer_part_number AS mfgPartNum,
              p.classpath,
              p.unspsc,
              p.short_desc AS officialTitle,
              p.short_desc AS shortDesc,
              p.long_desc1 AS longDesc1,
              p.retail_desc AS retailDesc,
              p.row_confidence AS confidenceScore,
              p.status,
              p.created_at AS createdAt,
              p.updated_at AS updatedAt,
              j.submitted_by AS submittedBy,
              j.file_name AS batchFileName,
              j.job_id AS jobId
            FROM dbo.product p
          `;

          if (queryEmail && queryEmail !== 'all') {
            prodSql += `
              JOIN dbo.raw_input r ON p.raw_input_id = r.id
              JOIN dbo.ingestion_job j ON r.job_id = j.job_id
              WHERE LOWER(j.submitted_by) = @email OR j.submitted_by LIKE '%' + @email + '%'
            `;
            prodReq.input('email', sql.VarChar(255), queryEmail.toLowerCase());
          } else {
            prodSql += `
              LEFT JOIN dbo.raw_input r ON p.raw_input_id = r.id
              LEFT JOIN dbo.ingestion_job j ON r.job_id = j.job_id
            `;
          }

          prodSql += ` ORDER BY p.product_id DESC`;
          const prodRes = await prodReq.query(prodSql);
          const rawProds = prodRes.recordset || [];

          if (rawProds.length > 0) {
            const pIds = rawProds.map((p: any) => p.id).filter(Boolean);
            // Fetch assets
            const assetRes = await pool.request().query(`
              SELECT product_id, asset_type, file_name, blob_url, source_url
              FROM dbo.product_asset
              WHERE product_id IN (${pIds.join(',')})
            `);
            const assetMap = new Map<string, any[]>();
            (assetRes.recordset || []).forEach((a: any) => {
              const pid = String(a.product_id);
              if (!assetMap.has(pid)) assetMap.set(pid, []);
              assetMap.get(pid)!.push(a);
            });

            // Fetch attributes
            const attrRes = await pool.request().query(`
              SELECT product_id, attribute_label, attribute_value, attribute_uom, confidence_score
              FROM dbo.product_attribute
              WHERE product_id IN (${pIds.join(',')})
            `);
            const attrMap = new Map<string, any[]>();
            (attrRes.recordset || []).forEach((at: any) => {
              const pid = String(at.product_id);
              if (!attrMap.has(pid)) attrMap.set(pid, []);
              attrMap.get(pid)!.push(at);
            });

            dbProducts = rawProds.map((p: any) => {
              const pid = String(p.id);
              const pAssets = assetMap.get(pid) || [];
              const pAttrs = attrMap.get(pid) || [];

              const images = pAssets
                .filter((a) => a.asset_type === 'image' || a.file_name?.match(/\.(jpg|png|webp|jpeg)$/i))
                .map((a) => ({ url: a.blob_url || a.source_url, alt: a.file_name, isPrimary: true }));

              const documents = pAssets
                .filter((a) => a.asset_type !== 'image')
                .map((a) => ({ assetType: a.asset_type || 'PDF', fileName: a.file_name, sourceUrl: a.source_url || a.blob_url }));

              const attributes = pAttrs.map((a) => ({
                label: a.attribute_label,
                value: a.attribute_value,
                uom: a.attribute_uom,
                confidence: a.confidence_score,
              }));

              // Build synthetic 252 delivery row
              const deliveryRow: Record<string, string> = {
                'SKU - MY_PART_NUMBER': p.partNumber,
                'Mfg_Part_Num': p.mfgPartNum || p.partNumber,
                'Part_Desc': p.officialTitle || p.partNumber,
                'MANUFACTURER_NAME': p.manufacturerName || 'OEM',
                'BRAND_NAME': p.brandName || p.manufacturerName || 'OEM',
                'Classpath': p.classpath || 'Industrial Supplies',
                'UNSPSC': p.unspsc || '40151500',
                'SHORT_DESC': p.shortDesc || p.officialTitle || '',
                'LONG_DESC1': p.longDesc1 || '',
                'Status': p.status || 'published',
              };
              attributes.forEach((attr: any) => {
                if (attr.label) {
                  deliveryRow[attr.label] = attr.uom ? `${attr.value} ${attr.uom}` : attr.value;
                }
              });

              return {
                ...p,
                images,
                documents,
                attributes,
                deliveryRow,
                nonEmptyColumnsCount: Object.keys(deliveryRow).length,
                sourceLocation: 'database_sql',
              };
            });
          }
        } catch (pErr) {
          console.warn('[UserUploads] Failed to query SQL products:', pErr);
        }
      }

      // Also merge in-memory batch products
      const batchProducts = batches.flatMap((b) =>
        (b.products || []).map((p) => ({
          ...p,
          batchId: b.batchId,
          batchFileName: b.fileName,
          emailRecipient: b.emailRecipient,
          sourceLocation: 'backend_batch',
        }))
      );

      const allProducts = [...dbProducts, ...batchProducts];

      return reply.status(200).send({
        email: queryEmail || 'all',
        accounts,
        totalAccounts: accounts.length,
        totalBatches: batches.length,
        totalJobs: jobs.length,
        totalProducts: allProducts.length,
        batches,
        jobs,
        products: allProducts,
        retrievedAt: new Date().toISOString(),
      });
    },
  );

  /**
   * POST /api/v1/ingestion/send-batch-email
   * Manually dispatch completion email with shareable link to any custom email
   */
  fastify.post<{
    Body: { batchId: string; email: string; recipientName?: string };
  }>(
    '/send-batch-email',
    {
      schema: {
        description: 'Send dataset extraction completion notification email to specified address',
        tags: ['Ingestion', 'Email'],
        summary: 'Send Batch Extraction Email',
      },
    },
    async (request, reply) => {
      const { batchId, email, recipientName } = request.body;
      if (!batchId || !email) {
        throw new ValidationError('`batchId` and `email` are required.');
      }

      const { batchFileEnricherService } = await import('../../services/batch-file-enricher.service');
      const { emailService } = await import('../../services/email.service');

      const batch = batchFileEnricherService.getBatchResult(batchId);
      if (!batch) {
        throw new NotFoundError('Batch Dataset Result', batchId);
      }

      const summary = (batch.products || []).map((p) => ({
        partNumber: p.partNumber,
        mfg: p.manufacturerName,
        brand: p.brandName,
        title: p.officialTitle || p.shortDesc,
        imageCount: (p.images || []).length,
        docCount: (p.documents || []).length,
        filledColumns: p.nonEmptyColumnsCount || 0,
      }));

      const emailRes = await emailService.sendBatchExtractionCompleteEmail(
        email.trim(),
        batch.batchId,
        batch.fileName,
        batch.totalRowsInFile,
        batch.processedCount,
        summary,
        recipientName || email.split('@')[0],
      );

      return reply.status(200).send({
        success: emailRes.success,
        recipient: email,
        error: emailRes.error,
        message: emailRes.success ? `Notification email sent to ${email}` : `Failed to send email: ${emailRes.error}`,
      });
    },
  );

  /**
   * POST /api/v1/ingestion/batch-export-excel
   * Exports an array of 252-column delivery rows into an Excel (.xlsx) workbook
   */
  fastify.post<{
    Body: { deliveryRows: Array<Record<string, string>>; fileName?: string };
  }>(
    '/batch-export-excel',
    {
      schema: {
        description: 'Export batch delivery rows into 252-column delivery Excel spreadsheet (.xlsx)',
        tags: ['Ingestion', 'Export'],
        summary: 'Export Batch Delivery Rows to Excel',
      },
    },
    async (request, reply) => {
      const { deliveryRows, fileName } = request.body;
      if (!deliveryRows || !Array.isArray(deliveryRows) || deliveryRows.length === 0) {
        throw new ValidationError('`deliveryRows` array is required.');
      }

      const { deliveryExporterService } = await import('../../services/delivery-exporter.service');
      const buffer = deliveryExporterService.exportRowsToExcel(deliveryRows);

      const outName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Batch_Delivery';

      return reply
        .header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        .header('Content-Disposition', `attachment; filename="Unihack_${outName}_Delivery_252Cols.xlsx"`)
        .send(buffer);
    },
  );

  /**
   * POST /api/v1/ingestion/batch-export-csv
   * Exports an array of 252-column delivery rows into a CSV (.csv) file
   */
  fastify.post<{
    Body: { deliveryRows: Array<Record<string, string>>; fileName?: string };
  }>(
    '/batch-export-csv',
    {
      schema: {
        description: 'Export batch delivery rows into 252-column delivery CSV spreadsheet (.csv)',
        tags: ['Ingestion', 'Export'],
        summary: 'Export Batch Delivery Rows to CSV',
      },
    },
    async (request, reply) => {
      const { deliveryRows, fileName } = request.body;
      if (!deliveryRows || !Array.isArray(deliveryRows) || deliveryRows.length === 0) {
        throw new ValidationError('`deliveryRows` array is required.');
      }

      const { deliveryExporterService } = await import('../../services/delivery-exporter.service');
      const buffer = deliveryExporterService.exportRowsToCsv(deliveryRows);

      const outName = fileName ? fileName.replace(/\.[^/.]+$/, '') : 'Batch_Delivery';

      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', `attachment; filename="Unihack_${outName}_Delivery_252Cols.csv"`)
        .send(buffer);
    },
  );

  /**
   * POST /api/v1/ingestion/batch-save-catalog
   * Persists an array of enriched products directly into Azure SQL catalog
   */
  fastify.post<{
    Body: { products: Array<any> };
  }>(
    '/batch-save-catalog',
    {
      preHandler: [authenticate],
      schema: {
        description: 'Persist batch enriched products into catalog database',
        tags: ['Ingestion', 'Products'],
        summary: 'Save Batch Products to Catalog',
      },
    },
    async (request, reply) => {
      const { products } = request.body;
      if (!products || !Array.isArray(products) || products.length === 0) {
        throw new ValidationError('`products` array is required.');
      }

      const { aiPipelineService } = await import('../../services/ai-pipeline.service');

      const savedIds: number[] = [];
      for (const p of products) {
        try {
          const id = await aiPipelineService.persistProduct({
            partNumber: p.partNumber,
            manufacturerName: p.manufacturerName,
            brandName: p.brandName,
            manufacturerPartNumber: p.mfgPartNum || p.partNumber,
            classpath: p.classpath,
            shortDesc: p.shortDesc,
            longDesc1: p.longDesc1,
            mobileDesc: p.mobileDesc,
            invoiceDesc: p.invoiceDesc,
            retailDesc: p.retailDesc,
            marketingDescription: p.marketingDescription,
            unspsc: p.unspsc || '40151500',
            upc: p.upc || null,
            ean: p.ean || null,
            gtin: p.gtin || null,
            countryOfOrigin: p.countryOfOrigin || 'United States',
            discontinued: false,
            actualImage: (p.images || []).length > 0,
            rowConfidence: p.confidenceScore || 0.98,
            status: 'published',
            features: p.features || [],
            attributes: p.attributes || [],
            assets: [
              ...(p.images || []).map((img: any) => ({
                assetType: 'image',
                fileName: `${p.manufacturerName}_${p.partNumber}.jpg`,
                sourceUrl: img.url,
                isFromManufacturer: true,
              })),
              ...(p.documents || []).map((doc: any) => ({
                assetType: doc.assetType,
                fileName: doc.fileName,
                sourceUrl: doc.sourceUrl,
                isFromManufacturer: true,
              })),
            ],
          });
          if (id !== null) {
            savedIds.push(id);
          }
        } catch (err) {
          console.warn(`[BatchSave] Failed to save product ${p.partNumber}:`, err);
        }
      }

      return reply.status(200).send({
        success: true,
        message: `Successfully saved ${savedIds.length} products to catalog.`,
        savedCount: savedIds.length,
        savedIds,
      });
    },
  );

  /**
   * POST /api/v1/ingestion/ocr
   * Multi-Modal OCR & Strict Sufficiency Gatekeeper for Product Label / Nameplate Images (Multipart)
   */
  fastify.post(
    '/ocr',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const data = await request.file();
      if (!data) {
        throw new ValidationError('No image file was uploaded in the multipart request.');
      }

      const buffer = await data.toBuffer();
      const fileName = data.filename || 'product-label.jpg';
      const mimeType = data.mimetype || 'image/jpeg';
      const user = request.user?.email || request.user?.uid || 'anonymous';

      const result = await ocrIngestionService.processImageOcr(
        buffer,
        fileName,
        mimeType,
        user,
        false
      );

      return reply.status(200).send(result);
    }
  );

  /**
   * POST /api/v1/ingestion/ocr-base64
   * Multi-Modal OCR & Strict Sufficiency Gatekeeper via Base64 JSON Payload
   */
  fastify.post<{
    Body: {
      imageBase64: string;
      fileName?: string;
      mimeType?: string;
      saveToCatalog?: boolean;
    };
  }>(
    '/ocr-base64',
    {
      preHandler: [authenticate],
    },
    async (request, reply) => {
      const { imageBase64, fileName, mimeType, saveToCatalog } = request.body || {};
      if (!imageBase64 || typeof imageBase64 !== 'string') {
        throw new ValidationError('imageBase64 string is required.');
      }

      // Strip data URL prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+]+;base64,/i, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const user = request.user?.email || request.user?.uid || 'anonymous';

      const result = await ocrIngestionService.processImageOcr(
        buffer,
        fileName || 'label-snapshot.jpg',
        mimeType || 'image/jpeg',
        user,
        Boolean(saveToCatalog)
      );

      return reply.status(200).send(result);
    }
  );

  /**
   * POST /api/v1/ingestion/verify-urls
   * Automated Head-Check URL Health Verification & Dead-Link Suppression Endpoint
   */
  fastify.post<{
    Body: {
      urls?: Array<{ url: string; expectedType?: 'any' | 'image' | 'pdf' }> | string[];
      url?: string;
      expectedType?: 'any' | 'image' | 'pdf';
    };
  }>(
    '/verify-urls',
    {
      schema: {
        description: 'Verify live HTTP status of URLs and suppress dead/broken links',
        tags: ['Ingestion'],
        summary: 'URL Health Verification & Dead-Link Filter',
      },
    },
    async (request, reply) => {
      const { urls, url, expectedType } = request.body || {};

      if (url) {
        const result = await urlHealthVerifierService.verifyUrl(url, { expectedType: expectedType || 'any' });
        return reply.status(200).send({
          success: true,
          result,
          verifiedLive: result.isValid,
        });
      }

      if (Array.isArray(urls)) {
        const normalizedBatch = urls.map((u) => {
          if (typeof u === 'string') return { url: u, expectedType: expectedType || 'any' as const };
          return { url: u.url, expectedType: u.expectedType || expectedType || 'any' as const };
        });

        const resultMap = await urlHealthVerifierService.verifyUrlsBatch(normalizedBatch);
        const results = normalizedBatch.map((item) => resultMap.get(item.url)!);

        return reply.status(200).send({
          success: true,
          totalChecked: results.length,
          validCount: results.filter((r) => r.isValid).length,
          deadCount: results.filter((r) => !r.isValid).length,
          results,
        });
      }

      return reply.status(400).send({
        success: false,
        error: 'Either "url" or "urls" array must be provided in request body.',
      });
    }
  );
};


