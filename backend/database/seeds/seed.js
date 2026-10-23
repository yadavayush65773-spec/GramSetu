import { database } from '../../src/config/database.js';
import { supabaseAdminClient, supabaseClient } from '../../src/config/supabase.js';
import {
  LOCATIONS_SEED,
  SCHEMES_SEED,
  BENEFICIARIES_SEED,
  HOUSING_PROJECTS_SEED,
  INSPECTIONS_SEED,
  INSPECTION_EVIDENCE_SEED,
  INSTALLMENTS_SEED,
  RISK_CASES_SEED,
  AUDIT_LOGS_SEED,
  NOTIFICATIONS_SEED,
  GRIEVANCES_SEED,
} from './seedData.js';

async function runSeed() {
  console.log('[Seed] Starting GramSetu database seed...');

  const client = supabaseAdminClient || supabaseClient;

  if (client) {
    console.log('[Seed] Supabase credentials detected. Seeding PostgreSQL tables...');
    try {
      // 1. Schemes
      await client.from('schemes').upsert(
        SCHEMES_SEED.map((s) => ({
          id: s.id,
          code: s.code,
          name: s.name,
          name_hi: s.name_hi,
          description: s.description,
          description_hi: s.description_hi,
          category: s.category,
          allocated_amount: s.allocated_amount,
          utilized_amount: s.utilized_amount,
          target_beneficiaries: s.target_beneficiaries,
          enrolled_beneficiaries: s.enrolled_beneficiaries,
          completed_projects: s.completed_projects,
          status: s.status,
        }))
      );
      console.log('✓ Seeded schemes into Supabase');

      // 2. Beneficiaries
      await client.from('beneficiaries').upsert(
        BENEFICIARIES_SEED.map((b) => ({
          id: b.id,
          beneficiary_reference: b.beneficiary_reference,
          full_name: b.full_name,
          full_name_hi: b.full_name_hi,
          normalized_name: b.normalized_name,
          gender: b.gender,
          age: b.age,
          phone_masked: b.phone_masked,
          village_id: b.village_id,
          block_id: b.block_id,
          district_id: b.district_id,
          scheme_id: b.scheme_id,
          verification_status: b.verification_status,
          risk_score: b.risk_score,
          risk_severity: b.risk_severity,
        }))
      );
      console.log('✓ Seeded beneficiaries into Supabase');

      // 3. Housing Projects
      await client.from('housing_projects').upsert(
        HOUSING_PROJECTS_SEED.map((p) => ({
          id: p.id,
          project_reference: p.project_reference,
          beneficiary_id: p.beneficiary_id,
          scheme_id: p.scheme_id,
          village_id: p.village_id,
          block_id: p.block_id,
          district_id: p.district_id,
          project_status: p.project_status,
          current_stage: p.current_stage,
          approved_budget: p.approved_budget,
          completion_percentage: p.completion_percentage,
        }))
      );
      console.log('✓ Seeded housing projects into Supabase');

      // 4. Inspections
      await client.from('inspections').upsert(
        INSPECTIONS_SEED.map((i) => ({
          id: i.id,
          client_record_id: i.client_record_id,
          inspection_code: i.inspection_code,
          project_id: i.project_id,
          beneficiary_id: i.beneficiary_id,
          inspector_name: i.inspector_name,
          stage: i.stage,
          status: i.status,
          inspection_notes: i.inspection_notes,
          latitude: i.latitude,
          longitude: i.longitude,
        }))
      );
      console.log('✓ Seeded inspections into Supabase');

      // 5. Evidence
      await client.from('inspection_evidence').upsert(
        INSPECTION_EVIDENCE_SEED.map((e) => ({
          id: e.id,
          inspection_id: e.inspection_id,
          project_id: e.project_id,
          storage_path: e.storage_path,
          original_filename: e.original_filename,
          media_type: e.media_type,
          file_size: e.file_size,
          sha256_hash: e.sha256_hash,
          caption: e.caption,
        }))
      );
      console.log('✓ Seeded evidence into Supabase');

      // 6. Installments
      await client.from('installments').upsert(
        INSTALLMENTS_SEED.map((inst) => ({
          id: inst.id,
          installment_number: inst.installment_number,
          beneficiary_id: inst.beneficiary_id,
          scheme_id: inst.scheme_id,
          amount: inst.amount,
          status: inst.status,
          approver_officer: inst.approver_officer,
          disbursement_ref: inst.disbursement_ref,
        }))
      );
      console.log('✓ Seeded installments into Supabase');

      // 7. Grievances
      await client.from('grievances').upsert(
        GRIEVANCES_SEED.map((g) => ({
          id: g.id,
          tracking_code: g.tracking_code,
          citizen_name: g.citizen_name,
          phone_masked: g.phone_masked,
          category: g.category,
          description: g.description,
          district_id: g.district_id,
          status: g.status,
        }))
      );
      console.log('✓ Seeded grievances into Supabase');
    } catch (err) {
      console.warn('[Seed] Supabase seed warning:', err.message);
    }
  }

  // Always reset and reseed in-memory store
  database.resetDemoData();
  console.log('✓ In-memory demo baseline successfully seeded with full synthetic records');
  console.log('🎉 GramSetu database seed completed successfully!');
}

runSeed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
