import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { successResponse } from '../../utils/apiResponse.js';
import { ValidationError, ForbiddenError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';

const router = Router();

// Allowed external actions for POST /api/audit-logs
const ALLOWED_EXTERNAL_ACTIONS = [
  'CLIENT_OFFLINE_SYNC_STARTED',
  'CLIENT_OFFLINE_SYNC_FINISHED',
  'CLIENT_PAGE_VIEW',
  'CLIENT_EXPORT_REPORT',
];

function serializeAuditLog(a) {
  return {
    id: a.id,
    timestamp: a.created_at || a.timestamp || new Date().toISOString(),
    actor: a.actor,
    actorRole: a.actor_role || a.actorRole || 'Officer',
    action: a.action,
    targetEntity: a.entity_type || a.targetEntity || 'System',
    targetId: a.entity_id || a.targetId || '',
    targetCode: a.entity_code || a.targetCode || '',
    previousValue: typeof a.before_state === 'object' ? JSON.stringify(a.before_state) : (a.before_state || a.previousValue || ''),
    newValue: typeof a.after_state === 'object' ? JSON.stringify(a.after_state) : (a.after_state || a.newValue || ''),
    reason: a.reason || '',
    sha256EvidenceRef: a.sha256_evidence_ref || a.sha256EvidenceRef || '',
    ipAddress: a.ip_address || a.ipAddress || '10.42.0.1 (NIC SafeNet)',
  };
}

// GET /api/audit-logs
router.get('/', optionalAuthenticate, (req, res) => {
  const { entityType, action, page, limit } = req.query;
  let items = database.store.auditLogs;

  if (entityType && entityType !== 'All') {
    items = items.filter(
      (a) => (a.entity_type || a.targetEntity || '').toLowerCase() === entityType.toLowerCase()
    );
  }
  if (action && action !== 'All') {
    items = items.filter((a) => a.action === action);
  }

  const serialized = items.map(serializeAuditLog);

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, {
    auditLogs: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// POST /api/audit-logs (Restricted allowlist of actions)
router.post('/', authenticate, async (req, res) => {
  const { action, targetEntity, targetId, targetCode, reason, previousValue, newValue } = req.body;

  if (!action || !ALLOWED_EXTERNAL_ACTIONS.includes(action)) {
    throw new ValidationError(
      `Direct audit log creation restricted to allowlisted actions: [${ALLOWED_EXTERNAL_ACTIONS.join(', ')}]`
    );
  }

  const record = await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action,
    entityType: targetEntity || 'System',
    entityId: targetId || 'sys-client',
    entityCode: targetCode || 'CLIENT-OP',
    beforeState: previousValue ? { val: previousValue } : null,
    afterState: newValue ? { val: newValue } : null,
    reason: reason || 'Client runtime operational audit event',
    requestId: req.id,
  });

  return successResponse(res, serializeAuditLog(record), 201);
});

export default router;
