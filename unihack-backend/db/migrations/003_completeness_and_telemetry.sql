-- =============================================================================
-- Migration: 003_completeness_and_telemetry.sql
-- Description: Adds completeness_rate and completeness_score columns to dbo.product
-- Target: Azure SQL Database / Microsoft SQL Server 2019+
-- =============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- 1. Add completeness_rate column if not exists
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.product') 
    AND name = 'completeness_rate'
)
BEGIN
    ALTER TABLE dbo.product ADD completeness_rate DECIMAL(5,2) NULL;
END;

-- 2. Add completeness_score column if not exists
IF NOT EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.product') 
    AND name = 'completeness_score'
)
BEGIN
    ALTER TABLE dbo.product ADD completeness_score DECIMAL(5,2) NULL;
END;

-- 3. Index for performance querying by completeness rate
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes 
    WHERE name = 'IX_product_completeness_rate' 
    AND object_id = OBJECT_ID('dbo.product')
)
BEGIN
    CREATE NONCLUSTERED INDEX IX_product_completeness_rate ON dbo.product(completeness_rate);
END;

-- 4. Expand audit_log.action column to VARCHAR(60) to support FIELD_SUPPRESSED_ZERO_HALLUCINATION
IF EXISTS (
    SELECT 1 FROM sys.columns 
    WHERE object_id = OBJECT_ID('dbo.audit_log') 
    AND name = 'action' 
    AND max_length < 60
)
BEGIN
    ALTER TABLE dbo.audit_log ALTER COLUMN action VARCHAR(60) NOT NULL;
END;

