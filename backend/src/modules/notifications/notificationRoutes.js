import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();

function serializeNotification(n) {
  return {
    id: n.id,
    title: n.title,
    titleHi: n.title_hi || n.titleHi || n.title,
    message: n.message,
    messageHi: n.message_hi || n.messageHi || n.message,
    type: n.type || 'alert',
    severity: n.severity || 'info',
    timestamp: n.created_at || n.timestamp || new Date().toISOString(),
    read: Boolean(n.read),
    targetPage: n.target_page || n.targetPage || 'overview',
    targetId: n.target_id || n.targetId || null,
  };
}

// GET /api/notifications
router.get('/', optionalAuthenticate, (req, res) => {
  const items = database.store.notifications;
  const serialized = items.map(serializeNotification);
  return successResponse(res, {
    notifications: serialized,
    items: serialized,
    total: serialized.length,
    unreadCount: serialized.filter((n) => !n.read).length,
  });
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', optionalAuthenticate, (req, res) => {
  const item = database.store.notifications.find((n) => n.id === req.params.id);
  if (!item) {
    throw new NotFoundError(`Notification '${req.params.id}' not found`);
  }

  item.read = true;
  return successResponse(res, serializeNotification(item));
});

export default router;
