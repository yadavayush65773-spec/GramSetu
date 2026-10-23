import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { database } from '../../config/database.js';
import { authenticate } from '../../middleware/authenticate.js';
import { blockAuditorMutations } from '../../middleware/authorize.js';
import { uploadRateLimiter } from '../../middleware/rateLimiter.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../../utils/errors.js';
import { uploadEvidenceFile, getEvidenceDownloadUrl } from '../../config/storage.js';
import { evaluateEvidenceIntegrity } from '../../services/evidenceIntegrity.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { generateUUID } from '../../utils/ids.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// POST /api/inspections/:id/evidence (Upload and verify SHA-256 evidence)
router.post('/inspections/:id/evidence', authenticate, blockAuditorMutations, uploadRateLimiter, upload.single('photo'), async (req, res) => {
  const inspectionId = req.params.id;
  const inspection = database.store.inspections.find(
    (i) => i.id === inspectionId || i.inspection_code === inspectionId
  );
  if (!inspection) {
    throw new NotFoundError(`Inspection '${inspectionId}' not found`);
  }

  if (!req.file) {
    throw new ValidationError("Multipart form file 'photo' is required");
  }

  const { caption, clientHash, lat, lng } = req.body;

  // 1. Upload to storage (Supabase or local filesystem) and calculate genuine server SHA-256
  const uploadResult = await uploadEvidenceFile({
    file: req.file,
    inspectionId: inspection.id,
    userId: req.user.id,
  });

  // 2. Fetch project/beneficiary for reference coordinates
  const beneficiary = database.store.beneficiaries.find((b) => b.id === inspection.beneficiary_id);
  const referenceCoords = beneficiary ? { lat: beneficiary.latitude, lng: beneficiary.longitude } : null;
  const evidenceCoords = (lat && lng) ? { lat: parseFloat(lat), lng: parseFloat(lng) } : (inspection.latitude ? { lat: inspection.latitude, lng: inspection.longitude } : null);

  // 3. Evaluate evidence integrity (client hash match, duplicate hash check, geo-distance check)
  const integrityEvaluation = evaluateEvidenceIntegrity({
    serverHash: uploadResult.serverSha256,
    clientHash: clientHash,
    evidenceCoords,
    referenceCoords,
    existingEvidenceRecords: database.store.inspectionEvidence,
    currentInspectionId: inspection.id,
    currentProjectId: inspection.project_id,
  });

  const evidenceRecord = {
    id: `EVID-${generateUUID().slice(0, 8)}`,
    inspection_id: inspection.id,
    project_id: inspection.project_id,
    storage_path: uploadResult.storagePath,
    thumbnail_url: uploadResult.storagePath.startsWith('local://')
      ? `/api/evidence/file/${uploadResult.storagePath.replace('local://', '')}`
      : uploadResult.storagePath,
    original_filename: uploadResult.originalFilename,
    media_type: uploadResult.mimeType,
    file_size: uploadResult.fileSize,
    sha256_hash: uploadResult.serverSha256,
    caption: caption || 'Inspection site photographic proof',
    captured_at: new Date().toISOString(),
    uploaded_at: new Date().toISOString(),
    uploaded_by: req.user.id,
    reported_latitude: evidenceCoords?.lat || null,
    reported_longitude: evidenceCoords?.lng || null,
    integrity_metadata: integrityEvaluation,
  };

  database.store.inspectionEvidence.unshift(evidenceRecord);

  // If a duplicate hash or severe geo-fence discrepancy is detected, generate an explainable risk alert
  if (integrityEvaluation.isReusedHash || integrityEvaluation.isGeoDiscrepant) {
    const riskCode = `FRD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRiskCase = {
      id: `RISK-${generateUUID().slice(0, 8)}`,
      case_code: riskCode,
      case_reference: `CASE-${uploadResult.serverSha256.slice(0, 8)}`,
      title: integrityEvaluation.isReusedHash
        ? 'Duplicate Photographic SHA-256 Hash Detected'
        : 'Out-of-Boundary GPS Geotag Discrepancy',
      title_hi: integrityEvaluation.isReusedHash
        ? 'तस्वीर का SHA-256 हैश अन्य रिकॉर्ड से मेल खाता है'
        : 'भू-स्थानिक सीमा से बाहर का विसंगत जियोटैग',
      entity_type: 'Inspection',
      entity_id: inspection.id,
      beneficiary_id: inspection.beneficiary_id,
      risk_score: integrityEvaluation.isReusedHash ? 80 : 55,
      risk_level: integrityEvaluation.isReusedHash ? 'critical' : 'high',
      severity: integrityEvaluation.isReusedHash ? 'Critical' : 'High',
      flag_date: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      indicators: integrityEvaluation.flags.map((f) => ({
        factor: f.code,
        points: f.severity === 'Critical' ? 45 : 30,
        evidenceText: f.description,
        evidenceRef: uploadResult.serverSha256,
      })),
      recommended_action: 'Joint physical audit by BDO and Technical Inspector before installment release.',
      created_at: new Date().toISOString(),
    };
    database.store.riskCases.unshift(newRiskCase);
  }

  // Record audit entry
  await recordAuditEvent({
    actorId: req.user.id,
    actor: req.user.full_name,
    actorRole: req.user.role,
    action: 'UPLOADED_INSPECTION_EVIDENCE',
    entityType: 'Inspection',
    entityId: inspection.id,
    entityCode: inspection.inspection_code || inspection.inspectionCode,
    beforeState: null,
    afterState: {
      evidenceId: evidenceRecord.id,
      sha256: evidenceRecord.sha256_hash,
      flags: integrityEvaluation.flags,
    },
    reason: 'Field evidence photo uploaded and verified with SHA-256 digest',
    sha256EvidenceRef: evidenceRecord.sha256_hash,
    requestId: req.id,
  });

  return successResponse(res, evidenceRecord, 201);
});

// GET /api/inspections/:id/evidence
router.get('/inspections/:id/evidence', authenticate, (req, res) => {
  const inspectionId = req.params.id;
  const items = database.store.inspectionEvidence.filter(
    (e) => e.inspection_id === inspectionId || e.inspectionId === inspectionId
  );
  return successResponse(res, { evidence: items, total: items.length });
});

// GET /api/evidence/:id/download (Generate short-lived signed URL)
router.get('/evidence/:id/download', authenticate, async (req, res) => {
  const evidence = database.store.inspectionEvidence.find((e) => e.id === req.params.id);
  if (!evidence) {
    throw new NotFoundError(`Evidence record '${req.params.id}' not found`);
  }

  const downloadUrl = await getEvidenceDownloadUrl(evidence.storage_path, 1800); // 30 min expiry
  return successResponse(res, {
    downloadUrl,
    sha256Hash: evidence.sha256_hash,
    filename: evidence.original_filename,
    expiresInSeconds: 1800,
  });
});

// GET /api/evidence/file/:filename (Stream local file in demo mode)
router.get('/evidence/file/:filename', (req, res) => {
  const safeFilename = path.basename(req.params.filename);
  const filePath = path.resolve(process.cwd(), 'uploads', safeFilename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send('File not found');
  }

  res.setHeader('Cache-Control', 'private, max-age=3600');
  return res.sendFile(filePath);
});

export default router;
