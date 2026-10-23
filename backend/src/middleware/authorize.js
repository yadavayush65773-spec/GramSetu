import { ForbiddenError } from '../utils/errors.js';

/**
 * Enforce minimum allowed roles
 * @param  {...string} allowedRoles 
 */
export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError('User identity not authenticated'));
    }

    const userRole = req.user.role;
    // Normalize aliases: block_officer <-> bdo, public_citizen <-> citizen
    const normalizedRole = userRole === 'block_officer' ? 'bdo' : userRole === 'public_citizen' ? 'citizen' : userRole;
    const normalizedAllowed = allowedRoles.map(r => r === 'block_officer' ? 'bdo' : r === 'public_citizen' ? 'citizen' : r);

    if (!normalizedAllowed.includes(normalizedRole)) {
      return next(new ForbiddenError(`Role '${userRole}' is not authorized for this operation. Allowed: [${allowedRoles.join(', ')}]`));
    }

    next();
  };
}

/**
 * Block auditors from performing state mutations (Auditor Read-Only Enforcement)
 */
export function blockAuditorMutations(req, res, next) {
  if (req.user && req.user.role === 'auditor') {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return next(new ForbiddenError('Auditors have read-only access to records and cannot mutate data'));
    }
  }
  next();
}

/**
 * Enforce separation of duties: Field Inspectors cannot approve inspections or installments
 */
export function enforceSeparationOfDuties(req, res, next) {
  if (req.user && req.user.role === 'field_inspector') {
    return next(new ForbiddenError('Separation of duties violation: Field Inspectors cannot approve inspections or installments'));
  }
  next();
}

/**
 * Enforce jurisdiction check: If user is district_officer or bdo, verify record belongs to user jurisdiction
 */
export function enforceJurisdiction(getRecordLocation) {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return next();

      // State Admin and Auditor have statewide oversight
      if (user.role === 'state_admin' || user.role === 'auditor') {
        return next();
      }

      if (typeof getRecordLocation === 'function') {
        const location = await getRecordLocation(req);
        if (location) {
          if (user.district_id && location.districtId && location.districtId !== user.district_id && location.districtId !== 'All') {
            return next(new ForbiddenError(`Jurisdiction mismatch: user restricted to district ${user.district_id}`));
          }
          if (user.block_id && location.blockId && location.blockId !== user.block_id && location.blockId !== 'All') {
            return next(new ForbiddenError(`Jurisdiction mismatch: user restricted to block ${user.block_id}`));
          }
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}
