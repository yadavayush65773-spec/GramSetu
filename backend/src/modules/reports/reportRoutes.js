import { Router } from 'express';
import { database } from '../../config/database.js';
import { optionalAuthenticate } from '../../middleware/authenticate.js';
import { successResponse } from '../../utils/apiResponse.js';

const router = Router();

// GET /api/reports/dashboard
router.get('/dashboard', optionalAuthenticate, (req, res) => {
  const { district, block } = req.query;

  // Filter entities according to jurisdiction and query params
  let beneficiaries = database.store.beneficiaries;
  let projects = database.store.housingProjects;
  let inspections = database.store.inspections;
  let installments = database.store.installments;
  let riskCases = database.store.riskCases;
  let schemes = database.store.schemes;

  // Enforce jurisdiction if district_officer or bdo
  const effectiveDistrict = req.user?.district_id || district;
  const effectiveBlock = req.user?.block_id || block;

  if (effectiveDistrict && effectiveDistrict !== 'All') {
    beneficiaries = beneficiaries.filter((b) => (b.district_id || b.district) === effectiveDistrict);
    projects = projects.filter((p) => (p.district_id || p.district) === effectiveDistrict);
    inspections = inspections.filter((i) => (i.district_id || i.district) === effectiveDistrict);
    installments = installments.filter((inst) => {
      const b = beneficiaries.find((ben) => ben.id === (inst.beneficiary_id || inst.beneficiaryId));
      return (inst.district === effectiveDistrict) || Boolean(b);
    });
  }

  if (effectiveBlock && effectiveBlock !== 'All') {
    beneficiaries = beneficiaries.filter((b) => (b.block_id || b.block) === effectiveBlock);
    projects = projects.filter((p) => (p.block_id || p.block) === effectiveBlock);
    inspections = inspections.filter((i) => (i.block_id || i.block) === effectiveBlock);
  }

  // Calculate live dynamic metrics from application data
  const totalSchemes = schemes.length;
  const totalBudget = schemes.reduce((acc, s) => acc + Number(s.allocated_amount || s.allocatedBudget || 0), 0);
  const utilizedBudget = schemes.reduce((acc, s) => acc + Number(s.utilized_amount || s.utilizedBudget || 0), 0);

  const totalBeneficiaries = beneficiaries.length;
  const verifiedBeneficiaries = beneficiaries.filter(
    (b) => (b.verification_status || b.verificationStatus) === 'Verified'
  ).length;
  const pendingBeneficiaries = beneficiaries.filter(
    (b) => (b.verification_status || b.verificationStatus) === 'Pending' || (b.verification_status || b.verificationStatus) === 'Under Review'
  ).length;
  const flaggedBeneficiaries = beneficiaries.filter(
    (b) => (b.verification_status || b.verificationStatus) === 'Flagged'
  ).length;

  const totalProjects = projects.length;
  const completedProjects = projects.filter(
    (p) => (p.project_status || p.projectStatus) === 'Completed' || (p.current_stage || p.currentStage) === 'completion'
  ).length;
  const delayedProjects = projects.filter(
    (p) => (p.project_status || p.projectStatus) === 'Delayed'
  ).length;

  // Stage progress counts
  const stageCounts = {
    foundation: projects.filter((p) => (p.current_stage || p.currentStage).toLowerCase() === 'foundation').length,
    plinth: projects.filter((p) => (p.current_stage || p.currentStage).toLowerCase() === 'plinth').length,
    lintel: projects.filter((p) => (p.current_stage || p.currentStage).toLowerCase() === 'lintel').length,
    completion: projects.filter((p) => (p.current_stage || p.currentStage).toLowerCase() === 'completion').length,
  };

  const totalInspections = inspections.length;
  const passedInspections = inspections.filter((i) => (i.status || '').toLowerCase() === 'passed').length;
  const pendingInspections = inspections.filter(
    (i) => (i.status || '').toLowerCase() === 'scheduled' || (i.status || '').toLowerCase() === 'in progress'
  ).length;
  const failedInspections = inspections.filter((i) => (i.status || '').toLowerCase() === 'failed').length;
  const overdueInspections = inspections.filter((i) => (i.status || '').toLowerCase() === 'overdue').length;

  const totalInstallments = installments.length;
  const approvedInstallments = installments.filter((i) => (i.status || '').toLowerCase() === 'approved' || (i.status || '').toLowerCase() === 'disbursed').length;
  const pendingInstallments = installments.filter((i) => (i.status || '').toLowerCase() === 'pending approval').length;
  const pendingInstallmentAmount = installments
    .filter((i) => (i.status || '').toLowerCase() === 'pending approval')
    .reduce((acc, i) => acc + Number(i.amount || 0), 0);

  const openRiskCases = riskCases.filter(
    (r) => r.status === 'Under Review' || r.status === 'Escalated'
  ).length;
  const criticalRiskCases = riskCases.filter(
    (r) => r.severity === 'Critical' && (r.status === 'Under Review' || r.status === 'Escalated')
  ).length;

  const recentAudit = database.store.auditLogs.slice(0, 10);

  return successResponse(res, {
    scope: {
      district: effectiveDistrict || 'All',
      block: effectiveBlock || 'All',
    },
    finances: {
      totalBudget,
      utilizedBudget,
      utilizationPercentage: totalBudget > 0 ? Math.round((utilizedBudget / totalBudget) * 100) : 0,
      totalSchemes,
    },
    beneficiaries: {
      total: totalBeneficiaries,
      verified: verifiedBeneficiaries,
      pending: pendingBeneficiaries,
      flagged: flaggedBeneficiaries,
    },
    housingProjects: {
      total: totalProjects,
      completed: completedProjects,
      delayed: delayedProjects,
      inProgress: totalProjects - completedProjects,
      stageCounts,
    },
    inspections: {
      total: totalInspections,
      passed: passedInspections,
      pending: pendingInspections,
      failed: failedInspections,
      overdue: overdueInspections,
    },
    installments: {
      total: totalInstallments,
      approved: approvedInstallments,
      pending: pendingInstallments,
      pendingAmount: pendingInstallmentAmount,
    },
    riskIntelligence: {
      openCases: openRiskCases,
      criticalCases: criticalRiskCases,
    },
    recentAuditActivity: recentAudit,
  });
});

export default router;
