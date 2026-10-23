import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { blockAuditorMutations } from '../../middleware/authorize.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';

const router = Router();

function serializeRiskCase(r) {
  const beneficiary = database.store.beneficiaries.find(
    (b) => b.id === (r.beneficiary_id || r.beneficiaryId)
  );

  return {
    id: r.id,
    caseCode: r.case_code || r.caseCode,
    caseReference: r.case_reference || r.caseReference,
    title: r.title,
    titleHi: r.title_hi || r.titleHi || r.title,
    beneficiaryId: r.beneficiary_id || r.beneficiaryId || '',
    beneficiaryName: beneficiary?.full_name || beneficiary?.fullName || 'Beneficiary Record',
    schemeName: beneficiary?.scheme_name || beneficiary?.schemeName || 'Pradhan Mantri Awas Yojana - Gramin',
    district: beneficiary?.district_id || beneficiary?.district || 'Gorakhpur',
    block: beneficiary?.block_id || beneficiary?.block || 'Pipraich',
    village: beneficiary?.village_id || beneficiary?.village || 'Belghat',
    riskScore: Number(r.risk_score || r.riskScore || 50),
    severity: r.severity || 'Medium',
    flagDate: r.flag_date || r.flagDate || (r.created_at ? r.created_at.split('T')[0] : '2026-02-14'),
    status: r.status || 'Under Review',
    indicators: r.indicators || [],
    recommendedAction: r.recommended_action || r.recommendedAction || 'Physical joint audit recommended',
    reviewedBy: r.reviewed_by || r.reviewedBy || null,
    reviewNotes: r.review_notes || r.reviewNotes || null,
    resolutionTimestamp: r.resolved_at || r.resolutionTimestamp || null,
  };
}

// GET /api/risk-cases
router.get('/', optionalAuthenticate, (req, res) => {
  const { severity, status, district, page, limit } = req.query;
  let items = database.store.riskCases;

  if (severity && severity !== 'All') {
    items = items.filter((r) => r.severity.toLowerCase() === severity.toLowerCase());
  }
  if (status && status !== 'All') {
    items = items.filter((r) => r.status.toLowerCase() === status.toLowerCase());
  }
  if (district && district !== 'All') {
    items = items.filter((r) => {
      const b = database.store.beneficiaries.find((ben) => ben.id === (r.beneficiary_id || r.beneficiaryId));
      return b && (b.district_id === district || b.district === district);
    });
  }

  const serialized = items.map(serializeRiskCase);

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, {
    riskCases: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// GET /api/risk-cases/:id
router.get('/:id', optionalAuthenticate, (req, res) => {
  const r = database.store.riskCases.find((item) => item.id === req.params.id || item.case_code === req.params.id);
  if (!r) {
    throw new NotFoundError(`Risk case '${req.params.id}' not found`);
  }
  return successResponse(res, serializeRiskCase(r));
});

// PATCH /api/risk-cases/:id/status
router.patch('/:id/status', authenticate, blockAuditorMutations, async (req, res) => {
  const index = database.store.riskCases.findIndex(
    (item) => item.id === req.params.id || item.case_code === req.params.id
  );
  if (index === -1) {
    throw new NotFoundError(`Risk case '${req.params.id}' not found`);
  }

  const { status, notes, reviewNotes } = req.body;
  if (!status) {
    throw new ValidationError('Updated status is required');
  }

  const before = { ...database.store.riskCases[index] };
  const remarks = notes || reviewNotes || '';

  database.store.riskCases[index] = {
    ...before,
    status,
    review_notes: remarks,
    reviewNotes: remarks,
    reviewed_by: req.user.role,
    reviewedBy: req.user.role,
    resolved_at: ['Resolved (False Positive)', 'Enforcement Initiated'].includes(status)
      ? new Date().toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.riskCases[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'UPDATED_RISK_CASE_STATUS',
    entityType: 'RiskCase',
    entityId: after.id,
    entityCode: after.case_code || after.caseCode,
    beforeState: { status: before.status },
    afterState: { status: after.status },
    reason: remarks || 'Risk inquiry status updated by authorized reviewer',
    requestId: req.id,
  });

  return successResponse(res, serializeRiskCase(after));
});

export default router;
