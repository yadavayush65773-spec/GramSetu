import { database } from '../../config/database.js';

export function appendAuditLogToStore(auditRecord) {
  database.store.auditLogs.unshift(auditRecord);
}

export function getAuditLogsFromStore({ limit = 50, entityType, actorId } = {}) {
  let logs = [...database.store.auditLogs];

  if (entityType) {
    logs = logs.filter((l) => (l.entity_type || l.targetEntity) === entityType);
  }
  if (actorId) {
    logs = logs.filter((l) => l.actor_id === actorId);
  }

  return logs.slice(0, limit);
}
