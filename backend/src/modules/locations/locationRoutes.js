import { Router } from 'express';
import { database } from '../../config/database.js';
import { successResponse } from '../../utils/apiResponse.js';

const router = Router();

router.get('/', (req, res) => {
  const { type, parentId } = req.query;
  let locations = database.store.locations;

  if (type) {
    locations = locations.filter((l) => l.type === type);
  }
  if (parentId) {
    locations = locations.filter((l) => l.parent_id === parentId);
  }

  // Also include the combined flattened hierarchy for maps and selectors
  const hierarchy = locations.map((l) => ({
    id: l.id,
    type: l.type,
    name: l.name,
    nameHi: l.name_hi,
    code: l.code,
    parentId: l.parent_id,
    lat: l.latitude,
    lng: l.longitude,
  }));

  return successResponse(res, {
    locations: hierarchy,
    total: hierarchy.length,
  });
});

export default router;
