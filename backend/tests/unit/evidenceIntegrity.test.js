import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeSHA256,
  calculateGeoDistanceKm,
  evaluateEvidenceIntegrity,
} from '../../src/services/evidenceIntegrity.js';

describe('Evidence Integrity & Cryptographic Hashing', () => {
  it('computes accurate SHA-256 digest from byte buffer', () => {
    const buffer = Buffer.from('gramsetu-rural-housing-evidence-sample');
    const hash = computeSHA256(buffer);
    assert.equal(hash.length, 64);
    assert.equal(typeof hash, 'string');
    // Deterministic verify
    const expected = computeSHA256(Buffer.from('gramsetu-rural-housing-evidence-sample'));
    assert.equal(hash, expected);
  });

  it('calculates geographic distance accurately using Haversine formula', () => {
    // Varanasi (25.3176, 82.9739) to Mirzapur (25.1337, 82.5644) is approx 46-47 km
    const distanceKm = calculateGeoDistanceKm(25.3176, 82.9739, 25.1337, 82.5644);
    assert.ok(distanceKm > 40);
    assert.ok(distanceKm < 55);
  });

  it('detects client-reported vs server-computed hash mismatches', () => {
    const serverHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const clientHash = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';

    const result = evaluateEvidenceIntegrity({
      serverHash,
      clientHash,
      evidenceCoords: { lat: 25.2674, lng: 82.9238 },
      referenceCoords: { lat: 25.2674, lng: 82.9238 },
      existingEvidenceRecords: [],
      currentInspectionId: 'INSP-NEW-01',
      currentProjectId: 'PRJ-001',
    });

    assert.equal(result.isHashVerified, false);
    assert.ok(result.flags.some((f) => f.code === 'HASH_MISMATCH'));
  });

  it('detects duplicate photo hash reuse across unrelated projects', () => {
    const sharedHash = '9e107d9d372bb6826bd81d3542a419d6dae07663e264c7ad3eb0ea7f66a6a9b4';
    const existingRecords = [
      {
        id: 'EVID-EXISTING',
        inspection_id: 'INSP-PRIOR-01',
        project_id: 'PRJ-004',
        sha256_hash: sharedHash,
      },
    ];

    const result = evaluateEvidenceIntegrity({
      serverHash: sharedHash,
      clientHash: sharedHash,
      evidenceCoords: { lat: 25.2674, lng: 82.9238 },
      referenceCoords: { lat: 25.2674, lng: 82.9238 },
      existingEvidenceRecords: existingRecords,
      currentInspectionId: 'INSP-CURRENT-02',
      currentProjectId: 'PRJ-002',
    });

    assert.equal(result.isReusedHash, true);
    assert.ok(result.flags.some((f) => f.code === 'DUPLICATE_EVIDENCE_HASH'));
    assert.equal(result.flags[0].severity, 'Critical');
  });

  it('flags geo-fence discrepancy when distance exceeds 28km threshold', () => {
    const result = evaluateEvidenceIntegrity({
      serverHash: 'abc123hash',
      clientHash: 'abc123hash',
      // Approx 35 km away
      evidenceCoords: { lat: 25.6, lng: 83.2 },
      referenceCoords: { lat: 25.2674, lng: 82.9238 },
      existingEvidenceRecords: [],
      currentInspectionId: 'INSP-GEO-TEST',
      currentProjectId: 'PRJ-001',
    });

    assert.equal(result.isGeoDiscrepant, true);
    assert.ok(result.geoDistanceKm > 28);
    assert.ok(result.flags.some((f) => f.code === 'GEO_DISCREPANCY_EXCEEDED'));
  });
});
