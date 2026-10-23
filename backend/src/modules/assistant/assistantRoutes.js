import { Router } from 'express';
import { database } from '../../config/database.js';
import { optionalAuthenticate } from '../../middleware/authenticate.js';
import { assistantRateLimiter } from '../../middleware/rateLimiter.js';
import { successResponse } from '../../utils/apiResponse.js';
import { ValidationError } from '../../utils/errors.js';
import { generateAssistantResponse } from '../../services/assistantService.js';

const router = Router();

// POST /api/assistant/chat
router.post('/chat', assistantRateLimiter, optionalAuthenticate, async (req, res, next) => {
  try {
    const rawQuery = req.body?.query || req.body?.message || '';
    const query = typeof rawQuery === 'string' ? rawQuery.trim() : '';
    const language = req.body?.language || 'en';
    const selectedDistrict = req.body?.selectedDistrict || 'All';

    if (!query) {
      throw new ValidationError('A question or query is required');
    }

    // Provide allowlisted, sanitized platform context to the assistant
    const sanitizedContext = {
      schemes: database.store.schemes,
      beneficiaries: database.store.beneficiaries.map((b) => ({
        id: b.id,
        fullName: b.full_name || b.fullName,
        verificationStatus: b.verification_status || b.verificationStatus,
        riskScore: b.risk_score || b.riskScore,
        district: b.district_id || b.district,
        block: b.block_id || b.block,
        village: b.village_id || b.village,
      })),
      inspections: database.store.inspections.map((i) => ({
        id: i.id,
        inspectionCode: i.inspection_code || i.inspectionCode,
        status: i.status,
        stage: i.stage,
        beneficiaryId: i.beneficiary_id,
        district: i.district_id || i.district,
        block: i.block_id || i.block,
      })),
      installments: database.store.installments.map((inst) => ({
        id: inst.id,
        installmentNumber: inst.installment_number || inst.installmentNumber,
        amount: inst.amount,
        status: inst.status,
        beneficiaryName: inst.beneficiary_name || 'Beneficiary',
        schemeName: inst.scheme_name || 'PMAY-G',
      })),
      riskCases: database.store.riskCases,
      selectedDistrict,
      language,
      userRole: req.user?.role || 'public_citizen',
    };

    const response = await generateAssistantResponse({
      query,
      context: sanitizedContext,
      language,
    });

    return successResponse(res, {
      response: response.text,
      text: response.text,
      reply: response.text,
      relatedAction: response.relatedAction || null,
      language: language === 'hi' ? 'hi' : 'en',
      engine: process.env.GEMINI_API_KEY ? 'gemini_bilingual' : 'deterministic_rule_base',
    });
  } catch (err) {
    next(err);
  }
});

export default router;
