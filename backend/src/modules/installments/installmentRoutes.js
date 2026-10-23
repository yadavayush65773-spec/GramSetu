import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize, enforceSeparationOfDuties } from '../../middleware/authorize.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { validateInstallmentPrerequisites } from '../../services/workflowEngine.js';
import { generateUUID } from '../../utils/ids.js';

const router = Router();

function serializeInstallment(inst) {
  const beneficiary = database.store.beneficiaries.find(
    (b) => b.id === inst.beneficiary_id || b.id === inst.beneficiaryId
  );
  const scheme = database.store.schemes.find(
    (s) => s.id === inst.scheme_id || s.id === inst.schemeId
  );

  return {
    id: inst.id,
    installmentNumber: Number(inst.installment_number || inst.installmentNumber || 1),
    beneficiaryId: inst.beneficiary_id || inst.beneficiaryId,
    beneficiaryName: inst.beneficiary_name || beneficiary?.full_name || beneficiary?.fullName || 'Beneficiary',
    village: inst.village || beneficiary?.village_id || beneficiary?.village || '',
    block: inst.block || beneficiary?.block_id || beneficiary?.block || '',
    district: inst.district || beneficiary?.district_id || beneficiary?.district || '',
    schemeId: inst.scheme_id || inst.schemeId || 'SCH-PMAYG',
    schemeName: inst.scheme_name || scheme?.name || 'Pradhan Mantri Awas Yojana - Gramin',
    amount: Number(inst.amount || 40000),
    requestedDate: inst.requested_date || inst.requestedDate || '2026-02-01',
    approvalDate: inst.approval_date || inst.approvalDate || null,
    disbursementDate: inst.disbursement_date || inst.disbursementDate || null,
    status: inst.status || 'Pending Approval',
    linkedInspectionId: inst.linked_inspection_id || inst.linkedInspectionId || null,
    prerequisitesMet: inst.prerequisite_checks || inst.prerequisitesMet || {
      physicalMilestoneVerified: true,
      photoEvidenceShaVerified: true,
      blockOfficerEndorsement: true,
      budgetAllocationAvailable: true,
    },
    approverOfficer: inst.approver_officer || inst.approverOfficer || null,
    rejectionReason: inst.rejection_reason || inst.rejectionReason || null,
    disbursementRef: inst.disbursement_ref || inst.disbursementRef || null,
  };
}

// GET /api/installments
router.get('/', optionalAuthenticate, (req, res) => {
  const { district, status, page, limit } = req.query;
  let items = database.store.installments;

  if (district && district !== 'All') {
    items = items.filter((i) => {
      const b = database.store.beneficiaries.find((ben) => ben.id === (i.beneficiary_id || i.beneficiaryId));
      return (i.district === district) || (b && (b.district_id === district || b.district === district));
    });
  }
  if (status && status !== 'All') {
    items = items.filter((i) => i.status.toLowerCase() === status.toLowerCase());
  }

  const serialized = items.map(serializeInstallment);

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, {
    installments: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// GET /api/installments/:id
router.get('/:id', optionalAuthenticate, (req, res) => {
  const item = database.store.installments.find((i) => i.id === req.params.id);
  if (!item) {
    throw new NotFoundError(`Installment '${req.params.id}' not found`);
  }
  return successResponse(res, serializeInstallment(item));
});

// PATCH /api/installments/:id/approve
router.patch('/:id/approve', authenticate, enforceSeparationOfDuties, authorize('state_admin', 'district_officer'), async (req, res) => {
  const index = database.store.installments.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    throw new NotFoundError(`Installment '${req.params.id}' not found`);
  }

  const before = { ...database.store.installments[index] };
  const { notes } = req.body;

  // Validate prerequisites (milestone verified, SHA-256 verified)
  validateInstallmentPrerequisites(before);

  const approvalDate = new Date().toISOString().split('T')[0];
  const simulatedDisbursementRef = `PFMS-SIM-2026-UP-${Math.floor(10000 + Math.random() * 90000)}`;

  database.store.installments[index] = {
    ...before,
    status: 'Approved',
    approval_date: approvalDate,
    approver_officer: req.user.full_name,
    reviewer_remarks: notes || 'Statutory physical milestone and photographic cryptographic SHA-256 verified',
    disbursement_ref: simulatedDisbursementRef,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.installments[index];

  // Record approval in approvals decision history
  const approvalEntry = {
    id: `APPR-${generateUUID().slice(0, 8)}`,
    entity_type: 'Installment',
    entity_id: after.id,
    workflow_stage: `Installment #${after.installment_number || after.installmentNumber}`,
    action: 'APPROVE',
    reviewer_id: req.user.id,
    reviewer_name: req.user.full_name,
    remarks: notes || 'DBT installment sanctioned following verified physical milestones',
    previous_status: before.status,
    new_status: 'Approved',
    created_at: new Date().toISOString(),
  };
  database.store.approvals.unshift(approvalEntry);

  // Update beneficiary's disbursed tracking
  const benIndex = database.store.beneficiaries.findIndex(
    (b) => b.id === (after.beneficiary_id || after.beneficiaryId)
  );
  if (benIndex !== -1) {
    const ben = database.store.beneficiaries[benIndex];
    database.store.beneficiaries[benIndex] = {
      ...ben,
      current_installment_no: Math.min(ben.total_installments || 3, (after.installment_number || 1) + 1),
      disbursed_amount: Number(ben.disbursed_amount || 0) + Number(after.amount || 40000),
    };
  }

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'APPROVED_INSTALLMENT',
    entityType: 'Installment',
    entityId: after.id,
    entityCode: `Inst #${after.installment_number || after.installmentNumber}`,
    beforeState: { status: before.status },
    afterState: { status: after.status, disbursementRef: simulatedDisbursementRef },
    reason: notes || 'Statutory physical milestones and photo SHA-256 verified',
    requestId: req.id,
  });

  return successResponse(res, serializeInstallment(after));
});

// PATCH /api/installments/:id/reject
router.patch('/:id/reject', authenticate, enforceSeparationOfDuties, authorize('state_admin', 'district_officer'), async (req, res) => {
  const index = database.store.installments.findIndex((i) => i.id === req.params.id);
  if (index === -1) {
    throw new NotFoundError(`Installment '${req.params.id}' not found`);
  }

  const { reason } = req.body;
  if (!reason) {
    throw new ValidationError('A mandatory rejection reason must be specified');
  }

  const before = { ...database.store.installments[index] };

  database.store.installments[index] = {
    ...before,
    status: 'Rejected',
    rejection_reason: reason,
    approver_officer: req.user.full_name,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.installments[index];

  const approvalEntry = {
    id: `APPR-${generateUUID().slice(0, 8)}`,
    entity_type: 'Installment',
    entity_id: after.id,
    workflow_stage: `Installment #${after.installment_number || after.installmentNumber}`,
    action: 'REJECT',
    reviewer_id: req.user.id,
    reviewer_name: req.user.full_name,
    remarks: reason,
    previous_status: before.status,
    new_status: 'Rejected',
    created_at: new Date().toISOString(),
  };
  database.store.approvals.unshift(approvalEntry);

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'REJECTED_INSTALLMENT',
    entityType: 'Installment',
    entityId: after.id,
    entityCode: `Inst #${after.installment_number || after.installmentNumber}`,
    beforeState: { status: before.status },
    afterState: { status: after.status },
    reason,
    requestId: req.id,
  });

  return successResponse(res, serializeInstallment(after));
});

export default router;
