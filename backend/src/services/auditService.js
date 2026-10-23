import { generateUUID } from '../utils/ids.js';
import { supabaseAdminClient, supabaseClient } from '../config/supabase.js';
import { appendAuditLogToStore } from '../modules/auditLogs/auditRepository.js';

export async function recordAuditEvent({
  actorId,
  actor = 'Authorized Officer',
  actorRole = 'Officer',
  action,
  entityType,
  entityId,
  entityCode,
  beforeState,
  afterState,
  reason,
  sha256EvidenceRef,
  ipAddress = '10.42.0.1 (NIC SafeNet)',
  requestId,
}) {
  const auditRecord = {
    id: generateUUID(),
    actor_id: actorId || null,
    actor: String(actor),
    actor_role: String(actorRole),
    action: String(action),
    entity_type: String(entityType),
    entity_id: String(entityId),
    entity_code: entityCode ? String(entityCode) : null,
    before_state: beforeState || null,
    after_state: afterState || null,
    reason: reason ? String(reason) : null,
    sha256_evidence_ref: sha256EvidenceRef ? String(sha256EvidenceRef) : null,
    ip_address: String(ipAddress),
    request_id: requestId ? String(requestId) : null,
    created_at: new Date().toISOString(),
  };

  // 1. In-memory / fallback store
  appendAuditLogToStore(auditRecord);

  // 2. Persist to Supabase if configured
  const client = supabaseAdminClient || supabaseClient;
  if (client) {
    try {
      await client.from('audit_logs').insert([auditRecord]);
    } catch (err) {
      console.warn('[AuditService] Failed to insert audit log into Supabase:', err.message);
    }
  }

  return auditRecord;
}
