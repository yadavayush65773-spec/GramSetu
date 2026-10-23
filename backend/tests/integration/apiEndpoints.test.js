import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { database } from '../../src/config/database.js';

const app = createApp();

describe('GramSetu Full API Workflows & Compatibility', () => {
  beforeEach(() => {
    database.resetDemoData();
  });

  // 1. Health & Diagnostics
  it('GET /api/health returns operational status and database mode', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'UP');
    assert.ok(res.body.data.mode);
    assert.ok(res.body.meta.requestId);
  });

  // 2. Schemes & Projects
  it('GET /api/schemes returns active rural schemes with budget utilization', async () => {
    const res = await request(app).get('/api/schemes');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    const schemes = res.body.data.schemes || res.body.data.items;
    assert.ok(schemes.length >= 6);
    assert.ok(schemes[0].code);
    assert.ok(schemes[0].allocatedBudget > 0);
  });

  it('GET /api/housing-projects/:id returns 404 for unknown project', async () => {
    const res = await request(app).get('/api/housing-projects/UNKNOWN-999');
    assert.equal(res.status, 404);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  // 3. Beneficiary Verification Workflow
  it('PATCH /api/beneficiaries/:id/verify updates statutory checklist and records audit log', async () => {
    const res = await request(app)
      .patch('/api/beneficiaries/BEN-002/verify')
      .set('X-Demo-Role', 'district_officer')
      .send({
        status: 'Verified',
        reason: 'Gram Sabha resolution minutes submitted and physical survey verified on ground',
        checklistUpdates: [
          { id: 'C7', met: true },
          { id: 'C9', met: true },
        ],
      });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.verificationStatus, 'Verified');

    // Verify audit log entry was automatically created
    const auditRes = await request(app)
      .get('/api/audit-logs')
      .set('X-Demo-Role', 'auditor');

    const logs = auditRes.body.data.auditLogs || auditRes.body.data.items;
    const verifyLog = logs.find((l) => l.action === 'STATUS_CHANGE_VERIFIED');
    assert.ok(verifyLog);
    assert.equal(verifyLog.targetEntity, 'Beneficiary');
  });

  it('enforces mandatory justification when verifying an applicant', async () => {
    const res = await request(app)
      .patch('/api/beneficiaries/BEN-002/verify')
      .set('X-Demo-Role', 'district_officer')
      .send({
        status: 'Verified',
        // Omitting reason/reviewerNotes
      });

    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('mandatory justification'));
  });

  // 4. Offline Synchronization & Idempotency
  it('POST /api/sync handles offline queue idempotently without duplicate records', async () => {
    const clientRecordId = 'OFFLINE-QUEUE-TEST-UUID-999';
    const queuePayload = {
      items: [
        {
          id: clientRecordId,
          type: 'inspection_draft',
          payload: {
            id: 'INSP-SYNC-TEST-01',
            inspectionCode: 'GS-INSP-2026-9999',
            beneficiaryId: 'BEN-001',
            stage: 'Plinth Level',
            status: 'In Progress',
            observations: 'Field inspection recorded in offline tablet workspace',
          },
        },
      ],
    };

    // First sync submission
    const res1 = await request(app)
      .post('/api/sync')
      .set('X-Demo-Role', 'field_inspector')
      .send(queuePayload);

    assert.equal(res1.status, 200);
    assert.equal(res1.body.data.syncedCount, 1);

    // Second repeated retry submission with identical clientRecordId (Idempotent retry)
    const res2 = await request(app)
      .post('/api/sync')
      .set('X-Demo-Role', 'field_inspector')
      .send(queuePayload);

    assert.equal(res2.status, 200);
    assert.equal(res2.body.data.results[0].idempotentRetry, true);

    // Verify only ONE inspection exists on server
    const allInspections = database.store.inspections.filter(
      (i) => i.client_record_id === clientRecordId || i.id === 'INSP-SYNC-TEST-01'
    );
    assert.equal(allInspections.length, 1);
  });

  it('POST /api/sync detects conflicts and prevents silently overwriting finalized reviewer decisions', async () => {
    // INSP-101 is already 'Passed' by the reviewer
    const queuePayload = {
      items: [
        {
          id: 'CLIENT-CONFLICT-TEST',
          type: 'inspection_draft',
          payload: {
            id: 'INSP-101',
            status: 'Scheduled', // Stale edit trying to reset a Passed inspection
            observations: 'Stale offline edit',
          },
        },
      ],
    };

    const res = await request(app)
      .post('/api/sync')
      .set('X-Demo-Role', 'field_inspector')
      .send(queuePayload);

    assert.equal(res.status, 200);
    assert.equal(res.body.data.conflictCount, 1);
    assert.equal(res.body.data.results[0].status, 'conflict');
    assert.ok(res.body.data.results[0].conflictDetails.includes('already finalized'));

    // Confirm server state remains Passed
    const serverInsp = database.store.inspections.find((i) => i.id === 'INSP-101');
    assert.equal(serverInsp.status, 'Passed');
  });

  // 5. DBT Installment Approval Workflow
  it('PATCH /api/installments/:id/approve verifies prerequisites, sets simulated PFMS ref, and updates DBT metrics', async () => {
    const res = await request(app)
      .patch('/api/installments/INST-002/approve')
      .set('X-Demo-Role', 'district_officer')
      .send({ notes: 'All statutory milestones verified on ground' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'Approved');
    assert.ok(res.body.data.disbursementRef.includes('PFMS-SIM'));

    // Confirm decision record added to approvals decision history
    const approvalsRes = await request(app)
      .get('/api/approvals')
      .set('X-Demo-Role', 'district_officer');

    const approvals = approvalsRes.body.data.approvals || approvalsRes.body.data.items;
    assert.ok(approvals.some((a) => a.entity_id === 'INST-002' && a.action === 'APPROVE'));
  });

  // 6. Public Grievance Submission & Privacy Masking
  it('POST /api/grievances creates grievance and returns unique tracking code without leaking complainant data', async () => {
    const res = await request(app)
      .post('/api/grievances')
      .send({
        citizenName: 'Babulal Bind',
        phone: '9876543210',
        village: 'Rohaniya',
        district: 'Varanasi',
        category: 'Delayed Installment',
        description: 'Foundation casting finished over 4 weeks ago. Kindly expedite verification.',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.match(res.body.data.trackingId, /^GRV-2026-UP-[A-Z0-9]{4}$/);

    const trackingId = res.body.data.trackingId;

    // Public tracking query must NOT expose raw unmasked name or phone
    const trackRes = await request(app).get(`/api/grievances/${trackingId}`);
    assert.equal(trackRes.status, 200);
    assert.equal(trackRes.body.data.trackingId, trackingId);
    assert.equal(trackRes.body.data.phoneMasked, undefined); // private field stripped
    assert.ok(trackRes.body.data.maskedCitizen);
    assert.ok(trackRes.body.data.maskedCitizen.includes('****'));
  });

  // 7. Bilingual AI Assistant
  it('POST /api/assistant/chat responds in English and Hindi to scheme questions', async () => {
    // English query
    const enRes = await request(app)
      .post('/api/assistant/chat')
      .send({ query: 'How many high-risk cases are awaiting review?', language: 'en' });

    assert.equal(enRes.status, 200);
    assert.ok(enRes.body.data.text.includes('Risk'));

    // Hindi query
    const hiRes = await request(app)
      .post('/api/assistant/chat')
      .send({ query: 'कितनी किश्तें अनुमोदन हेतु लंबित हैं?', language: 'hi' });

    assert.equal(hiRes.status, 200);
    assert.ok(hiRes.body.data.text);
  });

  // 8. Dashboard Aggregate Reporting
  it('GET /api/reports/dashboard calculates dynamic live metrics', async () => {
    const res = await request(app).get('/api/reports/dashboard?district=All');
    assert.equal(res.status, 200);
    assert.ok(res.body.data.finances.totalBudget > 0);
    assert.ok(res.body.data.beneficiaries.total >= 4);
    assert.ok(res.body.data.housingProjects.total >= 4);
    assert.ok(res.body.data.inspections.total >= 3);
  });
});
