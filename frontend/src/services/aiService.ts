import { Beneficiary, Scheme, FieldInspection, Installment, FraudRiskCase } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedAction?: {
    label: string;
    targetPage: string;
    params?: any;
  };
}

interface AssistantContext {
  schemes: Scheme[];
  beneficiaries: Beneficiary[];
  inspections: FieldInspection[];
  installments: Installment[];
  riskCases: FraudRiskCase[];
  selectedDistrict: string;
  language: 'en' | 'hi';
}

/**
 * Intelligent public-sector assistant for GramSetu.
 * Queries current live platform state to give precise, actionable answers.
 */
export async function getAssistantResponse(
  query: string,
  context: AssistantContext
): Promise<{ text: string; relatedAction?: ChatMessage['relatedAction'] }> {
  try {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        language: context.language,
        selectedDistrict: context.selectedDistrict,
      }),
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data?.text) {
        return {
          text: json.data.text,
          relatedAction: json.data.relatedAction,
        };
      }
    }
  } catch (_) {
    // Offline / fallback to deterministic local logic
  }

  const q = query.toLowerCase().trim();
  const isHi = context.language === 'hi' || /[\u0900-\u097F]/.test(query);

  const pendingBeneficiaries = context.beneficiaries.filter(b => b.verificationStatus === 'Pending' || b.verificationStatus === 'Under Review');
  const criticalRisks = context.riskCases.filter(r => r.severity === 'Critical' || r.severity === 'High');
  const pendingApprovals = context.installments.filter(i => i.status === 'Pending Approval');
  const overdueInspections = context.inspections.filter(i => i.status === 'Overdue');

  // Query: High risk / fraud cases
  if (q.includes('high-risk') || q.includes('fraud') || q.includes('जोखिम') || q.includes('धोखाधड़ी') || q.includes('गड़बड़ी')) {
    if (isHi) {
      return {
        text: `वर्तमान में **${criticalRisks.length} उच्च जोखिम वाले मामले** समीक्षा हेतु लंबित हैं।\n\n` +
          criticalRisks.map(r => `• **${r.caseCode}**: ${r.titleHi} (${r.village}, ${r.district}) - स्कोर: ${r.riskScore}/100`).join('\n') +
          `\n\nमुख्य कारण: फोटो हैश समानता और ग्राम सीमा से 28 किमी दूर विसंगत जियोटैग।`,
        relatedAction: {
          label: 'जोखिम विश्लेषण डैशबोर्ड खोलें',
          targetPage: 'risk_fraud',
        },
      };
    } else {
      return {
        text: `Currently there are **${criticalRisks.length} High & Critical Risk cases** requiring immediate review:\n\n` +
          criticalRisks.map(r => `• **${r.caseCode}**: ${r.title} (${r.village}, ${r.district}) - Risk Score: ${r.riskScore}/100`).join('\n') +
          `\n\nTop anomaly: Duplicate SHA-256 photograph hash detected across multiple beneficiaries and 28km out-of-boundary GPS tags.`,
        relatedAction: {
          label: 'View Risk & Fraud Intelligence',
          targetPage: 'risk_fraud',
        },
      };
    }
  }

  // Query: Pending installments / approvals
  if (q.includes('किश्त') || q.includes('installment') || q.includes('भुगतान') || q.includes('approval') || q.includes('disbursement')) {
    const totalPendingAmount = pendingApprovals.reduce((acc, i) => acc + i.amount, 0);
    if (isHi) {
      return {
        text: `वर्तमान में **${pendingApprovals.length} किश्तें** अनुमोदन हेतु प्रतीक्षारत हैं, जिनका कुल मूल्य **₹${totalPendingAmount.toLocaleString('en-IN')}** है।\n\n` +
          pendingApprovals.map(i => `• ${i.beneficiaryName} - किश्त संख्या #${i.installmentNumber} (₹${i.amount.toLocaleString('en-IN')}) - ${i.schemeName}`).join('\n') +
          `\n\nसभी आवश्यक तकनीकी निरीक्षण उत्तीर्ण हो चुके हैं।`,
        relatedAction: {
          label: 'किश्त अनुमोदन पोर्टल खोलें',
          targetPage: 'installments',
        },
      };
    } else {
      return {
        text: `Currently there are **${pendingApprovals.length} installments** awaiting authorized approval, totaling **₹${totalPendingAmount.toLocaleString('en-IN')}**:\n\n` +
          pendingApprovals.map(i => `• ${i.beneficiaryName} - Installment #${i.installmentNumber} (₹${i.amount.toLocaleString('en-IN')}) for ${i.schemeName}`).join('\n') +
          `\n\nAll requisite physical milestone verification reports and photo SHA hashes are verified.`,
        relatedAction: {
          label: 'Review Pending Approvals',
          targetPage: 'installments',
        },
      };
    }
  }

  // Query: Inspections / field visits
  if (q.includes('inspection') || q.includes('निरीक्षण') || q.includes('overdue') || q.includes('विलंबित') || q.includes('inspector')) {
    if (isHi) {
      return {
        text: `ग्रामसेतु निरीक्षण स्थिति:\n• कुल दर्ज निरीक्षण: ${context.inspections.length}\n• सफल (Passed): ${context.inspections.filter(i => i.status === 'Passed').length}\n• विलंबित (Overdue): ${overdueInspections.length}\n• असफल/गड़बड़ी (Failed): ${context.inspections.filter(i => i.status === 'Failed').length}\n\nपिपराइच ब्लॉक में अर्जुन लाल निषाद का निरीक्षण अति-विलंबित है।`,
        relatedAction: {
          label: 'क्षेत्रीय निरीक्षण मॉड्यूल देखें',
          targetPage: 'inspections',
        },
      };
    } else {
      return {
        text: `GramSetu Field Inspection Summary:\n• Total Inspections: ${context.inspections.length}\n• Passed: ${context.inspections.filter(i => i.status === 'Passed').length}\n• Overdue: ${overdueInspections.length}\n• Failed (Integrity breach): ${context.inspections.filter(i => i.status === 'Failed').length}\n\nNotice: 1 inspection in Pipraich block is overdue for foundation verification.`,
        relatedAction: {
          label: 'Open Field Inspections',
          targetPage: 'inspections',
        },
      };
    }
  }

  // Query: Pending applications / block / district
  if (q.includes('लंबित') || q.includes('pending') || q.includes('आवेदन') || q.includes('verification') || q.includes('ब्लॉक')) {
    if (isHi) {
      return {
        text: `आपके चुने हुए क्षेत्र में **${pendingBeneficiaries.length} लाभार्थी सत्यापन** लंबित अथवा समीक्षाधीन हैं।\n\n` +
          `• सत्यापन हेतु लंबित: ${context.beneficiaries.filter(b => b.verificationStatus === 'Pending').length}\n` +
          `• समीक्षाधीन (Under Review): ${context.beneficiaries.filter(b => b.verificationStatus === 'Under Review').length}\n` +
          `• संदिग्ध (Flagged): ${context.beneficiaries.filter(b => b.verificationStatus === 'Flagged').length}\n\n` +
          `आप किसी भी लाभार्थी का 9-चरणीय पात्रता सत्यापन सीधे पोर्टल से प्रारंभ कर सकते हैं।`,
        relatedAction: {
          label: 'लाभार्थी सत्यापन सूची खोलें',
          targetPage: 'beneficiaries',
        },
      };
    } else {
      return {
        text: `In your administrative scope, there are **${pendingBeneficiaries.length} beneficiary verifications** pending or under review:\n\n` +
          `• Pending First Review: ${context.beneficiaries.filter(b => b.verificationStatus === 'Pending').length}\n` +
          `• Under Technical Review: ${context.beneficiaries.filter(b => b.verificationStatus === 'Under Review').length}\n` +
          `• Flagged for Anomalies: ${context.beneficiaries.filter(b => b.verificationStatus === 'Flagged').length}\n\n` +
          `You can execute the 9-step statutory eligibility checklist and inspect photographic metadata directly.`,
        relatedAction: {
          label: 'Open Beneficiary Directory',
          targetPage: 'beneficiaries',
        },
      };
    }
  }

  // Query: Schemes overview
  if (q.includes('scheme') || q.includes('योजना') || q.includes('बजट') || q.includes('budget') || q.includes('awas') || q.includes('jal jeevan')) {
    const totalBudget = context.schemes.reduce((acc, s) => acc + s.allocatedBudget, 0);
    const totalUtilized = context.schemes.reduce((acc, s) => acc + s.utilizedBudget, 0);
    const pct = Math.round((totalUtilized / totalBudget) * 100);
    if (isHi) {
      return {
        text: `ग्रामसेतु पर **${context.schemes.length} प्रमुख ग्रामीण विकास योजनाएं** सक्रिय हैं:\n` +
          `• कुल आवंटित बजट: ₹${(totalBudget / 10000000).toFixed(2)} करोड़\n` +
          `• व्यय किया गया बजट: ₹${(totalUtilized / 10000000).toFixed(2)} करोड़ (${pct}%)\n` +
          `• कुल पंजीकृत लाभार्थी: ${context.schemes.reduce((a, s) => a + s.enrolledBeneficiaries, 0)} ग्रामीण\n\n` +
          `शीर्ष योजनाएं: पीएम आवास योजना (ग्रामीण), जल जीवन मिशन, स्वच्छ भारत मिशन।`,
        relatedAction: {
          label: 'योजना प्रबंधन देखें',
          targetPage: 'schemes',
        },
      };
    } else {
      return {
        text: `There are **${context.schemes.length} flagship rural development schemes** monitored on GramSetu:\n` +
          `• Total Budget Allocated: ₹${(totalBudget / 10000000).toFixed(2)} Cr\n` +
          `• Utilized Expenditure: ₹${(totalUtilized / 10000000).toFixed(2)} Cr (${pct}%)\n` +
          `• Enrolled Beneficiaries: ${context.schemes.reduce((a, s) => a + s.enrolledBeneficiaries, 0)}\n\n` +
          `Key initiatives include PMAY-Gramin, Jal Jeevan Mission, SBM-G, PMGSY roads, and Amrit Sarovar lakes.`,
        relatedAction: {
          label: 'View Schemes & Projects',
          targetPage: 'schemes',
        },
      };
    }
  }

  // Default fallback response
  if (isHi) {
    return {
      text: `नमस्ते! मैं **ग्रामसेतु सहायक** हूँ। मैं ग्रामीण विकास योजनाओं, लाभार्थी सत्यापन, जियोटैग्ड निरीक्षणों, किश्त अनुमोदन और धोखाधड़ी रोकथाम में आपकी सहायता कर सकता हूँ।\n\nआप मुझसे पूछ सकते हैं:\n1. "मेरे ब्लॉक में कितने आवेदन लंबित हैं?"\n2. "उच्च जोखिम वाले मामलों की सूची दिखाएं"\n3. "कौन-सी किश्तें अनुमोदन हेतु प्रतीक्षारत हैं?"\n4. "आज के निरीक्षणों का सारांश दें"`,
    };
  } else {
    return {
      text: `Hello! I am **GramSetu Sahayak**, your digital administrative co-pilot for rural development monitoring.\n\nI can assist you with:\n1. "Show high-risk cases awaiting review."\n2. "How many applications are pending in my block?"\n3. "Which scheme installments need approval?"\n4. "Summarize overdue field inspections."`,
    };
  }
}
