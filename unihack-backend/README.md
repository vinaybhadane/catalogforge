# UniHack AI Product Intelligence Platform — Backend

Enterprise-grade TypeScript & Fastify backend architecture for automated industrial product data classification, enrichment, deterministic validation, review routing, and Azure SQL persistence.

---

## 1. Architecture Overview

- **`packages/contracts`**: Shared TypeScript domain models, enums, REST request/response shapes, and Service Bus event payloads.
- **`apps/api`**: Fastify REST API server with Firebase Admin JWT authentication, RBAC guard middleware, OpenAPI 3.0 documentation, and Azure SQL connection pooling.
- **`apps/workers`**: Placeholder container for asynchronous Python pipeline workers (Classification, Retrieval, Enrichment, Validation).
- **`db/migrations`**: Azure SQL DDL migration scripts and indexes.
- **`db/seeds`**: Reference master data and LOV seed loaders.

---

## 2. Directory Structure

```text
unihack-backend/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── app.ts                         # Fastify application factory
│   │   │   ├── server.ts                      # Server entry point with graceful shutdown
│   │   │   ├── config/env.ts                  # Zod environment validation
│   │   │   ├── errors/app-errors.ts           # Typed domain exception hierarchy
│   │   │   ├── middleware/                    # Auth, RBAC, Request-ID, Error handler
│   │   │   ├── plugins/                       # CORS, Swagger, Database connection pool
│   │   │   ├── repositories/                  # User and domain data access layers
│   │   │   ├── routes/                        # Health and Auth endpoints
│   │   │   ├── schemas/                       # Fastify request/response schemas
│   │   │   └── services/                      # Auth and domain business logic
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── workers/                               # Python Container App worker scripts
├── packages/
│   └── contracts/                             # Shared contracts package (@unihack/contracts)
│       ├── src/
│       │   ├── api/                           # Common, auth, and product API shapes
│       │   ├── domain/                        # Enums, Product, Review, Job, Audit models
│       │   └── events/                        # Azure Service Bus message schemas
│       ├── package.json
│       └── tsconfig.json
├── db/
│   ├── migrations/
│   │   └── 001_initial_schema.sql             # Complete Azure SQL DDL & Indexes
│   └── seeds/
├── .env.example
├── package.json
├── tsconfig.base.json
└── README.md
```

---

## 3. Getting Started

### Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- Azure SQL Database or local SQL Server instance

### Installation
```bash
cd unihack-backend
npm install
npm run build
```

### Environment Setup
Copy `.env.example` to `.env` in `apps/api/` or backend root:
```bash
cp .env.example apps/api/.env
```

### Database Migration
Execute `db/migrations/001_initial_schema.sql` against your Azure SQL instance using Azure Data Studio, `sqlcmd`, or SSMS.

### Running the API Server
```bash
# Start in development mode with live reload
npm run dev

# Or build and start in production mode
npm run build
cd apps/api && npm start
```

---

## 4. API Endpoints (Phase 1)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Basic service liveness health check |
| `GET` | `/health/dependencies` | Public/Admin | Azure SQL connectivity check |
| `GET` | `/api/docs` | Public | Swagger / OpenAPI 3.0 Interactive Documentation |
| `GET` | `/api/openapi.json` | Public | OpenAPI specification JSON schema |
| `GET` | `/api/v1/auth/me` | Bearer Token | Returns authenticated user claims & profile |
