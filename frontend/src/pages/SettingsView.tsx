import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Settings, 
  Globe, 
  Database, 
  RotateCcw, 
  ShieldCheck, 
  HardDrive, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Lock,
  Download,
  Share2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    selectedDistrict, 
    setSelectedDistrict, 
    resetToDemoData, 
    offlineSyncQueue,
    beneficiaries,
    schemes,
    inspections,
    addToast 
  } = useApp();

  const isHi = language === 'hi';

  const handleClearCache = () => {
    localStorage.removeItem('gramsetu_app_state_v1_offline_queue');
    addToast('Offline draft cache cleared.', 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0D3B2E]">
          {isHi ? 'सिस्टम सेटिंग्स व डाटा प्रबंधन' : 'Platform Settings & Data Governance'}
        </h2>
        <p className="text-xs text-[#66756F]">
          {isHi ? 'भाषा प्राथमिकताएं, स्थानीय ऑफलाइन भंडारण, और डेमो डाटा प्रबंधन' : 'Configure platform language, district scope, offline IndexedDB cache, and presentation data'}
        </p>
      </div>

      {/* Localization Section */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-[#0D3B2E] flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#174C3C]" />
          {isHi ? 'भाषा एवं क्षेत्रीय प्राथमिकता' : 'Language & Localization Preference'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => setLanguage('en')}
            className={`p-3.5 rounded-xl border text-left font-bold transition-all ${
              language === 'en' ? 'bg-[#174C3C] text-white border-[#174C3C] shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span>English (Default)</span>
              {language === 'en' && <CheckCircle2 className="w-4 h-4 text-[#E99A36]" />}
            </div>
            <p className="text-[11px] font-normal opacity-80">Full administrative dashboard in English terminology</p>
          </button>

          <button
            onClick={() => setLanguage('hi')}
            className={`p-3.5 rounded-xl border text-left font-bold transition-all ${
              language === 'hi' ? 'bg-[#174C3C] text-white border-[#174C3C] shadow-xs' : 'bg-gray-50 border-gray-200 text-gray-700'
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="font-devanagari">हिन्दी (राजभाषा)</span>
              {language === 'hi' && <CheckCircle2 className="w-4 h-4 text-[#E99A36]" />}
            </div>
            <p className="text-[11px] font-normal opacity-80">भारतीय ग्रामीण विकास शब्दावली के साथ पूर्ण हिंदी इंटरफ़ेस</p>
          </button>
        </div>
      </div>

      {/* District Scope */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-sm text-[#0D3B2E] flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#174C3C]" />
          Default District Administrative Scope
        </h3>
        <p className="text-xs text-[#66756F]">
          Filters active dashboard cards, charts, and beneficiary tables to your selected jurisdiction.
        </p>
        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="w-full sm:w-72 p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
        >
          <option value="All">All Districts (State Overview)</option>
          <option value="Varanasi">Varanasi District</option>
          <option value="Prayagraj">Prayagraj District</option>
          <option value="Gorakhpur">Gorakhpur District</option>
          <option value="Mirzapur">Mirzapur District</option>
        </select>
      </div>

      {/* Offline Storage Diagnostics */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-[#0D3B2E] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#174C3C]" />
            Local IndexedDB Cache & PWA Storage
          </h3>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">
            Healthy
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 text-[10px] block">Cached Beneficiaries</span>
            <p className="text-base font-bold text-[#0D3B2E] font-mono mt-0.5">{beneficiaries.length} Records</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 text-[10px] block">Field Inspections</span>
            <p className="text-base font-bold text-[#0D3B2E] font-mono mt-0.5">{inspections.length} Records</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-500 text-[10px] block">Offline Queue Items</span>
            <p className="text-base font-bold text-amber-800 font-mono mt-0.5">{offlineSyncQueue.length} Pending</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={handleClearCache}
            className="px-3.5 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
          >
            Clear Offline Sync Queue
          </button>
        </div>
      </div>

      {/* Download Project Source ZIP */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#E99A36]/10 text-[#0D3B2E] rounded-xl border border-[#E99A36]/30">
              <Share2 className="w-5 h-5 text-[#E99A36]" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {isHi ? 'प्रोजेक्ट सोर्स कोड संग्रह (.ZIP) डाउनलोड करें' : 'Shareable Source Code Archive (gramsetu-techtrix26.zip)'}
              </h3>
              <p className="text-xs text-[#66756F]">
                Complete production frontend bundle with React 19, TypeScript, Tailwind CSS, Leaflet maps, and seed data.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
            ~150 KB • Zero-bloat
          </span>
        </div>

        <div className="p-3 bg-[#F7F6F0] rounded-xl border border-gray-200 text-xs text-[#192D3A] space-y-1">
          <p className="font-semibold">Quick Start Instructions after downloading:</p>
          <p className="font-mono text-[11px] text-gray-700 bg-white p-2 rounded-lg border border-gray-200">
            unzip gramsetu-techtrix26.zip && cd gramsetu-techtrix26 && npm install && npm run dev
          </p>
        </div>

        <div className="flex justify-end pt-1">
          <a
            href="/gramsetu-techtrix26.zip"
            download="gramsetu-techtrix26.zip"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 text-[#E99A36]" />
            <span>Download gramsetu-techtrix26.zip</span>
          </a>
        </div>
      </div>

      {/* Reset Demo Data */}
      <div className="bg-red-50/50 rounded-2xl border border-red-200 p-5 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
          <RotateCcw className="w-4 h-4 text-red-600" />
          <span>Reset Demo Environment to Baseline</span>
        </div>
        <p className="text-xs text-red-800 leading-relaxed">
          If you added or edited records during judging and want to restore the pristine initial TechTrix'26 demo data (all 6 schemes, 35 beneficiaries, fraud indicators, and inspections), click below.
        </p>
        <button
          onClick={resetToDemoData}
          className="px-4 py-2 bg-[#C64242] hover:bg-[#a53232] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          Reset Demo Data to Factory State
        </button>
      </div>
    </div>
  );
};
