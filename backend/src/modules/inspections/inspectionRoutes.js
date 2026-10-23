import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize, blockAuditorMutations, enforceSeparationOfDuties } from '../../middleware/authorize.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { generateCode } from '../../utils/ids.js';

const router = Router();

function serializeInspection(i) {
  const beneficiary = database.store.beneficiaries.find(
    (b) => b.id === i.beneficiary_id || b.id === i.beneficiaryId
  );
  const evidencePhotos = database.store.inspectionEvidence.filter(
    (e) => e.inspection_id === i.id || e.inspectionId === i.id
  ).map((e) => ({
    id: e.id,
    caption: e.caption || 'Site Evidence',
    timestamp: e.captured_at || e.uploaded_at || new Date().toISOString(),
    fileSizeKb: Math.round(Number(e.file_size || 200000) / 1024),
    sha256Hash: e.sha256_hash,
    thumbnailUrl: e.thumbnail_url || (e.storage_path ? `/api/evidence/file/${e.storage_path.replace('local://', '')}` : ''),
  }));

  return {
    id: i.id,
    inspectionCode: i.inspection_code || i.inspectionCode,
    clientRecordId: i.client_record_id || i.clientRecordId || null,
    beneficiaryId: i.beneficiary_id || i.beneficiaryId,
    beneficiaryName: i.beneficiary_name || beneficiary?.full_name || beneficiary?.fullName || 'Beneficiary',
    schemeId: i.scheme_id || i.schemeId || 'SCH-PMAYG',
    schemeName: i.scheme_name || beneficiary?.scheme_name || 'Pradhan Mantri Awas Yojana - Gramin',
    village: i.village_id || i.village || beneficiary?.village || '',
    block: i.block_id || i.block || beneficiary?.block || '',
    district: i.district_id || i.district || beneficiary?.district || '',
    scheduledDate: i.captured_at ? i.captured_at.split('T')[0] : (i.scheduledDate || '2026-02-15'),
    completedDate: i.submitted_at ? i.submitted_at.split('T')[0] : (i.completedDate || null),
    inspectorName: i.inspector_name || i.inspectorName || 'R. K. Singh (Junior Engineer)',
    status: i.status || 'Scheduled',
    stage: i.stage || 'Foundation',
    gpsLocation: {
      lat: Number(i.latitude || (i.gpsLocation && i.gpsLocation.lat) || 25.3),
      lng: Number(i.longitude || (i.gpsLocation && i.gpsLocation.lng) || 82.9),
      accuracyMeters: Number(i.reported_accuracy || (i.gpsLocation && i.gpsLocation.accuracyMeters) || 3.5),
      isDeviceGps: i.is_device_gps != null ? Boolean(i.is_device_gps) : Boolean(i.gpsLocation?.isDeviceGps ?? true),
    },
    checklist: i.checklist || [],
    evidencePhotos: evidencePhotos.length > 0 ? evidencePhotos : (i.evidencePhotos || []),
    observations: i.inspection_notes || i.observations || '',
    correctiveActionsRequired: i.corrective_actions_required || i.correctiveActionsRequired || '',
    followUpDeadline: i.follow_up_deadline || i.followUpDeadline || null,
    syncedFromServer: i.synced_from_server ?? true,
    syncStatus: i.sync_status || 'synced',
  };
}

// GET /api/inspections
router.get('/', optionalAuthenticate, (req, res) => {
  const { district, block, status, stage, page, limit } = req.query;
  let items = database.store.inspections;

  if (district && district !== 'All') {
    items = items.filter((i) => (i.district_id || i.district) === district);
  }
  if (block && block !== 'All') {
    items = items.filter((i) => (i.block_id || i.block) === block);
  }
  if (status && status !== 'All') {
    items = items.filter((i) => (i.status || '').toLowerCase() === status.toLowerCase());
  }
  if (stage && stage !== 'All') {
    items = items.filter((i) => (i.stage || '').toLowerCase() === stage.toLowerCase());
  }

  const serialized = items.map(serializeInspection);

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, {
    inspections: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// GET /api/inspections/:id
router.get('/:id', optionalAuthenticate, (req, res) => {
  const item = database.store.inspections.find(
    (i) => i.id === req.params.id || i.inspection_code === req.params.id || i.inspectionCode === req.params.id
  );
  if (!item) {
    throw new NotFoundError(`Inspection '${req.params.id}' not found`);
  }
  return successResponse(res, serializeInspection(item));
});

// POST /api/inspections (Supports offline-first idempotency)
router.post('/', authenticate, blockAuditorMutations, async (req, res) => {
  const data = req.body;

  // 1. Check idempotency if client_record_id or clientRecordId provided
  const clientRecordId = data.clientRecordId || data.client_record_id || data.id;
  if (clientRecordId) {
    const existing = database.store.inspections.find(
      (i) => i.client_record_id === clientRecordId || i.id === clientRecordId
    );
    if (existing) {
      // Idempotent return: do not create duplicate
      return successResponse(res, serializeInspection(existing), 200, {
        idempotentRetry: true,
        message: 'Existing inspection record returned for duplicate clientRecordId',
      });
    }
  }

  if (!data.beneficiaryId) {
    throw new ValidationError('beneficiaryId is required for field inspection');
  }

  const id = data.id || `INSP-${Date.now().toString().slice(-4)}`;
  const inspectionCode = data.inspectionCode || generateCode('GS', 'INSP', 2026);

  const newInspection = {
    id,
    client_record_id: clientRecordId,
    clientRecordId,
    inspection_code: inspectionCode,
    inspectionCode,
    project_id: data.projectId || null,
    beneficiary_id: data.beneficiaryId,
    beneficiaryId: data.beneficiaryId,
    beneficiary_name: data.beneficiaryName || '',
    scheme_id: data.schemeId || 'SCH-PMAYG',
    scheme_name: data.schemeName || 'Pradhan Mantri Awas Yojana - Gramin',
    village_id: data.village || '',
    block_id: data.block || '',
    district_id: data.district || '',
    stage: data.stage || 'Foundation',
    status: data.status || 'Scheduled',
    inspector_name: data.inspectorName || req.user.full_name,
    inspection_notes: data.observations || '',
    observations: data.observations || '',
    latitude: data.gpsLocation?.lat || 25.3,
    longitude: data.gpsLocation?.lng || 82.9,
    reported_accuracy: data.gpsLocation?.accuracyMeters || 3.5,
    is_device_gps: data.gpsLocation?.isDeviceGps ?? true,
    checklist: data.checklist || [],
    evidencePhotos: data.evidencePhotos || [],
    captured_at: new Date().toISOString(),
    submitted_at: data.status === 'Scheduled' ? null : new Date().toISOString(),
    offline_created: Boolean(data.offlineCreated || req.headers['x-offline-source']),
    sync_status: 'synced',
    created_at: new Date().toISOString(),
  };

  database.store.inspections.unshift(newInspection);

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'CREATED_INSPECTION',
    entityType: 'Inspection',
    entityId: newInspection.id,
    entityCode: newInspection.inspection_code,
    beforeState: null,
    afterState: newInspection,
    reason: `Field inspection created for stage '${newInspection.stage}'`,
    requestId: req.id,
  });

  return successResponse(res, serializeInspection(newInspection), 201);
});

// POST /api/inspections/:id/submit
router.post('/:id/submit', authenticate, blockAuditorMutations, async (req, res) => {
  const index = database.store.inspections.findIndex((i) => i.id === req.params.id || i.inspection_code === req.params.id);
  if (index === -1) {
    throw new NotFoundError(`Inspection '${req.params.id}' not found`);
  }

  const before = { ...database.store.inspections[index] };
  const { notes, checklist, observations } = req.body;

  database.store.inspections[index] = {
    ...before,
    status: 'In Progress',
    inspection_notes: notes || observations || before.inspection_notes,
    checklist: checklist || before.checklist,
    submitted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const after = database.store.inspections[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'SUBMITTED_FIELD_INSPECTION',
    entityType: 'Inspection',
    entityId: after.id,
    entityCode: after.inspection_code || after.inspectionCode,
    beforeState: before,
    afterState: after,
    reason: notes || 'Inspector submitted physical verification on ground',
    requestId: req.id,
  });

  return successResponse(res, serializeInspection(after));
});

// POST /api/inspections/:id/approve (Separation of duties: Field Inspectors CANNOT approve!)
router.post('/:id/approve', authenticate, enforceSeparationOfDuties, authorize('state_admin', 'district_officer', 'bdo'), async (req, res) => {
  const index = database.store.inspections.findIndex((i) => i.id === req.params.id || i.inspection_code === req.params.id);
  if (index === -1) {
    throw new NotFoundError(`Inspection '${req.params.id}' not found`);
  }

  const before = { ...database.store.inspections[index] };
  const { notes } = req.body;

  database.store.inspections[index] = {
    ...before,
    status: 'Passed',
    inspection_notes: notes ? `${before.inspection_notes || ''}\n[Approved]: ${notes}` : before.inspection_notes,
    completed_date: new Date().toISOString().split('T')[0],
    updated_at: new Date().toISOString(),
  };

  const after = database.store.inspections[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'APPROVED_FIELD_INSPECTION',
    entityType: 'Inspection',
    entityId: after.id,
    entityCode: after.inspection_code || after.inspectionCode,
    beforeState: before,
    afterState: after,
    reason: notes || 'Statutory stage milestone inspection approved by officer',
    requestId: req.id,
  });

  return successResponse(res, serializeInspection(after));
});

// POST /api/inspections/:id/reject
router.post('/:id/reject', authenticate, enforceSeparationOfDuties, authorize('state_admin', 'district_officer', 'bdo'), async (req, res) => {
  const index = database.store.inspections.findIndex((i) => i.id === req.params.id || i.inspection_code === req.params.id);
  if (index === -1) {
    throw new NotFoundError(`Inspection '${req.params.id}' not found`);
  }

  const { reason } = req.body;
  if (!reason) {
    throw new ValidationError('A mandatory rejection reason must be supplied');
  }

  const before = { ...database.store.inspections[index] };

  database.store.inspections[index] = {
    ...before,
    status: 'Failed',
    corrective_actions_required: reason,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.inspections[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'REJECTED_FIELD_INSPECTION',
    entityType: 'Inspection',
    entityId: after.id,
    entityCode: after.inspection_code || after.inspectionCode,
    beforeState: before,
    afterState: after,
    reason,
    requestId: req.id,
  });

  return successResponse(res, serializeInspection(after));
});

// POST /api/inspections/:id/request-correction
router.post('/:id/request-correction', authenticate, enforceSeparationOfDuties, authorize('state_admin', 'district_officer', 'bdo'), async (req, res) => {
  const index = database.store.inspections.findIndex((i) => i.id === req.params.id || i.inspection_code === req.params.id);
  if (index === -1) {
    throw new NotFoundError(`Inspection '${req.params.id}' not found`);
  }

  const { instructions } = req.body;
  if (!instructions) {
    throw new ValidationError('Correction instructions must be specified');
  }

  const before = { ...database.store.inspections[index] };

  database.store.inspections[index] = {
    ...before,
    status: 'Needs Improvement',
    corrective_actions_required: instructions,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.inspections[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'CORRECTION_REQUESTED_INSPECTION',
    entityType: 'Inspection',
    entityId: after.id,
    entityCode: after.inspection_code || after.inspectionCode,
    beforeState: before,
    afterState: after,
    reason: instructions,
    requestId: req.id,
  });

  return successResponse(res, serializeInspection(after));
});

export default router;
