import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { generateUUID } from '../../utils/ids.js';

const router = Router();

// Serialize scheme to maintain 100% frontend compatibility with Scheme interface
function serializeScheme(s) {
  return {
    id: s.id,
    code: s.code,
    name: s.name,
    nameHi: s.name_hi || s.nameHi || '',
    description: s.description || '',
    descriptionHi: s.description_hi || s.descriptionHi || '',
    category: s.category,
    district: s.district_id || s.district || 'All Districts',
    allocatedBudget: Number(s.allocated_amount || s.allocatedBudget || 0),
    utilizedBudget: Number(s.utilized_amount || s.utilizedBudget || 0),
    targetBeneficiaries: Number(s.target_beneficiaries || s.targetBeneficiaries || 0),
    enrolledBeneficiaries: Number(s.enrolled_beneficiaries || s.enrolledBeneficiaries || 0),
    completedProjects: Number(s.completed_projects || s.completedProjects || 0),
    startDate: s.start_date || s.startDate || '',
    endDate: s.end_date || s.endDate || '',
    responsibleOfficer: s.responsible_officer || s.responsibleOfficer || '',
    status: s.status || 'Active',
    milestones: s.milestones || [],
    ministry: s.ministry || s.ministry_name || 'Ministry of Rural Development, GoI',
    ministryHi: s.ministry_hi || 'ग्रामीण विकास मंत्रालय, भारत सरकार',
    schemeType: s.scheme_type || s.schemeType || 'Centrally Sponsored',
    officialPortalUrl: s.official_portal_url || s.officialPortalUrl || 'https://www.myscheme.gov.in',
    sourceVerificationUrl: s.source_verification_url || s.sourceVerificationUrl || 'https://www.myscheme.gov.in',
    benefitsSummary: s.benefits_summary || s.benefitsSummary || '',
    benefitsSummaryHi: s.benefits_summary_hi || s.benefitsSummaryHi || '',
    eligibilityCriteria: s.eligibility_criteria || s.eligibilityCriteria || [],
    requiredDocuments: s.required_documents || s.requiredDocuments || [],
    verificationDate: s.verification_date || s.verificationDate || '2026-10-23',
    isOfficialVerified: s.is_official_verified !== undefined ? s.is_official_verified : true,
  };
}

// GET /api/schemes
router.get('/', (req, res) => {
  const { category, district, status, search, page, limit } = req.query;
  let items = database.store.schemes;

  if (category && category !== 'All') {
    items = items.filter((s) => s.category.toLowerCase() === category.toLowerCase());
  }
  if (district && district !== 'All') {
    items = items.filter(
      (s) => (s.district_id === 'All' || s.district === 'All Districts') || s.district_id === district || s.district === district
    );
  }
  if (status && status !== 'All') {
    items = items.filter((s) => s.status.toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        (s.name_hi && s.name_hi.includes(q))
    );
  }

  const serialized = items.map(serializeScheme);

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  // Return compatible payload
  return successResponse(res, {
    schemes: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// GET /api/schemes/:id
router.get('/:id', (req, res) => {
  const scheme = database.store.schemes.find((s) => s.id === req.params.id || s.code === req.params.id);
  if (!scheme) {
    throw new NotFoundError(`Scheme '${req.params.id}' not found`);
  }
  return successResponse(res, serializeScheme(scheme));
});

// POST /api/schemes (State Admin only)
router.post('/', authenticate, authorize('state_admin'), async (req, res) => {
  const data = req.body;
  if (!data.name || !data.code || !data.category) {
    throw new ValidationError('Name, code, and category are required fields for a new scheme');
  }

  const existing = database.store.schemes.find((s) => s.code.toLowerCase() === data.code.toLowerCase());
  if (existing) {
    throw new ValidationError(`Scheme with code '${data.code}' already exists`);
  }

  const newScheme = {
    id: data.id || `SCH-${generateUUID().slice(0, 8)}`,
    code: data.code,
    name: data.name,
    name_hi: data.nameHi || data.name_hi || data.name,
    description: data.description || '',
    description_hi: data.descriptionHi || data.description_hi || '',
    category: data.category,
    district_id: data.district || data.district_id || 'All',
    allocated_amount: Number(data.allocatedBudget || data.allocated_amount || 0),
    utilized_amount: Number(data.utilizedBudget || data.utilized_amount || 0),
    target_beneficiaries: Number(data.targetBeneficiaries || data.target_beneficiaries || 0),
    enrolled_beneficiaries: Number(data.enrolledBeneficiaries || data.enrolled_beneficiaries || 0),
    completed_projects: Number(data.completedProjects || data.completed_projects || 0),
    start_date: data.startDate || data.start_date || new Date().toISOString().split('T')[0],
    end_date: data.endDate || data.end_date || '',
    responsible_officer: data.responsibleOfficer || data.responsible_officer || req.user.full_name,
    status: data.status || 'Active',
    milestones: data.milestones || [],
  };

  database.store.schemes.unshift(newScheme);

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'CREATED_NEW_SCHEME',
    entityType: 'Scheme',
    entityId: newScheme.id,
    entityCode: newScheme.code,
    beforeState: null,
    afterState: newScheme,
    reason: 'New rural development scheme enrolled in GramSetu',
    requestId: req.id,
  });

  return successResponse(res, serializeScheme(newScheme), 201);
});

// PUT /api/schemes/:id
router.put('/:id', authenticate, authorize('state_admin'), async (req, res) => {
  const index = database.store.schemes.findIndex((s) => s.id === req.params.id || s.code === req.params.id);
  if (index === -1) {
    throw new NotFoundError(`Scheme '${req.params.id}' not found`);
  }

  const before = { ...database.store.schemes[index] };
  const updateData = req.body;

  database.store.schemes[index] = {
    ...before,
    ...updateData,
    allocated_amount: updateData.allocatedBudget != null ? Number(updateData.allocatedBudget) : before.allocated_amount,
    utilized_amount: updateData.utilizedBudget != null ? Number(updateData.utilizedBudget) : before.utilized_amount,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.schemes[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'UPDATED_SCHEME',
    entityType: 'Scheme',
    entityId: after.id,
    entityCode: after.code,
    beforeState: before,
    afterState: after,
    reason: 'Scheme budget or configuration updated by State Administrator',
    requestId: req.id,
  });

  return successResponse(res, serializeScheme(after));
});

export default router;
