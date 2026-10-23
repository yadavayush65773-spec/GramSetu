import { Router } from 'express';
import compatibilityRoutes from './compatibility.js';
import authRoutes from '../modules/auth/authRoutes.js';
import locationRoutes from '../modules/locations/locationRoutes.js';
import schemeRoutes from '../modules/schemes/schemeRoutes.js';
import beneficiaryRoutes from '../modules/beneficiaries/beneficiaryRoutes.js';
import housingProjectRoutes from '../modules/housingProjects/housingProjectRoutes.js';
import inspectionRoutes from '../modules/inspections/inspectionRoutes.js';
import evidenceRoutes from '../modules/evidence/evidenceRoutes.js';
import installmentRoutes from '../modules/installments/installmentRoutes.js';
import approvalRoutes from '../modules/approvals/approvalRoutes.js';
import riskCaseRoutes from '../modules/riskCases/riskCaseRoutes.js';
import auditRoutes from '../modules/auditLogs/auditRoutes.js';
import notificationRoutes from '../modules/notifications/notificationRoutes.js';
import grievanceRoutes from '../modules/grievances/grievanceRoutes.js';
import reportRoutes from '../modules/reports/reportRoutes.js';
import syncRoutes from '../modules/sync/syncRoutes.js';
import assistantRoutes from '../modules/assistant/assistantRoutes.js';
import userRoutes from '../modules/users/userRoutes.js';

const apiRouter = Router();

// Compatibility & Diagnostics
apiRouter.use('/', compatibilityRoutes);

// Feature Modules
apiRouter.use('/auth', authRoutes);
apiRouter.use('/locations', locationRoutes);
apiRouter.use('/schemes', schemeRoutes);
apiRouter.use('/beneficiaries', beneficiaryRoutes);
apiRouter.use('/housing-projects', housingProjectRoutes);
apiRouter.use('/projects', housingProjectRoutes); // Compatibility alias
apiRouter.use('/inspections', inspectionRoutes);
apiRouter.use('/', evidenceRoutes);
apiRouter.use('/installments', installmentRoutes);
apiRouter.use('/approvals', approvalRoutes);
apiRouter.use('/risk-cases', riskCaseRoutes);
apiRouter.use('/fraud-cases', riskCaseRoutes); // Compatibility alias
apiRouter.use('/audit-logs', auditRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/grievances', grievanceRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/sync', syncRoutes);
apiRouter.use('/assistant', assistantRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
