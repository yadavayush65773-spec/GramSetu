import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Layers,
  UserCheck,
  ClipboardCheck,
  CreditCard,
  ShieldAlert,
  MapPin,
  WifiOff,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Globe2,
  FileCheck2,
  ChevronDown,
  Building2,
  Landmark,
  Eye,
  LogIn,
  UserPlus,
  Compass,
  FileText,
  AlertTriangle,
  Scale,
  RefreshCw,
  HelpCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActivePage, language, setLanguage, schemes, beneficiaries, installments, riskCases } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const isHi = language === 'hi';

  const faqs = [
    {
      qEn: 'How does GramSetu verify that a construction photograph is genuine and not reused?',
      qHi: 'ग्रामसेतु यह कैसे सत्यापित करता है कि निर्माण फोटो वास्तविक है और पहले इस्तेमाल नहीं की गई?',
      aEn: 'Every photograph captured during field inspections is digested on the server using cryptographic SHA-256 byte hashing. If the identical image bytes were previously submitted for any other beneficiary or project, the anti-fraud engine flags an instant Critical Risk case (#DUPLICATE_EVIDENCE_HASH).',
      aHi: 'क्षेत्रीय निरीक्षण के दौरान ली गई प्रत्येक फोटो का सर्वर पर क्रिप्टोग्राफिक SHA-256 बाइट हैशिंग किया जाता है। यदि वही फोटो किसी अन्य लाभार्थी या परियोजना में पहले प्रस्तुत की गई है, तो सिस्टम तत्काल गंभीर धोखाधड़ी चेतावनी जारी करता है।'
    },
    {
      qEn: 'Can field inspectors submit inspections in remote rural areas with zero internet?',
      qHi: 'क्या क्षेत्रीय निरीक्षक बिना इंटरनेट वाले दूरदराज के गांवों में निरीक्षण दर्ज कर सकते हैं?',
      aEn: 'Yes. GramSetu has an offline-first architecture. When operating without mobile connectivity, inspections, checklist verifications, and GPS coordinates are stored locally in the tablet workspace. Once network access is restored, the queue is synced idempotently with zero duplicate records.',
      aHi: 'हां। ग्रामसेतु में ऑफलाइन-फर्स्ट वर्कस्पेस है। जब इंटरनेट नहीं होता, तो सभी निरीक्षण, चेकलिस्ट और जीपीएस डेटा टैबलेट में सुरक्षित रहता है। नेटवर्क वापस आने पर एक क्लिक में केंद्रीय सर्वर पर बिना दोहराव के समन्वयित हो जाता है।'
    },
    {
      qEn: 'How does the 28 km geo-fence discrepancy detection work?',
      qHi: '28 किमी का जियो-फेंस विचलन अलर्ट कैसे काम करता है?',
      aEn: 'The inspection coordinates recorded by the device GPS are compared against the legal village reference benchmark using the Haversine great-circle distance formula. If the inspection was reportedly conducted more than 28 km away from the village boundary, an explainable geographic risk signal is generated.',
      aHi: 'डिवाइस जीपीएस द्वारा दर्ज निर्देशांकों की तुलना हैवरसाइन सूत्र द्वारा ग्राम संदर्भ बिंदु से की जाती है। यदि निरीक्षण गांव की सीमा से 28 किमी से अधिक दूरी पर दर्ज किया गया हो, तो स्वतः भौगोलिक जोखिम चेतावनी दर्ज होती है।'
    },
    {
      qEn: 'Can a field inspector approve their own inspection or release money?',
      qHi: 'क्या क्षेत्रीय निरीक्षक अपने स्वयं के निरीक्षण को स्वीकृत कर सकते हैं या धनराशि जारी कर सकते हैं?',
      aEn: 'Strictly prohibited by design. GramSetu enforces statutory separation of duties: Field Inspectors may only record ground observations. Stage approvals and Direct Benefit Transfer (DBT) installment releases require explicit authorization by the District Officer (DM/CDO) or authorized State Admin.',
      aHi: 'प्रणाली में यह सख्त वर्जित है। ग्रामसेतु में कर्तव्यों का विभाजन लागू है: क्षेत्रीय निरीक्षक केवल स्थलीय साक्ष्य दर्ज कर सकते हैं। किश्त अनुमोदन और डीबीटी फंड रिलीज का अधिकार केवल जिला मजिस्ट्रेट/सीडीओ और राज्य स्तर के पास है।'
    },
    {
      qEn: 'How does GramSetu protect citizen privacy while maintaining public transparency?',
      qHi: 'सार्वजनिक पारदर्शिता बनाए रखते हुए ग्रामसेतु नागरिकों की गोपनीयता कैसे सुरक्षित रखता है?',
      aEn: 'Public citizens can track macro scheme outlays and individual grievance tracking codes (e.g., GRV-2026-UP-4921) on the Transparency Portal. All sensitive citizen identifiers (full Aadhaar, mobile digits, exact household plots) are strictly masked on all public-facing endpoints.',
      aHi: 'नागरिक समग्र योजना आवंटन और अपनी शिकायत ट्रैकिंग कोड (जैसे GRV-2026-UP-4921) ट्रैक कर सकते हैं। सभी व्यक्तिगत पहचान डेटा (आधार, फोन नंबर, निजी विवरण) सार्वजनिक पोर्टल पर पूरी तरह मास्क रहते हैं।'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* 1. TOP ANNOUNCEMENT BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-stone-900 to-emerald-950 text-white text-xs py-2 px-4 border-b border-emerald-800/40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase border border-amber-500/30">
              TechTrix'26 PS-1
            </span>
            <span className="text-stone-300 hidden sm:inline">
              Smart Rural Housing & Panchayat Monitoring Platform • Problem Statement 1
            </span>
          </div>
          <div className="flex items-center gap-4 text-stone-300 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live DPI System
            </span>
            <button
              onClick={() => setLanguage(isHi ? 'en' : 'hi')}
              className="text-amber-300 hover:text-amber-200 font-medium underline flex items-center gap-1"
            >
              <Globe2 className="w-3.5 h-3.5" />
              {isHi ? 'Switch to English' : 'हिन्दी में देखें'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER & NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & National Emblem Reference */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActivePage('landing')}>
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-stone-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 border border-emerald-600/30">
              <Landmark className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black tracking-tight text-stone-900 font-serif">GramSetu</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                  ग्रामसेतु
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-500 tracking-wide uppercase">
                {isHi ? 'डिजिटल ग्रामीण आवास एवं पंचायत निगरानी मंच' : 'Smart Rural Housing & Panchayat Monitoring'}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-600">
            <a href="#features" className="hover:text-emerald-700 transition-colors">
              {isHi ? 'मुख्य विशेषताएं' : 'Core Features'}
            </a>
            <a href="#lifecycle" className="hover:text-emerald-700 transition-colors">
              {isHi ? 'कार्यप्रणाली' : 'How It Works'}
            </a>
            <a href="#security" className="hover:text-emerald-700 transition-colors">
              {isHi ? 'सुरक्षा व हैश' : 'Security & Cryptography'}
            </a>
            <a href="#faq" className="hover:text-emerald-700 transition-colors">
              {isHi ? 'अक्सर पूछे जाने वाले सवाल' : 'FAQ'}
            </a>
            <button
              onClick={() => setActivePage('public_portal')}
              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-bold"
            >
              <Globe2 className="w-4 h-4" />
              {isHi ? 'जन पोर्टल' : 'Public Portal'}
            </button>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActivePage('login')}
              className="px-4 py-2 text-sm font-bold text-stone-700 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-4 h-4 text-emerald-700" />
              {isHi ? 'लॉग इन' : 'Sign In'}
            </button>
            <button
              onClick={() => setActivePage('register')}
              className="px-4 py-2 text-sm font-bold bg-white text-emerald-700 border border-emerald-600/40 hover:bg-emerald-50 rounded-lg transition-all shadow-xs hidden sm:flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              {isHi ? 'पंजीकरण' : 'Register'}
            </button>
            <button
              onClick={() => setActivePage('overview')}
              className="px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-emerald-700 to-emerald-800 hover:from-emerald-800 hover:to-emerald-900 rounded-lg shadow-sm shadow-emerald-900/20 hover:shadow-md transition-all flex items-center gap-2 group"
            >
              <span>{isHi ? 'डैशबोर्ड खोलें' : 'Launch Console'}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 3. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-stone-200/80 bg-radial-[at_top_right] from-emerald-50/60 via-transparent to-amber-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* National Promise Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 border border-emerald-300/60 text-xs font-bold mb-6 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{isHi ? 'प्रत्येक कार्य सत्यापित • प्रत्येक लाभ जवाबदेह' : 'Every Work Verified • Every Benefit Accountable'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.15] mb-6">
              {isHi ? (
                <>
                  ग्रामीण आवास एवं पंचायत विकास की <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-800 to-stone-900">
                    पारदर्शी व जवाबदेह डिजिटल निगरानी
                  </span>
                </>
              ) : (
                <>
                  Smart Rural Housing &amp; <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 via-emerald-800 to-stone-900">
                    Panchayat Monitoring Platform
                  </span>
                </>
              )}
            </h1>

            {/* Sub-headline */}
            <p className="text-lg sm:text-xl text-stone-600 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
              {isHi
                ? 'प्रधानमंत्री आवास योजना (ग्रामीण) एवं प्रमुख योजनाओं के 4-चरणीय निर्माण सत्यापन, ऑफलाइन टैबलेट निरीक्षण, फोटो क्रिप्टोग्राफिक SHA-256 हैशिंग, 28 किमी जियो-फेंस विचलन पहचान एवं डीबीटी किश्त अनुमोदन का एकीकृत डिजिटल मंच।'
                : 'A production-grade Digital Public Infrastructure (DPI) platform uniting State Admins, District Officers, BDOs, Field Engineers, and Citizens for cryptographic evidence verification, fraud detection, and DBT installment governance.'}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
              <button
                onClick={() => setActivePage('overview')}
                className="px-6 py-3.5 text-base font-bold text-white bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 hover:from-emerald-800 hover:to-stone-900 rounded-xl shadow-lg shadow-emerald-900/25 hover:shadow-xl transition-all flex items-center gap-2 group"
              >
                <span>{isHi ? 'लाइव प्लेटफॉर्म देखें' : 'Explore Live Platform'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setActivePage('login')}
                className="px-6 py-3.5 text-base font-bold text-stone-800 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-xs transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-emerald-700" />
                <span>{isHi ? 'अधिकारी / निरीक्षक लॉगिन' : 'Officer / Inspector Sign In'}</span>
              </button>
              <button
                onClick={() => setActivePage('public_portal')}
                className="px-5 py-3.5 text-base font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 rounded-xl transition-all flex items-center gap-2"
              >
                <Compass className="w-4 h-4 text-emerald-700" />
                <span>{isHi ? 'नागरिक शिकायत ट्रैक करें' : 'Track Citizen Grievance'}</span>
              </button>
            </div>

            {/* Key Micro Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-white/90 border border-stone-200 shadow-md">
              <div className="p-3 text-left border-r border-stone-100 last:border-0">
                <div className="text-2xl font-black text-emerald-800">6 Schemes</div>
                <div className="text-xs text-stone-500 font-medium">PMAY-G, JJM, SBM-G, PMGSY</div>
              </div>
              <div className="p-3 text-left border-r border-stone-100 last:border-0">
                <div className="text-2xl font-black text-stone-900">100% SHA-256</div>
                <div className="text-xs text-stone-500 font-medium">Server-Computed Evidence Hashing</div>
              </div>
              <div className="p-3 text-left border-r border-stone-100 last:border-0">
                <div className="text-2xl font-black text-amber-700">&gt;28 km Alert</div>
                <div className="text-xs text-stone-500 font-medium">Haversine Geo-Fence Discrepancy</div>
              </div>
              <div className="p-3 text-left">
                <div className="text-2xl font-black text-emerald-700">Offline-First</div>
                <div className="text-xs text-stone-500 font-medium">Hardware GPS Locked Field Cache</div>
              </div>
            </div>
          </div>

          {/* Interactive Hero Visual Preview */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl bg-stone-900 p-3 sm:p-4 shadow-2xl border border-stone-700/60">
            <div className="flex items-center justify-between px-3 py-2 border-b border-stone-800 mb-3 text-xs text-stone-400">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="font-mono text-stone-300 ml-2">GramSetu DPI • NIC SafeNet Node • Live Verified</span>
              </div>
              <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded text-[11px] border border-emerald-800/60 font-mono">
                UP_STATE_NODE: ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Card 1: PMAY-G Milestone Tracker */}
              <div className="bg-stone-800/90 rounded-xl p-4 border border-stone-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Housing Construction</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">Stage: Lintel Cast</span>
                </div>
                <div className="text-base font-bold text-white mb-1">Ram Dayal Maurya (BEN-002)</div>
                <p className="text-xs text-stone-400 mb-3">Village: Rohaniya • Block: Sevapuri (Varanasi)</p>
                <div className="w-full bg-stone-700 h-2 rounded-full overflow-hidden mb-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-amber-400 h-full w-[75%]"></div>
                </div>
                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>Plinth: Verified</span>
                  <span className="text-amber-300">Lintel: 75%</span>
                  <span>Handover: Pending</span>
                </div>
              </div>

              {/* Card 2: SHA-256 Collision Warning */}
              <div className="bg-stone-800/90 rounded-xl p-4 border border-red-500/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Fraud Risk Case #001
                  </span>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded font-bold">Score: 85/100</span>
                </div>
                <div className="text-sm font-bold text-white mb-1">Reused Photo Hash Detected</div>
                <p className="text-xs text-stone-300 mb-2">
                  Identical SHA-256 byte digest reused across two different applicant records in Mirzapur &amp; Gorakhpur.
                </p>
                <div className="text-[10px] font-mono bg-stone-900 p-1.5 rounded text-stone-400 truncate">
                  SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </div>
              </div>

              {/* Card 3: DBT Release Gatekeeper */}
              <div className="bg-stone-800/90 rounded-xl p-4 border border-stone-700/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">DBT Installment #2</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">₹40,000 Pending</span>
                </div>
                <div className="text-base font-bold text-white mb-1">Gatekeeping Check</div>
                <div className="space-y-1.5 text-xs text-stone-300 mb-3">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Plinth Stage Verified (JE Endorsement)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographic Evidence Passed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero Geo-Fence Anomaly (&lt; 28km)</span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-300 font-semibold bg-emerald-950/80 p-1.5 rounded border border-emerald-800/60 text-center">
                  Ready for DM / CDO Final Authorization
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SECTION */}
      <section id="features" className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {isHi ? 'सटीक निगरानी उपकरण' : 'Institutional Capabilities'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mt-3 mb-4">
              {isHi ? 'भ्रष्टाचार-मुक्त ग्रामीण निगरानी के 6 मजबूत स्तंभ' : 'Six Pillars of Zero-Leakage Rural Governance'}
            </h2>
            <p className="text-base text-stone-600">
              {isHi
                ? 'कागजी दावों और फर्जी जियो-टैगिंग के युग को समाप्त कर वास्तविक बाइट-स्तरीय साक्ष्य सुरक्षा।'
                : 'Designed from the ground up to prevent ghost beneficiaries, recycled inspection photographs, and unverified payment releases.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {isHi ? 'क्रिप्टोग्राफिक साक्ष्य हैशिंग' : 'SHA-256 Photo Byte Cryptography'}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'प्रत्येक स्थलीय फोटो का वास्तविक बाइट-स्तरीय SHA-256 हैश सर्वर पर निकाला जाता है। दो अलग-अलग फाइलों का हैश समान पाए जाने पर तत्काल अलर्ट।'
                  : 'Computes cryptographic digests directly from uploaded image bytes. Detects if identical construction photos are reused across different projects.'}
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <WifiOff className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {isHi ? 'ऑफलाइन-फर्स्ट टैबलेट वर्कस्पेस' : 'Offline Field Tablet Workspace'}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'कनेक्टिविटी विहीन क्षेत्रों में निरीक्षण स्थानीय IndexedDB में कतारबद्ध होते हैं। सर्वर पर लौटने पर बिना किसी डुप्लीकेट रिकॉर्ड के समन्वय।'
                  : 'Engineers record inspections in remote network shadow areas. Idempotent background synchronization prevents record duplication upon reconnection.'}
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {isHi ? '28 किमी जियो-फेंस विसंगति पहचान' : 'Geo-Fence Anomaly Engine (>28km)'}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'हैवरसाइन सूत्र द्वारा स्थलीय निर्देशांकों और कानूनी ग्राम संदर्भ बिंदु के बीच दूरी का सटीक आकलन कर फर्जी जियो-टैगिंग को उजागर किया जाता है।'
                  : 'Calculates the exact geographic distance between inspection GPS coordinates and village reference benchmarks, highlighting anomalies >28 km.'}
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center mb-5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {isHi ? 'कर्तव्यों का संवैधानिक विभाजन' : 'Statutory Separation of Duties'}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'निरीक्षक कभी भी स्वयं का काम स्वीकृत नहीं कर सकते। डीबीटी किश्त केवल अधिकृत जिला अधिकारी (DM/CDO) के डिजिटल हस्ताक्षर से स्वीकृत होती है।'
                  : 'Enforces role separation: Inspectors cannot approve their own submissions. DBT installment disbursements require District Officer or State Admin approval.'}
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center mb-5 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {isHi ? '0–100 स्पष्टीकरण योग्य जोखिम स्कोरिंग' : 'Explainable Risk Scoring Engine'}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'संभावित डुप्लीकेट नाम, साझा आवास, फोटो हैश और विलंबित निर्माण चरणों के आधार पर 0–100 स्कोर व स्पष्ट कारणों सहित रिस्क केस तैयार होते हैं।'
                  : 'Deterministic engine evaluating duplicate identity candidates, name similarity, and overdue stages into transparent risk indicators.'}
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#FAF8F5] p-7 rounded-2xl border border-stone-200 hover:border-emerald-300 transition-all hover:shadow-lg group">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">
                {isHi ? 'द्विभाषी ग्रामसेतु सहायक AI' : 'Bilingual Sahayak AI Assistant'}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                {isHi
                  ? 'हिन्दी व अंग्रेजी में वास्तविक डेटा के आधार पर योजनाओं के बजट, लंबित किश्तों व निरीक्षण नियमों पर त्वरित प्रश्नों का उत्तर देने वाला सह-चालक।'
                  : 'Answers live operational questions regarding scheme outlays, pending quotas, and statutory verification rules in English and Hindi.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 4-STAGE CONSTRUCTION LIFECYCLE */}
      <section id="lifecycle" className="py-20 bg-[#F8F6F0] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              {isHi ? 'कार्यप्रणाली' : 'End-to-End Workflow'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mt-3 mb-4">
              {isHi ? '4-चरणीय ग्रामीण आवास निरीक्षण एवं डीबीटी चक्र' : 'The 4-Stage Rural Housing & DBT Lifecycle'}
            </h2>
            <p className="text-base text-stone-600">
              {isHi
                ? 'आवेदन से लेकर गृह प्रवेश तक: हर चरण में सख्त साक्ष्य सत्यापन के बाद ही सरकारी किश्त का हस्तांतरण।'
                : 'Ensuring that public funds are disbursed strictly against independently verified, photographic ground progress.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center mb-4">
                01
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">
                {isHi ? '9-चरणीय पात्रता सत्यापन' : 'Statutory Verification'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isHi
                  ? 'कच्चा मकान, वार्षिक आय, ग्राम सभा प्रस्ताव, भूमि स्वामित्व एवं एसईसीसी सूची से मिलान। औचित्य रिकॉर्डिंग अनिवार्य।'
                  : 'Verification of kutcha dwelling, socio-economic eligibility, and land rights. Mandatory justification recorded in immutable audit log.'}
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-black text-sm flex items-center justify-center mb-4">
                02
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">
                {isHi ? 'प्लव स्तर (Plinth) निरीक्षण' : 'Plinth Field Inspection'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isHi
                  ? 'नींव एवं कुर्सी स्तर के निर्माण का स्थलीय फोटो साक्ष्य, डिवाइस जीपीएस लॉक व कच्चे बाइट हैश की गणना।'
                  : 'Frontline inspection of plinth construction with device GPS locking and photographic SHA-256 evidence generation.'}
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-amber-600 text-white font-black text-sm flex items-center justify-center mb-4">
                03
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">
                {isHi ? 'लिंटेल व छत ढलाई सत्यापन' : 'Lintel & Roof Casting'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isHi
                  ? 'दीवारों एवं छत की ढलाई की जांच। पिछले चरण के साक्ष्यों से तुलना कर दोहराव व जियो-फेंस विसंगति परीक्षण।'
                  : 'Second stage inspection validating superstructure and roof casting before qualifying for installment tranche #2.'}
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative">
              <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-black text-sm flex items-center justify-center mb-4">
                04
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1.5">
                {isHi ? 'अंतिम गृह प्रवेश व डीबीटी' : 'Completion & Handover'}
              </h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                {isHi
                  ? 'शौचालय, खिड़की-दरवाजे व पेंटिंग के बाद पूर्णता प्रमाण पत्र। जिला अधिकारी द्वारा अंतिम किश्त का डिजिटल अनुमोदन।'
                  : 'Sanitary fittings and final dwelling handover. District Officer signs off, releasing final tranche with simulated PFMS reference.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ROLE HIERARCHY */}
      <section className="py-20 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              {isHi ? 'भूमिका एवं अनुमति मैट्रिक्स' : 'Governance Hierarchy'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mt-3 mb-4">
              {isHi ? 'सभी 6 प्रशासनिक स्तरों के लिए सुरक्षित अधिकार' : 'Multi-Tier Role-Based Access Control (RBAC)'}
            </h2>
            <p className="text-base text-stone-600">
              {isHi
                ? 'राज्य स्तर से लेकर आम ग्रामीण नागरिक तक, प्रत्येक उपयोगकर्ता के लिए स्पष्ट दायित्व एवं अधिकार क्षेत्र।'
                : 'Enforcing strict server-side authorization so no officer or user can exceed their statutory jurisdiction.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-stone-200 bg-[#FAF9F5]">
              <div className="text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">State Level (Tier 1)</div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">State Administrator</h4>
              <p className="text-xs text-stone-600 mb-4">
                ACS &amp; Rural Development Directorate. State-wide scheme registry, budget allocations, and master platform control.
              </p>
              <div className="text-xs text-purple-800 font-semibold bg-purple-50 p-2 rounded border border-purple-200">
                Full State Jurisdiction • Scheme Creation • Audit Access
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-[#FAF9F5]">
              <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">District Level (Tier 2)</div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">District Officer (DM / CDO)</h4>
              <p className="text-xs text-stone-600 mb-4">
                District Magistrate &amp; Chief Development Officer. DBT installment releases, vigilance reviews, and fraud remediation.
              </p>
              <div className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded border border-emerald-200">
                District Scope • DBT Authorization • Fraud Remediation
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-[#FAF9F5]">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">Block Level (Tier 3)</div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">Block Development Officer (BDO)</h4>
              <p className="text-xs text-stone-600 mb-4">
                Sub-district operations. Beneficiary roster validation, inspector assignments, and rectification notices.
              </p>
              <div className="text-xs text-blue-800 font-semibold bg-blue-50 p-2 rounded border border-blue-200">
                Block Scope • Checklist Endorsements • Inspector Assignment
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-[#FAF9F5]">
              <div className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Ground Frontline (Tier 4)</div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">Field Technical Inspector (JE)</h4>
              <p className="text-xs text-stone-600 mb-4">
                Frontline civil engineer. Captures ground milestone progress with hardware GPS lock and raw byte SHA-256 photo hashing.
              </p>
              <div className="text-xs text-amber-800 font-semibold bg-amber-50 p-2 rounded border border-amber-200">
                Assigned Panchayats • Offline Tablet Queue • Evidence Capture
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-[#FAF9F5]">
              <div className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">Constitutional Oversight</div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">Public Accounts Auditor (CAG)</h4>
              <p className="text-xs text-stone-600 mb-4">
                Social audit &amp; CAG directorate. Read-only examination of the immutable append-only ledger and evidence integrity.
              </p>
              <div className="text-xs text-indigo-800 font-semibold bg-indigo-50 p-2 rounded border border-indigo-200">
                State-Wide Read-Only • Immutable Audit Trail • Tamper Verification
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-stone-200 bg-[#FAF9F5]">
              <div className="text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">Public Citizen Tier</div>
              <h4 className="text-lg font-bold text-stone-900 mb-2">Rural Beneficiary &amp; Citizen</h4>
              <p className="text-xs text-stone-600 mb-4">
                Open access to scheme outlays, village progress, and filing grievances with unique tracking codes (`GRV-2026-UP-xxxx`).
              </p>
              <div className="text-xs text-stone-800 font-semibold bg-stone-100 p-2 rounded border border-stone-200">
                Public Transparency • Grievance Tracking • Masked PII
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section id="faq" className="py-20 bg-[#FAF8F5] border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              FAQ
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-stone-900 mt-3 mb-3">
              {isHi ? 'अक्सर पूछे जाने वाले महत्वपूर्ण प्रश्न' : 'Frequently Asked Questions'}
            </h2>
            <p className="text-base text-stone-600">
              {isHi ? 'ग्रामसेतु की वास्तुकला, क्रिप्टोग्राफी एवं सुरक्षा से जुड़े मुख्य प्रश्न' : 'Technical and operational questions about the GramSetu platform.'}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 text-left font-bold text-stone-900 flex items-center justify-between gap-4 hover:bg-stone-50/80 transition-colors"
                >
                  <span className="text-base">{isHi ? f.qHi : f.qEn}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-stone-400 shrink-0 transition-transform ${openFaq === i ? 'rotate-180 text-emerald-700' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                    {isHi ? f.aHi : f.aEn}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. CALL TO ACTION & GET STARTED */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-stone-900 to-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800/80 text-amber-300 flex items-center justify-center mx-auto mb-6 border border-emerald-700 shadow-xl">
            <Landmark className="w-8 h-8" />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight leading-tight">
            {isHi ? 'पारदर्शी ग्रामीण विकास के नए युग का अनुभव करें' : 'Experience Transparent Rural Governance Today'}
          </h2>
          <p className="text-stone-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {isHi
              ? 'ग्रामसेतु मंच पर सीधे प्रवेश करें, सभी 6 भूमिकाओं का परीक्षण करें और देखें कि कैसे हर कार्य सत्यापित और हर लाभ जवाबदेह होता है।'
              : 'Launch the live interactive demonstration console or register an officer account to evaluate institutional accountability in action.'}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setActivePage('overview')}
              className="px-8 py-4 text-base font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-xl transition-all flex items-center gap-2 group"
            >
              <span>{isHi ? 'लाइव कंसोल लॉन्च करें (Demo)' : 'Launch Live Console (Demo)'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActivePage('register')}
              className="px-7 py-4 text-base font-bold text-white bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/60 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>{isHi ? 'नया खाता बनाएं' : 'Create Officer Account'}</span>
            </button>
            <button
              onClick={() => setActivePage('login')}
              className="px-7 py-4 text-base font-bold text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-all flex items-center gap-2"
            >
              <LogIn className="w-5 h-5" />
              <span>{isHi ? 'लॉग इन करें' : 'Sign In'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-stone-950 text-stone-400 text-xs py-12 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Landmark className="w-5 h-5 text-amber-400" />
                <span className="text-base font-black text-white font-serif tracking-tight">GramSetu (ग्रामसेतु)</span>
              </div>
              <p className="text-stone-400 leading-relaxed mb-4">
                Smart Rural Housing &amp; Panchayat Monitoring Platform. Designed for TechTrix'26 Problem Statement 1.
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Build: v1.0.4-production • TechTrix'26
              </div>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Flagship Schemes</h5>
              <ul className="space-y-2">
                <li><button onClick={() => setActivePage('schemes')} className="hover:text-emerald-400">PMAY-G (Rural Housing)</button></li>
                <li><button onClick={() => setActivePage('schemes')} className="hover:text-emerald-400">Jal Jeevan Mission</button></li>
                <li><button onClick={() => setActivePage('schemes')} className="hover:text-emerald-400">Swachh Bharat Mission (G)</button></li>
                <li><button onClick={() => setActivePage('schemes')} className="hover:text-emerald-400">PMGSY Rural Roads</button></li>
                <li><button onClick={() => setActivePage('schemes')} className="hover:text-emerald-400">Amrit Sarovar &amp; Solar Urja</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Platform Modules</h5>
              <ul className="space-y-2">
                <li><button onClick={() => setActivePage('overview')} className="hover:text-emerald-400">Overview Command Centre</button></li>
                <li><button onClick={() => setActivePage('beneficiaries')} className="hover:text-emerald-400">9-Step Beneficiary Verification</button></li>
                <li><button onClick={() => setActivePage('inspections')} className="hover:text-emerald-400">Field Inspections &amp; SHA-256</button></li>
                <li><button onClick={() => setActivePage('risk_fraud')} className="hover:text-emerald-400">Risk &amp; Fraud Detection Engine</button></li>
                <li><button onClick={() => setActivePage('public_portal')} className="hover:text-emerald-400">Public Citizen Transparency</button></li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-xs">Security &amp; Legal</h5>
              <ul className="space-y-2">
                <li className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SHA-256 Byte Verification</li>
                <li className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-emerald-400" /> Supabase PostgreSQL + RLS</li>
                <li className="flex items-center gap-1.5"><Scale className="w-3.5 h-3.5 text-emerald-400" /> Statutory Separation of Duties</li>
                <li className="flex items-center gap-1.5"><FileCheck2 className="w-3.5 h-3.5 text-emerald-400" /> Immutable Append-Only Ledger</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800/80 pt-6 flex flex-wrap items-center justify-between gap-4 text-stone-500">
            <div>
              &copy; 2026 GramSetu (ग्रामसेतु). Digital Rural Infrastructure Monitoring. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => setActivePage('landing')} className="hover:text-stone-300">Home</button>
              <button onClick={() => setActivePage('login')} className="hover:text-stone-300">Sign In</button>
              <button onClick={() => setActivePage('register')} className="hover:text-stone-300">Register</button>
              <button onClick={() => setActivePage('public_portal')} className="hover:text-stone-300">Public Portal</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
