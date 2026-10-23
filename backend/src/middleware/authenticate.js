import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';
import { getProfileByAuthOrId } from '../modules/users/userRepository.js';

// Synthetic demo users for safe demo role-switching
export const DEMO_USERS = {
  state_admin: {
    id: '00000000-0000-0000-0000-000000000001',
    auth_user_id: 'auth-state-admin-01',
    full_name: 'Dr. Anand Kumar IAS',
    email: 'admin.rural@gramsetu.nic.in',
    role: 'state_admin',
    district_id: null,
    block_id: null,
    panchayat_id: null,
    is_active: true,
  },
  district_officer: {
    id: '00000000-0000-0000-0000-000000000002',
    auth_user_id: 'auth-district-officer-01',
    full_name: 'Smt. Priyanka Rao IAS (District Magistrate / CDO)',
    email: 'dm.gorakhpur@gramsetu.nic.in',
    role: 'district_officer',
    district_id: 'DIST-GKP-01',
    block_id: null,
    panchayat_id: null,
    is_active: true,
  },
  bdo: {
    id: '00000000-0000-0000-0000-000000000003',
    auth_user_id: 'auth-bdo-01',
    full_name: 'Shri Vikramaditya Verma (BDO)',
    email: 'bdo.chargawan@gramsetu.nic.in',
    role: 'bdo',
    district_id: 'DIST-GKP-01',
    block_id: 'BLK-CRG-01',
    panchayat_id: null,
    is_active: true,
  },
  block_officer: {
    id: '00000000-0000-0000-0000-000000000003',
    auth_user_id: 'auth-bdo-01',
    full_name: 'Shri Vikramaditya Verma (BDO)',
    email: 'bdo.chargawan@gramsetu.nic.in',
    role: 'bdo',
    district_id: 'DIST-GKP-01',
    block_id: 'BLK-CRG-01',
    panchayat_id: null,
    is_active: true,
  },
  field_inspector: {
    id: '00000000-0000-0000-0000-000000000004',
    auth_user_id: 'auth-inspector-01',
    full_name: 'R. K. Singh (Junior Engineer / Field Inspector)',
    email: 'inspector.singh@gramsetu.nic.in',
    role: 'field_inspector',
    district_id: 'DIST-GKP-01',
    block_id: 'BLK-CRG-01',
    panchayat_id: null,
    is_active: true,
  },
  auditor: {
    id: '00000000-0000-0000-0000-000000000005',
    auth_user_id: 'auth-auditor-01',
    full_name: 'M. S. Swaminathan (CAG State Auditor)',
    email: 'auditor.cag@gramsetu.nic.in',
    role: 'auditor',
    district_id: null,
    block_id: null,
    panchayat_id: null,
    is_active: true,
  },
  citizen: {
    id: '00000000-0000-0000-0000-000000000006',
    auth_user_id: 'auth-citizen-01',
    full_name: 'Rameshwar Lal Patel (Gramin Resident)',
    email: 'citizen.rameshwar@gramsetu.nic.in',
    role: 'citizen',
    district_id: 'DIST-GKP-01',
    block_id: 'BLK-CRG-01',
    panchayat_id: 'GP-JGL-01',
    is_active: true,
  },
  public_citizen: {
    id: '00000000-0000-0000-0000-000000000006',
    auth_user_id: 'auth-citizen-01',
    full_name: 'Rameshwar Lal Patel (Gramin Resident)',
    email: 'citizen.rameshwar@gramsetu.nic.in',
    role: 'citizen',
    district_id: 'DIST-GKP-01',
    block_id: 'BLK-CRG-01',
    panchayat_id: 'GP-JGL-01',
    is_active: true,
  },
};

export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const demoRoleHeader = req.headers['x-demo-role'];

    // 1. Check for standard Bearer Token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (!token || token === 'null' || token === 'undefined') {
        throw new UnauthorizedError('Missing or malformed authorization token');
      }

      try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        const profile = await getProfileByAuthOrId(decoded.sub || decoded.id);

        if (!profile) {
          throw new UnauthorizedError('User account associated with token not found');
        }
        if (!profile.is_active) {
          throw new ForbiddenError('Account is disabled or inactive');
        }

        req.user = profile;
        return next();
      } catch (jwtErr) {
        if (jwtErr instanceof ForbiddenError) throw jwtErr;
        throw new UnauthorizedError('Invalid or expired authentication token');
      }
    }

    // 2. Controlled Demo Mode Role Header
    if (demoRoleHeader && (env.DEMO_MODE || env.NODE_ENV !== 'production')) {
      const roleKey = String(demoRoleHeader).toLowerCase().trim();
      const syntheticUser = DEMO_USERS[roleKey];
      if (syntheticUser) {
        req.user = syntheticUser;
        return next();
      }
    }

    // Unauthenticated
    throw new UnauthorizedError('Authentication token or demo authorization required');
  } catch (err) {
    next(err);
  }
}

// Optional authentication middleware (for public endpoints with optional user context)
export async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const demoRoleHeader = req.headers['x-demo-role'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token && token !== 'null') {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET);
          const profile = await getProfileByAuthOrId(decoded.sub || decoded.id);
          if (profile && profile.is_active) {
            req.user = profile;
          }
        } catch (_) {
          // ignore error for optional auth
        }
      }
    } else if (demoRoleHeader && (env.DEMO_MODE || env.NODE_ENV !== 'production')) {
      const roleKey = String(demoRoleHeader).toLowerCase().trim();
      if (DEMO_USERS[roleKey]) {
        req.user = DEMO_USERS[roleKey];
      }
    }
  } catch (_) {
    // continue without user
  }
  next();
}
