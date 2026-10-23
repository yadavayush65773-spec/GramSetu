import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { database } from '../../src/config/database.js';

const app = createApp();

describe('Authentication & Role-Based Access Control (RBAC)', () => {
  beforeEach(() => {
    database.resetDemoData();
  });

  it('rejects protected endpoints without token or demo role with HTTP 401', async () => {
    const res = await request(app).get('/api/auth/me');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  it('rejects invalid or malformed bearer token with HTTP 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token-string-12345');
    assert.equal(res.status, 401);
    assert.equal(res.body.success, false);
  });

  it('issues valid JWT via demo login endpoint', async () => {
    const res = await request(app)
      .post('/api/auth/demo-login')
      .send({ role: 'district_officer' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.role, 'district_officer');

    // Authenticate with the issued token
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${res.body.data.token}`);

    assert.equal(meRes.status, 200);
    assert.equal(meRes.body.data.user.role, 'district_officer');
  });

  it('enforces separation of duties: Field Inspector CANNOT approve inspections', async () => {
    // Attempt to approve inspection as field_inspector
    const res = await request(app)
      .post('/api/inspections/INSP-101/approve')
      .set('X-Demo-Role', 'field_inspector')
      .send({ notes: 'Self-approval attempt' });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('Separation of duties violation'));
  });

  it('enforces separation of duties: Field Inspector CANNOT approve installments', async () => {
    const res = await request(app)
      .patch('/api/installments/INST-002/approve')
      .set('X-Demo-Role', 'field_inspector')
      .send({ notes: 'Attempted installment approval' });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
  });

  it('enforces auditor read-only constraint: Auditor CANNOT mutate data', async () => {
    const res = await request(app)
      .post('/api/inspections')
      .set('X-Demo-Role', 'auditor')
      .send({
        beneficiaryId: 'BEN-001',
        stage: 'Foundation',
      });

    assert.equal(res.status, 403);
    assert.equal(res.body.success, false);
    assert.ok(res.body.error.message.includes('Auditors have read-only access'));
  });

  it('restricts scheme creation exclusively to State Administrator', async () => {
    // District officer cannot create a scheme
    const districtRes = await request(app)
      .post('/api/schemes')
      .set('X-Demo-Role', 'district_officer')
      .send({
        name: 'Unauthorized Scheme',
        code: 'UNAUTH-01',
        category: 'Housing',
      });
    assert.equal(districtRes.status, 403);

    // State Admin CAN create a scheme
    const adminRes = await request(app)
      .post('/api/schemes')
      .set('X-Demo-Role', 'state_admin')
      .send({
        name: 'Authorized Rural Sanitation Scheme',
        code: 'AUTH-SBM-2026',
        category: 'Water & Sanitation',
        allocatedBudget: 5000000,
      });
    assert.equal(adminRes.status, 201);
    assert.equal(adminRes.body.success, true);
  });

  it('registers a new user and issues JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Vikash Kumar Tiwari',
        email: 'vikash.tiwari@gramsetu.in',
        password: 'Password@123',
        role: 'field_inspector',
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.equal(res.body.data.user.email, 'vikash.tiwari@gramsetu.in');
    assert.equal(res.body.data.user.role, 'field_inspector');
  });

  it('rejects registration with duplicate email with HTTP 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Duplicate Applicant',
        email: 'admin.rural@gramsetu.nic.in', // Existing demo email
        password: 'Password@123',
      });

    assert.equal(res.status, 409);
    assert.equal(res.body.success, false);
    assert.equal(res.body.error.code, 'DUPLICATE_EMAIL');
  });

  it('authenticates registered user with valid password', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send({
        fullName: 'Sunita Devi',
        email: 'sunita.devi@gramsetu.in',
        password: 'SecurePassword@2026',
        role: 'citizen',
      });

    // Then login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'sunita.devi@gramsetu.in',
        password: 'SecurePassword@2026',
      });

    assert.equal(loginRes.status, 200);
    assert.equal(loginRes.body.success, true);
    assert.ok(loginRes.body.data.token);
    assert.equal(loginRes.body.data.user.email, 'sunita.devi@gramsetu.in');
  });

  it('handles forgot password request safely', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: 'dm.gorakhpur@gramsetu.nic.in' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.sent);
  });
});
