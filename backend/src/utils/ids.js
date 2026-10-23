import crypto from 'crypto';

export function generateUUID() {
  return crypto.randomUUID();
}

export function generateCode(prefix = 'GS', entity = 'REC', year = 2026) {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${entity}-${year}-${randomDigits}`;
}

export function generateGrievanceTrackingCode(state = 'UP', year = 2026) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GRV-${year}-${state}-${suffix}`;
}

export function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}
