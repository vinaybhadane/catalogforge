# CatalogForge — Enterprise AI Product Intelligence Platform

<div align="center">

<img src="public/logo-icon.png" width="60" height="60" alt="CatalogForge Logo" style="border-radius: 12px; margin-bottom: 8px;" />

### **Transform raw, chaotic catalog data into validated, source-grounded commerce records.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.1-black.svg?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?style=flat-square&logo=react)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-4.26-000000.svg?style=flat-square&logo=fastify)](https://fastify.dev/)
[![Azure SQL](https://img.shields.io/badge/Azure%20SQL-Database-0078d4.svg?style=flat-square&logo=microsoftazure)](https://azure.microsoft.com/en-us/products/azure-sql/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%26%20Admin-ffca28.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-Multi--Modal%20Vision-4285F4.svg?style=flat-square&logo=google)](https://ai.google.dev/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success.svg?style=flat-square)]()

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

## 📌 Executive Summary

**CatalogForge** is an enterprise-grade AI Product Intelligence and Autonomous Catalog Governance Platform designed to solve the multi-billion-dollar product data quality crisis in industrial, electrical, plumbing, HVAC, and distributor supply chains.

Distributor datasets routinely suffer from:
- **Missing or corrupted Part Numbers (MPN) and SKUs**
- **Placeholder values and uninformative tokens** (e.g. `-- Unbranded --`, `-- No DIB Brand --`, `N/A`, `TBD`, `-`)
- **Chaotic, non-standardized Units of Measure (UOM)** (e.g. `INCHES`, `1/2"`, `0.5 in`, `1-3/4 in`)
- **Unverified third-party marketplace data drift** (pollution from Amazon, eBay, AliExpress, and unvetted sellers)
- **Time-consuming manual catalog reviews** costing distributors weeks per catalog update

CatalogForge automates end-to-end catalog data operations through an **8-Stage Deterministic Pipeline**, **Multi-Modal Vision/OCR Ingestion**, **Zero-Hallucination Gatekeeper**, **Strict Tier-1 OEM Sourcing**, **Golden 252-Column Delivery Export**, and a **Human-in-the-Loop (HITL) Review Studio**.

---

## 🏗️ Architecture & Technology Stack

```
                                    ┌─────────────────────────────────────────────────────────┐
                                    │                     CatalogForge UI                     │
                                    │           Next.js 15 (App Router) + React 19            │
                                    │    Tailwind CSS • Lucide Icons • Recharts Analytics     │
                                    └────────────────────────────┬────────────────────────────┘
                                                                 │  REST / Bearer JWT
                                                                 ▼
                                    ┌─────────────────────────────────────────────────────────┐
                                    │                Fastify REST API Server                  │
                                    │               TypeScript Monorepo (v4.26)               │
                                    │       Zod Validation • Swagger / OpenAPI 3.0 Docs       │
                                    └────────────┬───────────────┬───────────────┬────────────┘
                                                 │               │               │
                     ┌───────────────────────────┘               │               └───────────────────────────┐
                     ▼                                           ▼                                           ▼
       ┌───────────────────────────┐               ┌───────────────────────────┐               ┌───────────────────────────┐
       │     Azure SQL Database    │               │  Google Gemini 2.5 / 3.5  │               │   Brave Search / Resend   │
       │   Connection Pool (mssql) │               │ Multi-Modal Vision & OCR  │               │  OEM Grounding & 2FA Auth │
       │  Migrations & Master Data │               │  Sufficiency Gatekeeper   │               │ Transactional Email Alert │
       └───────────────────────────┘               └───────────────────────────┘               └───────────────────────────┘
```

### Core Technologies

| Layer | Technologies | Key Capabilities |
|---|---|---|
| **Frontend Web App** | **Next.js 15.1**, **React 19**, **TypeScript 5.7** | App Router, Server/Client components, dynamic routing, reactive UI, static pre-rendering |
| **Styling & Design System** | **Tailwind CSS**, Glassmorphism, Neumorphic tokens | High-contrast palette, responsive layout, accessible typography, fluid micro-interactions |
| **Backend REST API** | **Fastify 4.26**, **TypeScript 5.3**, **Zod** | High-performance async server, input schema validation, request ID tracing, graceful shutdown |
| **Contracts & Monorepo** | **@unihack/contracts** workspace | Shared TypeScript interfaces, domain models, DTOs, and event payloads |
| **Database & Persistence** | **Azure SQL Database**, `mssql 10.0` | Connection pooling, SQL Server migrations, relational schema, fallback memory-store |
| **Authentication & RBAC** | **Firebase Admin & Client SDK 12.0** | Zero-trust token validation, role-based access control (Admin, Catalog Manager, Auditor) |
| **Multi-Modal Vision & AI** | **Google Gemini 2.5 / 3.5 Flash** | Label/nameplate OCR, table extraction, multi-modal entity parsing, zero-hallucination scoring |
| **Web Search Grounding** | **Brave Search API** | Strict Tier-1 OEM domain resolution, verified datasheets, PDF spec sheet links |
| **Email & Security Alerts** | **Brevo (Sendinblue)** / **Resend** | 6-Digit 2FA password reset OTPs, team member invitation emails with confirmation links |
| **Export & Reporting Engine** | **SheetJS (xlsx)** & **csv-parse** | Strict 252-column golden delivery export, header verification, Excel/CSV generation |

---

## ⚡ The 8-Stage Deterministic Pipeline

CatalogForge processes all raw product data through 8 sequential, auditable stages:

```mermaid
flowchart LR
    S1["Stage 1<br/><b>Pre-flight & Ingestion</b>"] --> S2["Stage 2<br/><b>Classification</b>"]
    S2 --> S3["Stage 3<br/><b>Attribute Enrichment</b>"]
    S3 --> S4["Stage 4<br/><b>Controlled Vocab (LOV)</b>"]
    S4 --> S5["Stage 5<br/><b>Deterministic Validation</b>"]
    S5 --> S6["Stage 6<br/><b>Confidence Scoring</b>"]
    S6 --> S7["Stage 7<br/><b>HITL Review Studio</b>"]
    S7 --> S8["Stage 8<br/><b>252-Col Delivery Export</b>"]
```

1. **Stage 1: Pre-flight File & Image Ingestion**
   - Ingests CSV, XLSX, PDF datasheets, packaging photos, or nameplate images.
   - Cleanses corrupted encoding, parses headers, and eliminates placeholder tokens (`N/A`, `TBD`, `-- Unbranded --`).

2. **Stage 2: Taxonomy & Classification**
   - Deterministically classifies products into Department > Class > Fine categories and UNSPSC codes (e.g. `40151500`).

3. **Stage 3: Source-Grounded Attribute Enrichment**
   - Parses technical dimensions, electrical ratings (voltage, amperage, poles, interrupt rating), and materials.
   - Normalizes fractions and units (`1/2"` $\rightarrow$ `0.5 in`, `1-3/4"` $\rightarrow$ `1.75 in`, `INCHES` $\rightarrow$ `in`).

4. **Stage 4: Controlled Vocabulary (LOV) Resolution**
   - Maps messy variations (e.g., `Polycarb`, `PC`, `Polycarbonate Resin`) into standardized Master Data terms.

5. **Stage 5: Deterministic Validation Rules**
   - Applies mathematical bounds checks (e.g. `Min Voltage <= Max Voltage`, `Poles >= 1`, string length constraints).

6. **Stage 6: Multi-Factor Confidence Scoring**
   - Calculates field-level and aggregate confidence scores ($0.00$ to $1.00$) backed by provenance evidence.

7. **Stage 7: Human-in-the-Loop (HITL) Review Studio**
   - Flags low-confidence records ($< 80\%$) into interactive reviewer queues with side-by-side visual diffs and keyboard shortcuts.

8. **Stage 8: Auto-Publishing & 252-Column Enterprise Export**
   - Exports pristine, production-ready catalogs into the exact **252-Column Enterprise Delivery Format** (`.xlsx` or `.csv`).

---

## 🚀 Key Platform Features

### 📸 Multi-Modal Visual OCR & Zero-Hallucination Gatekeeper
- Upload single packaging labels, nameplate stickers, or multi-row invoice photos.
- Evaluated with **Google Gemini Vision** with a strict **80% Sufficiency Gatekeeper**.
- If an image is blurry or lacks product identifiers, extraction immediately aborts with `ABORTED_INSUFFICIENT_DATA` to prevent hallucination.

### 🛡️ Strict Tier-1 OEM Sourcing & Marketplace Blacklisting
- Enforces that technical documents, PDF cut sheets, CAD models, and high-res photos originate exclusively from verified manufacturer domains.
- Automatically discards consumer marketplace links (Amazon, eBay, Walmart, AliExpress, Temu, Flipkart).

### 📊 Real-Time Analytics & Immutable Audit Trails
- Track ingestion throughput, classification accuracy, LOV resolution rate ($> 96.8\%$), and review queue backlog.
- Every attribute modification, AI enrichment, and manual override is permanently logged in `dbo.audit_log` with user stamps and ISO timestamps.

### 👥 Enterprise Team Management & Role-Based Access Control
- Manage team members across three clear permission tiers:
  - **Administrator:** Full workspace configuration, policy governance, and member invitation management.
  - **Catalog Manager:** Ingest datasets, trigger AI lookups, review pending items, and publish approved records.
  - **Auditor (Read-Only):** Inspect product provenance, view audit logs, and download delivery files.
- Email invitation workflow with real-time `Pending Acceptance` $\rightarrow$ `Accepted / Active` tracking.

---

## 📁 Repository Structure

```text
CatalogForge/
├── .env.example                               # Frontend environment template
├── .gitignore                                 # Git ignore rules for Next.js & secrets
├── package.json                               # Frontend dependencies & scripts
├── next.config.mjs                            # Next.js optimization configuration
├── tailwind.config.ts                         # Tailwind design tokens & themes
├── tsconfig.json                              # TypeScript strict configuration
│
├── public/                                    # Public static brand assets & icons
│   ├── logo-icon.png                          # CatalogForge brand icon
│   ├── favicon.ico                            # Application favicon
│   └── ...
│
├── src/                                       # Frontend Next.js 15 Source Code
│   ├── app/                                   # App Router routes
│   │   ├── (marketing)/page.tsx               # Enterprise landing page
│   │   ├── (auth)/                            # Login, Signup, Invite acceptance pages
│   │   ├── (app)/                             # Authenticated workspace routes
│   │   │   ├── dashboard/page.tsx             # Executive command center
│   │   │   ├── upload/page.tsx                # File upload & Multi-Modal OCR studio
│   │   │   ├── jobs/page.tsx                  # Pipeline job monitoring & telemetry
│   │   │   ├── products/page.tsx              # Product master catalog & review queue
│   │   │   ├── analytics/page.tsx             # Catalog intelligence & scoreboard
│   │   │   ├── audit/page.tsx                 # Governance audit log viewer
│   │   │   ├── team_management/page.tsx       # Team invitations & RBAC console
│   │   │   ├── settings/page.tsx              # Sourcing policy & alert preferences
│   │   │   └── profile/page.tsx               # User account details & 2FA security
│   │   ├── layout.tsx                         # Root HTML layout
│   │   ├── error.tsx                          # Global error boundary
│   │   └── not-found.tsx                      # 404 handler
│   ├── components/                            # Reusable UI component modules
│   ├── hooks/                                 # Custom React hooks
│   ├── lib/                                   # Core utilities, API client, Firebase auth
│   └── styles/globals.css                     # Global stylesheet
│
└── unihack-backend/                           # Fastify Enterprise Backend Monorepo
    ├── .env.example                           # Backend environment variables template
    ├── package.json                           # Workspace root package config
    ├── apps/
    │   ├── api/                               # Core Fastify TypeScript REST API Server
    │   │   ├── src/
    │   │   │   ├── app.ts                     # Fastify application factory
    │   │   │   ├── server.ts                  # Server entry point
    │   │   │   ├── config/env.ts              # Zod environment validation
    │   │   │   ├── middleware/                # Auth, RBAC, Request-ID, Error handler
    │   │   │   ├── plugins/                   # CORS, Swagger, Azure SQL pool
    │   │   │   ├── repositories/              # Azure SQL data access layer
    │   │   │   ├── routes/                    # API route handlers (Ingestion, Products, etc.)
    │   │   │   ├── services/                  # Business logic (AI Pipeline, OCR, Exporter)
    │   │   │   └── test/                      # Comprehensive integration test suites
    │   │   └── package.json
    │   └── workers/                           # Pipeline worker specifications
    ├── packages/
    │   └── contracts/                         # Shared TypeScript domain contracts
    └── db/
        ├── migrations/                        # Azure SQL DDL schema scripts
        └── seeds/                             # Master data & LOV seed loaders
```

---

## ⚙️ Environment Configuration

### 1. Frontend Environment (`.env.local`)

Copy `.env.example` in the root directory to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NEXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
NEXT_PUBLIC_BREVO_SENDER_EMAIL=security@catalogforge.tech
```

### 2. Backend Environment (`unihack-backend/.env`)

Copy `unihack-backend/.env.example` to `unihack-backend/.env`:

```env
PORT=8000
HOST=0.0.0.0
NODE_ENV=development
LOG_LEVEL=info
APP_BASE_URL=http://localhost:3000

# Azure SQL Connection
AZURE_SQL_CONNECTION_STRING=Server=tcp:your-server.database.windows.net,1433;Initial Catalog=catalogforge_db;User ID=your_user;Password=your_password;Encrypt=True;TrustServerCertificate=False;

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# AI Vision & Sourcing
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
BRAVE_SEARCH_API_KEY=BSA...

# Email & Security Alerts
RESEND_API_KEY=re_...
RESEND_SENDER_EMAIL=CatalogForge Security <onboarding@resend.dev>

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,https://catalogforge.tech
```

---

## 🛠️ Installation & Local Development

### 1. Clone Repository & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/vinaybhadane/catalogforge.git
cd catalogforge

# Install frontend dependencies
npm install

# Install backend monorepo dependencies
cd unihack-backend
npm install
npm run build
cd ..
```

### 2. Run Database Migrations & Seeds

Execute the Azure SQL scripts in `unihack-backend/db/migrations/`:
- `001_initial_schema.sql` — Creates tables (`dbo.product`, `dbo.attribute`, `dbo.job`, `dbo.audit_log`, `dbo.app_user`, etc.)
- `002_master_data.sql` — Populates manufacturer rules, brands, and UOM standards
- `003_completeness_and_telemetry.sql` — Schema enhancements

Run the seed script:
```bash
cd unihack-backend
npm run db:seed
```

### 3. Start Development Servers

**Start Fastify Backend:**
```bash
cd unihack-backend
npm run dev
# Server listening on http://localhost:8000
# Swagger API docs available at http://localhost:8000/api/docs
```

**Start Next.js Frontend (in a new terminal):**
```bash
npm run dev
# Web application available at http://localhost:3000
```

---

## 🧪 Automated Test Suite & Verification

The codebase includes full unit, integration, and schema validation test suites.

```bash
# Run all backend test suites
cd unihack-backend
npm run test

# Run individual test suites
npm run test:api      # Fastify REST endpoints & ingestion lifecycle
npm run test:export   # Strict 252-column delivery format validation
npm run test:image    # Product image extraction & container isolation
npm run test:ocr      # Multi-modal OCR & Zero-Hallucination Gatekeeper

# Run Typecheck verification across all workspaces
npm run typecheck     # Frontend typecheck
cd unihack-backend && npm run typecheck  # Backend typecheck

# Run Production Builds
npm run build         # Next.js production build (20/20 routes)
cd unihack-backend && npm run build      # Fastify TypeScript compilation
```

---

## 🔒 Security & Compliance Architecture

- **Zero-Trust Token Validation:** Every incoming API call validates Firebase Admin JWT claims.
- **Role-Based Access Control (RBAC):** Strict role middleware prevents unauthorized data mutations.
- **Request ID Tracing:** Distributed tracing with unique `x-request-id` headers.
- **Input Sanitization & Injection Defense:** SQL parameterized queries, XSS sanitization, and strict Zod payload validation.
- **Immutable Audit Logging:** All automated classification decisions, AI enrichment events, and human reviewer approvals are stored permanently.

---

## 📄 License & Attribution

Copyright © 2026 **CatalogForge** — Developed by **Vinay S. Bhadane** & **Sakshi P. Patil**, MET Institute of Engineering, Nashik (B.E. Computer Engineering, 2028).

Licensed under the MIT License.
