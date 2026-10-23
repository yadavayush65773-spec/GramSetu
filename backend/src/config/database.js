import { env } from './env.js';
import { supabaseAdminClient, supabaseClient } from './supabase.js';
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
} from '../../database/seeds/seedData.js';
import { DEMO_USERS } from '../middleware/authenticate.js';

// In-Memory Database Store (resilient clone of synthetic seed data)
class DataStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.profiles = Object.values(DEMO_USERS).map(u => ({ ...u }));
    this.locations = JSON.parse(JSON.stringify(LOCATIONS_SEED));
    this.schemes = JSON.parse(JSON.stringify(SCHEMES_SEED));
    this.beneficiaries = JSON.parse(JSON.stringify(BENEFICIARIES_SEED));
    this.housingProjects = JSON.parse(JSON.stringify(HOUSING_PROJECTS_SEED));
    this.inspections = JSON.parse(JSON.stringify(INSPECTIONS_SEED));
    this.inspectionEvidence = JSON.parse(JSON.stringify(INSPECTION_EVIDENCE_SEED));
    this.installments = JSON.parse(JSON.stringify(INSTALLMENTS_SEED));
    this.riskCases = JSON.parse(JSON.stringify(RISK_CASES_SEED));
    this.auditLogs = JSON.parse(JSON.stringify(AUDIT_LOGS_SEED));
    this.notifications = JSON.parse(JSON.stringify(NOTIFICATIONS_SEED));
    this.grievances = JSON.parse(JSON.stringify(GRIEVANCES_SEED));
    this.syncRecords = [];
    this.approvals = [];
    this.lastReset = new Date().toISOString();
  }
}

export const inMemoryStore = new DataStore();

export const database = {
  mode: env.isSupabaseConfigured ? 'supabase_persistent' : 'in_memory_demo',
  isReady: () => true,
  store: inMemoryStore,
  resetDemoData: () => {
    inMemoryStore.reset();
    return {
      success: true,
      mode: env.isSupabaseConfigured ? 'supabase_persistent' : 'in_memory_demo',
      resetAt: inMemoryStore.lastReset,
    };
  },
};
