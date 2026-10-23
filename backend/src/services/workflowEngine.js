import { ValidationError, ForbiddenError } from '../utils/errors.js';

// Construction Stage Progression
export const HOUSING_STAGES = ['foundation', 'plinth', 'lintel', 'completion'];

// Inspection Statuses
export const INSPECTION_STATUSES = [
  'Scheduled',
  'In Progress',
  'Passed',
  'Needs Improvement',
  'Failed',
  'Overdue',
];

// Beneficiary Verification Statuses
export const VERIFICATION_STATUSES = [
  'Pending',
  'Under Review',
  'Verified',
  'Flagged',
  'Rejected',
  'Correction Requested',
];

// Installment Statuses
export const INSTALLMENT_STATUSES = [
  'Awaiting Inspection',
  'Pending Approval',
  'Approved',
  'Disbursed',
  'Rejected',
  'On Hold',
];

/**
 * Validate housing construction stage progression
 */
export function validateStageTransition(currentStage, nextStage) {
  const currentIndex = HOUSING_STAGES.indexOf(String(currentStage || '').toLowerCase());
  const nextIndex = HOUSING_STAGES.indexOf(String(nextStage || '').toLowerCase());

  if (currentIndex === -1 || nextIndex === -1) {
    throw new ValidationError(`Invalid construction stage: ${nextStage}. Must be one of: [${HOUSING_STAGES.join(', ')}]`);
  }

  // Prevent skipping prerequisite stages
  if (nextIndex > currentIndex + 1) {
    throw new ValidationError(
      `Cannot advance stage from '${currentStage}' directly to '${nextStage}'. Prerequisite stage '${HOUSING_STAGES[currentIndex + 1]}' must be verified first.`
    );
  }

  return true;
}

/**
 * Validate inspection workflow status transition
 */
export function validateInspectionTransition(currentStatus, targetAction) {
  const validTransitions = {
    Scheduled: ['submit', 'start', 'fail'],
    'In Progress': ['submit', 'fail', 'request-correction'],
    'Needs Improvement': ['submit', 'fail'],
    Overdue: ['submit', 'start', 'fail'],
  };

  const reviewActions = ['approve', 'reject', 'request-correction'];

  if (reviewActions.includes(targetAction)) {
    return true;
  }

  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(targetAction)) {
    throw new ValidationError(
      `Invalid inspection transition '${targetAction}' from current status '${currentStatus}'.`
    );
  }

  return true;
}

/**
 * Validate prerequisite checks for installment approval
 */
export function validateInstallmentPrerequisites(installment) {
  if (!installment) {
    throw new ValidationError('Installment record not found');
  }

  if (installment.status === 'Approved' || installment.status === 'Disbursed') {
    throw new ValidationError(`Installment #${installment.installment_number || installment.installmentNumber} is already ${installment.status}`);
  }

  const checks = installment.prerequisite_checks || installment.prerequisitesMet || {};

  // Milestone verified check
  if (checks.physicalMilestoneVerified === false) {
    throw new ValidationError('Cannot approve installment: Physical milestone inspection has not been verified');
  }

  // Photographic evidence SHA-256 check
  if (checks.photoEvidenceShaVerified === false) {
    throw new ValidationError('Cannot approve installment: Photographic evidence SHA-256 cryptographic check failed');
  }

  return true;
}
