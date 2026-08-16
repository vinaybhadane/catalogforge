-- =============================================================================
-- Migration: 002_master_data.sql
-- Description: Master Reference Tables, LOV Schemas, UOMs, and Ingestion Preflight
-- Target: Azure SQL Database / Microsoft SQL Server 2019+
-- =============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;

-- -----------------------------------------------------------------------------
-- 1. Alter ingestion_job to store preflight analysis JSON
-- -----------------------------------------------------------------------------
IF COL_LENGTH('dbo.ingestion_job', 'preflight_data') IS NULL
BEGIN
    ALTER TABLE dbo.ingestion_job ADD preflight_data NVARCHAR(MAX) NULL;
END;

-- -----------------------------------------------------------------------------
-- 2. Table: manufacturer_master
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.manufacturer_master', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.manufacturer_master (
        id BIGINT IDENTITY(1,1) NOT NULL,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        aliases NVARCHAR(MAX) NULL,
        website_domain VARCHAR(255) NULL,
        active BIT NOT NULL CONSTRAINT DF_mfg_master_active DEFAULT 1,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_mfg_master_created DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_manufacturer_master PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_manufacturer_master_name UNIQUE (name)
    );
END;

-- -----------------------------------------------------------------------------
-- 3. Table: brand_master
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.brand_master', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.brand_master (
        id BIGINT IDENTITY(1,1) NOT NULL,
        name VARCHAR(255) NOT NULL,
        manufacturer_name VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        aliases NVARCHAR(MAX) NULL,
        active BIT NOT NULL CONSTRAINT DF_brand_master_active DEFAULT 1,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_brand_master_created DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_brand_master PRIMARY KEY CLUSTERED (id ASC)
    );
END;

-- -----------------------------------------------------------------------------
-- 4. Table: lov_classpath
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.lov_classpath', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.lov_classpath (
        classpath_id BIGINT IDENTITY(1,1) NOT NULL,
        dept VARCHAR(100) NOT NULL,
        class VARCHAR(100) NOT NULL,
        fine VARCHAR(100) NOT NULL,
        full_classpath VARCHAR(500) NOT NULL,
        unspsc VARCHAR(20) NULL,
        active BIT NOT NULL CONSTRAINT DF_lov_classpath_active DEFAULT 1,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_lov_classpath_created DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_lov_classpath PRIMARY KEY CLUSTERED (classpath_id ASC),
        CONSTRAINT UQ_lov_classpath_full UNIQUE (full_classpath)
    );
END;

-- -----------------------------------------------------------------------------
-- 5. Table: lov_attribute
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.lov_attribute', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.lov_attribute (
        attribute_id BIGINT IDENTITY(1,1) NOT NULL,
        classpath_id BIGINT NOT NULL,
        attribute_name VARCHAR(100) NOT NULL,
        data_type VARCHAR(30) NOT NULL CONSTRAINT DF_lov_attr_type DEFAULT 'text',
        is_required BIT NOT NULL CONSTRAINT DF_lov_attr_req DEFAULT 0,
        sequence TINYINT NULL,
        standard_uom VARCHAR(20) NULL,
        CONSTRAINT PK_lov_attribute PRIMARY KEY CLUSTERED (attribute_id ASC),
        CONSTRAINT FK_lov_attribute_classpath FOREIGN KEY (classpath_id) REFERENCES dbo.lov_classpath(classpath_id) ON DELETE CASCADE
    );
END;

-- -----------------------------------------------------------------------------
-- 6. Table: lov_allowed_value
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.lov_allowed_value', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.lov_allowed_value (
        id BIGINT IDENTITY(1,1) NOT NULL,
        attribute_id BIGINT NOT NULL,
        allowed_value VARCHAR(255) NOT NULL,
        synonym_tokens NVARCHAR(MAX) NULL,
        is_default BIT NOT NULL CONSTRAINT DF_lov_allowed_default DEFAULT 0,
        CONSTRAINT PK_lov_allowed_value PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT FK_lov_allowed_value_attr FOREIGN KEY (attribute_id) REFERENCES dbo.lov_attribute(attribute_id) ON DELETE CASCADE
    );
END;

-- -----------------------------------------------------------------------------
-- 7. Table: uom_master
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.uom_master', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.uom_master (
        id INT IDENTITY(1,1) NOT NULL,
        raw_symbol VARCHAR(50) NOT NULL,
        standard_uom VARCHAR(20) NOT NULL,
        uom_category VARCHAR(30) NOT NULL,
        conversion_factor DECIMAL(12,6) NOT NULL CONSTRAINT DF_uom_factor DEFAULT 1.0,
        CONSTRAINT PK_uom_master PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_uom_master_symbol UNIQUE (raw_symbol)
    );
END;

-- -----------------------------------------------------------------------------
-- 8. Table: fraction_conversion
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.fraction_conversion', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.fraction_conversion (
        id INT IDENTITY(1,1) NOT NULL,
        fraction_pattern VARCHAR(30) NOT NULL,
        decimal_value DECIMAL(10,4) NOT NULL,
        CONSTRAINT PK_fraction_conversion PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_fraction_conversion_pattern UNIQUE (fraction_pattern)
    );
END;

-- -----------------------------------------------------------------------------
-- 9. Table: manufacturer_domain_allowlist
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.manufacturer_domain_allowlist', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.manufacturer_domain_allowlist (
        id INT IDENTITY(1,1) NOT NULL,
        domain VARCHAR(255) NOT NULL,
        manufacturer_name VARCHAR(255) NOT NULL,
        is_trusted BIT NOT NULL CONSTRAINT DF_mfg_domain_trusted DEFAULT 1,
        created_at DATETIME2(7) NOT NULL CONSTRAINT DF_mfg_domain_created DEFAULT SYSUTCDATETIME(),
        CONSTRAINT PK_manufacturer_domain_allowlist PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_manufacturer_domain UNIQUE (domain)
    );
END;

-- -----------------------------------------------------------------------------
-- 10. Table: field_definition
-- -----------------------------------------------------------------------------
IF OBJECT_ID('dbo.field_definition', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.field_definition (
        id INT IDENTITY(1,1) NOT NULL,
        field_key VARCHAR(100) NOT NULL,
        label VARCHAR(100) NOT NULL,
        field_type VARCHAR(30) NOT NULL,
        field_group VARCHAR(50) NOT NULL,
        editable BIT NOT NULL CONSTRAINT DF_field_def_editable DEFAULT 1,
        char_limit INT NULL,
        required BIT NOT NULL CONSTRAINT DF_field_def_required DEFAULT 0,
        help_text VARCHAR(500) NULL,
        CONSTRAINT PK_field_definition PRIMARY KEY CLUSTERED (id ASC),
        CONSTRAINT UQ_field_def_key UNIQUE (field_key)
    );
END;

-- =============================================================================
-- PERFORMANCE INDEXES
-- =============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_mfg_master_slug' AND object_id = OBJECT_ID('dbo.manufacturer_master'))
    CREATE NONCLUSTERED INDEX IX_mfg_master_slug ON dbo.manufacturer_master(slug);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_brand_master_mfg' AND object_id = OBJECT_ID('dbo.brand_master'))
    CREATE NONCLUSTERED INDEX IX_brand_master_mfg ON dbo.brand_master(manufacturer_name);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_lov_attr_classpath' AND object_id = OBJECT_ID('dbo.lov_attribute'))
    CREATE NONCLUSTERED INDEX IX_lov_attr_classpath ON dbo.lov_attribute(classpath_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_lov_allowed_attr' AND object_id = OBJECT_ID('dbo.lov_allowed_value'))
    CREATE NONCLUSTERED INDEX IX_lov_allowed_attr ON dbo.lov_allowed_value(attribute_id);
