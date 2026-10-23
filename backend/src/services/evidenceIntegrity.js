import crypto from 'crypto';
import { env } from '../config/env.js';

/**
 * Compute SHA-256 hex string from byte buffer
 */
export function computeSHA256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Haversine formula to calculate distance in kilometers between two GPS coordinates
 */
export function calculateGeoDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // rounded to 2 decimal places
}

/**
 * Evaluate evidence integrity:
 * 1. Verify client hash against server-computed hash
 * 2. Check for duplicate hash reuse across different projects
 * 3. Evaluate GPS distance against project reference coordinates
 */
export function evaluateEvidenceIntegrity({
  serverHash,
  clientHash,
  evidenceCoords,
  referenceCoords,
  existingEvidenceRecords = [],
  currentInspectionId,
  currentProjectId,
}) {
  const flags = [];
  let isHashVerified = true;

  // 1. Client hash mismatch detection
  if (clientHash && clientHash.toLowerCase() !== serverHash.toLowerCase()) {
    isHashVerified = false;
    flags.push({
      code: 'HASH_MISMATCH',
      severity: 'High',
      description: 'Client-reported SHA-256 hash does not match genuine server-computed byte digest.',
    });
  }

  // 2. Duplicate hash reuse across different inspections/projects
  const duplicateHashRecords = existingEvidenceRecords.filter(
    (e) =>
      e.sha256_hash &&
      e.sha256_hash.toLowerCase() === serverHash.toLowerCase() &&
      e.inspection_id !== currentInspectionId
  );

  let isReusedHash = false;
  if (duplicateHashRecords.length > 0) {
    isReusedHash = true;
    flags.push({
      code: 'DUPLICATE_EVIDENCE_HASH',
      severity: 'Critical',
      description: `Identical cryptographic image hash (${serverHash.slice(0, 12)}...) detected on ${duplicateHashRecords.length} other inspection record(s).`,
      relatedEntityIds: duplicateHashRecords.map((r) => r.inspection_id),
    });
  }

  // 3. Geographic discrepancy
  let geoDistanceKm = null;
  let isGeoDiscrepant = false;

  if (evidenceCoords?.lat && evidenceCoords?.lng && referenceCoords?.lat && referenceCoords?.lng) {
    geoDistanceKm = calculateGeoDistanceKm(
      evidenceCoords.lat,
      evidenceCoords.lng,
      referenceCoords.lat,
      referenceCoords.lng
    );

    if (geoDistanceKm !== null && geoDistanceKm > env.GEO_DISCREPANCY_THRESHOLD_KM) {
      isGeoDiscrepant = true;
      flags.push({
        code: 'GEO_DISCREPANCY_EXCEEDED',
        severity: 'High',
        description: `Captured inspection GPS location is ${geoDistanceKm} km away from registered project site (threshold: ${env.GEO_DISCREPANCY_THRESHOLD_KM} km).`,
        distanceKm: geoDistanceKm,
        thresholdKm: env.GEO_DISCREPANCY_THRESHOLD_KM,
      });
    }
  }

  return {
    serverHash,
    isHashVerified,
    isReusedHash,
    geoDistanceKm,
    isGeoDiscrepant,
    flags,
  };
}
