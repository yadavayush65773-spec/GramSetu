-- GramSetu (ग्रामसेतु) Database Schema Migration
-- 001_initial_schema.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES & ROLES
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id TEXT UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'state_admin', 
        'district_officer', 
        'bdo', 
        'block_officer', 
        'field_inspector', 
        'auditor', 
        'citizen', 
        'public_citizen'
    )),
    district_id TEXT,
    block_id TEXT,
    panchayat_id TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LOCATIONS HIERARCHY
CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('state', 'district', 'block', 'panchayat', 'village')),
    name TEXT NOT NULL,
    name_hi TEXT,
    code TEXT,
    parent_id UUID REFERENCES locations(id) ON DELETE SET NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SCHEMES
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_hi TEXT,
    description TEXT,
    description_hi TEXT,
    category TEXT NOT NULL,
    total_budget NUMERIC NOT NULL DEFAULT 0,
    allocated_amount NUMERIC NOT NULL DEFAULT 0,
    released_amount NUMERIC NOT NULL DEFAULT 0,
    utilized_amount NUMERIC NOT NULL DEFAULT 0,
    target_beneficiaries INTEGER DEFAULT 0,
    enrolled_beneficiaries INTEGER DEFAULT 0,
    completed_projects INTEGER DEFAULT 0,
    district_id TEXT,
    responsible_officer TEXT,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Review', 'Completed', 'Delayed')),
    start_date DATE,
    end_date DATE,
    milestones JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. BENEFICIARIES
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beneficiary_reference TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    full_name_hi TEXT,
    normalized_name TEXT NOT NULL,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    age INTEGER,
    phone_masked TEXT,
    household_reference TEXT,
    village_id TEXT NOT NULL,
    panchayat_id TEXT,
    block_id TEXT NOT NULL,
    district_id TEXT NOT NULL,
    scheme_id UUID REFERENCES schemes(id) ON DELETE SET NULL,
    eligibility_status TEXT NOT NULL DEFAULT 'Pending',
    verification_status TEXT NOT NULL DEFAULT 'Pending' CHECK (verification_status IN (
        'Pending', 
        'Under Review', 
        'Verified', 
        'Flagged', 
        'Rejected', 
        'Correction Requested'
    )),
    verification_checklist JSONB DEFAULT '[]'::jsonb,
    reviewer_notes TEXT,
    risk_score INTEGER DEFAULT 0 CHECK (risk_score >= 0 AND risk_score <= 100),
    risk_severity TEXT DEFAULT 'Low' CHECK (risk_severity IN ('Low', 'Medium', 'High', 'Critical')),
    risk_flags JSONB DEFAULT '[]'::jsonb,
    current_installment_no INTEGER DEFAULT 0,
    total_installments INTEGER DEFAULT 3,
    total_approved_amount NUMERIC DEFAULT 0,
    disbursed_amount NUMERIC DEFAULT 0,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    documents JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. HOUSING PROJECTS
CREATE TABLE IF NOT EXISTS housing_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_reference TEXT UNIQUE NOT NULL,
    beneficiary_id UUID NOT NULL REFERENCES beneficiaries(id) ON DELETE CASCADE,
    scheme_id UUID NOT NULL REFERENCES schemes(id) ON DELETE RESTRICT,
    village_id TEXT,
    panchayat_id TEXT,
    block_id TEXT,
    district_id TEXT,
    assigned_inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    project_status TEXT NOT NULL DEFAULT 'In Progress' CHECK (project_status IN (
        'In Progress', 
        'Completed', 
        'Delayed', 
        'On Hold', 
        'Terminated'
    )),
    current_stage TEXT NOT NULL DEFAULT 'foundation' CHECK (current_stage IN (
        'foundation', 
        'plinth', 
        'lintel', 
        'completion'
    )),
    approved_budget NUMERIC NOT NULL DEFAULT 0,
    completion_percentage NUMERIC NOT NULL DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
    planned_start_date DATE,
    planned_completion_date DATE,
    actual_completion_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INSPECTIONS
CREATE TABLE IF NOT EXISTS inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_record_id TEXT UNIQUE,
    inspection_code TEXT UNIQUE NOT NULL,
    project_id UUID REFERENCES housing_projects(id) ON DELETE SET NULL,
    beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
    inspector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    inspector_name TEXT,
    stage TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Scheduled' CHECK (status IN (
        'Scheduled', 
        'In Progress', 
        'Passed', 
        'Needs Improvement', 
        'Failed', 
        'Overdue'
    )),
    inspection_notes TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    reported_accuracy DOUBLE PRECISION,
    is_device_gps BOOLEAN DEFAULT TRUE,
    checklist JSONB DEFAULT '[]'::jsonb,
    captured_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    offline_created BOOLEAN DEFAULT FALSE,
    sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'syncing', 'synced', 'failed', 'conflict')),
    device_metadata JSONB DEFAULT '{}'::jsonb,
    required_evidence_checklist JSONB DEFAULT '[]'::jsonb,
    previous_stage_inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    corrective_actions_required TEXT,
    follow_up_deadline DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. INSPECTION EVIDENCE
CREATE TABLE IF NOT EXISTS inspection_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inspection_id UUID REFERENCES inspections(id) ON DELETE CASCADE,
    project_id UUID REFERENCES housing_projects(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    thumbnail_url TEXT,
    original_filename TEXT NOT NULL,
    media_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    sha256_hash TEXT NOT NULL,
    caption TEXT,
    captured_at TIMESTAMPTZ,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reported_latitude DOUBLE PRECISION,
    reported_longitude DOUBLE PRECISION,
    integrity_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INSTALLMENTS
CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES housing_projects(id) ON DELETE SET NULL,
    beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE CASCADE,
    scheme_id UUID REFERENCES schemes(id) ON DELETE RESTRICT,
    installment_number INTEGER NOT NULL,
    milestone TEXT,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending Approval' CHECK (status IN (
        'Awaiting Inspection', 
        'Pending Approval', 
        'Approved', 
        'Disbursed', 
        'Rejected', 
        'On Hold'
    )),
    linked_inspection_id UUID REFERENCES inspections(id) ON DELETE SET NULL,
    prerequisite_checks JSONB DEFAULT '{}'::jsonb,
    requested_date DATE DEFAULT CURRENT_DATE,
    approval_date DATE,
    disbursement_date DATE,
    disbursement_ref TEXT,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    approver_officer TEXT,
    reviewer_remarks TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. APPROVALS (Decision History)
CREATE TABLE IF NOT EXISTS approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    workflow_stage TEXT NOT NULL,
    action TEXT NOT NULL,
    reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewer_name TEXT,
    remarks TEXT,
    previous_status TEXT,
    new_status TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. RISK CASES
CREATE TABLE IF NOT EXISTS risk_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_code TEXT UNIQUE NOT NULL,
    case_reference TEXT,
    title TEXT NOT NULL,
    title_hi TEXT,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    beneficiary_id UUID REFERENCES beneficiaries(id) ON DELETE SET NULL,
    risk_score INTEGER NOT NULL DEFAULT 0,
    risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    severity TEXT NOT NULL DEFAULT 'Low' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    indicators JSONB DEFAULT '[]'::jsonb,
    explanation TEXT,
    recommended_action TEXT,
    status TEXT NOT NULL DEFAULT 'Under Review' CHECK (status IN (
        'Under Review', 
        'Escalated', 
        'Resolved (False Positive)', 
        'Enforcement Initiated'
    )),
    assigned_reviewer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_by TEXT,
    review_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS (Append-Only)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    entity_code TEXT,
    before_state JSONB,
    after_state JSONB,
    reason TEXT,
    sha256_evidence_ref TEXT,
    ip_address TEXT,
    request_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    target_role TEXT,
    title TEXT NOT NULL,
    title_hi TEXT,
    message TEXT NOT NULL,
    message_hi TEXT,
    type TEXT NOT NULL CHECK (type IN ('alert', 'approval', 'sync', 'inspection')),
    severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical', 'success')),
    read BOOLEAN DEFAULT FALSE,
    target_page TEXT,
    target_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. GRIEVANCES
CREATE TABLE IF NOT EXISTS grievances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_code TEXT UNIQUE NOT NULL,
    citizen_name TEXT NOT NULL,
    phone_masked TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN (
        'Delayed Installment', 
        'Inspection Irregularity', 
        'Application Grievance', 
        'Corrupt Practice Allegation'
    )),
    subject TEXT,
    description TEXT NOT NULL,
    district_id TEXT NOT NULL,
    block_id TEXT,
    panchayat_id TEXT,
    village TEXT,
    scheme_name TEXT,
    status TEXT NOT NULL DEFAULT 'Received' CHECK (status IN (
        'Received', 
        'Under Investigation', 
        'Redressed', 
        'Closed'
    )),
    response_summary TEXT,
    officer_remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SYNC RECORDS (Offline-First Idempotency)
CREATE TABLE IF NOT EXISTS sync_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_record_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    entity_type TEXT NOT NULL,
    server_record_id UUID,
    status TEXT NOT NULL CHECK (status IN ('pending', 'syncing', 'synced', 'failed', 'conflict')),
    payload JSONB NOT NULL,
    error_details TEXT,
    conflict_details TEXT,
    client_timestamp TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_schemes_code ON schemes(code);
CREATE INDEX IF NOT EXISTS idx_schemes_category ON schemes(category);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON schemes(status);

CREATE INDEX IF NOT EXISTS idx_beneficiaries_ref ON beneficiaries(beneficiary_reference);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_district ON beneficiaries(district_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_block ON beneficiaries(block_id);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_status ON beneficiaries(verification_status);
CREATE INDEX IF NOT EXISTS idx_beneficiaries_scheme ON beneficiaries(scheme_id);

CREATE INDEX IF NOT EXISTS idx_projects_ref ON housing_projects(project_reference);
CREATE INDEX IF NOT EXISTS idx_projects_beneficiary ON housing_projects(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_projects_scheme ON housing_projects(scheme_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON housing_projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_stage ON housing_projects(current_stage);

CREATE INDEX IF NOT EXISTS idx_inspections_code ON inspections(inspection_code);
CREATE INDEX IF NOT EXISTS idx_inspections_client_id ON inspections(client_record_id);
CREATE INDEX IF NOT EXISTS idx_inspections_project ON inspections(project_id);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_stage ON inspections(stage);

CREATE INDEX IF NOT EXISTS idx_evidence_sha256 ON inspection_evidence(sha256_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_inspection ON inspection_evidence(inspection_id);

CREATE INDEX IF NOT EXISTS idx_installments_beneficiary ON installments(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_installments_status ON installments(status);

CREATE INDEX IF NOT EXISTS idx_risk_cases_code ON risk_cases(case_code);
CREATE INDEX IF NOT EXISTS idx_risk_cases_entity ON risk_cases(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_cases_status ON risk_cases(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_grievances_tracking ON grievances(tracking_code);
CREATE INDEX IF NOT EXISTS idx_grievances_status ON grievances(status);

CREATE INDEX IF NOT EXISTS idx_sync_records_client ON sync_records(client_record_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE housing_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE grievances ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_records ENABLE ROW LEVEL SECURITY;

-- Allow public read for general transparency where appropriate
CREATE POLICY "Public schemes read" ON schemes FOR SELECT USING (true);
CREATE POLICY "Public locations read" ON locations FOR SELECT USING (true);
CREATE POLICY "Public grievances tracking" ON grievances FOR SELECT USING (true);

-- Authenticated roles read & write
CREATE POLICY "Authenticated full access profiles" ON profiles FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access schemes" ON schemes FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access beneficiaries" ON beneficiaries FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access housing_projects" ON housing_projects FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access inspections" ON inspections FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access inspection_evidence" ON inspection_evidence FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access installments" ON installments FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access approvals" ON approvals FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access risk_cases" ON risk_cases FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated read audit_logs" ON audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated append audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated full access notifications" ON notifications FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access grievances" ON grievances FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated full access sync_records" ON sync_records FOR ALL TO authenticated USING (true);
