/**
 * Raw Input Repository
 * Data access layer for raw_input table storing 11-column source records
 */

import { RawInputRecord } from '@unihack/contracts';
import sql from 'mssql';
import { getSqlPool } from '../plugins/db.plugin';
import { ParsedRawRow } from '../services/file-parser.service';

const inMemoryRawInputs = new Map<string, RawInputRecord[]>();
let autoIncId = 1;

export class RawInputRepository {
  /**
   * Bulk inserts parsed raw input rows for a given job
   */
  async insertBatch(
    jobId: string,
    rows: ParsedRawRow[],
  ): Promise<RawInputRecord[]> {
    const records: RawInputRecord[] = [];
    const now = new Date().toISOString();

    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      rows.forEach((r) => {
        const id = autoIncId++;
        records.push({
          id,
          jobId,
          partNumber: r.part_number,
          dept: r.dept,
          class: r.class,
          fine: r.fine,
          skuMyPartNumber: r.sku_my_part_number,
          mfgPartNum: r.mfg_part_num,
          partDesc: r.part_desc,
          e1Brand: r.e1_brand,
          unilogBrand: r.unilog_brand,
          dibBrand: r.dib_brand,
          partManuf: r.part_manuf,
          ingestedAt: now,
        });
      });
      inMemoryRawInputs.set(jobId, records);
      return records;
    }

    // In Azure SQL, use table-valued parameter or chunked batch inserts
    const table = new sql.Table('dbo.raw_input');
    table.create = false;
    table.columns.add('job_id', sql.UniqueIdentifier, { nullable: false });
    table.columns.add('part_number', sql.VarChar(50), { nullable: true });
    table.columns.add('dept', sql.VarChar(100), { nullable: true });
    table.columns.add('class', sql.VarChar(100), { nullable: true });
    table.columns.add('fine', sql.VarChar(100), { nullable: true });
    table.columns.add('sku_my_part_number', sql.VarChar(50), { nullable: true });
    table.columns.add('mfg_part_num', sql.VarChar(100), { nullable: true });
    table.columns.add('part_desc', sql.VarChar(255), { nullable: true });
    table.columns.add('e1_brand', sql.VarChar(255), { nullable: true });
    table.columns.add('unilog_brand', sql.VarChar(255), { nullable: true });
    table.columns.add('dib_brand', sql.VarChar(255), { nullable: true });
    table.columns.add('part_manuf', sql.VarChar(255), { nullable: true });

    rows.forEach((r) => {
      table.rows.add(
        jobId,
        r.part_number,
        r.dept,
        r.class,
        r.fine,
        r.sku_my_part_number,
        r.mfg_part_num,
        r.part_desc,
        r.e1_brand,
        r.unilog_brand,
        r.dib_brand,
        r.part_manuf,
      );
    });

    const request = pool.request();
    await request.bulk(table);

    // Fetch inserted records
    const fetchRequest = pool.request();
    fetchRequest.input('job_id', sql.UniqueIdentifier, jobId);
    const result = await fetchRequest.query(`
      SELECT
        id,
        job_id AS jobId,
        part_number AS partNumber,
        dept,
        class,
        fine,
        sku_my_part_number AS skuMyPartNumber,
        mfg_part_num AS mfgPartNum,
        part_desc AS partDesc,
        e1_brand AS e1Brand,
        unilog_brand AS unilogBrand,
        dib_brand AS dibBrand,
        part_manuf AS partManuf,
        ingested_at AS ingestedAt
      FROM dbo.raw_input
      WHERE job_id = @job_id
      ORDER BY id ASC
    `);

    return result.recordset;
  }

  /**
   * Retrieves raw input rows for a job with pagination
   */
  async findByJobId(
    jobId: string,
    page = 1,
    pageSize = 50,
  ): Promise<{ items: RawInputRecord[]; total: number }> {
    const offset = (page - 1) * pageSize;

    const pool = getSqlPool();
    if (!pool || !pool.connected) {
      const records = inMemoryRawInputs.get(jobId) || [];
      return {
        items: records.slice(offset, offset + pageSize),
        total: records.length,
      };
    }

    const request = pool.request();
    request.input('job_id', sql.UniqueIdentifier, jobId);
    request.input('offset', sql.Int, offset);
    request.input('limit', sql.Int, pageSize);

    const countRes = await request.query(`
      SELECT COUNT(*) AS total FROM dbo.raw_input WHERE job_id = @job_id
    `);
    const total = countRes.recordset[0]?.total || 0;

    const result = await request.query(`
      SELECT
        id,
        job_id AS jobId,
        part_number AS partNumber,
        dept,
        class,
        fine,
        sku_my_part_number AS skuMyPartNumber,
        mfg_part_num AS mfgPartNum,
        part_desc AS partDesc,
        e1_brand AS e1Brand,
        unilog_brand AS unilogBrand,
        dib_brand AS dibBrand,
        part_manuf AS partManuf,
        ingested_at AS ingestedAt
      FROM dbo.raw_input
      WHERE job_id = @job_id
      ORDER BY id ASC
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `);

    return { items: result.recordset, total };
  }
}

export const rawInputRepository = new RawInputRepository();
