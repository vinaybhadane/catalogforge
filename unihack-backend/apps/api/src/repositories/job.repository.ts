/**
 * Ingestion Job Repository
 * Data access layer for ingestion_job and stage_execution tables
 */

import {
  IngestionJobFilterQuery,
  JobStatus,
  PreflightReport,
  ProcessingJob,
  ProcessingStage,
} from '@unihack/contracts';
import crypto from 'crypto';
import sql from 'mssql';
import { getSqlPool } from '../plugins/db.plugin';

// In-memory cache for fallback mode if Azure SQL is unconfigured during testing
const inMemoryJobs = new Map<string, ProcessingJob>();
const inMemoryPreflights = new Map<string, PreflightReport>();

export const DEFAULT_SAMPLE_JOBS: ProcessingJob[] = [
  {
    jobId: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    fileName: 'Unihack_Sample_Dataset_Input.csv',
    sourceType: 'file_upload',
    rowCount: 150,
    processedRows: 150,
    publishedRows: 142,
    reviewRows: 8,
    failedRows: 0,
    status: 'completed',
    stage: 'published',
    progress: 100,
    submittedBy: 'admin',
    submittedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 38).toISOString(),
  },
  {
    jobId: 'f7e6d5c4-b3a2-1f0e-9d8c-7b6a5f4e3d2c',
    fileName: 'Abrasives_Batch_Run_01.csv',
    sourceType: 'file_upload',
    rowCount: 85,
    processedRows: 85,
    publishedRows: 82,
    reviewRows: 3,
    failedRows: 0,
    status: 'completed',
    stage: 'published',
    progress: 100,
    submittedBy: 'admin',
    submittedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
  },
  {
    jobId: 'c9d8e7f6-a5b4-3c2d-1e0f-9a8b7c6d5e4f',
    fileName: 'Schneider_Electric_Breakers_2026.xlsx',
    sourceType: 'file_upload',
    rowCount: 45,
    processedRows: 45,
    publishedRows: 44,
    reviewRows: 1,
    failedRows: 0,
    status: 'completed',
    stage: 'published',
    progress: 100,
    submittedBy: 'admin',
    submittedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    completedAt: new Date(Date.now() - 1000 * 60 * 235).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 235).toISOString(),
  },
];

for (const j of DEFAULT_SAMPLE_JOBS) {
  inMemoryJobs.set(j.jobId, j);
}

export class JobRepository {
  /**
   * Creates a new ingestion job entry
   */
  async createJob(data: {
    fileName?: string | null;
    sourceType?: string | null;
    rowCount?: number | null;
    status: JobStatus | string;
    stage?: ProcessingStage | string | null;
    submittedBy: string;
  }): Promise<ProcessingJob> {
    const jobId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newJob: ProcessingJob = {
      jobId,
      fileName: data.fileName || null,
      sourceType: data.sourceType || 'file_upload',
      rowCount: data.rowCount ?? null,
      processedRows: 0,
      publishedRows: 0,
      reviewRows: 0,
      failedRows: 0,
      status: data.status,
      stage: (data.stage as ProcessingStage) || 'queued',
      progress: 0,
      submittedBy: data.submittedBy,
      submittedAt: now,
      completedAt: null,
      updatedAt: now,
    };

    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      inMemoryJobs.set(jobId, newJob);
      return newJob;
    }

    const request = pool.request();
    request.input('job_id', sql.UniqueIdentifier, jobId);
    request.input('file_name', sql.VarChar(255), newJob.fileName);
    request.input('source_type', sql.VarChar(30), newJob.sourceType);
    request.input('row_count', sql.Int, newJob.rowCount);
    request.input('status', sql.VarChar(30), newJob.status);
    request.input('stage', sql.VarChar(30), newJob.stage);
    request.input('submitted_by', sql.VarChar(255), newJob.submittedBy);

    await request.query(`
      INSERT INTO dbo.ingestion_job (
        job_id, file_name, source_type, row_count,
        processed_rows, published_rows, review_rows, failed_rows,
        status, stage, submitted_by, submitted_at, updated_at
      ) VALUES (
        @job_id, @file_name, @source_type, @row_count,
        0, 0, 0, 0,
        @status, @stage, @submitted_by, SYSUTCDATETIME(), SYSUTCDATETIME()
      )
    `);

    inMemoryJobs.set(jobId, newJob);
    return newJob;
  }

  /**
   * Retrieves a job by ID
   */
  async findById(jobId: string): Promise<ProcessingJob | null> {
    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      return inMemoryJobs.get(jobId) || null;
    }

    const request = pool.request();
    request.input('job_id', sql.UniqueIdentifier, jobId);

    const result = await request.query(`
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
      WHERE job_id = @job_id
    `);

    const row = result.recordset[0];
    if (!row) return inMemoryJobs.get(jobId) || null;

    const rowCount = row.rowCount || 0;
    const processed = row.processedRows || 0;
    const progress = rowCount > 0 ? Math.round((processed / rowCount) * 100) : 0;

    return {
      ...row,
      progress,
    };
  }

  /**
   * Lists jobs with pagination and filters
   */
  async listJobs(query: IngestionJobFilterQuery): Promise<{ items: ProcessingJob[]; total: number }> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.min(100, Math.max(1, query.pageSize || 20));
    const offset = (page - 1) * pageSize;

    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      const all = Array.from(inMemoryJobs.values());
      const filtered = all.filter((j) => {
        if (query.status && j.status !== query.status) return false;
        if (query.stage && j.stage !== query.stage) return false;
        if (query.search && !j.fileName?.toLowerCase().includes(query.search.toLowerCase())) return false;
        return true;
      });
      return {
        items: filtered.slice(offset, offset + pageSize),
        total: filtered.length,
      };
    }

    const request = pool.request();
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, pageSize);

    let whereClause = 'WHERE 1=1';
    if (query.status) {
      whereClause += ' AND status = @status';
      request.input('status', sql.VarChar(30), query.status);
    }
    if (query.stage) {
      whereClause += ' AND stage = @stage';
      request.input('stage', sql.VarChar(30), query.stage);
    }
    if (query.search) {
      whereClause += ' AND file_name LIKE @search';
      request.input('search', sql.VarChar(255), `%${query.search}%`);
    }

    const countResult = await request.query(`
      SELECT COUNT(*) AS total FROM dbo.ingestion_job ${whereClause}
    `);
    const total = countResult.recordset[0]?.total || 0;

    if (total === 0 && !query.search && !query.status && !query.stage) {
      const all = Array.from(inMemoryJobs.values());
      return {
        items: all.slice(offset, offset + pageSize),
        total: all.length,
      };
    }

    const result = await request.query(`
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
      ${whereClause}
      ORDER BY submitted_at DESC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    const items: ProcessingJob[] = result.recordset.map((row) => {
      const rowCount = row.rowCount || 0;
      const processed = row.processedRows || 0;
      const progress = rowCount > 0 ? Math.round((processed / rowCount) * 100) : 0;
      return { ...row, progress };
    });

    return { items, total };
  }

  /**
   * Persists preflight analysis report JSON
   */
  async savePreflightReport(jobId: string, report: PreflightReport): Promise<void> {
    inMemoryPreflights.set(jobId, report);

    const pool = getSqlPool();
    if (!pool || !pool.connected) return;

    const request = pool.request();
    request.input('job_id', sql.UniqueIdentifier, jobId);
    request.input('preflight_data', sql.NVarChar(sql.MAX), JSON.stringify(report));

    await request.query(`
      UPDATE dbo.ingestion_job
      SET preflight_data = @preflight_data, updated_at = SYSUTCDATETIME()
      WHERE job_id = @job_id
    `);
  }

  /**
   * Retrieves preflight analysis report
   */
  async getPreflightReport(jobId: string): Promise<PreflightReport | null> {
    if (inMemoryPreflights.has(jobId)) {
      return inMemoryPreflights.get(jobId)!;
    }

    const pool = getSqlPool();
    if (!pool || !pool.connected) return null;

    const request = pool.request();
    request.input('job_id', sql.UniqueIdentifier, jobId);

    const result = await request.query(`
      SELECT preflight_data AS preflightData
      FROM dbo.ingestion_job
      WHERE job_id = @job_id
    `);

    const raw = result.recordset[0]?.preflightData;
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Updates job status and counters
   */
  async updateJob(
    jobId: string,
    updates: Partial<ProcessingJob>,
  ): Promise<void> {
    const existing = inMemoryJobs.get(jobId);
    if (existing) {
      inMemoryJobs.set(jobId, { ...existing, ...updates, updatedAt: new Date().toISOString() });
    }

    const pool = getSqlPool();
    if (!pool || !pool.connected) return;

    const request = pool.request();
    request.input('job_id', sql.UniqueIdentifier, jobId);

    const setClauses: string[] = ['updated_at = SYSUTCDATETIME()'];

    if (updates.status !== undefined) {
      setClauses.push('status = @status');
      request.input('status', sql.VarChar(30), updates.status);
    }
    if (updates.stage !== undefined) {
      setClauses.push('stage = @stage');
      request.input('stage', sql.VarChar(30), updates.stage);
    }
    if (updates.processedRows !== undefined) {
      setClauses.push('processed_rows = @processed_rows');
      request.input('processed_rows', sql.Int, updates.processedRows);
    }
    if (updates.publishedRows !== undefined) {
      setClauses.push('published_rows = @published_rows');
      request.input('published_rows', sql.Int, updates.publishedRows);
    }
    if (updates.reviewRows !== undefined) {
      setClauses.push('review_rows = @review_rows');
      request.input('review_rows', sql.Int, updates.reviewRows);
    }
    if (updates.failedRows !== undefined) {
      setClauses.push('failed_rows = @failed_rows');
      request.input('failed_rows', sql.Int, updates.failedRows);
    }
    if (updates.completedAt !== undefined) {
      setClauses.push('completed_at = SYSUTCDATETIME()');
    }

    await request.query(`
      UPDATE dbo.ingestion_job
      SET ${setClauses.join(', ')}
      WHERE job_id = @job_id
    `);
  }
}

export const jobRepository = new JobRepository();
