# GramSetu (ग्रामसेतु) Backend Service

> **TechTrix'26 — Problem Statement 1: Smart Rural Housing & Panchayat Monitoring Platform**  
> *Core Promise: Every Work Verified. Every Benefit Accountable.*

The GramSetu backend is a production-minded, modular, and secure RESTful service built with Node.js 24 LTS, Express.js (ES modules), and Supabase PostgreSQL. It powers rural housing monitoring, beneficiary verification workflows, photographic evidence cryptographic integrity, geo-fence discrepancy detection, DBT installment readiness checks, deterministic explainable risk scoring, and an append-only audit trail.

---

## 1. System Architecture

- **Runtime & Framework**: Node.js 24 LTS, Express.js 4 (ES Modules)
- **Primary Database**: Supabase PostgreSQL (with Row-Level Security, constraints, and foreign keys)
- **Resilient Fallback Mode**: Zero-credential In-Memory Demo Store for immediate local hackathon evaluation without external cloud dependencies
- **Authentication**: JWT Bearer token authentication + trusted demo role-switching (`X-Demo-Role`) for seamless UI evaluation
- **Evidence Verification**: Cryptographic SHA-256 byte hashing (Node.js native `crypto`) with cross-project hash collision detection and Haversine geo-fence discrepancy analysis
- **Risk Scoring**: Deterministic, explainable scoring engine evaluating photo hash reuse, geo-fencing (>28km), name similarity, and overdue stages
- **AI Assistant**: Deterministic bilingual (English & Hindi) query engine with seamless fallback to Google Gemini when `GEMINI_API_KEY` is provided

---

## 2. Directory Structure

```
backend/
├── src/
│   ├── config/             # Environment, Database, Supabase & Storage configs
│   ├── middleware/         # Auth, RBAC, Validation, Rate Limiting, Redacted Logging, Error Handler
│   ├── modules/            # Domain controllers & route handlers
│   │   ├── auth/           # Login, Demo Switcher, Identity
│   │   ├── schemes/        # Flagship rural development schemes
│   │   ├── beneficiaries/  # Statutory 9-step verification checklist
│   │   ├── housingProjects/# 4-stage housing construction lifecycles
│   │   ├── inspections/    # Field inspection records & review actions
│   │   ├── evidence/       # Cryptographic evidence upload & signed URLs
│   │   ├── installments/   # Milestone-linked DBT approvals & simulated PFMS
│   │   ├── approvals/      # Multi-level approval decision log
│   │   ├── riskCases/      # Explainable fraud & risk cases
│   │   ├── auditLogs/      # Append-only immutable audit trail
│   │   ├── notifications/  # User-targeted event alerts
│   │   ├── grievances/     # Citizen tracking & status updates
│   │   ├── locations/      # Geographic hierarchy (State -> GP -> Village)
│   │   ├── reports/        # Real-time aggregated live dashboard metrics
│   │   ├── sync/           # Offline-first idempotent queue synchronization
│   │   └── assistant/      # Bilingual conversational query assistant
│   ├── routes/             # Central router & frontend compatibility aliases
│   ├── services/           # Evidence integrity, Risk scoring, Workflow engine, Audit logger
│   ├── utils/              # API response envelopes, Pagination, UUIDs, Error classes
│   ├── app.js              # Express application assembly
│   └── server.js           # Server bootstrap & lifecycle management
├── database/
│   ├── migrations/         # 001_initial_schema.sql (14 tables, indexes, RLS)
│   └── seeds/              # seedData.js, seed.js (Synthetic demo dataset)
├── tests/                  # 33 unit and integration tests (Node 24 native test runner)
│   ├── unit/               # evidenceIntegrity, riskScoring, workflowEngine
│   └── integration/        # authAndPermissions, apiEndpoints
├── .env.example
├── package.json
└── README.md
```

---

## 3. Database Schema & Tables

The schema is defined in `database/migrations/001_initial_schema.sql` and includes 14 relational tables:

| Table | Purpose & Key Fields |
|---|---|
| `profiles` | User accounts, roles (`state_admin`, `district_officer`, `bdo`, `field_inspector`, `auditor`, `citizen`), assigned jurisdictions. |
| `locations` | Geographic hierarchy: State -> District -> Block -> Gram Panchayat -> Village with latitude/longitude. |
| `schemes` | PMAY-G, Jal Jeevan Mission, SBM-G, PMGSY, Amrit Sarovar, Rural Solar Urja with budget allocations. |
| `beneficiaries` | Applicant reference, normalized name, masked phone, 9-step statutory checklist, reviewer notes. |
| `housing_projects` | Project reference, 4 construction stages (`foundation`, `plinth`, `lintel`, `completion`), stage completion %. |
| `inspections` | Inspection records, client UUIDs, GPS coordinates, inspection notes, review status. |
| `inspection_evidence` | Storage path, original filename, MIME type, file size, SHA-256 digest, geo-fence discrepancy flag. |
| `installments` | Milestone-linked DBT tranches, prerequisite check results, simulated PFMS reference, approval timestamps. |
| `approvals` | Comprehensive decision history (entity type, action, reviewer ID, previous status, new status). |
| `risk_cases` | Explainable risk score (0-100), risk level (`low`, `medium`, `high`, `critical`), trigger indicators JSON. |
| `audit_logs` | Append-only system audit log (`actor`, `action`, `entity_type`, `before_state`, `after_state`, `timestamp`). |
| `notifications` | Role-targeted operational notifications with read tracking. |
| `grievances` | Public grievances with secure tracking codes (`GRV-2026-UP-XXXX`) protecting complainant privacy. |
| `sync_records` | Offline queue idempotency tracking (`client_record_id`, `status`, `conflict_data`). |

---

## 4. Role-Based Access Control (RBAC) Matrix

| Operation / Endpoint | `state_admin` | `district_officer` | `bdo` | `field_inspector` | `auditor` | `citizen` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **View Dashboard & Public Schemes** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Register New Scheme** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Register Beneficiary** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Statutory Checklist Verification** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Submit Field Inspection** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Approve / Reject Inspection** | ✅ | ✅ | ✅ | ❌ *(Duties Sep.)* | ❌ | ❌ |
| **Approve / Reject DBT Installment** | ✅ | ✅ | ❌ | ❌ *(Duties Sep.)* | ❌ | ❌ |
| **Upload Evidence & SHA-256 Hash** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Update Fraud Case Status** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ✅ | ✅ | ✅ | ✅ *(Read-Only)* | ❌ |
| **Mutate Records (Auditor)** | ❌ | ❌ | ❌ | ❌ | ❌ *(Blocked)* | ❌ |
| **Submit Citizen Grievance** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Trigger Demo Reset** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 5. Working API Endpoints

### System & Health
- `GET /api/health` — Service health, active database mode (`supabase_persistent` or `in_memory_demo`).
- `POST /api/reset-demo` — Restore deterministic demonstration baseline (State Admin only).

### Authentication & Profiles
- `POST /api/auth/login` — Standard credentials login (returns JWT).
- `POST /api/auth/demo-login` — Issue JWT for selected synthetic role.
- `GET /api/auth/me` — Return authenticated caller profile and role jurisdiction.

### Schemes & Locations
- `GET /api/schemes` — List schemes with category and status filters.
- `GET /api/schemes/:id` — Get scheme details.
- `POST /api/schemes` — Register scheme (State Admin only).
- `GET /api/locations` — Query geographic hierarchy and geo coordinates.

### Beneficiaries & Housing Projects
- `GET /api/beneficiaries` — Search beneficiaries by district, block, panchayat, status.
- `GET /api/beneficiaries/:id` — Beneficiary record with masked personal details.
- `POST /api/beneficiaries` — Register applicant into GramSetu.
- `PATCH /api/beneficiaries/:id/verify` — Statutory 9-step verification checklist workflow.
- `GET /api/beneficiaries/:id/duplicates` — Real-time duplicate candidate detection.
- `GET /api/housing-projects` *(alias: `/api/projects`)* — Housing projects with 4-stage construction progress.
- `GET /api/housing-projects/:id` — Specific project details with stage history.

### Inspections & Cryptographic Evidence
- `GET /api/inspections` — List inspections with stage and status filters.
- `GET /api/inspections/:id` — Inspection details.
- `POST /api/inspections` — Create or sync inspection (supports client UUID idempotency).
- `POST /api/inspections/:id/submit` — Transition inspection from draft to submitted.
- `POST /api/inspections/:id/approve` — Approve inspection stage (Officer only).
- `POST /api/inspections/:id/reject` — Reject inspection stage with remarks.
- `POST /api/inspections/:id/request-correction` — Request inspector rework.
- `POST /api/inspections/:id/evidence` — Upload photo bytes; computes SHA-256 and detects collisions.
- `GET /api/inspections/:id/evidence` — Retrieve inspection evidence records.

### Installments & Approvals
- `GET /api/installments` — List DBT installment milestones.
- `GET /api/installments/:id` — Installment record.
- `PATCH /api/installments/:id/approve` — Validate prerequisites & issue simulated PFMS reference.
- `PATCH /api/installments/:id/reject` — Reject installment with mandatory reason.
- `GET /api/approvals` — Workflow approval decision history.

### Risk Scoring, Audit, & Offline Sync
- `GET /api/risk-cases` *(alias: `/api/fraud-cases`)* — Explainable risk cases with indicators.
- `PATCH /api/risk-cases/:id/status` — Update risk case status and remarks.
- `GET /api/audit-logs` — Immutable, append-only system audit trail.
- `POST /api/sync` — Process offline inspection drafts with conflict and duplicate detection.

### Grievances & Notifications
- `GET /api/grievances` — List grievances (restricted view for public).
- `GET /api/grievances/:trackingId` — Public-safe tracking without exposing complainant PII.
- `POST /api/grievances` — Citizen grievance submission; generates tracking code.
- `GET /api/notifications` — Targeted alerts for active user.
- `PATCH /api/notifications/:id/read` — Mark notification read.

### Reports & Bilingual Assistant
- `GET /api/reports/dashboard` — Live computed KPI aggregations filtered by district/block.
- `POST /api/assistant/chat` — English and Hindi conversational query assistant.

---

## 6. How to Configure Persistent Supabase Mode

1. **Create Supabase Project**:
   Sign in to [supabase.com](https://supabase.com) and create a project.

2. **Execute Database Migration**:
   In the Supabase SQL Editor, paste and execute:
   `database/migrations/001_initial_schema.sql`

3. **Create Storage Bucket**:
   In Supabase Storage, create a private bucket named `gramsetu-evidence`.

4. **Update `backend/.env`**:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DEMO_MODE=false
   ```

5. **Seed the Database**:
   ```bash
   npm run seed
   ```

*(If Supabase credentials are not provided, the backend automatically boots in the resilient in-memory demo mode, ensuring uninterrupted operation.)*

---

## 7. Running Tests

Execute the 37 automated tests via Node 24 native test runner:

```bash
npm test
```

Expected output:
```
ℹ tests 37
ℹ suites 5
ℹ pass 37
ℹ fail 0
```

