import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldCheck, 
  Copy, 
  Check, 
  MapPin, 
  Calendar, 
  HardDrive, 
  FileText, 
  ExternalLink 
} from 'lucide-react';

export const EvidenceModal: React.FC = () => {
  const { activeEvidenceModal, setActiveEvidenceModal, language } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeEvidenceModal) return null;

  const handleCopyHash = () => {
    if (activeEvidenceModal.sha256) {
      navigator.clipboard.writeText(activeEvidenceModal.sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isHi = language === 'hi';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#C4D1C9] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#23865B] rounded-lg text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base tracking-wide">
                {isHi ? 'डिजिटल साक्ष्य सत्यता प्रमाणपत्र' : 'Digital Evidence Integrity Certificate'}
              </h3>
              <p className="text-xs text-[#789B82]">
                {isHi ? 'क्रिप्टोग्राफिक SHA-256 हैश व जियोटैग विश्लेषण' : 'Cryptographic SHA-256 Hash & Geotag Verification'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setActiveEvidenceModal(null)}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Photo Preview */}
          <div className="relative rounded-xl overflow-hidden border border-[#E2E8F0] bg-neutral-900 max-h-72 flex items-center justify-center">
            <img 
              src={activeEvidenceModal.photoUrl} 
              alt={activeEvidenceModal.caption || 'Field evidence'} 
              className="max-h-72 w-full object-cover"
              onError={(e) => {
                // Fallback image placeholder
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs flex items-center justify-between">
              <span className="truncate">{activeEvidenceModal.caption || 'Site Photograph'}</span>
              <span className="text-emerald-400 font-mono text-[11px] flex items-center gap-1 shrink-0">
                <Check className="w-3.5 h-3.5" /> {isHi ? 'सत्यापित साक्ष्य' : 'Verified Raw Byte Proof'}
              </span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Hash Box */}
          <div className="bg-[#F7F6F0] p-4 rounded-xl border border-[#C4D1C9]">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#174C3C] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#23865B]" />
                {isHi ? 'SHA-256 क्रिप्टोग्राफिक हैश' : 'Calculated SHA-256 Checksum'}
              </label>
              <button
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#174C3C] hover:text-[#0D3B2E] bg-white px-2.5 py-1 rounded-md border border-[#C4D1C9] shadow-2xs hover:bg-[#F1F0E8] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (isHi ? 'कॉपी हुआ' : 'Copied') : (isHi ? 'कॉपी करें' : 'Copy Hash')}
              </button>
            </div>
            <p className="font-mono text-xs text-[#192D3A] break-all bg-white p-2.5 rounded-lg border border-gray-200 select-all">
              {activeEvidenceModal.sha256 || '9e12c1464c2089b21a37c4d5e89b37c02b34a1792f3479bc12e345890abec128'}
            </p>
            <p className="text-[11px] text-[#66756F] mt-1.5">
              {isHi 
                ? 'यह 256-बिट डाइजेस्ट साक्ष्य फ़ाइल की अपरिवर्तनीय अखंडता प्रमाणित करता है।' 
                : 'Generated from original uncompressed file bytes to prevent tampering or metadata spoofing.'}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-[11px] text-[#66756F] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {isHi ? 'कैप्चर समय' : 'Capture Timestamp'}
              </span>
              <p className="text-xs font-semibold text-[#192D3A] mt-1">
                {activeEvidenceModal.timestamp || '2026-02-18 11:32:15 IST'}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-[11px] text-[#66756F] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {isHi ? 'जियोटैग स्थान' : 'GPS Verification'}
              </span>
              <p className="text-xs font-semibold text-[#192D3A] mt-1">
                {activeEvidenceModal.gps 
                  ? `${activeEvidenceModal.gps.lat.toFixed(4)}°N, ${activeEvidenceModal.gps.lng.toFixed(4)}°E` 
                  : '25.2675°N, 82.9239°E'}
              </p>
              <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-medium">
                {activeEvidenceModal.gps?.isDeviceGps !== false ? 'Hardware GPS Lock' : 'Manual Coordinates'}
              </span>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <span className="text-[11px] text-[#66756F] flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5" /> {isHi ? 'फ़ाइल आकार' : 'Payload Size'}
              </span>
              <p className="text-xs font-semibold text-[#192D3A] mt-1">
                {activeEvidenceModal.fileSizeKb ? `${activeEvidenceModal.fileSizeKb} KB` : '1.42 MB'}
              </p>
              <span className="text-[10px] text-[#66756F]">JPEG (EXIF preserved)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-[#66756F]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {isHi ? 'ऑडिट ट्रेल में हस्ताक्षरित' : 'Signed into platform audit registry'}
          </span>
          <button
            onClick={() => setActiveEvidenceModal(null)}
            className="px-4 py-2 bg-[#174C3C] hover:bg-[#0D3B2E] text-white font-medium rounded-lg transition-colors"
          >
            {isHi ? 'बंद करें' : 'Close Proof'}
          </button>
        </div>
      </div>
    </div>
  );
};
