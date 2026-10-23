import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { blockAuditorMutations } from '../../middleware/authorize.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { validateStageTransition, HOUSING_STAGES } from '../../services/workflowEngine.js';

const router = Router();

function serializeProject(p) {
  const beneficiary = database.store.beneficiaries.find(
    (b) => b.id === p.beneficiary_id || b.beneficiary_reference === p.beneficiary_id
  );
  const scheme = database.store.schemes.find((s) => s.id === p.scheme_id);
  const inspections = database.store.inspections.filter(
    (i) => i.project_id === p.id || i.beneficiary_id === p.beneficiary_id
  );
  const installments = database.store.installments.filter(
    (inst) => inst.project_id === p.id || inst.beneficiary_id === p.beneficiary_id
  );

  return {
    id: p.id,
    projectReference: p.project_reference || p.projectReference,
    beneficiaryId: p.beneficiary_id || p.beneficiaryId,
    beneficiaryName: beneficiary?.full_name || beneficiary?.fullName || 'Beneficiary',
    schemeId: p.scheme_id || p.schemeId,
    schemeName: scheme?.name || 'Pradhan Mantri Awas Yojana - Gramin',
    village: p.village_id || p.village || beneficiary?.village || '',
    panchayat: p.panchayat_id || p.panchayat || beneficiary?.panchayat_id || '',
    block: p.block_id || p.block || beneficiary?.block || '',
    district: p.district_id || p.district || beneficiary?.district || '',
    projectStatus: p.project_status || p.projectStatus || 'In Progress',
    currentStage: p.current_stage || p.currentStage || 'foundation',
    approvedBudget: Number(p.approved_budget || p.approvedBudget || 130000),
    completionPercentage: Number(p.completion_percentage || p.completionPercentage || 0),
    plannedStartDate: p.planned_start_date || p.plannedStartDate || '',
    plannedCompletionDate: p.planned_completion_date || p.plannedCompletionDate || '',
    actualCompletionDate: p.actual_completion_date || p.actualCompletionDate || null,
    inspectionsCount: inspections.length,
    inspections: inspections,
    installments: installments,
    installmentReadiness: {
      readyForNextInstallment: inspections.some((i) => i.status === 'Passed'),
      pendingInstallmentsCount: installments.filter((i) => i.status === 'Pending Approval').length,
    },
  };
}

// GET /api/housing-projects
router.get('/', optionalAuthenticate, (req, res) => {
  const { district, block, stage, status, search, page, limit } = req.query;
  let items = database.store.housingProjects;

  if (district && district !== 'All') {
    items = items.filter((p) => (p.district_id || p.district) === district);
  }
  if (block && block !== 'All') {
    items = items.filter((p) => (p.block_id || p.block) === block);
  }
  if (stage && stage !== 'All') {
    items = items.filter((p) => (p.current_stage || p.currentStage).toLowerCase() === stage.toLowerCase());
  }
  if (status && status !== 'All') {
    items = items.filter((p) => (p.project_status || p.projectStatus).toLowerCase() === status.toLowerCase());
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => {
      const ref = (p.project_reference || p.projectReference || '').toLowerCase();
      return ref.includes(q);
    });
  }

  const serialized = items.map(serializeProject);

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, {
    projects: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// GET /api/housing-projects/:id
router.get('/:id', optionalAuthenticate, (req, res) => {
  const p = database.store.housingProjects.find(
    (item) => item.id === req.params.id || item.project_reference === req.params.id
  );
  if (!p) {
    throw new NotFoundError(`Housing project '${req.params.id}' not found`);
  }
  return successResponse(res, serializeProject(p));
});

// POST /api/housing-projects
router.post('/', authenticate, blockAuditorMutations, async (req, res) => {
  const data = req.body;
  if (!data.beneficiaryId) {
    throw new ValidationError('beneficiaryId is required');
  }

  const id = `PRJ-${Date.now().toString().slice(-4)}`;
  const projectReference = `PRJ-PMAYG-${Date.now().toString().slice(-6)}`;

  const newProj = {
    id,
    project_reference: projectReference,
    projectReference,
    beneficiary_id: data.beneficiaryId,
    scheme_id: data.schemeId || 'SCH-PMAYG',
    village_id: data.village || 'Rohaniya',
    panchayat_id: data.panchayatId || 'GP-01',
    block_id: data.block || 'Sevapuri',
    district_id: data.district || 'Varanasi',
    project_status: 'In Progress',
    current_stage: 'foundation',
    approved_budget: Number(data.approvedBudget || 130000),
    completion_percentage: 10,
    planned_start_date: data.plannedStartDate || new Date().toISOString().split('T')[0],
    planned_completion_date: data.plannedCompletionDate || '',
    created_at: new Date().toISOString(),
  };

  database.store.housingProjects.unshift(newProj);

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'INITIATED_HOUSING_PROJECT',
    entityType: 'Project',
    entityId: newProj.id,
    entityCode: newProj.project_reference,
    beforeState: null,
    afterState: newProj,
    reason: 'Housing construction project record created for verified beneficiary',
    requestId: req.id,
  });

  return successResponse(res, serializeProject(newProj), 201);
});

// PATCH /api/housing-projects/:id
router.patch('/:id', authenticate, blockAuditorMutations, async (req, res) => {
  const index = database.store.housingProjects.findIndex(
    (p) => p.id === req.params.id || p.project_reference === req.params.id
  );
  if (index === -1) {
    throw new NotFoundError(`Housing project '${req.params.id}' not found`);
  }

  const before = { ...database.store.housingProjects[index] };
  const updateData = req.body;

  // If updating stage, validate progression rule
  if (updateData.currentStage && updateData.currentStage !== before.current_stage) {
    validateStageTransition(before.current_stage || before.currentStage, updateData.currentStage);
  }

  database.store.housingProjects[index] = {
    ...before,
    ...updateData,
    current_stage: updateData.currentStage || before.current_stage,
    project_status: updateData.projectStatus || before.project_status,
    completion_percentage: updateData.completionPercentage != null ? Number(updateData.completionPercentage) : before.completion_percentage,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.housingProjects[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'UPDATED_HOUSING_PROJECT',
    entityType: 'Project',
    entityId: after.id,
    entityCode: after.project_reference || after.projectReference,
    beforeState: before,
    afterState: after,
    reason: updateData.reason || 'Project progress / stage update',
    requestId: req.id,
  });

  return successResponse(res, serializeProject(after));
});

export default router;
