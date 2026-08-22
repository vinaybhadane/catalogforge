# CatalogForge — Enterprise Backend API & Data Engine

<div align="center">

[![Fastify](https://img.shields.io/badge/Fastify-4.26-000000.svg?style=flat-square&logo=fastify)](https://fastify.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Azure SQL](https://img.shields.io/badge/Azure%20SQL-Database-0078d4.svg?style=flat-square&logo=microsoftazure)](https://azure.microsoft.com/en-us/products/azure-sql/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85ea2d.svg?style=flat-square&logo=swagger)](https://swagger.io/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Vision%20%26%20Search-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev/)

</div>

---

## 👨‍💻 Engineering & Development Team

> **Developed & Architected by:**
>
> - **Vinay S. Bhadane** — *Lead Full-Stack & AI Systems Architect* ([Email](mailto:vinaybhadane06@gmail.com))
> - **Sakshi P. Patil** — *Lead Data Engineer & Systems Specialist*
>
> 🎓 **Institution:** **MET Institute of Engineering, Nashik**  
> 🏛️ **Department:** **Department of Computer Engineering**  
> 📅 **Academic Batch:** **B.E. Computer Engineering (Class of 2028)**

---

## 1. Backend Architecture & Package Structure

The backend is organized as a high-performance TypeScript monorepo powered by npm workspaces:

```text
unihack-backend/
├── apps/
│   ├── api/                                   # Fastify REST API Server (@unihack/api)
│   │   ├── src/
│   │   │   ├── app.ts                         # Fastify application factory & plugin registration
│   │   │   ├── server.ts                      # Server bootstrap, signal handling, graceful shutdown
│   │   │   ├── config/env.ts                  # Zod environment variable parsing & validation
│   │   │   ├── errors/app-errors.ts           # Typed domain error hierarchy
│   │   │   ├── middleware/                    # Auth, RBAC, Request-ID, Error handling middleware
│   │   │   ├── plugins/                       # CORS, DB connection pool, Swagger/OpenAPI
│   │   │   ├── repositories/                  # Azure SQL & in-memory fallback data access layers
│   │   │   ├── routes/                        # Fastify REST route handlers
│   │   │   │   ├── analytics/                 # Scoreboard & completeness metrics
│   │   │   │   ├── audit/                     # Immutable audit logging queries
│   │   │   │   ├── auth/                      # Firebase token verification & team management
│   │   │   │   ├── config/                    # UI field definitions & system configuration
│   │   │   │   ├── health/                    # Liveness & Azure SQL health checks
│   │   │   │   ├── ingestion/                 # CSV/XLSX, OCR label vision, URL scrapers
│   │   │   │   ├── master-data/               # Manufacturers, brands, LOV master tables
│   │   │   │   ├── products/                  # Product catalog CRUD & exports
│   │   │   │   └── reviews/                   # Human-in-the-Loop review queues & actions
│   │   │   ├── services/                      # Domain services (AI Pipeline, OCR, Exporter, etc.)
│   │   │   │   ├── ai-pipeline.service.ts     # 8-stage product intelligence execution engine
│   │   │   │   ├── batch-file-enricher.service.ts # High-throughput batch record enricher
│   │   │   │   ├── brave-search.service.ts    # Authoritative Tier-1 OEM domain resolver
│   │   │   │   ├── delivery-exporter.service.ts # Strict 252-column Excel/CSV export generator
│   │   │   │   ├── email.service.ts           # Resend / Brevo 2FA OTP & team invitation dispatcher
│   │   │   │   ├── file-parser.service.ts     # CSV / XLSX preflight parser & placeholder scanner
│   │   │   │   ├── gemini-search.service.ts   # Google Gemini 2.5/3.5 generative search grounding
│   │   │   │   ├── image-extractor.service.ts # Isolated product image crawler & dimension filter
│   │   │   │   ├── ingestion.service.ts       # Job coordinator & progress tracker
│   │   │   │   ├── ocr-ingestion.service.ts   # Multi-modal visual label OCR & Sufficiency Gatekeeper
│   │   │   │   ├── placeholder-detector.service.ts # Identifies invalid tokens (N/A, TBD, -- Unbranded --)
│   │   │   │   ├── source-governor.service.ts # OEM whitelist & marketplace blacklisting
│   │   │   │   ├── uom-normalizer.service.ts  # Standardizes fractions & units of measure
│   │   │   │   └── url-extractor.service.ts   # Scrapes technical specifications from web URLs
│   │   │   ├── test/                          # Unit & integration test suites
│   │   │   └── utils/text-sanitizer.ts        # String cleaning & character encoding normalizer
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── workers/                               # Pipeline background worker specifications
├── packages/
│   └── contracts/                             # Shared contracts package (@unihack/contracts)
│       ├── src/
│       │   ├── api/                           # Request / Response TypeScript interfaces
│       │   ├── domain/                        # Domain models (Product, Review, Job, Audit)
│       │   └── events/                        # Event message schemas
│       ├── package.json
│       └── tsconfig.json
├── db/
│   ├── migrations/                            # Azure SQL DDL scripts & indexes
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_master_data.sql
│   │   └── 003_completeness_and_telemetry.sql
│   └── seeds/                                 # LOV, UOM, and Master Data seed scripts
│       └── seed.ts
├── .env.example
├── package.json
└── tsconfig.base.json
```

---

## 2. API Endpoints Reference

### Health & System Diagnostics
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service liveness health check |
| `GET` | `/health/dependencies` | Public/Admin | Azure SQL connectivity & latency ping |
| `GET` | `/documentation` | Public | Interactive Swagger / OpenAPI 3.0 UI |
| `GET` | `/documentation/json` | Public | OpenAPI specification JSON schema |

### Configuration & Master Data
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/config` | Public | System configuration parameters |
| `GET` | `/api/v1/config/fields` | Public | Dynamic UI field schema definitions |
| `GET` | `/api/v1/master-data/manufacturers` | Bearer Token | Verified manufacturer reference records |
| `GET` | `/api/v1/master-data/brands` | Bearer Token | Brand lookup tables |
| `GET` | `/api/v1/master-data/uoms` | Bearer Token | Standardized Unit of Measure (UOM) definitions |

### Data Ingestion & OCR Processing
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/ingestion/uploads` | Bearer Token | Multipart CSV / XLSX / PDF file upload & preflight scan |
| `POST` | `/api/v1/ingestion/ocr` | Bearer Token | Multi-Modal Visual Label OCR with 80% Sufficiency Gatekeeper |
| `POST` | `/api/v1/ingestion/url` | Bearer Token | Ingest and parse product data from single OEM URL |
| `GET` | `/api/v1/ingestion/jobs` | Bearer Token | List all ingestion & enrichment jobs |
| `GET` | `/api/v1/ingestion/jobs/:jobId` | Bearer Token | Get real-time job execution telemetry |
| `GET` | `/api/v1/ingestion/jobs/:jobId/preflight` | Bearer Token | Preflight schema report & placeholder counts |
| `GET` | `/api/v1/ingestion/jobs/:jobId/rows` | Bearer Token | Paginated row-level inspection |

### Product Catalog & Delivery Exports
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | Bearer Token | Search and filter catalog products |
| `GET` | `/api/v1/products/:productId` | Bearer Token | Detailed product view with provenance evidence |
| `PUT` | `/api/v1/products/:productId` | Bearer Token | Update product attributes & classification |
| `GET` | `/api/v1/products/:productId/delivery-fields`| Bearer Token | Retrieve 252 delivery headers array for product |
| `GET` | `/api/v1/products/export/delivery.xlsx` | Bearer Token | Export catalog into golden 252-Column Excel file |
| `GET` | `/api/v1/products/export/delivery.csv` | Bearer Token | Export catalog into golden 252-Column CSV file |

### Review Studio & Human-in-the-Loop (HITL)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/reviews/queue` | Bearer Token | Pending review items flagged by confidence scoring |
| `POST` | `/api/v1/reviews/:productId/approve` | Bearer Token | Approve and auto-publish product record |
| `POST` | `/api/v1/reviews/:productId/reject` | Bearer Token | Reject product and log reason to audit trail |
| `POST` | `/api/v1/reviews/:productId/override` | Bearer Token | Override specific attribute with audit justification |

### Security, Auth & Team Management
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/auth/me` | Bearer Token | Return authenticated user claims & role |
| `POST` | `/api/v1/auth/otp/send` | Public/Auth | Dispatch 6-digit password reset OTP via email |
| `POST` | `/api/v1/auth/otp/verify` | Public/Auth | Verify 6-digit OTP code |
| `POST` | `/api/v1/auth/invite` | Bearer Token | Invite collaborator with role assignment |
| `GET` | `/api/v1/auth/team-members` | Bearer Token | List all active and pending team members |
| `POST` | `/api/v1/auth/team-members/update-role` | Bearer Token | Update member permission tier |
| `POST` | `/api/v1/auth/team-members/remove` | Bearer Token | Revoke workspace access |

---

## 3. Database Schema & Migration Guide

The backend uses **Azure SQL Database** with the following primary tables:
- `dbo.app_user` — User identity, roles, and status.
- `dbo.job` — Ingestion and enrichment batch job runs.
- `dbo.raw_input` — Immutable supplier CSV/file input rows.
- `dbo.product` — Published canonical master product records.
- `dbo.attribute` — Normalized key-value product attributes with UOMs.
- `dbo.audit_log` — SOC-2 compliant immutable audit trail.
- `dbo.backend_config` — Dynamic system configurations and thresholds.

### Running Migrations & Master Data Seeds

```bash
# 1. Execute SQL scripts in db/migrations/ against your Azure SQL instance
# (001_initial_schema.sql -> 002_master_data.sql -> 003_completeness_and_telemetry.sql)

# 2. Run the automated seed script
npm run db:seed
```

---

## 4. Automated Testing

All integration tests can be executed with a single command:

```bash
# Run all backend test suites
npm run test

# Run individual test suites
npm run test:api       # REST endpoints, ingestion, and job lifecycle
npm run test:export    # Strict 252-column delivery format validation
npm run test:image     # Product image extraction & container isolation
npm run test:ocr       # Multi-modal OCR & Zero-Hallucination Gatekeeper
```

---

## 5. Production Deployment

### Building for Production
```bash
npm run build
```

### Starting the Production Server
```bash
npm start
```

### Environment Variables
Ensure the following variables are set in production:
- `NODE_ENV=production`
- `PORT=8000`
- `AZURE_SQL_CONNECTION_STRING`
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
- `GEMINI_API_KEY`
- `BRAVE_SEARCH_API_KEY`
- `RESEND_API_KEY` or `BREVO_API_KEY`
- `CORS_ALLOWED_ORIGINS` (e.g. `https://catalogforge.tech`)
- `ENABLE_MOCK_AUTH_IN_DEV=false`

---

## 📄 License & Attribution

Copyright © 2026 **CatalogForge** — Developed by **Vinay S. Bhadane** & **Sakshi P. Patil**, MET Institute of Engineering, Nashik (B.E. Computer Engineering, 2028).
