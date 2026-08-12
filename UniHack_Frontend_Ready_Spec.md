# UniHack — Frontend Ready Build Specification

> **Purpose:** This document is the implementation-ready frontend specification for the UniHack AI-Powered Product Intelligence platform described in the supplied Technical Architecture Guide.
>
> **Frontend scope:** Production-quality frontend only. The UI must be designed so the backend, AI/enrichment pipeline, database, Azure services, and Firebase authentication can be connected later without redesigning the frontend.
>
> **Important constraint:** **Do not ship static/fake business data.** Product records, jobs, analytics, confidence values, source evidence, LOV matches, audit entries, user data, and processing states must come from API responses. During frontend-only development, use loading skeletons, empty states, explicit "No data available" states, and API-contract-driven placeholders—not invented product examples or hardcoded statistics.

---

## 1. Product Goal

The UniHack frontend represents a constrained product-enrichment and validation system.

The core user journey is:

```text
Raw Input
  ↓
Upload / Ingestion
  ↓
Pre-flight Normalisation
  ↓
Classification
  ↓
Attribute & Description Enrichment
  ↓
Validation + Confidence Scoring
  ↓
 ┌───────────────────────────────┐
 │ confidence >= threshold       │ → Auto Publish
 │ confidence < threshold        │ → Human Review
 └───────────────────────────────┘
  ↓
Published Product / Audit Trail
  ↓
Analytics & Evaluation
```

The architecture guide explicitly positions the challenge as structured, constrained generation rather than an open-ended chatbot. The frontend must therefore communicate:

- structured records
- controlled vocabularies
- source-grounded values
- deterministic validation
- confidence
- human review
- auditability
- measurable accuracy

The frontend should not visually frame the product as a generic AI chat application.

---

# 2. Source Requirements the Frontend Must Represent

The supplied guide identifies four core frontend screens:

1. **Upload**
2. **Batch Processing Status**
3. **Enrichment Review Studio**
4. **Analytics Dashboard**

The guide also specifies authentication and role-based access, REST/JSON communication, and a Firebase ID-token based authentication flow.

The frontend should therefore implement those four screens as first-class application experiences and add supporting screens for products, product detail, audit history, profile/settings, login, and error handling.

### Required workflow requirements

The frontend must be capable of representing:

- CSV/XLSX upload
- manufacturer URL input
- manufacturer PDF input
- input row count
- input schema detection
- placeholder scan results
- processing status by pipeline stage
- per-row processing state
- classification status
- enrichment status
- validation status
- publish status
- human-review routing
- generated product fields
- source evidence
- nearest LOV matches
- field-level confidence
- validation flags
- approve/edit/reject actions
- audit history
- analytics
- field-level accuracy
- LOV resolution percentage
- character-limit compliance
- manufacturer-match rate
- review queue metrics
- live/refreshable evaluation metrics
- honest reporting of missing source/ground-truth information

---

# 3. Frontend Technology Stack

## 3.1 Primary stack

```text
Next.js
React
TypeScript
Tailwind CSS
```

Recommended implementation:

- Next.js App Router
- TypeScript strict mode
- Server Components by default
- Client Components only where interactivity is required
- Tailwind CSS for layout and styling
- CSS variables for the design system
- Component primitives from shadcn/ui / Radix-style patterns
- Lucide icons

## 3.2 Supporting libraries

Recommended:

```text
TanStack Table
Recharts
Zustand
React Hook Form
Zod
React Dropzone
date-fns
```

Use libraries only where they solve a real UI problem. Avoid unnecessary dependencies.

### Why these choices

| Requirement | Recommended solution |
|---|---|
| Tables | TanStack Table |
| Charts | Recharts |
| Client state | Zustand |
| Forms | React Hook Form + Zod |
| Drag/drop | React Dropzone |
| Icons | Lucide |
| Dates | date-fns |
| UI primitives | shadcn/ui / Radix |
| Routing | Next.js App Router |
| Authentication | Firebase Authentication |
| Backend communication | REST + JSON |
| Token transport | Firebase ID token in Authorization header |

---

# 4. Design Direction

## 4.1 Visual personality

The interface should feel like:

**Enterprise Product Intelligence + Data Operations + Explainable AI**

It should not feel like:

- a generic dashboard template
- a consumer SaaS landing page
- a chatbot
- a colorful AI toy
- a cryptocurrency dashboard
- an e-commerce storefront

### Design goals

- trustworthy
- technical
- precise
- calm
- information-dense
- accessible
- fast
- enterprise-grade
- judge-friendly

---

# 5. Professional Color System

Use a restrained neutral-first palette.

Do not use gradients as the primary visual language.

Do not use excessive saturated colors.

## 5.1 Core colors

```text
Background:
#F8FAFC

Surface:
#FFFFFF

Surface Muted:
#F1F5F9

Border:
#E2E8F0

Border Strong:
#CBD5E1

Primary Text:
#0F172A

Secondary Text:
#475569

Muted Text:
#64748B

Primary Brand:
#1D4ED8

Primary Hover:
#1E40AF

Primary Soft:
#EFF6FF
```

## 5.2 Semantic colors

```text
Success:
#047857

Success Soft:
#ECFDF5

Warning:
#B45309

Warning Soft:
#FFFBEB

Error:
#B91C1C

Error Soft:
#FEF2F2

Info:
#0369A1

Info Soft:
#F0F9FF

Neutral:
#475569
```

## 5.3 Confidence colors

Confidence must be visually understandable without depending only on color.

Suggested semantic interpretation:

```text
High confidence:
Success semantic treatment

Medium confidence:
Warning semantic treatment

Low confidence:
Error/Review semantic treatment
```

Always include:

- numeric value
- text label
- icon or status indicator

Never communicate confidence using color alone.

---

# 6. Typography

Recommended:

```text
Primary UI font:
Inter

Optional numeric/data font:
system monospace stack
```

Use a modern sans-serif with excellent readability.

### Type scale

```text
Page title: 28–32px
Section heading: 20–24px
Card heading: 16–18px
Body: 14–16px
Table: 13–14px
Metadata: 12–13px
```

Do not make body text too small.

The interface will contain structured data, so readability takes priority over visual decoration.

---

# 7. Spacing System

Use an 8px spacing rhythm:

```text
4px
8px
12px
16px
24px
32px
40px
48px
64px
```

Prefer:

- 24px page padding on desktop
- 16px on tablet
- 12–16px on mobile

Use consistent spacing between:

- cards
- sections
- table rows
- form controls
- headings
- labels
- helper messages

---

# 8. Application Structure

Recommended project structure:

```text
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   │
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── jobs/
│   │   │   ├── page.tsx
│   │   │   └── [jobId]/
│   │   │       └── page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [productId]/
│   │   │       └── page.tsx
│   │   ├── review/
│   │   │   ├── page.tsx
│   │   │   └── [reviewId]/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── audit/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   │
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── loading.tsx
│   ├── sitemap.ts
│   └── robots.ts
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── upload/
│   ├── jobs/
│   ├── products/
│   ├── review/
│   ├── analytics/
│   ├── audit/
│   └── shared/
│
├── lib/
│   ├── api/
│   ├── auth/
│   ├── constants/
│   ├── validators/
│   ├── formatting/
│   └── utils/
│
├── hooks/
│
├── store/
│
├── types/
│
└── styles/
    └── globals.css
```

---

# 9. Routing / Sitemap

## Public

```text
/
 /login
 /signup
```

## Authenticated

```text
/dashboard
/upload
/jobs
/jobs/[jobId]
/products
/products/[productId]
/review
/review/[reviewId]
/analytics
/audit
/settings
/profile
```

## Error/system routes

```text
/not-found
/error
```

---

# 10. Landing Page

Route:

```text
/
```

The landing page should communicate the product concept without showing fake metrics or fake product records.

## Required sections

### 10.1 Header

Navigation:

```text
Logo
Product
Workflow
Capabilities
Security
Sign In
Get Started
```

Keep the navigation minimal.

### 10.2 Hero

Headline should communicate:

> Transform raw product data into validated, source-grounded commerce records.

Supporting copy should explain:

- structured enrichment
- controlled vocabulary
- validation
- human review

Primary CTA:

```text
Start Enrichment
```

Secondary CTA:

```text
View Workflow
```

Do not show fake customer logos, fake percentages, fake processing numbers, or fake testimonials.

### 10.3 Workflow visualization

Show:

```text
Input
↓
Classify
↓
Enrich
↓
Validate
↓
Publish / Review
```

This is a diagram, not live data.

### 10.4 Explainability section

Visually demonstrate the concept using generic UI shapes—not fake business records:

```text
Generated Value
        ↕
Source Evidence
        ↕
Approved LOV Values
        ↕
Confidence
```

### 10.5 Feature sections

Highlight:

- Vocabulary-constrained enrichment
- Source-grounded generation
- Validation
- Confidence scoring
- Human-in-the-loop review
- Auditability
- Analytics

### 10.6 Footer

Include:

- Product
- Documentation
- Security
- Contact
- Sign in

---

# 11. Authentication

## 11.1 Login

Route:

```text
/login
```

Design:

- clean centered layout
- product logo
- email input
- password input
- loading state
- validation
- authentication error
- disabled submit during request
- password visibility control
- optional Google sign-in only if backend/product requirement enables it

## 11.2 Authentication architecture

Frontend should use Firebase Authentication.

The browser should obtain the Firebase ID token.

API requests should send:

```http
Authorization: Bearer <firebase-id-token>
```

The backend will validate the token.

Do not put backend secrets or Azure credentials into the browser.

---

# 12. Role-Based UI

The guide identifies:

```text
admin
reviewer
viewer
```

The frontend must consume the role from authenticated session/token-derived user state.

## Admin

Can:

- access dashboard
- upload
- view jobs
- view products
- review
- approve/correct/reject
- analytics
- audit
- settings

## Reviewer

Can:

- dashboard
- jobs
- products
- review
- analytics

Review actions depend on backend authorization.

## Viewer

Can:

- dashboard
- products
- analytics

No mutation controls should be rendered for viewer-only permissions.

### Important

Frontend role checks are only for UX.

Backend authorization remains authoritative.

Never assume hiding a button is a security mechanism.

---

# 13. Global Application Shell

Authenticated pages should use:

```text
┌──────────────────────────────────────────────┐
│ Top Header                                   │
├──────────────┬───────────────────────────────┤
│ Sidebar      │ Main Content                  │
│              │                               │
│ Dashboard    │                               │
│ Upload       │                               │
│ Jobs         │                               │
│ Products     │                               │
│ Review       │                               │
│ Analytics    │                               │
│ Audit        │                               │
│              │                               │
└──────────────┴───────────────────────────────┘
```

## Sidebar

Desktop:

- collapsible
- icon + label
- active state
- role-aware items

Mobile:

- sheet/drawer navigation

### Sidebar sections

```text
WORKSPACE

Dashboard
Upload Data
Processing Jobs
Products

INTELLIGENCE

Review Studio
Analytics
Audit Logs

SYSTEM

Settings
Profile
```

---

# 14. Dashboard

Route:

```text
/dashboard
```

The dashboard must never require static data.

When the backend has no records:

```text
No processing data yet.
Upload a dataset to begin.
```

## KPI cards

Cards should be API-driven:

- Products processed
- Active jobs
- Needs review
- Published
- Average confidence

Do not hardcode values.

### Loading

Use card skeletons.

### No data

Use an empty-state card.

### Error

Show:

```text
Unable to load dashboard data.
Try again.
```

## Recent Jobs

Use an API-driven table.

Columns:

```text
Job
Input
Rows
Stage
Progress
Status
Created
Action
```

---

# 15. Upload Page

Route:

```text
/upload
```

This page is a critical demo screen.

## 15.1 Upload modes

Provide tabs or segmented control:

```text
File Upload
Manufacturer PDF
Manufacturer URL
```

### File Upload

Accepted:

```text
CSV
XLSX
```

### PDF

Accept manufacturer specification/document PDF.

### URL

Input:

```text
Manufacturer document URL
```

The frontend must not independently decide whether a domain is approved. The backend/source governance layer is authoritative.

---

# 16. File Upload UI

Design:

```text
┌───────────────────────────────────────────────┐
│                                               │
│           Drop file here                      │
│                                               │
│           or Browse files                     │
│                                               │
│           CSV / XLSX                          │
│                                               │
└───────────────────────────────────────────────┘
```

After selection:

```text
File selected
────────────────────────
filename
file size
file type

[Remove]
```

Never fabricate row counts before the backend/parser has returned them.

---

# 17. Pre-flight Scan

After upload submission, show backend-returned pre-flight results:

```text
Schema
Row count
Column count
Placeholder scan
Warnings
Errors
```

The guide specifically calls for a placeholder scan and making placeholder handling visible.

Placeholder values include:

```text
-- Unbranded --
-- No Unilog Brand --
-- No DIB Brand --
```

Frontend should display backend-provided findings, for example:

```text
Placeholder scan
Status: Completed

Brand placeholders detected
Rows affected: [API value]
```

Do not invent the number.

---

# 18. Pre-flight States

Required UI states:

```text
Idle
File selected
Uploading
Scanning
Scan completed
Scan completed with warnings
Rejected
Network error
Backend error
```

Every async state must be visually clear.

---

# 19. Processing Jobs

Routes:

```text
/jobs
/jobs/[jobId]
```

## 19.1 Jobs list

Columns:

```text
Job ID
File
Rows
Stage
Progress
Status
Created
Updated
Action
```

All values must be API-derived.

## 19.2 Job detail

Show pipeline timeline:

```text
Ingested
   ↓
Classified
   ↓
Enriched
   ↓
Validated
   ↓
Published
```

Or:

```text
Validated
   ↓
Needs Review
   ↓
Human Approval
   ↓
Published
```

---

# 20. Processing Status Design

Use a reusable pipeline component.

Each stage:

```text
● Complete
◉ In Progress
○ Pending
! Needs Attention
× Failed
```

Do not use only animation to indicate progress.

### Real-time compatibility

Frontend should support either:

```text
Polling
```

or:

```text
WebSocket / SignalR
```

without changing UI components.

Create a data-source abstraction:

```ts
interface JobStatusSource {
  subscribe(
    jobId: string,
    onUpdate: (status: JobStatus) => void
  ): () => void;
}
```

The initial implementation may use polling.

Later the backend can replace the transport.

---

# 21. Products List

Route:

```text
/products
```

Purpose:

Provide a searchable, filterable list of enriched product records.

## Filters

Backend-driven filters should include, where available:

- status
- confidence range
- category/classpath
- manufacturer
- review status
- processing job
- date range

Do not populate filter values with fake examples.

Filters must come from API metadata or user input.

## Table

Potential columns:

```text
Part Number
Manufacturer
Brand
Classpath
Confidence
Status
Updated
Actions
```

---

# 22. Product Detail

Route:

```text
/products/[productId]
```

Use a tabbed layout:

```text
Overview
Descriptions
Attributes
Dimensions
Assets
Validation
Audit
```

## Overview

Show:

- Part number
- Manufacturer
- Brand
- Manufacturer part number
- Classpath
- UNSPSC
- Status
- Confidence

## Descriptions

Show all supported description forms:

```text
Invoice Description
Mobile Description
Short Description
Long Description
Retail Description
Marketing Description
```

The guide describes five major description formats and the broader delivery format contains additional fields.

The UI should be extensible and render fields from the backend schema rather than assuming a hardcoded set of 252 columns.

---

# 23. 252-Field Compatibility

Important frontend requirement:

Do not design the application around only a fixed visual subset.

The guide states that the delivery format has approximately 252 columns containing:

- Classpath
- multiple description fields
- item features
- attribute label/value/UOM triplets
- dimensions
- UPC/EAN/GTIN
- UNSPSC
- warranty
- packaging
- product images
- specification documents
- manuals
- drawings
- country of origin
- discontinued/image flags

The frontend must therefore use a schema-oriented renderer.

Recommended architecture:

```ts
interface FieldDefinition {
  key: string;
  label: string;
  type:
    | "text"
    | "number"
    | "boolean"
    | "url"
    | "image"
    | "document"
    | "attribute"
    | "dimension"
    | "status";
  group: string;
  editable: boolean;
  charLimit?: number;
  required?: boolean;
}
```

The API can later provide field metadata, or the frontend can maintain a versioned presentation schema.

Do not hardwire a giant 252-column table as the default product UI.

---

# 24. Enrichment Review Studio

Route:

```text
/review
/review/[reviewId]
```

This is the flagship UI.

## 24.1 Layout

Desktop:

```text
┌──────────────┬────────────────────────────┬─────────────────────┐
│ Record       │ Generated / Validated      │ Evidence            │
│ Navigation   │ Product Fields             │ & LOV               │
│              │                            │                     │
│              │ Field                      │ Source              │
│              │ Value                      │ Passage             │
│              │ Confidence                 │                     │
│              │ Flags                      │ LOV alternatives    │
│              │                            │                     │
└──────────────┴────────────────────────────┴─────────────────────┘
```

Use CSS grid.

Desktop:

```text
260px 1fr 380px
```

Do not use huge fixed widths that break on smaller screens.

---

# 25. Review Studio — Left Panel

Show review queue.

Each item should come from the API:

```text
Product / Review identifier
Status
Confidence
Reason
```

Sort/filter controls:

```text
Lowest confidence
Newest
Status
Job
```

No fake counts.

---

# 26. Review Studio — Center Panel

For each field:

```text
Field label

Generated value
[Confidence]

Validation flags

[Edit]
```

Example structure without hardcoded content:

```text
MANUFACTURER_NAME
──────────────────────────────
<API generated value>

Confidence
<API score>

Validation
<API flags>
```

### Editing

For editable fields:

```text
Read mode
    ↓
Edit mode
    ↓
Save
    ↓
API mutation
    ↓
Validation refresh
```

Do not claim the change is saved until the backend confirms success.

---

# 27. Review Studio — Right Panel

Evidence must include:

### Source passage

- source URL
- source title if returned
- excerpt
- highlighted evidence
- timestamp if available

### LOV alternatives

Show:

```text
Selected match
Closest alternatives
Similarity/confidence
```

The exact values must come from the backend.

The guide explicitly requires generated values to be shown with source evidence and nearest LOV matches.

---

# 28. Review Actions

Required controls:

```text
Approve
Edit
Reject
```

Use confirmation dialogs for destructive actions such as reject.

### Approval state

After action:

```text
Saving...
Approved
```

Never display success before the API response.

---

# 29. Confidence UI

Confidence must support:

```text
Field-level confidence
Row-level confidence
```

Recommended component:

```text
ConfidenceBadge
```

Props:

```ts
interface ConfidenceBadgeProps {
  score: number | null;
  label?: string;
  showProgress?: boolean;
}
```

If confidence is missing:

```text
Not available
```

Do not display `0%` as a substitute for missing data.

---

# 30. Validation Flags

Use compact chips.

Examples defined by the guide include:

```text
OVER_CHAR_LIMIT
NOT_IN_LOV
PLACEHOLDER_NOT_DATA
```

The frontend should not invent new validation semantics. Render backend-provided flags safely and allow unknown flags to display as readable labels.

---

# 31. Character Limits

The guide makes field-level character limits important.

For an editable field with a known limit:

```text
Current characters / Max characters
```

Example presentation:

```text
123 / 150
```

If the field has no configured limit:

```text
Character limit not configured
```

Do not invent a limit.

Backend remains authoritative for final validation.

---

# 32. Human-in-the-Loop Workflow

The frontend must clearly represent:

```text
Auto-publish
```

versus

```text
Needs human review
```

The guide uses a configurable confidence threshold to route low-confidence rows to Review Studio.

The threshold should come from backend/configuration rather than being hardcoded into multiple components.

Recommended:

```ts
interface ReviewPolicy {
  confidenceThreshold: number | null;
}
```

Display:

```text
Review threshold
<API/config value>
```

only where the product role is allowed to see it.

---

# 33. Analytics Dashboard

Route:

```text
/analytics
```

Analytics is a judging-critical screen.

## Required metrics

The guide identifies:

- field-level accuracy vs. 200-row ground truth
- percentage of values resolved in LOV
- character-limit compliance
- review queue SLA
- manufacturer-match rate

Render only metrics returned by the evaluation/analytics API.

## Cards

Use:

```text
Metric
Value
Trend
Time period
Status
```

Do not hardcode:

```text
94%
97%
99%
```

or any other fake values.

---

# 34. Charts

Recommended chart types:

### Accuracy

Line or area chart.

### LOV Resolution

Progress bar / radial visual.

### Character Compliance

Progress bar.

### Manufacturer Match

Progress bar.

### Review Queue

Bar chart or area chart.

### Processing throughput

Time-series chart if backend exposes it.

Use accessible chart summaries below each chart.

Example:

```text
Accuracy chart

Data unavailable until evaluation data is loaded.
```

---

# 35. Live Accuracy Scoreboard

The guide specifically recommends a scoreboard that updates as more ground-truth data is processed.

Frontend behavior:

```text
Initial
Loading evaluation...

Updated
Metric values rendered from API

Error
Unable to refresh evaluation
```

Support:

```text
Last updated: <timestamp>
Refresh
```

Do not use fake animation to simulate live accuracy.

---

# 36. Audit Logs

Route:

```text
/audit
```

The guide includes field-level audit data.

Recommended table:

```text
Timestamp
Product
Field
Generated Value
Confidence
Validation Flags
Reviewer
Action
```

Expandable row:

```text
Source snippet
Previous value
Final value
```

Use server-side pagination once backend exists.

Frontend must not assume all audit events fit into one page.

---

# 37. Empty States

Every data screen needs an empty state.

### Products

```text
No products yet
Upload a dataset to begin enrichment.
[Upload Data]
```

### Jobs

```text
No processing jobs yet.
```

### Review

```text
No items require review.
```

### Analytics

```text
Analytics will appear once processing/evaluation data is available.
```

### Audit

```text
No audit events available.
```

These messages are static UI copy, not static business data.

---

# 38. Loading States

Use skeletons for:

- cards
- tables
- product detail sections
- review fields
- source evidence
- charts
- navigation-dependent user information

Do not show arbitrary fake values during loading.

Preferred pattern:

```text
Loading
  ↓
Skeleton
  ↓
Data
```

not:

```text
Loading
  ↓
Fake number
  ↓
Data
```

---

# 39. Error States

Create reusable:

```text
ErrorState
InlineError
Toast
FieldError
PermissionError
NetworkError
EmptyState
```

## Error categories

### 401

Redirect to login / session renewal.

### 403

Show permission error:

```text
You do not have permission to perform this action.
```

### 404

Use `not-found.tsx`.

### 409

Show conflict and offer refresh.

### 422

Show backend validation error near the relevant field.

### 429

Show temporary rate-limit message.

### 5xx

Show retryable system error.

---

# 40. Toast System

Use toasts sparingly.

Success examples:

```text
Upload accepted.
Review action saved.
Changes saved.
```

Error:

```text
Unable to save changes.
```

Never use toasts as the only way to communicate critical state.

---

# 41. API Compatibility Architecture

This is one of the most important requirements.

Frontend must not directly couple components to URLs.

Use:

```text
Component
  ↓
Hook
  ↓
API Client
  ↓
REST endpoint
```

Example:

```text
ReviewField
   ↓
useReviewRecord()
   ↓
reviewApi.getRecord()
   ↓
GET /api/v1/reviews/:id
```

---

# 42. API Client

Create:

```text
src/lib/api/client.ts
```

Responsibilities:

- base URL
- Authorization header
- JSON serialization
- error normalization
- request cancellation
- timeout handling
- response parsing

Example interface:

```ts
interface ApiClientOptions {
  baseUrl: string;
  getAccessToken: () => Promise<string | null>;
}
```

---

# 43. Recommended API Namespace

Version the API from day one:

```text
/api/v1/
```

Suggested frontend contracts:

```text
GET    /api/v1/dashboard/summary

POST   /api/v1/ingestion/uploads
POST   /api/v1/ingestion/url
GET    /api/v1/ingestion/jobs
GET    /api/v1/ingestion/jobs/:jobId
GET    /api/v1/ingestion/jobs/:jobId/rows

GET    /api/v1/products
GET    /api/v1/products/:productId

GET    /api/v1/reviews
GET    /api/v1/reviews/:reviewId
PATCH  /api/v1/reviews/:reviewId/fields/:fieldName
POST   /api/v1/reviews/:reviewId/approve
POST   /api/v1/reviews/:reviewId/reject

GET    /api/v1/analytics/summary
GET    /api/v1/analytics/accuracy
GET    /api/v1/analytics/lov
GET    /api/v1/analytics/compliance

GET    /api/v1/audit
```

These are frontend integration recommendations, not claims that these exact endpoints already exist in the supplied guide. The guide specifies REST/JSON communication; the final backend may choose different resource paths.

---

# 44. API Contract Philosophy

Every API response should be:

- typed
- versioned
- predictable
- nullable where data may genuinely be unavailable
- explicit about status
- explicit about pagination
- explicit about timestamps

Avoid UI assumptions like:

```ts
confidence: 0
```

when the backend actually means:

```ts
confidence: null
```

Missing data and zero are not the same.

---

# 45. TypeScript Domain Models

Create:

```text
src/types/
```

Suggested interfaces:

```ts
export interface Product {
  productId: string;
  partNumber: string;
  manufacturerName: string | null;
  brandName: string | null;
  manufacturerPartNumber: string | null;
  classpath: string | null;
  unspsc: string | null;

  descriptions: ProductDescriptions;
  attributes: ProductAttribute[];
  features: ProductFeature[];
  dimensions: ProductDimensions | null;
  assets: ProductAsset[];

  confidence: number | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}
```

Never place sample product values inside the interface.

---

# 46. Attribute Model

```ts
export interface ProductAttribute {
  sequence: number;
  attributeLabel: string;
  attributeValue: string | null;
  attributeUom: string | null;
  confidence: number | null;
  validationFlags: string[];
  source: EvidenceReference | null;
}
```

---

# 47. Evidence Model

```ts
export interface EvidenceReference {
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceSnippet: string | null;
  sourceSpan: string | null;
}
```

The UI should be able to display a missing evidence state without fabricating a passage.

---

# 48. Review Model

```ts
export interface ReviewItem {
  reviewId: string;
  productId: string;
  status: ReviewStatus;
  rowConfidence: number | null;
  fields: ReviewField[];
}
```

```ts
export interface ReviewField {
  fieldName: string;
  label: string;
  generatedValue: string | null;
  confidence: number | null;
  validationFlags: string[];
  evidence: EvidenceReference | null;
  lovMatches: LovMatch[];
  editable: boolean;
}
```

---

# 49. LOV Match Model

```ts
export interface LovMatch {
  value: string;
  score: number | null;
  selected: boolean;
}
```

The frontend simply renders API data.

It does not run its own vocabulary matching engine.

---

# 50. Job Model

```ts
export type ProcessingStage =
  | "queued"
  | "ingested"
  | "classified"
  | "enriched"
  | "validated"
  | "published"
  | "needs_review"
  | "failed";
```

```ts
export interface ProcessingJob {
  jobId: string;
  fileName: string | null;
  rowCount: number | null;
  status: string;
  stage: ProcessingStage | null;
  progress: number | null;
  submittedAt: string;
  completedAt: string | null;
}
```

Progress is nullable.

Do not display a fake `0%` simply because the backend did not return progress.

---

# 51. Analytics Model

```ts
export interface AnalyticsSummary {
  fieldLevelAccuracy: number | null;
  lovResolutionRate: number | null;
  characterComplianceRate: number | null;
  manufacturerMatchRate: number | null;
  reviewQueueSla: number | null;
  lastUpdatedAt: string | null;
}
```

---

# 52. Pagination

All potentially large lists must support server-side pagination.

Examples:

```text
/products
/jobs
/review
/audit
```

Use a standard response:

```ts
interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number | null;
  totalPages: number | null;
}
```

If the backend uses cursor pagination, adapt the client layer without changing page components.

---

# 53. Search

Search should be debounced.

Recommended:

```text
250–400ms debounce
```

For large datasets, send queries to the backend.

Do not download the entire product catalog to the browser just to search it.

---

# 54. Filtering

UI filters should be encoded into URL query parameters wherever practical:

```text
/products?status=pending_review&page=2
```

Benefits:

- shareable
- bookmarkable
- browser navigation
- better debugging
- server-rendering compatibility where appropriate

---

# 55. Performance Strategy

Fast loading is a primary requirement.

## 55.1 Core principles

- minimize JavaScript
- use Server Components where possible
- dynamically import heavy interactive components
- do not load analytics libraries on every page
- avoid giant UI bundles
- optimize fonts
- optimize images
- virtualize large tables
- paginate server-side
- cache safe GET requests
- avoid unnecessary client state
- defer non-critical scripts

---

# 56. Next.js Rendering Strategy

### Marketing pages

Use:

```text
Server Components
static generation
```

### Product list

Prefer:

```text
Server Component shell
+
client table interactions
```

### Analytics

Use server-rendered shell with client-side interactive charts.

### Review Studio

Client-heavy because it needs:

- editing
- field selection
- evidence navigation
- action state
- keyboard shortcuts

Do not make the entire application client-rendered just because Review Studio is interactive.

---

# 57. Code Splitting

Dynamically load:

- charts
- large review widgets
- PDF previewer
- advanced table controls

Example concept:

```ts
const AnalyticsCharts = dynamic(
  () => import("@/components/analytics/analytics-charts"),
  { ssr: false }
);
```

Use dynamic loading only where it actually reduces initial bundle size.

---

# 58. Table Performance

For products/jobs/audit:

- pagination
- column visibility
- row virtualization for large result sets
- memoized row rendering
- avoid rendering 252 fields for every row
- fetch detail only after row selection

The product list should show a summary schema.

The 252-field record is a detail/review experience, not a default giant table.

---

# 59. Image Optimization

All product images must use optimized rendering.

If the backend returns external image URLs:

- use Next.js image configuration safely
- restrict remote domains
- use appropriate sizes
- lazy load images below the fold
- provide fallback when images are unavailable

Never assume every product has an image.

---

# 60. PDF / Document Preview

For source documents:

Prefer an on-demand document preview.

Do not bundle a heavy PDF rendering library into every page.

Use dynamic import.

If the backend supplies only a URL:

```text
Open source
```

should not bypass source/security policies.

---

# 61. SEO

SEO is primarily relevant to public pages.

Authenticated application pages should not be indexed.

## Public pages

Implement:

- title
- description
- canonical URL
- Open Graph metadata
- Twitter/X metadata
- favicon
- structured metadata where appropriate
- semantic HTML
- sitemap
- robots

## Application pages

Set:

```text
noindex
```

for authenticated/private content.

Never expose customer/product data in public SEO output.

---

# 62. Metadata

Use Next.js Metadata API.

Landing:

```text
title:
UniHack — AI-Powered Product Intelligence

description:
Source-grounded, vocabulary-constrained product enrichment, validation, and human review.
```

Login:

```text
noindex
```

Dashboard:

```text
noindex
```

Exact final copy can be refined during branding.

---

# 63. Semantic HTML

Use:

```text
<header>
<nav>
<main>
<section>
<article>
<footer>
<h1>
<h2>
<table>
<form>
<label>
<button>
```

Avoid building the entire application with generic `<div>` elements.

---

# 64. Accessibility

Target:

```text
WCAG 2.2 AA
```

Requirements:

- keyboard navigation
- visible focus state
- accessible labels
- ARIA only when necessary
- no color-only status
- sufficient contrast
- screen-reader-friendly tables
- modal focus trapping
- escape-to-close dialogs
- logical heading hierarchy
- accessible chart summaries

---

# 65. Keyboard Shortcuts

Review Studio should support keyboard-friendly review flow.

Potential shortcuts:

```text
A → Approve
E → Edit
R → Reject
J → Next review item
K → Previous review item
```

These shortcuts must always have a discoverable help UI.

Do not trigger shortcuts while the user is typing in a text field.

---

# 66. Responsive Design

## Desktop

Optimized for:

```text
1280px+
```

Primary Review Studio layout should be desktop-first.

## Tablet

At approximately:

```text
768px+
```

Collapse:

```text
sidebar
multi-column evidence panel
```

## Mobile

At small widths:

- sidebar becomes drawer
- review panels stack
- tables become cards or horizontally scroll
- action buttons remain reachable
- fields stack

Review Studio should remain usable but does not need to replicate the desktop three-column layout exactly.

---

# 67. Design Tokens

Use CSS variables instead of scattering color values across components.

Example:

```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --surface: #ffffff;
  --surface-muted: #f1f5f9;

  --border: #e2e8f0;
  --border-strong: #cbd5e1;

  --primary: #1d4ed8;
  --primary-hover: #1e40af;

  --success: #047857;
  --warning: #b45309;
  --danger: #b91c1c;
  --info: #0369a1;
}
```

All UI components should consume tokens.

---

# 68. Reusable UI Components

Required foundational components:

```text
Button
Input
Textarea
Select
Checkbox
Switch
Badge
Tooltip
Dialog
Drawer
Tabs
Dropdown
Popover
Card
Table
Pagination
Breadcrumb
Alert
Toast
Skeleton
Progress
EmptyState
ErrorState
ConfirmDialog
```

Domain components:

```text
ConfidenceBadge
ValidationFlag
PipelineStage
PipelineTimeline
EvidenceViewer
LovMatches
ProductField
EditableProductField
ReviewActionBar
UploadDropzone
PreflightSummary
JobStatusCard
MetricCard
AccuracyChart
AuditTimeline
```

---

# 69. Upload Components

Create:

```text
UploadDropzone
UploadModeTabs
FileMetadataCard
PreflightSummary
PreflightCheckList
UploadProgress
```

Do not place business-specific parsing rules in these components.

---

# 70. Review Components

Create:

```text
ReviewQueue
ReviewRecord
ReviewField
FieldConfidence
ValidationFlags
EvidencePanel
LovMatchList
ReviewActionBar
SourceDocumentPanel
```

These should receive typed props.

They should not fetch directly unless a dedicated hook/provider owns the data.

---

# 71. Analytics Components

Create:

```text
MetricCard
MetricGrid
AccuracyChart
ComplianceChart
LovResolutionChart
ManufacturerMatchChart
ReviewSlaChart
LiveScoreboard
DateRangeFilter
```

Charts must handle:

```text
loading
empty
error
success
```

---

# 72. Data Fetching Strategy

Choose one coherent strategy.

Recommended:

```text
Server fetching:
Next.js server-side data fetching for initial page state

Client updates:
TanStack Query or controlled fetch hooks for interactive areas
```

If TanStack Query is added, use it systematically rather than only for one page.

If avoiding another dependency, create a small typed fetch/hook layer.

The key requirement is that API behavior is isolated from visual components.

---

# 73. State Management

Use global state only for:

- authenticated user
- role
- UI preferences
- review navigation state where necessary

Do not store the entire backend database in Zustand.

Server data belongs to server/data-fetching state.

---

# 74. Authentication State

Create:

```text
AuthProvider
useAuth()
```

Expose:

```ts
user
role
loading
signIn()
signOut()
refreshToken()
```

Do not place Firebase initialization directly inside random components.

---

# 75. Environment Variables

Frontend-safe variables:

```text
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_API_BASE_URL
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

Never expose:

```text
Azure secret keys
Azure OpenAI keys
Service Bus credentials
Database passwords
private signing keys
admin service credentials
```

---

# 76. Security Requirements

Frontend must:

- use HTTPS in production
- store no private Azure credentials
- rely on backend authorization
- send ID token with protected requests
- avoid dangerouslySetInnerHTML unless absolutely necessary
- sanitize/render source text safely
- avoid rendering raw HTML from source documents
- validate uploads at UI level
- enforce backend validation server-side
- never trust client-side roles for authorization

---

# 77. File Upload Security

Frontend validation:

- accepted extension
- file size limit from backend/product config
- upload progress
- cancellation
- clear error message

But frontend validation is only UX.

Backend must perform:

- MIME validation
- content validation
- malware/security scanning as required
- schema validation
- source validation

Do not assume a file is safe because its extension is `.csv`, `.xlsx`, or `.pdf`.

---

# 78. Backend-Driven Configuration

Where requirements may change, make them API-driven.

Examples:

```text
accepted file types
max file size
confidence threshold
review policy
field definitions
character limits
available filters
feature flags
```

Create:

```text
GET /api/v1/config
```

if backend chooses to expose centralized configuration.

Frontend should still have safe fallbacks for presentation only.

---

# 79. No Static Business Data Policy

This rule is mandatory.

Do not hardcode:

```text
product names
part numbers
manufacturer names
brand names
LOV values
confidence scores
accuracy percentages
review counts
job counts
processing rows
source passages
audit entries
```

Do not include fake examples such as:

```text
FRIGIDAIRE®
PDSH4816AF
94%
200 products
```

unless they are dynamically returned from the actual backend or supplied by the user for a real session.

For design/demo, use:

```text
Loading...
No data yet
Not available
Select a record
```

---

# 80. Frontend-only Development Without Static Data

During implementation before backend is available:

### Allowed

```text
Skeleton loaders
Empty states
Disabled controls
Schema-only components
API error states
Loading states
URL-driven state
Test-only automated component snapshots
```

### Avoid

```text
Fake products
Fake statistics
Fake job histories
Fake source snippets
Fake AI results
Fake confidence
```

A component should be testable using TypeScript object shapes and automated tests without shipping a fake dataset.

---

# 81. Optional Development Mocking

If local development absolutely requires simulated network responses, keep them outside production.

Use a mock server/interceptor layer such as:

```text
MSW
```

Requirements:

- mock handlers live under a development/test-only path
- production builds must not register them
- mock mode must be explicitly enabled
- mocked records must never be presented as real data
- no mock business data committed into the production UI

Prefer contract-only tests whenever possible.

---

# 82. API Error Envelope

Recommend backend error shape:

```ts
interface ApiError {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
}
```

Frontend should normalize all errors into this shape.

Display user-friendly messages while keeping technical request IDs available for troubleshooting.

---

# 83. Request Lifecycle

Every API mutation should follow:

```text
Idle
 ↓
Submitting
 ↓
Success
```

or:

```text
Idle
 ↓
Submitting
 ↓
Error
```

Disable duplicate submission.

Abort stale requests where appropriate.

---

# 84. Upload Lifecycle

```text
Idle
 ↓
File Selected
 ↓
Client Validation
 ↓
Upload
 ↓
Backend Accepted
 ↓
Pre-flight
 ↓
Job Created
 ↓
Navigate to Job Detail
```

Do not mark a job as processing before the backend confirms that it exists.

---

# 85. Review Mutation Lifecycle

```text
Click Approve
 ↓
Confirm if required
 ↓
API Request
 ↓
Backend validates
 ↓
Success
 ↓
Update record state
 ↓
Move to next review item
```

Optimistic updates can be used only where rollback behavior is reliable.

For approval/rejection, pessimistic confirmation is safer for the first production version.

---

# 86. Routing and Navigation Behavior

After upload succeeds:

```text
/upload
   ↓
/jobs/[jobId]
```

After selecting a product:

```text
/products
   ↓
/products/[productId]
```

After opening a review:

```text
/review
   ↓
/ review/[reviewId]
```

After approving:

```text
/review/[reviewId]
   ↓
next pending item OR review queue
```

Preserve search/filter context.

---

# 87. Breadcrumbs

Use breadcrumbs on deep pages:

```text
Products / Product
Jobs / Job
Review / Review Item
```

Do not use breadcrumbs on every small panel.

---

# 88. URL State

Use query parameters for:

- search
- pagination
- filters
- sorting
- selected tab where useful

Example:

```text
/products?search=&status=&page=1
```

Do not put huge serialized product records into the URL.

---

# 89. Performance Budget

Establish measurable goals.

Suggested initial targets:

```text
Fast initial render
Minimal client JS
No large blocking bundle
Responsive interaction
```

Track:

- LCP
- CLS
- INP
- TTFB

Use Lighthouse and browser performance tooling.

The exact numeric thresholds can be set during deployment, but the frontend should be built toward strong Core Web Vitals from the beginning.

---

# 90. Font and Asset Optimization

Use:

```text
next/font
```

Do not load fonts from third-party CSS unless necessary.

Use SVG for icons.

Do not ship huge PNG assets when SVG or compressed WebP/AVIF is suitable.

---

# 91. Animations

Animations should be subtle.

Use:

- opacity
- transform
- progress transitions
- panel expansion

Avoid:

- continuous background motion
- distracting gradients
- excessive parallax
- heavy animation on data tables

Respect:

```css
@media (prefers-reduced-motion: reduce)
```

---

# 92. Professional Dashboard Layout

The overall visual hierarchy:

```text
Page Title
Breadcrumb / context

Primary action

High-level summary

Main data visualization/table

Secondary information

Detail panels
```

Avoid putting 20 cards at the top of a page.

---

# 93. Dashboard Card Rules

Cards should:

- have consistent height where appropriate
- have small radius
- use subtle borders
- minimal shadow
- strong typography hierarchy
- avoid excessive decorative icons

Suggested radius:

```text
8px–12px
```

Avoid rounded-everything styling.

---

# 94. Tables

Tables are critical to this product.

Requirements:

- sticky header where useful
- hover row state
- focus row state
- sort indicators
- pagination
- column controls
- density option if useful
- truncation with tooltip
- accessible column headers
- keyboard navigation where feasible

Never make a 252-column table the primary browsing UI.

---

# 95. Product Field Renderer

Build a generic:

```text
DynamicFieldRenderer
```

Capabilities:

```text
text
number
boolean
url
image
document
attribute
dimension
status
confidence
```

This makes the UI compatible with future schema changes.

---

# 96. Source Evidence UX

Evidence should feel like a forensic inspection panel.

Structure:

```text
SOURCE
Manufacturer source
[Open source]

EVIDENCE
Highlighted excerpt

FIELD
<field name>

EXTRACTED VALUE
<value>

MATCH
<LOV match>

CONFIDENCE
<score>
```

Do not fabricate evidence.

If source passage is missing:

```text
No source evidence returned for this field.
```

---

# 97. Honest Gap Reporting

The guide explicitly values identifying genuine missing information instead of inventing it.

Frontend must support:

```text
Missing
Not provided
Not found
Source unavailable
Not evaluated
```

These are different from:

```text
False
0
Unknown
```

Avoid silently converting null into a meaningful value.

---

# 98. Placeholder Visualization

When backend identifies placeholder input values, display:

```text
Placeholder detected
Not treated as data
```

The frontend should not show placeholder brand values as real brands.

A special status:

```text
PLACEHOLDER_NOT_DATA
```

should be understandable to reviewers.

---

# 99. Review Studio Explainability

This is the main differentiator.

A reviewer should be able to answer three questions immediately:

1. **What value did the system produce?**
2. **Why did it produce that value?**
3. **Can I trust or correct it?**

UI must support exactly that relationship.

---

# 100. Analytics Explainability

Every metric should have:

```text
metric name
definition
value
time/evaluation scope
last updated
```

Use an info tooltip for metric definitions.

Do not label a metric simply:

```text
Accuracy
```

without explaining which accuracy.

Use:

```text
Field-level accuracy
```

when that is what the API returns.

---

# 101. Evaluation Scope

The guide discusses evaluation against the 200-row ground truth.

Frontend should show evaluation scope when the backend supplies it:

```text
Evaluation dataset
Rows evaluated
Fields evaluated
Category/classpath scope
Last updated
```

Do not claim that all 252 fields are evaluated if the backend has only evaluated the MVP subset.

---

# 102. Category Scope

The guide recommends a depth-first MVP around one category such as Fittings or Faucets.

The frontend must support category scoping without hardcoding which category.

Use backend/config-provided category information.

Example display:

```text
Current evaluation scope
<category returned by API>
```

If none is configured:

```text
Evaluation scope not available
```

---

# 103. Delivery Export Compatibility

The guide explains that the normalized relational model can be flattened to the Delivery Format.

Frontend should therefore provide an export action only when backend supports it.

Possible UI:

```text
Export
  CSV
  XLSX
```

Do not generate the 252-column output in the browser unless explicitly required.

The backend should remain the source of truth for final exports.

---

# 104. Product Assets

Product detail should support:

```text
Product images
Specification sheet
Manual
SDS
Drawing
Catalog
```

Each asset should show:

```text
Type
Name
Source
Preview / Open
```

Only render an asset if the backend returns it.

---

# 105. Mobile Considerations

Mobile is secondary for Review Studio but primary for general navigation.

Use:

- responsive sidebar
- bottom-friendly action buttons
- horizontally scrollable tables
- stacked review layout
- simplified charts

Avoid forcing complex multi-column review screens into tiny screens.

---

# 106. Component Testing

Test:

- loading
- empty
- success
- error
- permission denied
- long text
- missing fields
- unknown validation flag
- null confidence
- long source evidence
- large attribute list
- keyboard behavior

Do not test only the happy path.

---

# 107. Accessibility Testing

Use:

```text
axe
Lighthouse
keyboard-only testing
screen-reader spot checks
```

Minimum checks:

- no missing form labels
- no inaccessible icon buttons
- focus visible
- dialog focus trapped
- color contrast
- table headers
- semantic heading hierarchy

---

# 108. SEO Testing

Validate:

- title
- description
- canonical
- robots
- sitemap
- OG tags
- no private application indexing

---

# 109. Performance Testing

Test:

```text
Landing page
Dashboard
Products list
Review Studio
Analytics
```

Measure:

- initial JS
- network requests
- image payload
- font payload
- rendering time
- interaction latency

Review Studio must not block the entire app from loading.

---

# 110. CI Requirements

Recommended checks:

```text
npm run lint
npm run typecheck
npm run test
npm run build
```

Optional:

```text
npm run test:e2e
```

CI should fail on TypeScript errors.

---

# 111. Code Quality Rules

Use:

- strict TypeScript
- no implicit `any`
- reusable typed components
- centralized API client
- centralized domain types
- small components
- explicit loading/error handling
- no secrets in source
- no debug console logs in production
- no fake business data
- no unused dependencies

---

# 112. ESLint / Formatting

Use:

```text
ESLint
Prettier
```

Recommended policies:

- no unused variables
- no implicit any
- React hook rules
- import ordering
- consistent formatting

---

# 113. Git Structure

Suggested:

```text
main
develop

feature/*
fix/*
refactor/*
```

Commit examples:

```text
feat: add upload workflow
feat: add review studio shell
feat: add analytics dashboard
feat: integrate firebase auth
fix: handle review mutation error
perf: lazy load analytics charts
```

---

# 114. Frontend Implementation Order

Build in this order:

## Phase 1 — Foundation

```text
Next.js
TypeScript
Tailwind
design tokens
layout
navigation
responsive shell
```

## Phase 2 — Public/auth

```text
landing
login
auth provider
route protection
```

## Phase 3 — Core workflow

```text
upload
pre-flight
jobs
job detail
```

## Phase 4 — Product

```text
products
product detail
dynamic field renderer
assets
validation
```

## Phase 5 — Review Studio

```text
review queue
review detail
evidence
LOV matches
confidence
approve/edit/reject
audit
```

## Phase 6 — Analytics

```text
metric cards
charts
live scoreboard
evaluation scope
```

## Phase 7 — Quality

```text
SEO
accessibility
performance
error states
testing
```

---

# 115. MVP Priority

If time is limited, prioritize:

```text
1. Upload
2. Processing status
3. Review Studio
4. Analytics
5. Dashboard
6. Products
7. Product detail
8. Audit
9. Settings/Profile
```

The guide specifically identifies Upload, Batch Status, Review Studio, and Analytics as the core frontend screens.

---

# 116. Demo-Ready Flow

The frontend should support this complete judge flow:

```text
Landing
 ↓
Login
 ↓
Dashboard
 ↓
Upload
 ↓
Pre-flight summary
 ↓
Create processing job
 ↓
Job status
 ↓
Classification
 ↓
Enrichment
 ↓
Validation
 ↓
Needs Review
 ↓
Review Studio
 ↓
Generated field
 ↓
Source evidence
 ↓
LOV alternatives
 ↓
Confidence
 ↓
Approve / Correct / Reject
 ↓
Published status
 ↓
Analytics
 ↓
Accuracy / LOV / Compliance / Manufacturer Match
 ↓
Audit trail
```

No artificial animation should pretend that backend processing happened.

---

# 117. Frontend Requirements Traceability Matrix

| Guide requirement | Frontend implementation |
|---|---|
| Upload CSV/XLSX | Upload page + dropzone |
| Manufacturer PDF/URL | Upload modes |
| Row count | Pre-flight API result |
| Placeholder scan | Pre-flight summary |
| Pipeline stages | Job detail timeline |
| Classification | Processing stage |
| Enrichment | Processing stage + product fields |
| Validation | Validation flags |
| Confidence | Confidence badge |
| Auto-publish | Published state |
| Human review | Review Studio |
| Source evidence | Evidence panel |
| LOV alternatives | LOV match panel |
| Approve/Edit/Reject | Review actions |
| Audit trail | Audit page + product audit tab |
| Product record | Product pages |
| 252-column compatibility | Dynamic field renderer |
| Attributes | Attribute table |
| UOM | Attribute/dimension rendering |
| Product assets | Assets tab |
| Analytics | Analytics dashboard |
| Field-level accuracy | Analytics metric |
| LOV resolution | Analytics metric |
| Character compliance | Analytics metric |
| Review SLA | Analytics metric |
| Manufacturer match | Analytics metric |
| Live scoreboard | Live/refreshable analytics widget |
| Firebase Auth | Auth provider |
| RBAC | Permission-aware UI |
| REST/JSON | Typed API client |
| Fast frontend | Server components + code splitting |
| SEO | Metadata + sitemap + robots |
| Accessibility | WCAG-oriented component design |

---

# 118. Definition of Done

Frontend is considered complete when:

### Architecture

- [ ] Next.js App Router implemented
- [ ] TypeScript strict
- [ ] API client isolated from UI
- [ ] domain types created
- [ ] authentication abstraction created
- [ ] role-based UI abstraction created

### UX

- [ ] landing page
- [ ] login
- [ ] dashboard
- [ ] upload
- [ ] pre-flight
- [ ] jobs
- [ ] job detail
- [ ] products
- [ ] product detail
- [ ] review studio
- [ ] analytics
- [ ] audit
- [ ] profile/settings

### Core workflow

- [ ] CSV/XLSX UI
- [ ] PDF UI
- [ ] URL UI
- [ ] pre-flight UI
- [ ] processing UI
- [ ] review UI
- [ ] evidence UI
- [ ] LOV UI
- [ ] confidence UI
- [ ] approve/edit/reject UI
- [ ] audit UI
- [ ] analytics UI

### Data integrity

- [ ] no fake products
- [ ] no fake statistics
- [ ] no hardcoded confidence
- [ ] no fake review entries
- [ ] no fake source passages
- [ ] no hardcoded manufacturer/brand records
- [ ] API-compatible empty states everywhere

### Performance

- [ ] Server Components used wherever practical
- [ ] dynamic imports for heavy modules
- [ ] optimized images
- [ ] optimized fonts
- [ ] paginated tables
- [ ] virtualized large tables where needed
- [ ] minimal client-side state

### SEO

- [ ] public metadata
- [ ] sitemap
- [ ] robots
- [ ] canonical
- [ ] Open Graph
- [ ] private routes noindex

### Accessibility

- [ ] keyboard navigation
- [ ] visible focus
- [ ] semantic HTML
- [ ] accessible forms
- [ ] color-independent status
- [ ] accessible dialogs
- [ ] accessible tables
- [ ] reduced motion

### Backend compatibility

- [ ] API base URL via environment variable
- [ ] Firebase token support
- [ ] REST/JSON client
- [ ] error envelope handling
- [ ] pagination support
- [ ] nullable values supported
- [ ] backend-driven status values
- [ ] backend-driven configuration supported

---

# 119. Recommended Final Frontend Stack Summary

```text
Framework
└── Next.js

Language
└── TypeScript

UI
├── React
├── Tailwind CSS
├── shadcn/ui / Radix primitives
└── Lucide

Data
├── Typed REST client
├── TanStack Query (optional/recommended for interactive server state)
└── Zod

Tables
└── TanStack Table

Charts
└── Recharts

Forms
└── React Hook Form + Zod

Upload
└── React Dropzone

State
└── Zustand for UI/session state only

Authentication
└── Firebase Authentication

Backend communication
└── REST / JSON

Backend token
└── Firebase ID token

Deployment target
└── Any Next.js-compatible hosting platform

SEO
└── Next.js Metadata + sitemap + robots

Testing
├── Vitest/Jest
├── React Testing Library
└── Playwright
```

---

# 120. Final Design Principle

The entire interface should communicate one idea:

> **The system does not simply generate product content. It transforms raw product input into structured, constrained, validated, source-grounded records—and shows the reviewer why every uncertain field should be trusted, corrected, or rejected.**

The visual design must therefore prioritize:

```text
Trust
  >
Clarity
  >
Evidence
  >
Validation
  >
Confidence
  >
Human Control
  >
Visual Decoration
```

The strongest frontend is not the one with the most animations or cards.

The strongest frontend is the one where a judge can understand, within seconds:

```text
What came in?
     ↓
What did the system infer?
     ↓
What evidence supports it?
     ↓
Did validation pass?
     ↓
How confident is it?
     ↓
Why did it go to human review?
     ↓
What happened after review?
     ↓
Can the results be measured?
```

That is the UI architecture this specification is designed to implement.

---

## Source Alignment

This specification is based on the supplied **UniHack — AI-Powered Product Intelligence for Industrial Commerce — Technical Architecture & Winning-MVP Build Guide**.

Key source areas used:

- **Pages 2–3:** problem definition, value proposition, constraints, MVP scope
- **Page 4:** end-to-end pipeline and frontend architecture
- **Pages 5–7:** data model, frontend screens, authentication/security
- **Pages 8–10:** AI/extraction/RAG/validation concepts that the frontend must represent
- **Pages 11–12:** alignment requirements and judging/demo strategy

The frontend should implement the UI contract described above while leaving enrichment, lookup, validation, storage, scoring, and source retrieval logic to the backend services described in the guide.
