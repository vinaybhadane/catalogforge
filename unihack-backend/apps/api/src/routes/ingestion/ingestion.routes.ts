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
};
