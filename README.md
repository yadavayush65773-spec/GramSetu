# GramSetu (ग्रामसेतु) — TechTrix'26 (Problem Statement 1)

> **Smart Rural Housing & Panchayat Monitoring Platform**  
> *Core Promise: Every Work Verified. Every Benefit Accountable.*  
> Built for TechTrix'26 Hackathon | Problem Statement 1 (PS-1)

---

## 🌾 Project Overview

**GramSetu** is a production-minded digital public infrastructure platform connecting State Administrators, District Officers (DM/CDO), Block Development Officers (BDO), Frontline Technical Field Inspectors, Auditors, and Rural Citizens into one transparent, accountable ecosystem.

### Core Pillars
- **Flagship Scheme Directory**: Real-time progress and budget monitoring for PMAY-G, Jal Jeevan Mission, Swachh Bharat Mission (Gramin), PMGSY, Amrit Sarovar, and Rural Solar Urja.
- **9-Step Statutory Beneficiary Verification**: Multi-factor eligibility checklist, real-time duplicate identity detection, and mandatory justification audit logging.
- **Offline Field Inspections**: Tablet-friendly inspection workspace with GPS coordinate logging and **SHA-256 cryptographic byte hashing** for site evidence photos.
- **Stage Installment Approvals**: Direct Benefit Transfer (DBT) approval workflow with prerequisite milestone verification, separation of duties, and simulated PFMS disbursement references.
- **Explainable Fraud & Risk Intelligence**: 0–100 deterministic risk scoring detecting SHA-256 photo hash reuse across unrelated projects, geo-fence deviations (>28 km discrepancy), and missing mandatory evidence.
- **Append-Only Audit Trail**: Immutable transaction log tracking every verification, approval, rejection, and sync mutation.
- **Bilingual GramSetu Sahayak AI**: Natural language assistant in Hindi (हिन्दी) and English querying real-time platform data (deterministic engine + Gemini integration).
- **Public Citizen Transparency Portal**: Open scheme outlays, village progress, and citizen grievance filing with auto-generated tracking codes (`GRV-2026-UP-xxxx`).
- **Role-Based Access Control (RBAC)**: Strict server-side permission enforcement across 6 roles with separation of duties between inspectors and approvers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React, Recharts, Leaflet |
| **Backend** | Node.js 24 LTS, Express.js 4 (ES Modules), Zod, Helmet, CORS, Rate Limiting |
| **Database** | Supabase PostgreSQL (14 relational tables, foreign keys, indexes, Row-Level Security) |
| **Fallback DB** | Zero-config In-Memory Demo Store for immediate hackathon evaluation without external cloud credentials |
| **Security & Cryptography** | Node.js native `crypto` SHA-256 hashing, Haversine geo-distance, JWT auth, Redacted JSON logging |
| **Testing** | Node 24 native test runner (`node --test`), Supertest (33 unit & integration tests) |

---

## 📂 Repository Structure

```
GramSetu/
├── frontend/                  # React 19 + TypeScript + Vite application (Port 5173)
│   ├── src/
│   │   ├── components/        # Layout, Navigation, Modals, Assistant
│   │   ├── context/           # AppContext state & API hydration
│   │   ├── pages/             # 14 complete functional application modules
│   │   ├── services/          # Bilingual AI assistant service & API clients
│   │   ├── types/             # Domain TypeScript interfaces
│   │   └── utils/             # WebCrypto SHA-256, formatters
│   ├── public/
│   ├── package.json
│   └── vite.config.ts         # Port 5173, /api proxy to http://localhost:5000
├── backend/                   # Node.js Express REST API service (Port 5000)
│   ├── src/
│   │   ├── config/            # Env, Database, Supabase, Storage configs
│   │   ├── middleware/        # Auth, RBAC, Validation, Rate Limiter, Error Handler
│   │   ├── modules/           # Domain controllers (Schemes, Beneficiaries, Inspections, etc.)
│   │   ├── routes/            # Central router & backward-compatible aliases
│   │   ├── services/          # Evidence hashing, Risk scoring, Workflow engine, Audit
│   │   └── utils/             # Responses, Pagination, UUIDs, Errors
│   ├── database/
│   │   ├── migrations/        # 001_initial_schema.sql (14 tables, RLS, indexes)
│   │   └── seeds/             # Comprehensive synthetic UP dataset
│   ├── tests/                 # 33 unit and integration tests
│   ├── .env.example
│   ├── package.json
│   └── README.md
├── package.json               # Root scripts for concurrently running both services
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20+ or v24+ LTS installed
- **npm**: v10+

### 2. Install All Dependencies
From the repository root:
```bash
npm run install:all
```
*(Or run `npm install` inside both `frontend/` and `backend/`)*

### 3. Run Development Servers
Run frontend and backend concurrently from root:
```bash
npm run dev
```

The services will be available at:
- **Frontend Application**: `http://localhost:5173`
- **Backend API Service**: `http://localhost:5000`
- **Backend Health Check**: `http://localhost:5000/api/health`

Alternatively, run each service independently:
```bash
npm run dev:frontend   # Starts Vite on port 5173
npm run dev:backend    # Starts Express on port 5000
```

### 4. Run Automated Tests
Execute the 37 backend unit and integration test suites:
```bash
npm test
```
All 37 tests pass cleanly:
- `authAndPermissions.test.js`: 11 passed (including registration, login, duplicate email handling, and forgot password)
- `evidenceIntegrity.test.js`: 5 passed
- `riskScoring.test.js`: 4 passed
- `workflowEngine.test.js`: 6 passed
- `apiEndpoints.test.js`: 11 passed

### 5. Build for Production
```bash
npm run build
```

---

## 🔐 Role-Based Access Control (RBAC)

GramSetu enforces strict separation of duties across 6 distinct roles:

| Role | Permitted Capabilities | Restrictions |
|---|---|---|
| **State Admin** | Full statewide access, scheme registration, demo reset | Strict authorization check |
| **District Officer** | Beneficiary verification, inspection approval, DBT approval | Restricted to assigned district |
| **BDO** | Project monitoring, block-level verification | Restricted to assigned block |
| **Field Inspector** | Submit inspections, capture GPS evidence | **CANNOT** approve own inspections or DBT |
| **Auditor** | Read-only inspection and audit trail inspection | **BLOCKED** from mutating any records |
| **Citizen** | Public progress, scheme outlays, submit/track grievances | **CANNOT** view private beneficiary PII |

---

## ☁️ Supabase Configuration & Production Migration

The backend is pre-configured with zero credentials to run in a resilient in-memory demo mode out of the box.

To connect a persistent production Supabase instance:
1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and execute `backend/database/migrations/001_initial_schema.sql`.
3. Create a private bucket in Supabase Storage named `gramsetu-evidence`.
4. Copy `backend/.env.example` to `backend/.env` and fill in:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DEMO_MODE=false
   ```
5. Seed the persistent database:
   ```bash
   npm run seed
   ```

---

## 🏆 Key Evaluation Scenarios for Judges

1. **Cryptographic Photo SHA-256 Collision**:
   - In **Risk & Fraud Detection**, inspect Case `#RC-2026-001`.
   - GramSetu detected that two different beneficiaries submitted the exact same photograph bytes (`e3b0c44...`), triggering a Critical risk alert (Score: 85).
2. **Geo-Fence Discrepancy (>28 km)**:
   - Inspect Case `#RC-2026-002`, where inspection GPS coordinates were reported 34.2 km away from the village reference point, generating an explainable fraud lead.
3. **Offline Field Inspection & Synchronization**:
   - Switch role to **Field Inspector**.
   - Toggle the **Offline Mode** pill in the top header.
   - Record a new inspection; it queues securely in local storage.
   - Toggle online mode back and click **Push Sync to Central Server** — the backend processes the queue idempotently without duplicate records.
4. **Separation of Duties**:
   - As a **Field Inspector**, try approving an inspection or installment — the backend strictly returns `HTTP 403 Forbidden`.
   - Switch to **District Officer** to approve the DBT installment, generating an append-only audit event and simulated PFMS disbursement reference (`PFMS-SIM-2026-UP-XXXX`).
5. **Bilingual GramSetu Sahayak AI**:
   - Open the floating AI assistant and ask: *"मेरे ब्लॉक में कितने आवेदन लंबित हैं?"* or *"List high risk fraud cases."*
