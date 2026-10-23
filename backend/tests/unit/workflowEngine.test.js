import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateStageTransition,
  validateInstallmentPrerequisites,
} from '../../src/services/workflowEngine.js';
import { ValidationError } from '../../src/utils/errors.js';

describe('Workflow Engine & Statutory Transition Enforcement', () => {
  it('allows valid sequential construction stage advancement', () => {
    assert.doesNotThrow(() => validateStageTransition('foundation', 'plinth'));
    assert.doesNotThrow(() => validateStageTransition('plinth', 'lintel'));
    assert.doesNotThrow(() => validateStageTransition('lintel', 'completion'));
  });

  it('rejects skipping mandatory intermediate construction stages', () => {
    // Foundation directly to Lintel (skipping Plinth) must be blocked
    assert.throws(() => validateStageTransition('foundation', 'lintel'), ValidationError);
    // Foundation directly to Completion must be blocked
    assert.throws(() => validateStageTransition('foundation', 'completion'), ValidationError);
  });

  it('rejects unknown or invalid construction stages', () => {
    assert.throws(() => validateStageTransition('foundation', 'interior_painting'), ValidationError);
  });

  it('blocks DBT installment approval when prerequisite milestone is unverified', () => {
    const unverifiedInstallment = {
      id: 'INST-TEST-01',
      installmentNumber: 2,
      status: 'Pending Approval',
      prerequisitesMet: {
        physicalMilestoneVerified: false,
        photoEvidenceShaVerified: true,
      },
    };

    assert.throws(() => validateInstallmentPrerequisites(unverifiedInstallment), ValidationError);
  });

  it('blocks DBT installment approval when photo SHA-256 integrity check fails', () => {
    const unverifiedShaInstallment = {
      id: 'INST-TEST-02',
      installmentNumber: 2,
      status: 'Pending Approval',
      prerequisitesMet: {
        physicalMilestoneVerified: true,
        photoEvidenceShaVerified: false,
      },
    };

    assert.throws(() => validateInstallmentPrerequisites(unverifiedShaInstallment), ValidationError);
  });

  it('allows DBT installment approval when all statutory prerequisites are met', () => {
    const validInstallment = {
      id: 'INST-TEST-03',
      installmentNumber: 1,
      status: 'Pending Approval',
      prerequisitesMet: {
        physicalMilestoneVerified: true,
        photoEvidenceShaVerified: true,
        blockOfficerEndorsement: true,
        budgetAllocationAvailable: true,
      },
    };

    assert.equal(validateInstallmentPrerequisites(validInstallment), true);
  });
});
