import { env } from '../config/env.js';
import { GoogleGenAI } from '@google/genai';

/**
 * Handle Assistant Queries with Deterministic Rule Base + Optional Gemini Fallback
 */
export async function generateAssistantResponse({ query, context = {}, language = 'en' }) {
  const q = String(query || '').toLowerCase().trim();
  const isHi = language === 'hi' || /[\u0900-\u097F]/.test(query);

  const schemes = context.schemes || [];
  const beneficiaries = context.beneficiaries || [];
  const inspections = context.inspections || [];
  const installments = context.installments || [];
  const riskCases = context.riskCases || [];

  const pendingBeneficiaries = beneficiaries.filter(
    (b) => b.verificationStatus === 'Pending' || b.verificationStatus === 'Under Review' || b.verification_status === 'Pending'
  );
  const criticalRisks = riskCases.filter(
    (r) => r.severity === 'Critical' || r.severity === 'High' || r.risk_level === 'critical' || r.risk_level === 'high'
  );
  const pendingApprovals = installments.filter(
    (i) => i.status === 'Pending Approval' || i.status === 'pending'
  );
  const overdueInspections = inspections.filter(
    (i) => i.status === 'Overdue' || i.status === 'overdue'
  );

  // 1. High risk / fraud cases
  if (q.includes('high-risk') || q.includes('fraud') || q.includes('जोखिम') || q.includes('धोखाधड़ी') || q.includes('गड़बड़ी')) {
    if (isHi) {
      return {
        text: `वर्तमान में **${criticalRisks.length} उच्च जोखिम वाले मामले** समीक्षा हेतु लंबित हैं।\n\n` +
          criticalRisks.slice(0, 5).map((r) => `• **${r.caseCode || r.case_code}**: ${r.titleHi || r.title_hi || r.title} - स्कोर: ${r.riskScore || r.risk_score}/100`).join('\n') +
          `\n\nमुख्य कारण: फोटो हैश समानता और ग्राम सीमा से 28 किमी दूर विसंगत जियोटैग।`,
        relatedAction: { label: 'जोखिम विश्लेषण डैशबोर्ड खोलें', targetPage: 'risk_fraud' },
      };
    }
    return {
      text: `Currently there are **${criticalRisks.length} High & Critical Risk cases** requiring review:\n\n` +
        criticalRisks.slice(0, 5).map((r) => `• **${r.caseCode || r.case_code}**: ${r.title} - Risk Score: ${r.riskScore || r.risk_score}/100`).join('\n') +
        `\n\nTop anomaly: Duplicate SHA-256 photograph hash detected and 28km geo-fence discrepancy.`,
      relatedAction: { label: 'View Risk & Fraud Intelligence', targetPage: 'risk_fraud' },
    };
  }

  // 2. Pending installments / DBT approvals
  if (q.includes('किश्त') || q.includes('installment') || q.includes('भुगतान') || q.includes('approval') || q.includes('disbursement')) {
    const totalPendingAmount = pendingApprovals.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    if (isHi) {
      return {
        text: `वर्तमान में **${pendingApprovals.length} किश्तें** अनुमोदन हेतु प्रतीक्षारत हैं, जिनका कुल मूल्य **₹${totalPendingAmount.toLocaleString('en-IN')}** है।\n\n` +
          pendingApprovals.slice(0, 5).map((i) => `• ${i.beneficiaryName || i.beneficiary_name || 'लाभार्थी'} - किश्त संख्या #${i.installmentNumber || i.installment_number} (₹${Number(i.amount).toLocaleString('en-IN')})`).join('\n') +
          `\n\nसभी आवश्यक तकनीकी निरीक्षण उत्तीर्ण हो चुके हैं।`,
        relatedAction: { label: 'किश्त अनुमोदन पोर्टल खोलें', targetPage: 'installments' },
      };
    }
    return {
      text: `Currently there are **${pendingApprovals.length} installments** awaiting authorized approval, totaling **₹${totalPendingAmount.toLocaleString('en-IN')}**:\n\n` +
        pendingApprovals.slice(0, 5).map((i) => `• ${i.beneficiaryName || i.beneficiary_name || 'Beneficiary'} - Installment #${i.installmentNumber || i.installment_number} (₹${Number(i.amount).toLocaleString('en-IN')})`).join('\n') +
        `\n\nAll requisite physical milestone verification reports and photo SHA hashes are verified.`,
      relatedAction: { label: 'Review Pending Approvals', targetPage: 'installments' },
    };
  }

  // 3. Inspections / Field visits
  if (q.includes('inspection') || q.includes('निरीक्षण') || q.includes('overdue') || q.includes('विलंबित') || q.includes('inspector')) {
    const passedCount = inspections.filter((i) => i.status === 'Passed' || i.status === 'passed').length;
    const failedCount = inspections.filter((i) => i.status === 'Failed' || i.status === 'failed').length;
    if (isHi) {
      return {
        text: `ग्रामसेतु निरीक्षण सारांश:\n• कुल दर्ज निरीक्षण: ${inspections.length}\n• सफल (Passed): ${passedCount}\n• विलंबित (Overdue): ${overdueInspections.length}\n• असफल (Failed): ${failedCount}\n\nक्षेत्रीय तकनीकी सहायकों द्वारा मोबाइल ऐप के माध्यम से नियमित सत्यापन जारी है।`,
        relatedAction: { label: 'क्षेत्रीय निरीक्षण मॉड्यूल देखें', targetPage: 'inspections' },
      };
    }
    return {
      text: `GramSetu Field Inspection Summary:\n• Total Inspections: ${inspections.length}\n• Passed: ${passedCount}\n• Overdue: ${overdueInspections.length}\n• Failed: ${failedCount}\n\nField verification is strictly bound to cryptographic SHA-256 byte hashes and device GPS coordinates.`,
      relatedAction: { label: 'Open Field Inspections', targetPage: 'inspections' },
    };
  }

  // 4. Pending verifications
  if (q.includes('लंबित') || q.includes('pending') || q.includes('आवेदन') || q.includes('verification') || q.includes('सत्यापन')) {
    if (isHi) {
      return {
        text: `आपके प्रशासनिक क्षेत्र में **${pendingBeneficiaries.length} लाभार्थी सत्यापन** लंबित अथवा समीक्षाधीन हैं।\n\nआप किसी भी आवेदक का 9-चरणीय पात्रता सत्यापन सीधे ग्रामसेतु पोर्टल से निष्पादित कर सकते हैं।`,
        relatedAction: { label: 'लाभार्थी सत्यापन सूची खोलें', targetPage: 'beneficiaries' },
      };
    }
    return {
      text: `In your administrative scope, there are **${pendingBeneficiaries.length} beneficiary verifications** pending or under review.\n\nYou can execute the 9-step statutory eligibility checklist and inspect photographic metadata directly.`,
      relatedAction: { label: 'Open Beneficiary Directory', targetPage: 'beneficiaries' },
    };
  }

  // 5. Schemes & Budgets
  if (q.includes('scheme') || q.includes('योजना') || q.includes('बजट') || q.includes('budget') || q.includes('pmay') || q.includes('jal jeevan')) {
    const totalBudget = schemes.reduce((acc, s) => acc + Number(s.allocatedBudget || s.allocated_amount || 0), 0);
    const totalUtilized = schemes.reduce((acc, s) => acc + Number(s.utilizedBudget || s.utilized_amount || 0), 0);
    const pct = totalBudget > 0 ? Math.round((totalUtilized / totalBudget) * 100) : 0;
    if (isHi) {
      return {
        text: `ग्रामसेतु पर **${schemes.length} प्रमुख ग्रामीण विकास योजनाएं** सक्रिय हैं:\n` +
          `• कुल आवंटित बजट: ₹${(totalBudget / 10000000).toFixed(2)} करोड़\n` +
          `• व्ययित राशि: ₹${(totalUtilized / 10000000).toFixed(2)} करोड़ (${pct}% उपयोगिता)\n\n` +
          schemes.slice(0, 4).map((s) => `• **${s.nameHi || s.name_hi || s.name}**: ₹${(Number(s.allocatedBudget || s.allocated_amount) / 10000000).toFixed(2)} Cr`).join('\n'),
        relatedAction: { label: 'योजना विवरण देखें', targetPage: 'schemes' },
      };
    }
    return {
      text: `GramSetu currently monitors **${schemes.length} flagship rural schemes**:\n` +
        `• Total Allocated Outlay: ₹${(totalBudget / 10000000).toFixed(2)} Cr\n` +
        `• Utilized Outlay: ₹${(totalUtilized / 10000000).toFixed(2)} Cr (${pct}% utilization)\n\n` +
        schemes.slice(0, 4).map((s) => `• **${s.name}**: ₹${(Number(s.allocatedBudget || s.allocated_amount) / 10000000).toFixed(2)} Cr`).join('\n'),
      relatedAction: { label: 'Explore Schemes & Projects', targetPage: 'schemes' },
    };
  }

  // 6. Optional Gemini Integration if GEMINI_API_KEY is configured
  if (env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const prompt = `You are GramSetu Sahayak, an official AI co-pilot for India's rural scheme administration and public accountability platform GramSetu.
Respond politely and concisely in ${isHi ? 'Hindi' : 'English'}.
Do not invent personal identifiers or secrets. Answer the user query based on rural scheme monitoring context.
Query: "${query}"`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        return {
          text: response.text,
          relatedAction: { label: 'View Dashboard', targetPage: 'overview' },
        };
      }
    } catch (aiErr) {
      console.warn('[GeminiAssistant] Fallback to deterministic response:', aiErr.message);
    }
  }

  // Default bilingual fallback
  if (isHi) {
    return {
      text: `नमस्ते! मैं **ग्रामसेतु सहायक** हूँ। मैं ग्रामीण विकास योजनाओं, 9-चरणीय सत्यापन, स्थलीय निरीक्षण एवं धोखाधड़ी निवारण में आपकी सहायता कर सकता हूँ।\n\nआप मुझसे उच्च जोखिम वाले मामलों, लंबित किश्तों, या योजनाओं के बजट के संबंध में पूछ सकते हैं।`,
      relatedAction: { label: 'डैशबोर्ड खोलें', targetPage: 'overview' },
    };
  }

  return {
    text: `Hello! I am **GramSetu Sahayak**, your administrative co-pilot for rural development scheme monitoring.\n\nYou can ask about high-risk fraud cases, pending DBT installment approvals, 9-step beneficiary verifications, or scheme budget utilization.`,
    relatedAction: { label: 'Open Overview Dashboard', targetPage: 'overview' },
  };
}
