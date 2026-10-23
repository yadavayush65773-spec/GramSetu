/**
 * Calculate deterministic, explainable risk score (0 - 100) and indicators
 */
export function calculateRiskScore({
  duplicateHashDetected = false,
  reusedHashInspectionIds = [],
  geoDiscrepancyKm = 0,
  geoDiscrepancyThresholdKm = 28,
  duplicateCandidatesCount = 0,
  hasMissingChecklistEvidence = false,
  isInspectionOverdue = false,
  repeatedSyncFailuresCount = 0,
  assetRosterDiscrepancy = false,
}) {
  let score = 0;
  const indicators = [];

  // 1. Photographic SHA-256 Hash Reuse (High Severity Signal)
  if (duplicateHashDetected) {
    const points = 45;
    score += points;
    indicators.push({
      code: 'DUPLICATE_EVIDENCE_HASH',
      factor: 'Cryptographic SHA-256 Evidence Hash Reuse',
      severity: 'Critical',
      points,
      description: 'An identical evidence-file photograph hash exists on another unrelated inspection record.',
      relatedEntityIds: reusedHashInspectionIds,
    });
  }

  // 2. Geographic Fence Discrepancy (> 28km)
  if (geoDiscrepancyKm > geoDiscrepancyThresholdKm) {
    const points = 35;
    score += points;
    indicators.push({
      code: 'GEO_DISCREPANCY_EXCEEDED',
      factor: 'GPS Coordinate Discrepancy Exceeded',
      severity: 'High',
      points,
      description: `Reported field inspection coordinates are ${geoDiscrepancyKm} km away from registered project site (threshold: ${geoDiscrepancyThresholdKm} km).`,
      details: { geoDiscrepancyKm, geoDiscrepancyThresholdKm },
    });
  }

  // 3. Potential Duplicate Beneficiary Candidate
  if (duplicateCandidatesCount > 0) {
    const points = Math.min(30, duplicateCandidatesCount * 15);
    score += points;
    indicators.push({
      code: 'POTENTIAL_DUPLICATE_BENEFICIARY',
      factor: 'Potential Duplicate Enrollment Match',
      severity: duplicateCandidatesCount > 1 ? 'High' : 'Medium',
      points,
      description: `Identified ${duplicateCandidatesCount} potential duplicate applicant candidate(s) sharing household or phonetic identity records.`,
      details: { count: duplicateCandidatesCount },
    });
  }

  // 4. Missing Mandatory Evidence in Inspection Checklist
  if (hasMissingChecklistEvidence) {
    const points = 20;
    score += points;
    indicators.push({
      code: 'MISSING_MANDATORY_EVIDENCE',
      factor: 'Incomplete Statutory Verification Checklist',
      severity: 'Medium',
      points,
      description: 'Mandatory technical milestone criteria are missing requisite supporting physical verification.',
    });
  }

  // 5. Overdue Physical Inspection
  if (isInspectionOverdue) {
    const points = 15;
    score += points;
    indicators.push({
      code: 'OVERDUE_INSPECTION_STAGE',
      factor: 'Milestone Inspection Timeline Overdue',
      severity: 'Low',
      points,
      description: 'Scheduled physical construction milestone inspection has exceeded SLA timeframe without field update.',
    });
  }

  // 6. Asset Roster Discrepancy
  if (assetRosterDiscrepancy) {
    const points = 25;
    score += points;
    indicators.push({
      code: 'ASSET_ROSTER_MISMATCH',
      factor: 'Panchayat Asset Roster Inconsistency',
      severity: 'High',
      points,
      description: 'Claimed prior kutcha dwelling or land ownership discrepancies detected in panchayat baseline census.',
    });
  }

  // 7. Repeated Sync Failures
  if (repeatedSyncFailuresCount >= 3) {
    const points = 15;
    score += points;
    indicators.push({
      code: 'REPEATED_SYNC_ANOMALY',
      factor: 'Multiple Offline Synchronization Failures',
      severity: 'Medium',
      points,
      description: `Record failed offline reconciliation ${repeatedSyncFailuresCount} consecutive times.`,
    });
  }

  // Bound score between 0 and 100
  const totalScore = Math.min(100, Math.max(0, score));

  // Determine severity tier
  let severity = 'Low';
  let riskLevel = 'low';
  let recommendedAction = 'No action required; standard processing.';

  if (totalScore >= 75) {
    severity = 'Critical';
    riskLevel = 'critical';
    recommendedAction = 'Immediate physical audit and joint verification by District Officer / BDO mandated before DBT disbursement.';
  } else if (totalScore >= 50) {
    severity = 'High';
    riskLevel = 'high';
    recommendedAction = 'Mandatory secondary review by Senior Technical Inspector required.';
  } else if (totalScore >= 25) {
    severity = 'Medium';
    riskLevel = 'medium';
    recommendedAction = 'Routine verification recommended; review uploaded checklist evidence.';
  }

  return {
    riskScore: totalScore,
    riskLevel,
    severity,
    indicators,
    recommendedAction,
    calculatedAt: new Date().toISOString(),
  };
}
