import { Router } from 'express';
import { database } from '../config/database.js';
import { authenticate } from '../middleware/authenticate.js';
import { authorize } from '../middleware/authorize.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  return successResponse(res, {
    status: 'UP',
    name: 'GramSetu Backend API (ग्रामसेतु)',
    version: '1.0.0',
    mode: database.mode,
    demoMode: env.DEMO_MODE,
    isSupabaseConfigured: env.isSupabaseConfigured,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Demo Reset (Secured to State Admin or when ENABLE_DEMO_RESET is true)
router.post('/reset-demo', authenticate, (req, res) => {
  if (!env.ENABLE_DEMO_RESET) {
    return errorResponse(res, 'Demo reset is disabled in production environment', 403, 'RESET_DISABLED');
  }

  if (req.user.role !== 'state_admin' && !env.DEMO_MODE) {
    return errorResponse(res, 'Demo reset is only permissible for State Administrator', 403, 'FORBIDDEN');
  }

  const result = database.resetDemoData();
  return successResponse(res, {
    message: 'Demo dataset successfully restored to initial deterministic baseline',
    ...result,
  });
});

export default router;
