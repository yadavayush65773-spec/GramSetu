import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateRiskScore } from '../../src/services/riskScoring.js';

describe('Deterministic Explainable Risk Scoring Engine', () => {
  it('returns score 0 and low severity when no anomalous indicators exist', () => {
    const result = calculateRiskScore({});
    assert.equal(result.riskScore, 0);
    assert.equal(result.riskLevel, 'low');
    assert.equal(result.severity, 'Low');
    assert.equal(result.indicators.length, 0);
  });

  it('correctly weighs duplicate SHA-256 hash detection as Critical severity', () => {
    const result = calculateRiskScore({
      duplicateHashDetected: true,
      reusedHashInspectionIds: ['INSP-PRIOR-01'],
    });

    assert.equal(result.riskScore, 45);
    assert.equal(result.severity, 'Medium');
    assert.ok(result.indicators.some((i) => i.code === 'DUPLICATE_EVIDENCE_HASH'));
    assert.equal(result.indicators[0].severity, 'Critical');
  });

  it('escalates to Critical tier (>= 75) when multiple compound indicators trigger', () => {
    const result = calculateRiskScore({
      duplicateHashDetected: true,
      geoDiscrepancyKm: 32,
      geoDiscrepancyThresholdKm: 28,
      duplicateCandidatesCount: 1,
    });

    // 45 + 35 + 15 = 95
    assert.equal(result.riskScore, 95);
    assert.equal(result.severity, 'Critical');
    assert.equal(result.riskLevel, 'critical');
    assert.ok(result.indicators.length >= 3);
    assert.ok(result.recommendedAction.includes('Immediate physical audit'));
  });

  it('bounds maximum risk score strictly at 100', () => {
    const result = calculateRiskScore({
      duplicateHashDetected: true,
      geoDiscrepancyKm: 50,
      duplicateCandidatesCount: 5,
      hasMissingChecklistEvidence: true,
      isInspectionOverdue: true,
      assetRosterDiscrepancy: true,
      repeatedSyncFailuresCount: 5,
    });

    assert.equal(result.riskScore, 100);
  });
});
