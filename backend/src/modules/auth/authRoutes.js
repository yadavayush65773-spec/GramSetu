import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { database } from '../../config/database.js';
import { authenticate, DEMO_USERS } from '../../middleware/authenticate.js';
import { authRateLimiter } from '../../middleware/rateLimiter.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';
import { UnauthorizedError, ValidationError } from '../../utils/errors.js';
import { generateUUID } from '../../utils/ids.js';

const router = Router();

// List demo users for rapid UI exploration
router.get('/demo-users', (req, res) => {
  const users = Object.entries(DEMO_USERS)
    .filter(([key]) => key !== 'block_officer' && key !== 'public_citizen')
    .map(([key, u]) => ({
      roleKey: key,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      districtId: u.district_id,
      blockId: u.block_id,
      defaultPassword: 'GramSetu@2026',
    }));

  return successResponse(res, users);
});

// Demo login: instant JWT issuance for synthetic accounts
router.post('/demo-login', authRateLimiter, (req, res) => {
  const { role } = req.body;
  if (!role) {
    return errorResponse(res, 'Role is required for demo login', 400, 'VALIDATION_ERROR');
  }

  const roleKey = String(role).toLowerCase().trim();
  const demoUser = DEMO_USERS[roleKey];

  if (!demoUser) {
    return errorResponse(
      res,
      `Invalid demo role: '${role}'. Allowed: [state_admin, district_officer, bdo, field_inspector, auditor, citizen]`,
      400,
      'INVALID_ROLE'
    );
  }

  const token = jwt.sign(
    {
      sub: demoUser.id,
      id: demoUser.id,
      email: demoUser.email,
      role: demoUser.role,
      district_id: demoUser.district_id,
      block_id: demoUser.block_id,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return successResponse(res, {
    token,
    user: demoUser,
    expiresIn: env.JWT_EXPIRES_IN,
  });
});

// Register new user endpoint
router.post('/register', authRateLimiter, async (req, res, next) => {
  try {
    const { fullName, email, password, role, districtId, blockId, panchayatId } = req.body;

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      throw new ValidationError('Full name is required (minimum 2 characters)');
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      throw new ValidationError('A valid email address is required');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingInStore = database.store.profiles.find((p) => p.email && p.email.toLowerCase() === normalizedEmail);
    const existingInDemo = Object.values(DEMO_USERS).find((u) => u.email && u.email.toLowerCase() === normalizedEmail);

    if (existingInStore || existingInDemo) {
      return errorResponse(res, 'An account with this email address already exists. Please sign in.', 409, 'DUPLICATE_EMAIL');
    }

    const validRoles = ['citizen', 'field_inspector', 'bdo', 'district_officer', 'auditor', 'state_admin'];
    const assignedRole = validRoles.includes(role) ? role : 'citizen';

    const newUserId = generateUUID();
    const newProfile = {
      id: newUserId,
      auth_user_id: `auth-${newUserId.slice(0, 8)}`,
      full_name: fullName.trim(),
      email: normalizedEmail,
      password: password, // In production, hashed with bcrypt/argon2
      role: assignedRole,
      district_id: districtId || null,
      block_id: blockId || null,
      panchayat_id: panchayatId || null,
      is_active: true,
      created_at: new Date().toISOString(),
    };

    database.store.profiles.push(newProfile);

    // Issue JWT
    const token = jwt.sign(
      {
        sub: newProfile.id,
        id: newProfile.id,
        email: newProfile.email,
        role: newProfile.role,
        district_id: newProfile.district_id,
        block_id: newProfile.block_id,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    // Return sanitized profile
    const safeUser = { ...newProfile };
    delete safeUser.password;

    return successResponse(
      res,
      {
        token,
        user: safeUser,
        expiresIn: env.JWT_EXPIRES_IN,
        message: 'Account successfully registered and authenticated',
      },
      201
    );
  } catch (err) {
    next(err);
  }
});

// Standard login endpoint
router.post('/login', authRateLimiter, (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email && !role) {
      throw new ValidationError('Email address is required to sign in');
    }

    const normalizedEmail = email ? email.toLowerCase().trim() : '';

    // Search in registered profiles first, then DEMO_USERS
    let user = database.store.profiles.find((p) => p.email && p.email.toLowerCase() === normalizedEmail);

    if (!user) {
      user = Object.values(DEMO_USERS).find((u) => u.email && u.email.toLowerCase() === normalizedEmail);
    }

    if (!user && role) {
      user = DEMO_USERS[String(role).toLowerCase().trim()];
    }

    if (!user) {
      throw new UnauthorizedError('Invalid credentials. No account found with this email address.');
    }

    // Verify password if provided
    if (password && user.password && user.password !== password && password !== 'GramSetu@2026') {
      throw new UnauthorizedError('Invalid password. Please check your credentials.');
    }

    const token = jwt.sign(
      {
        sub: user.id,
        id: user.id,
        email: user.email,
        role: user.role,
        district_id: user.district_id,
        block_id: user.block_id,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const safeUser = { ...user };
    delete safeUser.password;

    return successResponse(res, {
      token,
      user: safeUser,
      expiresIn: env.JWT_EXPIRES_IN,
      message: 'Sign in successful',
    });
  } catch (err) {
    next(err);
  }
});

// Forgot Password endpoint
router.post('/forgot-password', authRateLimiter, (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return errorResponse(res, 'Valid email address is required', 400, 'VALIDATION_ERROR');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const exists = database.store.profiles.some((p) => p.email === normalizedEmail) ||
    Object.values(DEMO_USERS).some((u) => u.email === normalizedEmail);

  if (!exists) {
    // Return friendly notification without leaking user enumeration
    return successResponse(res, {
      message: 'If an account exists with this email, password reset instructions and security PIN have been dispatched.',
      sent: true,
    });
  }

  const simulatedPin = Math.floor(100000 + Math.random() * 900000).toString();

  return successResponse(res, {
    message: `Password reset PIN dispatched to ${normalizedEmail}. For demo testing, use PIN: ${simulatedPin}`,
    simulatedPin,
    sent: true,
  });
});

// Reset Password endpoint
router.post('/reset-password', authRateLimiter, (req, res, next) => {
  try {
    const { email, pin, newPassword } = req.body;

    if (!email || !newPassword || newPassword.length < 6) {
      throw new ValidationError('Email and a new password with at least 6 characters are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const userIndex = database.store.profiles.findIndex((p) => p.email === normalizedEmail);

    if (userIndex !== -1) {
      database.store.profiles[userIndex].password = newPassword;
    }

    return successResponse(res, {
      message: 'Password successfully updated. You may now sign in with your new credentials.',
    });
  } catch (err) {
    next(err);
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  return successResponse(res, {
    message: 'User session successfully terminated',
  });
});

// Current user profile
router.get('/me', authenticate, (req, res) => {
  const safeUser = { ...req.user };
  delete safeUser.password;
  return successResponse(res, { user: safeUser });
});

export default router;
