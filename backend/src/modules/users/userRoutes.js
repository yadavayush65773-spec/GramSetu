import { Router } from 'express';
import { database } from '../../config/database.js';
import { authenticate } from '../../middleware/authenticate.js';
import { successResponse } from '../../utils/apiResponse.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();

// GET /api/users
router.get('/', authenticate, (req, res) => {
  const users = database.store.profiles.map((p) => ({
    id: p.id,
    fullName: p.full_name,
    email: p.email,
    role: p.role,
    districtId: p.district_id,
    blockId: p.block_id,
    isActive: p.is_active,
  }));
  return successResponse(res, { users, total: users.length });
});

// GET /api/users/:id
router.get('/:id', authenticate, (req, res) => {
  const user = database.store.profiles.find((p) => p.id === req.params.id);
  if (!user) {
    throw new NotFoundError(`User '${req.params.id}' not found`);
  }
  return successResponse(res, {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    districtId: user.district_id,
    blockId: user.block_id,
    isActive: user.is_active,
  });
});

export default router;
