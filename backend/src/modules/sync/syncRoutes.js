import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate } from '../../middleware/authenticate.js';
import { blockAuditorMutations } from '../../middleware/authorize.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { recordAuditEvent } from '../../services/auditService.js';
import { generateUUID } from '../../utils/ids.js';

const router = Router();

// POST /api/sync (Process queued offline inspection/verification items)
router.post('/', authenticate, blockAuditorMutations, async (req, res) => {
  const { items } = req.body;
  const syncQueue = Array.isArray(items) ? items : [req.body];

  if (!syncQueue || syncQueue.length === 0) {
    return successResponse(res, { syncedCount: 0, results: [] });
  }

  const results = [];

  for (const item of syncQueue) {
    const clientRecordId = item.id || item.recordId || item.clientRecordId || generateUUID();
    const itemType = item.type || 'inspection_draft';
    const payload = item.payload || item;

    try {
      // 1. Check if sync record already processed (Idempotency)
      const existingSync = database.store.syncRecords.find((s) => s.client_record_id === clientRecordId);

      if (existingSync) {
        results.push({
          clientRecordId,
          status: 'synced',
          serverRecordId: existingSync.server_record_id,
          idempotentRetry: true,
          message: 'Record previously synchronized',
        });
        continue;
      }

      // 2. Process inspection draft
      if (itemType === 'inspection_draft') {
        const insp = payload;
        // Check if inspection already exists on server
        const existingInspIndex = database.store.inspections.findIndex(
          (i) => i.id === insp.id || i.inspection_code === insp.inspectionCode || i.client_record_id === clientRecordId
        );

        if (existingInspIndex !== -1) {
          const currentOnServer = database.store.inspections[existingInspIndex];

          // Conflict detection: If server inspection is already 'Passed' or 'Failed', do not silently overwrite reviewer decision
          if (['Passed', 'Failed'].includes(currentOnServer.status)) {
            const syncEntry = {
              id: generateUUID(),
              client_record_id: clientRecordId,
              user_id: req.user.id,
              entity_type: 'Inspection',
              server_record_id: currentOnServer.id,
              status: 'conflict',
              payload,
              conflict_details: `Server inspection is already finalized with status '${currentOnServer.status}'`,
              created_at: new Date().toISOString(),
            };
            database.store.syncRecords.unshift(syncEntry);

            results.push({
              clientRecordId,
              status: 'conflict',
              serverRecordId: currentOnServer.id,
              conflictDetails: syncEntry.conflict_details,
              serverRecord: currentOnServer,
            });
            continue;
          }

          // Otherwise, update existing draft
          database.store.inspections[existingInspIndex] = {
            ...currentOnServer,
            ...insp,
            sync_status: 'synced',
            updated_at: new Date().toISOString(),
          };

          const syncEntry = {
            id: generateUUID(),
            client_record_id: clientRecordId,
            user_id: req.user.id,
            entity_type: 'Inspection',
            server_record_id: currentOnServer.id,
            status: 'synced',
            payload,
            created_at: new Date().toISOString(),
          };
          database.store.syncRecords.unshift(syncEntry);

          results.push({
            clientRecordId,
            status: 'synced',
            serverRecordId: currentOnServer.id,
          });
        } else {
          // Create brand new inspection from offline queue
          const newInsp = {
            ...insp,
            id: insp.id || `INSP-${Date.now().toString().slice(-4)}`,
            client_record_id: clientRecordId,
            sync_status: 'synced',
            offline_created: true,
            created_at: new Date().toISOString(),
          };

          database.store.inspections.unshift(newInsp);

          const syncEntry = {
            id: generateUUID(),
            client_record_id: clientRecordId,
            user_id: req.user.id,
            entity_type: 'Inspection',
            server_record_id: newInsp.id,
            status: 'synced',
            payload,
            created_at: new Date().toISOString(),
          };
          database.store.syncRecords.unshift(syncEntry);

          await recordAuditEvent({
            actorId: req.user.id,
            actor: req.user.full_name,
            actorRole: req.user.role,
            action: 'OFFLINE_INSPECTION_SYNCED',
            entityType: 'Inspection',
            entityId: newInsp.id,
            entityCode: newInsp.inspection_code || newInsp.inspectionCode,
            beforeState: null,
            afterState: newInsp,
            reason: 'Synchronized from field inspector offline queue',
            requestId: req.id,
          });

          results.push({
            clientRecordId,
            status: 'synced',
            serverRecordId: newInsp.id,
          });
        }
      } else {
        // Generic synced item
        results.push({
          clientRecordId,
          status: 'synced',
        });
      }
    } catch (err) {
      results.push({
        clientRecordId,
        status: 'failed',
        errorDetails: err.message,
      });
    }
  }

  return successResponse(res, {
    processedCount: syncQueue.length,
    syncedCount: results.filter((r) => r.status === 'synced').length,
    conflictCount: results.filter((r) => r.status === 'conflict').length,
    failedCount: results.filter((r) => r.status === 'failed').length,
    results,
  });
});

export default router;
