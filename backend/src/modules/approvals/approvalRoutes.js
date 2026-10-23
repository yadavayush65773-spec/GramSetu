import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate } from '../../middleware/authenticate.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError } from '../../utils/errors.js';
import { paginate } from '../../utils/pagination.js';

const router = Router();

// GET /api/approvals
router.get('/', authenticate, (req, res) => {
  const { entityType, page, limit } = req.query;
  let items = database.store.approvals;

  if (entityType) {
    items = items.filter((a) => a.entity_type.toLowerCase() === entityType.toLowerCase());
  }

  if (page || limit) {
    const paginated = paginate(items, page, limit);
    return successResponse(res, paginated);
  }

  return successResponse(res, { approvals: items, total: items.length });
});

// GET /api/approvals/:id
router.get('/:id', authenticate, (req, res) => {
  const item = database.store.approvals.find((a) => a.id === req.params.id);
  if (!item) {
    throw new NotFoundError(`Approval record '${req.params.id}' not found`);
  }
  return successResponse(res, item);
});

export default router;
