-- =============================================================================
-- Migration: 001_initial_schema.sql
-- Description: UniHack Core Azure SQL Relational Database Schema
-- Target: Azure SQL Database / Microsoft SQL Server 2019+
-- =============================================================================

-- Ensure ANSI NULLs and Quoted Identifiers
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- -----------------------------------------------------------------------------
-- 1. Table: raw_input (11-column source ingest buffer)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.raw_input', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.raw_input (
        id BIGINT IDENTITY(1,1) NOT NULL,
        job_id UNIQUEIDENTIFIER NOT NULL,
        part_number VARCHAR(50) NULL,
        dept VARCHAR(100) NULL,
        class VARCHAR(100) NULL,
        fine VARCHAR(100) NULL,
        sku_my_part_number VARCHAR(50) NULL,
        mfg_part_num VARCHAR(100) NULL,
        part_desc VARCHAR(255) NULL,
        e1_brand VARCHAR(255) NULL,
        unilog_brand VARCHAR(255) NULL,
        dib_brand VARCHAR(255) NULL,
        part_manuf VARCHAR(255) NULL,
        ingested_at DATETIME2(7) NOT NULL CONSTRAINT DF_raw_input_ingested_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_raw_input PRIMARY KEY CLUSTERED (id ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 2. Table: evidence (Retrieved manufacturer source citations and snippets)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.evidence', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.evidence (
        evidence_id BIGINT IDENTITY(1,1) NOT NULL,
        source_url VARCHAR(1000) NULL,
        source_title VARCHAR(500) NULL,
        source_snippet NVARCHAR(MAX) NULL,
        source_span NVARCHAR(MAX) NULL,
        document_type VARCHAR(50) NULL,
        page_number INT NULL,
        manufacturer VARCHAR(255) NULL,
        part_number VARCHAR(100) NULL,
        retrieved_at DATETIME2(7) NOT NULL CONSTRAINT DF_evidence_retrieved_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_evidence PRIMARY KEY CLUSTERED (evidence_id ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 3. Table: product (Core normalized product intelligence entity)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.product', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.product (
        product_id BIGINT IDENTITY(1,1) NOT NULL,
        raw_input_id BIGINT NULL,
        part_number VARCHAR(50) NOT NULL,
        manufacturer_name VARCHAR(255) NULL,
        brand_name VARCHAR(255) NULL,
        manufacturer_part_number VARCHAR(100) NULL,
        classpath VARCHAR(500) NULL,
        unspsc VARCHAR(20) NULL,

        mobile_desc VARCHAR(80) NULL,
        invoice_desc VARCHAR(40) NULL,
        short_desc VARCHAR(150) NULL,
        long_desc1 NVARCHAR(MAX) NULL,
        retail_desc NVARCHAR(MAX) NULL,
        marketing_description NVARCHAR(MAX) NULL,

        upc VARCHAR(20) NULL,
        ean VARCHAR(20) NULL,
        gtin VARCHAR(20) NULL,

        length_val DECIMAL(10,4) NULL,
        length_uom VARCHAR(10) NULL,
        height_val DECIMAL(10,4) NULL,
        height_uom VARCHAR(10) NULL,
        width_val DECIMAL(10,4) NULL,
        width_uom VARCHAR(10) NULL,
        weight_val DECIMAL(10,4) NULL,
        weight_uom VARCHAR(10) NULL,

        country_of_origin VARCHAR(100) NULL,
        discontinued BIT NOT NULL CONSTRAINT DF_product_discontinued DEFAULT 0,
        actual_image BIT NOT NULL CONSTRAINT DF_product_actual_image DEFAULT 0,

        row_confidence DECIMAL(5,2) NULL,
        status VARCHAR(30) NOT NULL CONSTRAINT DF_product_status DEFAULT 'pending_review',
        version INT NOT NULL CONSTRAINT DF_product_version DEFAULT 1,

        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_product_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_product_updated_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_product PRIMARY KEY CLUSTERED (product_id ASC),
        CONSTRAINT FK_product_raw_input FOREIGN KEY (raw_input_id) REFERENCES dbo.raw_input(id) ON DELETE SET NULL
    );
END;

-- -----------------------------------------------------------------------------
-- 4. Table: product_feature (Ordered marketing bullet features up to 20)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.product_feature', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.product_feature (
        id BIGINT IDENTITY(1,1) NOT NULL,
        product_id BIGINT NOT NULL,
        sequence TINYINT NOT NULL,
        feature_text VARCHAR(500) NOT NULL,
        CONSTRAINT PK_product_feature PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT FK_product_feature_product FOREIGN KEY (product_id) REFERENCES dbo.product(product_id) ON DELETE CASCADE,
        CONSTRAINT UQ_product_feature_seq UNIQUE (product_id, sequence)
    );
END;

-- -----------------------------------------------------------------------------
-- 5. Table: product_attribute (LOV constrained attribute triplets up to 50)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.product_attribute', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.product_attribute (
        id BIGINT IDENTITY(1,1) NOT NULL,
        product_id BIGINT NOT NULL,
        sequence TINYINT NOT NULL,
        attribute_label VARCHAR(100) NOT NULL,
        attribute_value VARCHAR(255) NULL,
        attribute_uom VARCHAR(20) NULL,
        lov_match_confidence DECIMAL(5,2) NULL,
        confidence_score DECIMAL(5,2) NULL,
        validation_flags VARCHAR(1000) NULL,
        source_evidence_id BIGINT NULL,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_product_attribute_created_at DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_product_attribute_updated_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_product_attribute PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT FK_product_attribute_product FOREIGN KEY (product_id) REFERENCES dbo.product(product_id) ON DELETE CASCADE,
        CONSTRAINT FK_product_attribute_evidence FOREIGN KEY (source_evidence_id) REFERENCES dbo.evidence(evidence_id) ON DELETE SET NULL,
        CONSTRAINT UQ_product_attribute_seq UNIQUE (product_id, sequence)
    );
END;

-- -----------------------------------------------------------------------------
-- 6. Table: product_asset (Images, manuals, SDS, CAD drawings)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.product_asset', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.product_asset (
        id BIGINT IDENTITY(1,1) NOT NULL,
        product_id BIGINT NOT NULL,
        asset_type VARCHAR(50) NOT NULL,
        sequence TINYINT NULL,
        file_name VARCHAR(255) NULL,
        blob_url VARCHAR(1000) NULL,
        source_url VARCHAR(1000) NULL,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_product_asset_created_at DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_product_asset PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT FK_product_asset_product FOREIGN KEY (product_id) REFERENCES dbo.product(product_id) ON DELETE CASCADE
    );
END;

-- -----------------------------------------------------------------------------
-- 7. Table: ingestion_job (Batch file upload and pipeline lifecycle tracking)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.ingestion_job', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.ingestion_job (
        job_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ingestion_job_id DEFAULT NEWID(),
        file_name VARCHAR(255) NULL,
        source_type VARCHAR(30) NULL,
        row_count INT NULL,
        processed_rows INT NOT NULL CONSTRAINT DF_ingestion_job_processed DEFAULT 0,
        published_rows INT NOT NULL CONSTRAINT DF_ingestion_job_published DEFAULT 0,
        review_rows INT NOT NULL CONSTRAINT DF_ingestion_job_review DEFAULT 0,
        failed_rows INT NOT NULL CONSTRAINT DF_ingestion_job_failed DEFAULT 0,
        status VARCHAR(30) NOT NULL,
        stage VARCHAR(30) NULL,
        submitted_by VARCHAR(255) NOT NULL,
        submitted_at DATETIME2(7) NOT NULL CONSTRAINT DF_ingestion_job_submitted DEFAULT SYSUTCDATETIME(),
        completed_at DATETIME2(7) NULL,
        updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_ingestion_job_updated DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_ingestion_job PRIMARY KEY CLUSTERED (job_id ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 8. Table: stage_execution (Granular stage execution audit & idempotency)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.stage_execution', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.stage_execution (
        id BIGINT IDENTITY(1,1) NOT NULL,
        job_id UNIQUEIDENTIFIER NOT NULL,
        row_id BIGINT NULL,
        stage VARCHAR(50) NOT NULL,
        attempt INT NOT NULL,
        status VARCHAR(30) NOT NULL,
        error_code VARCHAR(100) NULL,
        error_message NVARCHAR(2000) NULL,
        started_at DATETIME2(7) NULL,
        completed_at DATETIME2(7) NULL,
        CONSTRAINT PK_stage_execution PRIMARY KEY CLUSTERED (id ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 9. Table: review_item (Human-in-the-Loop review queue items)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.review_item', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.review_item (
        review_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_review_item_id DEFAULT NEWID(),
        product_id BIGINT NOT NULL,
        status VARCHAR(30) NOT NULL CONSTRAINT DF_review_item_status DEFAULT 'pending',
        reason VARCHAR(1000) NULL,
        row_confidence DECIMAL(5,2) NULL,
        assigned_to VARCHAR(255) NULL,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_review_item_created DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_review_item_updated DEFAULT SYSUTCDATETIME(),
        resolved_at DATETIME2(7) NULL,
        CONSTRAINT PK_review_item PRIMARY KEY CLUSTERED (review_id ASC),
        CONSTRAINT FK_review_item_product FOREIGN KEY (product_id) REFERENCES dbo.product(product_id) ON DELETE CASCADE
    );
END;

-- -----------------------------------------------------------------------------
-- 10. Table: review_field (Review item field-level correction records)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.review_field', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.review_field (
        id BIGINT IDENTITY(1,1) NOT NULL,
        review_id UNIQUEIDENTIFIER NOT NULL,
        field_name VARCHAR(100) NOT NULL,
        generated_value NVARCHAR(MAX) NULL,
        confidence DECIMAL(5,2) NULL,
        validation_flags VARCHAR(1000) NULL,
        evidence_id BIGINT NULL,
        editable BIT NOT NULL CONSTRAINT DF_review_field_editable DEFAULT 1,
        selected_lov_value VARCHAR(500) NULL,
        CONSTRAINT PK_review_field PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT FK_review_field_review FOREIGN KEY (review_id) REFERENCES dbo.review_item(review_id) ON DELETE CASCADE,
        CONSTRAINT FK_review_field_evidence FOREIGN KEY (evidence_id) REFERENCES dbo.evidence(evidence_id) ON DELETE SET NULL
    );
END;

-- -----------------------------------------------------------------------------
-- 11. Table: audit_log (Immutable change and decision audit trail)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.audit_log', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.audit_log (
        id BIGINT IDENTITY(1,1) NOT NULL,
        product_id BIGINT NULL,
        job_id UNIQUEIDENTIFIER NULL,
        field_name VARCHAR(100) NULL,
        generated_value NVARCHAR(MAX) NULL,
        source_snippet NVARCHAR(MAX) NULL,
        confidence_score DECIMAL(5,2) NULL,
        validation_flags VARCHAR(1000) NULL,
        reviewer VARCHAR(255) NOT NULL,
        action VARCHAR(30) NOT NULL,
        previous_value NVARCHAR(MAX) NULL,
        final_value NVARCHAR(MAX) NULL,
        reason NVARCHAR(1000) NULL,
        timestamp DATETIME2(7) NOT NULL CONSTRAINT DF_audit_log_timestamp DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_audit_log PRIMARY KEY CLUSTERED (id ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 12. Table: backend_config (Dynamic system threshold and policy configuration)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.backend_config', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.backend_config (
        config_key VARCHAR(150) NOT NULL,
        config_value NVARCHAR(MAX) NULL,
        value_type VARCHAR(30) NOT NULL,
        version INT NOT NULL CONSTRAINT DF_backend_config_version DEFAULT 1,
        updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_backend_config_updated DEFAULT SYSUTCDATETIME(),
        updated_by VARCHAR(255) NULL,
        CONSTRAINT PK_backend_config PRIMARY KEY CLUSTERED (config_key ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 13. Table: outbox_event (Transactional Outbox for reliable event dispatch)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.outbox_event', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.outbox_event (
        id BIGINT IDENTITY(1,1) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        aggregate_id VARCHAR(100) NOT NULL,
        payload NVARCHAR(MAX) NOT NULL,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_outbox_event_created DEFAULT SYSUTCDATETIME(),
        published_at DATETIME2(7) NULL,
        attempts INT NOT NULL CONSTRAINT DF_outbox_event_attempts DEFAULT 0,
        CONSTRAINT PK_outbox_event PRIMARY KEY CLUSTERED (id ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 14. Table: app_user (Application users and RBAC roles)
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.app_user', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.app_user (
        uid VARCHAR(255) NOT NULL,
        email VARCHAR(255) NULL,
        display_name VARCHAR(255) NULL,
        role VARCHAR(30) NOT NULL CONSTRAINT DF_app_user_role DEFAULT 'viewer',
        active BIT NOT NULL CONSTRAINT DF_app_user_active DEFAULT 1,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_app_user_created DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2(7) NOT NULL CONSTRAINT DF_app_user_updated DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_app_user PRIMARY KEY CLUSTERED (uid ASC)
    );
END;

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

-- raw_input indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_raw_input_job_id' AND object_id = OBJECT_ID('dbo.raw_input'))
    CREATE NONCLUSTERED INDEX IX_raw_input_job_id ON dbo.raw_input(job_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_raw_input_part_number' AND object_id = OBJECT_ID('dbo.raw_input'))
    CREATE NONCLUSTERED INDEX IX_raw_input_part_number ON dbo.raw_input(part_number);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_raw_input_mfg_part_num' AND object_id = OBJECT_ID('dbo.raw_input'))
    CREATE NONCLUSTERED INDEX IX_raw_input_mfg_part_num ON dbo.raw_input(mfg_part_num);

-- product indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_product_part_number' AND object_id = OBJECT_ID('dbo.product'))
    CREATE NONCLUSTERED INDEX IX_product_part_number ON dbo.product(part_number);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_product_status' AND object_id = OBJECT_ID('dbo.product'))
    CREATE NONCLUSTERED INDEX IX_product_status ON dbo.product(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_product_row_confidence' AND object_id = OBJECT_ID('dbo.product'))
    CREATE NONCLUSTERED INDEX IX_product_row_confidence ON dbo.product(row_confidence);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_product_classpath' AND object_id = OBJECT_ID('dbo.product'))
    CREATE NONCLUSTERED INDEX IX_product_classpath ON dbo.product(classpath);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_product_updated_at' AND object_id = OBJECT_ID('dbo.product'))
    CREATE NONCLUSTERED INDEX IX_product_updated_at ON dbo.product(updated_at DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_product_raw_input_id' AND object_id = OBJECT_ID('dbo.product'))
    CREATE NONCLUSTERED INDEX IX_product_raw_input_id ON dbo.product(raw_input_id);

-- evidence indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_evidence_part_number' AND object_id = OBJECT_ID('dbo.evidence'))
    CREATE NONCLUSTERED INDEX IX_evidence_part_number ON dbo.evidence(part_number);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_evidence_manufacturer' AND object_id = OBJECT_ID('dbo.evidence'))
    CREATE NONCLUSTERED INDEX IX_evidence_manufacturer ON dbo.evidence(manufacturer);

-- ingestion_job indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ingestion_job_status' AND object_id = OBJECT_ID('dbo.ingestion_job'))
    CREATE NONCLUSTERED INDEX IX_ingestion_job_status ON dbo.ingestion_job(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ingestion_job_stage' AND object_id = OBJECT_ID('dbo.ingestion_job'))
    CREATE NONCLUSTERED INDEX IX_ingestion_job_stage ON dbo.ingestion_job(stage);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ingestion_job_submitted_at' AND object_id = OBJECT_ID('dbo.ingestion_job'))
    CREATE NONCLUSTERED INDEX IX_ingestion_job_submitted_at ON dbo.ingestion_job(submitted_at DESC);

-- stage_execution indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_stage_execution_job_stage' AND object_id = OBJECT_ID('dbo.stage_execution'))
    CREATE NONCLUSTERED INDEX IX_stage_execution_job_stage ON dbo.stage_execution(job_id, stage, attempt);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_stage_execution_row_id' AND object_id = OBJECT_ID('dbo.stage_execution'))
    CREATE NONCLUSTERED INDEX IX_stage_execution_row_id ON dbo.stage_execution(row_id);

-- review_item indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_review_item_product_id' AND object_id = OBJECT_ID('dbo.review_item'))
    CREATE NONCLUSTERED INDEX IX_review_item_product_id ON dbo.review_item(product_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_review_item_status' AND object_id = OBJECT_ID('dbo.review_item'))
    CREATE NONCLUSTERED INDEX IX_review_item_status ON dbo.review_item(status);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_review_item_row_confidence' AND object_id = OBJECT_ID('dbo.review_item'))
    CREATE NONCLUSTERED INDEX IX_review_item_row_confidence ON dbo.review_item(row_confidence);

-- review_field indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_review_field_review_id' AND object_id = OBJECT_ID('dbo.review_field'))
    CREATE NONCLUSTERED INDEX IX_review_field_review_id ON dbo.review_field(review_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_review_field_evidence_id' AND object_id = OBJECT_ID('dbo.review_field'))
    CREATE NONCLUSTERED INDEX IX_review_field_evidence_id ON dbo.review_field(evidence_id);

-- audit_log indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_audit_log_product_id' AND object_id = OBJECT_ID('dbo.audit_log'))
    CREATE NONCLUSTERED INDEX IX_audit_log_product_id ON dbo.audit_log(product_id, timestamp DESC);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_audit_log_job_id' AND object_id = OBJECT_ID('dbo.audit_log'))
    CREATE NONCLUSTERED INDEX IX_audit_log_job_id ON dbo.audit_log(job_id, timestamp DESC);

-- outbox_event indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_outbox_event_published' AND object_id = OBJECT_ID('dbo.outbox_event'))
    CREATE NONCLUSTERED INDEX IX_outbox_event_published ON dbo.outbox_event(published_at, created_at);

-- app_user indexes
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_app_user_email' AND object_id = OBJECT_ID('dbo.app_user'))
    CREATE NONCLUSTERED INDEX IX_app_user_email ON dbo.app_user(email);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_app_user_role' AND object_id = OBJECT_ID('dbo.app_user'))
    CREATE NONCLUSTERED INDEX IX_app_user_role ON dbo.app_user(role);
