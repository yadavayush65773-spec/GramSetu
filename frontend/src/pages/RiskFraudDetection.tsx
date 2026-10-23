import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FraudRiskCase } from '../types';
import { getRiskColorClass } from '../utils/formatters';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  ArrowUpRight, 
  FileWarning, 
  X,
  FileText,
  BadgeAlert
} from 'lucide-react';

export const RiskFraudDetection: React.FC = () => {
  const { 
    riskCases, 
    updateRiskCaseStatus, 
    language, 
    selectedDistrict, 
    setActiveEvidenceModal, 
    currentRole,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [selectedCase, setSelectedCase] = useState<FraudRiskCase | null>(null);

  // Review Modal State
  const [actionStatus, setActionStatus] = useState<FraudRiskCase['status']>('Under Review');
  const [reviewNotes, setReviewNotes] = useState('');

  const isHi = language === 'hi';

  const filteredCases = riskCases.filter((c) => {
    const matchesDistrict = selectedDistrict === 'All' || c.district === selectedDistrict;
    const matchesSearch = 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.village.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === 'All' || c.severity === severityFilter;
    return matchesDistrict && matchesSearch && matchesSeverity;
  });

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase) return;
    if (!reviewNotes.trim()) {
      addToast(isHi ? 'समीक्षा टिप्पणी दर्ज करना अनिवार्य है।' : 'Officer review notes are mandatory.', 'error');
      return;
    }

    updateRiskCaseStatus(selectedCase.id, actionStatus, reviewNotes);
    setSelectedCase(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded font-mono">
              Integrity & Anti-Fraud Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'जोखिम एवं धोखाधड़ी विश्लेषिकी' : 'Explainable Risk & Fraud Intelligence'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'क्रिप्टोग्राफिक साक्ष्य दोहराव, जियोफेंसिंग विसंगति व अपात्रता संकेतों की पारदर्शी पहचान' : 'Deterministic anomaly detection: image hash collisions, geo-fence deviations, and duplicate claims'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-red-50 text-red-800 px-3 py-1.5 rounded-xl border border-red-200 font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <span>{riskCases.filter(r => r.severity === 'Critical').length} Critical Collision Flags</span>
          </span>
        </div>
      </div>

      {/* Explanatory Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">Transparent Demonstration Rules:</strong> GramSetu does not use opaque AI "black boxes" to judge citizen guilt. Every risk score (0-100) displays exact contributing factors, such as duplicate cryptographic SHA-256 photo hash collision, out-of-boundary GPS coordinates, and asset registry mismatches.
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#C4D1C9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#66756F] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'मामला कोड, लाभार्थी या विसंगति खोजें...' : 'Search case code, citizen name or anomaly factor...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F6F0] border border-gray-200 rounded-xl text-[#192D3A] focus:outline-hidden"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs bg-[#F7F6F0] border border-gray-200 text-[#174C3C] font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
          >
            <option value="All">{isHi ? 'सभी गंभीरता स्तर' : 'All Severities'}</option>
            <option value="Critical">Critical (गंभीर)</option>
            <option value="High">High (उच्च)</option>
            <option value="Medium">Medium (मध्यम)</option>
            <option value="Low">Low (सामान्य)</option>
          </select>
        </div>
      </div>

      {/* Risk Cases Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredCases.map((rc) => {
          const riskStyle = getRiskColorClass(rc.severity);

          return (
            <div
              key={rc.id}
              onClick={() => {
                setSelectedCase(rc);
                setActionStatus(rc.status);
                setReviewNotes(rc.reviewNotes || '');
              }}
              className="bg-white rounded-2xl border border-[#C4D1C9] hover:border-[#174C3C] p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold bg-[#F7F6F0] text-[#174C3C] px-2 py-0.5 rounded-md border border-gray-200">
                    {rc.caseCode}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskStyle.badge}`}>
                      Score {rc.riskScore}/100 • {rc.severity}
                    </span>
                    <span className="text-[10px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                      {rc.status}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#0D3B2E] group-hover:text-[#174C3C] line-clamp-1">
                  {isHi ? rc.titleHi : rc.title}
                </h3>
                <p className="text-[11px] text-[#66756F] mt-0.5 mb-3">
                  Target: <strong className="text-[#192D3A]">{rc.beneficiaryName}</strong> ({rc.village}, {rc.district}) • {rc.schemeName}
                </p>

                {/* Indicators Breakdown preview */}
                <div className="space-y-2 bg-[#F7F6F0] p-3 rounded-xl border border-gray-200 text-xs">
                  <p className="text-[10px] uppercase font-bold text-[#789B82] tracking-wider">
                    Contributing Factors ({rc.indicators.length})
                  </p>
                  {rc.indicators.map((ind, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-2">
                      <span className="text-[#192D3A] font-medium text-[11px] line-clamp-1">
                        • {ind.factor}
                      </span>
                      <span className="font-mono font-bold text-red-700 text-[11px] shrink-0">
                        +{ind.points} pts
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px]">
                <span className="text-[#66756F]">Flagged on: {rc.flagDate}</span>
                <span className="text-[#174C3C] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Investigate Anomaly <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Case Review and Action Drawer / Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-300 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-bold">
                  {selectedCase.caseCode}
                </span>
                <h3 className="font-bold text-base mt-1">
                  {isHi ? selectedCase.titleHi : selectedCase.title}
                </h3>
              </div>
              <button onClick={() => setSelectedCase(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReview} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Score bar */}
              <div className="bg-[#F7F6F0] p-4 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-[#0D3B2E]">Explainable Risk Score</span>
                  <span className="font-mono text-base font-black text-red-600">{selectedCase.riskScore} / 100</span>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#C64242] h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedCase.riskScore}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#66756F] mt-1.5">
                  Severity: <strong className="text-red-700">{selectedCase.severity}</strong> • Citizen: {selectedCase.beneficiaryName} ({selectedCase.village})
                </p>
              </div>

              {/* Detailed Breakdown with Evidence References */}
              <div>
                <h4 className="font-bold text-[#0D3B2E] mb-2">Factor-by-Factor Breakdown</h4>
                <div className="space-y-2">
                  {selectedCase.indicators.map((ind, i) => (
                    <div key={i} className="p-3 bg-red-50/50 rounded-xl border border-red-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900">{ind.factor}</span>
                        <span className="font-mono font-bold text-red-700">+{ind.points} pts</span>
                      </div>
                      <p className="text-[#192D3A] text-[11px] leading-relaxed">{ind.evidenceText}</p>
                      {ind.evidenceRef && (
                        <span className="inline-block text-[10px] font-mono text-[#174C3C] bg-white px-2 py-0.5 rounded border border-gray-200">
                          Ref: {ind.evidenceRef}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended statutory action */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed">
                <span className="font-bold block mb-0.5">Recommended Statutory Procedure:</span>
                {selectedCase.recommendedAction}
              </div>

              {/* Decision / Status Dropdown */}
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Update Case Investigation Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Under Review',
                    'Escalated',
                    'Resolved (False Positive)',
                    'Enforcement Initiated',
                  ].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setActionStatus(st as any)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        actionStatus === st 
                          ? 'bg-[#174C3C] text-white border-[#174C3C]' 
                          : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reviewer Notes */}
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">
                  Authorized Officer Notes & Justification *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Record verification findings, show cause notice dispatch number, or false positive resolution rationale..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#174C3C] text-white rounded-xl font-bold shadow-2xs"
                >
                  Record Decision in Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
