import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { grievanceRateLimiter } from '../../middleware/rateLimiter.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { generateGrievanceTrackingCode, generateUUID } from '../../utils/ids.js';

const router = Router();

function serializeGrievance(g, isPublic = false) {
  if (isPublic) {
    // Privacy-safe public tracking response: no unmasked complainant data or internal remarks
    const nameParts = (g.citizen_name || g.citizenName || 'Citizen').split(' ');
    const maskedName = nameParts[0].charAt(0) + '**** ' + (nameParts[1] ? nameParts[1].charAt(0) + '.' : '');

    return {
      trackingId: g.tracking_code || g.trackingId,
      maskedCitizen: maskedName,
      village: g.village,
      district: g.district_id || g.district,
      schemeName: g.scheme_name || g.schemeName,
      category: g.category,
      submissionDate: g.created_at ? g.created_at.split('T')[0] : (g.submissionDate || '2026-02-10'),
      status: g.status,
      publicResponse: g.response_summary || g.officer_remarks || 'Your grievance has been registered and is under active inquiry.',
    };
  }

  // Administrative view
  return {
    id: g.id,
    trackingId: g.tracking_code || g.trackingId,
    citizenName: g.citizen_name || g.citizenName,
    phoneMasked: g.phone_masked || g.phoneMasked,
    village: g.village,
    district: g.district_id || g.district,
    schemeName: g.scheme_name || g.schemeName,
    category: g.category,
    description: g.description,
    submissionDate: g.created_at ? g.created_at.split('T')[0] : (g.submissionDate || '2026-02-10'),
    status: g.status,
    officerRemarks: g.officer_remarks || g.officerRemarks || '',
    responseSummary: g.response_summary || '',
  };
}

// GET /api/grievances (Administrative list)
router.get('/', optionalAuthenticate, (req, res) => {
  const { category, status, district, page, limit } = req.query;
  const isOfficer = req.user && ['state_admin', 'district_officer', 'bdo', 'auditor'].includes(req.user.role);

  let items = database.store.grievances;

  if (district && district !== 'All') {
    items = items.filter((g) => (g.district_id || g.district) === district);
  }
  if (status && status !== 'All') {
    items = items.filter((g) => g.status.toLowerCase() === status.toLowerCase());
  }
  if (category && category !== 'All') {
    items = items.filter((g) => g.category.toLowerCase() === category.toLowerCase());
  }

  const serialized = items.map((g) => serializeGrievance(g, !isOfficer));

  if (page || limit) {
    const paginated = paginate(serialized, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, {
    grievances: serialized,
    items: serialized,
    total: serialized.length,
  });
});

// GET /api/grievances/:trackingId (Public tracking endpoint)
router.get('/:trackingId', optionalAuthenticate, (req, res) => {
  const targetId = req.params.trackingId.trim();
  const grievance = database.store.grievances.find(
    (g) => (g.tracking_code || g.trackingId) === targetId || g.id === targetId
  );

  if (!grievance) {
    throw new NotFoundError(`Grievance with tracking ID '${targetId}' not found`);
  }

  const isOfficer = req.user && ['state_admin', 'district_officer', 'bdo'].includes(req.user.role);
  return successResponse(res, serializeGrievance(grievance, !isOfficer));
});

// POST /api/grievances (Public grievance submission with abuse protection)
router.post('/', grievanceRateLimiter, optionalAuthenticate, async (req, res) => {
  const data = req.body;
  if (!data.citizenName && !data.citizen_name) {
    throw new ValidationError('Citizen name is required');
  }
  if (!data.description || data.description.length < 10) {
    throw new ValidationError('A detailed description (minimum 10 characters) is required');
  }
  if (!data.category) {
    throw new ValidationError('Grievance category is required');
  }

  const id = `GRV-${generateUUID().slice(0, 8)}`;
  const trackingCode = generateGrievanceTrackingCode('UP', 2026);
  const citizenName = data.citizenName || data.citizen_name;
  const phone = data.phoneMasked || data.phone || 'XXXXXX0000';

  const newGrievance = {
    id,
    tracking_code: trackingCode,
    trackingId: trackingCode,
    citizen_name: citizenName,
    citizenName,
    phone_masked: phone.length === 10 ? `XXXXXX${phone.slice(-4)}` : phone,
    phoneMasked: phone.length === 10 ? `XXXXXX${phone.slice(-4)}` : phone,
    village: data.village || 'Rohaniya',
    district_id: data.district || 'Varanasi',
    district: data.district || 'Varanasi',
    scheme_name: data.schemeName || 'Pradhan Mantri Awas Yojana - Gramin',
    schemeName: data.schemeName || 'Pradhan Mantri Awas Yojana - Gramin',
    category: data.category,
    description: data.description,
    status: 'Received',
    submissionDate: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  };

  database.store.grievances.unshift(newGrievance);

  await recordAuditEvent({
    actorId: req.user?.id || null,
    actor: req.user?.full_name || 'Public Rural Citizen',
    actorRole: req.user?.role || 'Citizen',
    action: 'SUBMITTED_CITIZEN_GRIEVANCE',
    entityType: 'Grievance',
    entityId: newGrievance.id,
    entityCode: trackingCode,
    beforeState: null,
    afterState: { category: newGrievance.category, trackingCode },
    reason: `Public complaint registered under category '${newGrievance.category}'`,
    requestId: req.id,
  });

  return successResponse(
    res,
    {
      trackingId: trackingCode,
      message: `Your grievance has been successfully lodged with reference #${trackingCode}. You can track status anytime.`,
      grievance: serializeGrievance(newGrievance, true),
    },
    201
  );
});

// PATCH /api/grievances/:id/status (Authorized officer resolution)
router.patch('/:id/status', authenticate, async (req, res) => {
  if (!['state_admin', 'district_officer', 'bdo'].includes(req.user.role)) {
    throw new ForbiddenError('Only administrative officers can update grievance inquiry status');
  }

  const { status, remarks, responseSummary } = req.body;
  if (!status) {
    throw new ValidationError('Grievance status is required');
  }

  const index = database.store.grievances.findIndex(
    (g) => g.id === req.params.id || g.tracking_code === req.params.id || g.trackingId === req.params.id
  );
  if (index === -1) {
    throw new NotFoundError(`Grievance '${req.params.id}' not found`);
  }

  const before = { ...database.store.grievances[index] };

  database.store.grievances[index] = {
    ...before,
    status,
    officer_remarks: remarks || responseSummary || before.officer_remarks,
    response_summary: responseSummary || remarks || before.response_summary,
    updated_at: new Date().toISOString(),
  };

  const after = database.store.grievances[index];

  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'UPDATED_GRIEVANCE_STATUS',
    entityType: 'Grievance',
    entityId: after.id,
    entityCode: after.tracking_code || after.trackingId,
    beforeState: { status: before.status },
    afterState: { status: after.status },
    reason: remarks || 'Grievance status updated by administrative officer',
    requestId: req.id,
  });

  return successResponse(res, serializeGrievance(after, false));
});

export default router;
