import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize, blockAuditorMutations } from '../../middleware/authorize.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { findPotentialDuplicates } from '../../services/duplicateDetection.js';
import { normalizeName, generateCode, generateUUID } from '../../utils/ids.js';

const router = Router();

function serializeBeneficiary(b, isPublic = false) {
  return {
    id: b.id,
    beneficiaryCode: b.beneficiary_reference || b.beneficiaryCode,
    fullName: b.full_name || b.fullName,
    fullNameHi: b.full_name_hi || b.fullNameHi || '',
    gender: b.gender || 'Other',
    age: b.age || 40,
    phoneMasked: b.phone_masked || b.phoneMasked || 'XXXXXX0000',
    village: b.village_id || b.village,
    villageHi: b.village_hi || b.villageHi || '',
    block: b.block_id || b.block,
    district: b.district_id || b.district,
    schemeId: b.scheme_id || b.schemeId,
    schemeName: b.scheme_name || b.schemeName || 'Pradhan Mantri Awas Yojana - Gramin',
    applicationDate: b.created_at ? b.created_at.split('T')[0] : (b.applicationDate || '2026-01-10'),
    verificationStatus: b.verification_status || b.verificationStatus || 'Pending',
    assignedOfficer: b.assigned_officer || b.assignedOfficer || 'Authorized Field Inspector',
    riskScore: Number(b.risk_score || b.riskScore || 0),
    riskSeverity: b.risk_severity || b.riskSeverity || 'Low',
    riskFlags: b.risk_flags || b.riskFlags || [],
    eligibilityChecklist: b.verification_checklist || b.eligibilityChecklist || [],
    documents: isPublic ? [] : (b.documents || []),
    currentInstallmentNo: Number(b.current_installment_no || b.currentInstallmentNo || 0),
    totalInstallments: Number(b.total_installments || b.totalInstallments || 3),
    totalApprovedAmount: Number(b.total_approved_amount || b.totalApprovedAmount || 130000),
    disbursedAmount: Number(b.disbursed_amount || b.disbursedAmount || 0),
    coordinates: {
      lat: Number(b.latitude || (b.coordinates && b.coordinates.lat) || 25.3),
      lng: Number(b.longitude || (b.coordinates && b.coordinates.lng) || 82.9),
    },
    notes: b.reviewer_notes || b.notes || '',
  };
}

// GET /api/beneficiaries
router.get('/', optionalAuthenticate, (req, res) => {
  const { district, block, schemeId, status, search, page, limit } = req.query;
  const isCitizen = req.user && (req.user.role === 'citizen' || req.user.role === 'public_citizen');

  let items = database.store.beneficiaries;

  // Jurisdiction filtering for District Officers and BDOs
  if (req.user && req.user.role === 'district_officer' && req.user.district_id) {
    items = items.filter((b) => (b.district_id || b.district) === req.user.district_id);
  }
  if (req.user && req.user.role === 'bdo' && req.user.block_id) {
    items = items.filter((b) => (b.block_id || b.block) === req.user.block_id);
  }

  if (district && district !== 'All') {
    items = items.filter((b) => (b.district_id || b.district) === district);
  }
  if (block && block !== 'All') {
    items = items.filter((b) => (b.block_id || b.block) === block);
  }
  if (schemeId && schemeId !== 'All') {
    items = items.filter((b) => (b.scheme_id || b.schemeId) === schemeId);
  }
  if (status && status !== 'All') {
    items = items.filter((b) => (b.verification_status || b.verificationStatus) === status);
  }
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((b) => {
      const name = (b.full_name || b.fullName || '').toLowerCase();
      const code = (b.beneficiary_reference || b.beneficiaryCode || '').toLowerCase();
      const village = (b.village_id || b.village || '').toLowerCase();
      return name.includes(q) || code.includes(q) || village.includes(q);
    });
  }

  const serialized = items.map((b) => serializeBeneficiary(b, isCitizen));

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, {
    beneficiaries: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// GET /api/beneficiaries/:id
router.get('/:id', optionalAuthenticate, (req, res) => {
  const beneficiary = database.store.beneficiaries.find(
    (b) => b.id === req.params.id || b.beneficiary_reference === req.params.id || b.beneficiaryCode === req.params.id
  );
  if (!beneficiary) {
    throw new NotFoundError(`Beneficiary '${req.params.id}' not found`);
  }

  const isCitizen = req.user && (req.user.role === 'citizen' || req.user.role === 'public_citizen');
  return successResponse(res, serializeBeneficiary(beneficiary, isCitizen));
});

// GET /api/beneficiaries/:id/duplicates
router.get('/:id/duplicates', authenticate, (req, res) => {
  const target = database.store.beneficiaries.find(
    (b) => b.id === req.params.id || b.beneficiary_reference === req.params.id || b.beneficiaryCode === req.params.id
  );
  if (!target) {
    throw new NotFoundError(`Beneficiary '${req.params.id}' not found`);
  }

  const duplicates = findPotentialDuplicates(target, database.store.beneficiaries, database.store.inspectionEvidence);
  return successResponse(res, {
    beneficiaryId: target.id,
    duplicateCandidates: duplicates,
    total: duplicates.length,
  });
});

// POST /api/beneficiaries
router.post('/', authenticate, blockAuditorMutations, async (req, res, next) => {
  try {
    const data = req.body;
    if (!data.fullName && !data.full_name) {
      throw new ValidationError('Applicant fullName is required');
    }

    const id = data.id || `BEN-${Date.now().toString().slice(-4)}`;
    const beneficiaryCode = data.beneficiaryCode || generateCode('GS', 'BEN', 2026);
    const fullName = data.fullName || data.full_name;

    const newBeneficiary = {
      id,
      beneficiary_reference: beneficiaryCode,
      beneficiaryCode,
      full_name: fullName,
      fullName,
      full_name_hi: data.fullNameHi || data.full_name_hi || '',
      fullNameHi: data.fullNameHi || '',
      normalized_name: normalizeName(fullName),
      gender: data.gender || 'Male',
      age: Number(data.age || 40),
      phone_masked: data.phoneMasked || 'XXXXXX0000',
      phoneMasked: data.phoneMasked || 'XXXXXX0000',
      household_reference: data.householdReference || `HH-UP-${Date.now().toString().slice(-4)}`,
      village_id: data.village || data.village_id || 'Rohaniya',
      village: data.village || 'Rohaniya',
      panchayat_id: data.panchayatId || 'GP-01',
      block_id: data.block || data.block_id || 'Sevapuri',
      block: data.block || 'Sevapuri',
      district_id: data.district || data.district_id || 'Varanasi',
      district: data.district || 'Varanasi',
      scheme_id: data.schemeId || 'SCH-PMAYG',
      schemeId: data.schemeId || 'SCH-PMAYG',
      scheme_name: data.schemeName || 'Pradhan Mantri Awas Yojana - Gramin',
      schemeName: data.schemeName || 'Pradhan Mantri Awas Yojana - Gramin',
      verification_status: 'Pending',
      verificationStatus: 'Pending',
      verification_checklist: data.eligibilityChecklist || [],
      eligibilityChecklist: data.eligibilityChecklist || [],
      documents: data.documents || [],
      risk_score: 0,
      riskScore: 0,
      risk_severity: 'Low',
      riskSeverity: 'Low',
      risk_flags: [],
      riskFlags: [],
      current_installment_no: 0,
      total_installments: 3,
      total_approved_amount: 130000,
      disbursed_amount: 0,
      latitude: data.coordinates?.lat || 25.3,
      longitude: data.coordinates?.lng || 82.9,
      created_at: new Date().toISOString(),
    };

    database.store.beneficiaries.unshift(newBeneficiary);

    await recordAuditEvent({
      actorId: req.user.id,
      actor: req.user.full_name,
      actorRole: req.user.role,
      action: 'REGISTERED_NEW_BENEFICIARY',
      entityType: 'Beneficiary',
      entityId: newBeneficiary.id,
      entityCode: newBeneficiary.beneficiary_reference,
      beforeState: null,
      afterState: newBeneficiary,
      reason: 'New beneficiary application registered into GramSetu platform',
      requestId: req.id,
    });

    return successResponse(res, serializeBeneficiary(newBeneficiary), 201);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/beneficiaries/:id/verify (Statutory verification checklist workflow)
router.patch('/:id/verify', authenticate, blockAuditorMutations, async (req, res, next) => {
  try {
    const { status, reason, checklistUpdates, reviewerNotes } = req.body;

    if (!status) {
      throw new ValidationError("Verification 'status' is required ('Verified' | 'Flagged' | 'Rejected' | 'Correction Requested' | 'Under Review')");
    }

    // Citizens and field inspectors cannot make final statutory verification approvals
    if (req.user.role === 'citizen' || req.user.role === 'public_citizen') {
      throw new ForbiddenError('Citizens cannot perform statutory beneficiary verification');
    }

    const index = database.store.beneficiaries.findIndex(
      (b) => b.id === req.params.id || b.beneficiary_reference === req.params.id || b.beneficiaryCode === req.params.id
    );
    if (index === -1) {
      throw new NotFoundError(`Beneficiary '${req.params.id}' not found`);
    }

    const before = { ...database.store.beneficiaries[index] };

    // If status is being set to Verified, enforce mandatory justification/notes
    if (status === 'Verified' && !reason && !reviewerNotes) {
      throw new ValidationError('A mandatory justification reason must be recorded when verifying an applicant');
    }

    // Apply checklist updates if provided
    let updatedChecklist = before.verification_checklist || before.eligibilityChecklist || [];
    if (Array.isArray(checklistUpdates)) {
      updatedChecklist = updatedChecklist.map((c) => {
        const up = checklistUpdates.find((u) => u.id === c.id);
        return up ? { ...c, met: Boolean(up.met) } : c;
      });
    }

    // Check if all critical criteria are met before marking 'Verified'
    if (status === 'Verified') {
      const unmet = updatedChecklist.filter((c) => !c.met);
      if (unmet.length > 2) {
        throw new ValidationError(`Cannot mark applicant 'Verified': ${unmet.length} mandatory statutory criteria remain unmet`);
      }
    }

    database.store.beneficiaries[index] = {
      ...before,
      verification_status: status,
      verificationStatus: status,
      verification_checklist: updatedChecklist,
      eligibilityChecklist: updatedChecklist,
      reviewer_notes: reviewerNotes || reason || before.reviewer_notes,
      assigned_officer: req.user.full_name,
      updated_at: new Date().toISOString(),
    };

    const after = database.store.beneficiaries[index];

    await recordAuditEvent({
      actorId: req.user.id,
      actor: req.user.full_name,
      actorRole: req.user.role,
      action: `STATUS_CHANGE_${status.toUpperCase().replace(/\s+/g, '_')}`,
      entityType: 'Beneficiary',
      entityId: after.id,
      entityCode: after.beneficiary_reference || after.beneficiaryCode,
      beforeState: { status: before.verification_status || before.verificationStatus },
      afterState: { status: after.verification_status },
      reason: reason || reviewerNotes || 'Statutory verification workflow transition',
      requestId: req.id,
    });

    return successResponse(res, serializeBeneficiary(after));
  } catch (err) {
    next(err);
  }
});

export default router;
