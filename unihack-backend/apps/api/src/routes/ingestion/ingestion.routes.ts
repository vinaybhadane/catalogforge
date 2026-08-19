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
      const xlsx = await import('xlsx');
      const { DELIVERY_HEADERS } = await import('../../services/delivery-exporter.service');

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

      // Ensure all 252 headers exist in proper order
      const orderedRow: Record<string, string> = {};
      for (const h of DELIVERY_HEADERS) {
        orderedRow[h] = rowToExport[h] || '';
      }

      const worksheet = xlsx.utils.json_to_sheet([orderedRow], {
        header: [...DELIVERY_HEADERS],
      });
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Unilog Delivery');
      const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

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
  fastify.post<{
    Body: { url: string; deliveryRow?: Record<string, string> };
  }>(
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
      const xlsx = await import('xlsx');
      const { DELIVERY_HEADERS } = await import('../../services/delivery-exporter.service');

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

      const orderedRow: Record<string, string> = {};
      for (const h of DELIVERY_HEADERS) {
        orderedRow[h] = rowToExport[h] || '';
      }

      const worksheet = xlsx.utils.json_to_sheet([orderedRow], {
        header: [...DELIVERY_HEADERS],
      });
      const csvContent = xlsx.utils.sheet_to_csv(worksheet);
      const buffer = Buffer.from(csvContent, 'utf-8');

      return reply
        .header('Content-Type', 'text/csv; charset=utf-8')
        .header('Content-Disposition', 'attachment; filename="Unihack_Extracted_Product_Delivery.csv"')
        .send(buffer);
    },
  );
};

