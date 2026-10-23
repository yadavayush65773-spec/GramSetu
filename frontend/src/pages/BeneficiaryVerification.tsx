import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Beneficiary, VerificationStatus } from '../types';
import { formatINR, formatDate, getVerificationStatusBadge, getRiskColorClass } from '../utils/formatters';
import { truncateHash } from '../utils/crypto';
import { 
  UserCheck, 
  Search, 
  Filter, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Check, 
  X, 
  Clock, 
  User, 
  MapPin, 
  Eye, 
  Building,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';

export const BeneficiaryVerification: React.FC = () => {
  const { 
    beneficiaries, 
    verifyBeneficiary, 
    selectedDistrict, 
    language, 
    setActiveEvidenceModal, 
    currentRole,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);

  // Verification Workflow State
  const [workflowModalOpen, setWorkflowModalOpen] = useState(false);
  const [checklistState, setChecklistState] = useState<{ id: string; met: boolean }[]>([]);
  const [decision, setDecision] = useState<VerificationStatus>('Verified');
  const [decisionReason, setDecisionReason] = useState('');

  const isHi = language === 'hi';

  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesDistrict = selectedDistrict === 'All' || b.district === selectedDistrict;
    const matchesSearch = 
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.beneficiaryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.schemeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.verificationStatus === statusFilter;
    return matchesDistrict && matchesSearch && matchesStatus;
  });

  const openWorkflow = (b: Beneficiary) => {
    setSelectedBeneficiary(b);
    setChecklistState(b.eligibilityChecklist.map((c) => ({ id: c.id, met: c.met })));
    setDecision(b.verificationStatus === 'Flagged' ? 'Flagged' : 'Verified');
    setDecisionReason('');
    setWorkflowModalOpen(true);
  };

  const submitWorkflowDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBeneficiary) return;

    if ((decision === 'Rejected' || decision === 'Correction Requested' || decision === 'Flagged') && !decisionReason.trim()) {
      addToast(isHi ? 'अस्वीकृति या संशोधन हेतु अनिवार्य कारण दर्ज करें।' : 'Mandatory justification reason required.', 'error');
      return;
    }

    verifyBeneficiary(
      selectedBeneficiary.id,
      decision,
      decisionReason || 'Eligibility checklist verified by statutory officer',
      checklistState
    );

    setWorkflowModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'लाभार्थी पात्रता सत्यापन पंजिका' : 'Beneficiary Verification Register'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? '9-चरणीय पात्रता सत्यापन, डुप्लिकेट दावा चेतावनी व क्रिप्टोग्राफिक साक्ष्य जांच' : '9-step statutory eligibility checklist, duplicate claim detection & proof audit'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-50 text-amber-800 px-3 py-1 rounded-xl border border-amber-200 font-semibold">
            {beneficiaries.filter((b) => b.verificationStatus === 'Pending' || b.verificationStatus === 'Under Review').length} Pending Actions
          </span>
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
              placeholder={isHi ? 'लाभार्थी नाम, कोड या ग्राम खोजें...' : 'Search by citizen name, code or village...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F6F0] border border-gray-200 rounded-xl text-[#192D3A] focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F6F0] border border-gray-200 text-[#174C3C] font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
          >
            <option value="All">{isHi ? 'सभी स्थिति (All Status)' : 'All Verification Status'}</option>
            <option value="Verified">Verified (सत्यापित)</option>
            <option value="Under Review">Under Review (समीक्षाधीन)</option>
            <option value="Pending">Pending (लंबित)</option>
            <option value="Flagged">Flagged (संदिग्ध)</option>
            <option value="Correction Requested">Correction Requested</option>
            <option value="Rejected">Rejected (अस्वीकृत)</option>
          </select>
        </div>
      </div>

      {/* Beneficiaries Table */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F6F0] text-[#174C3C] border-b border-gray-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Village & Block</th>
                <th className="py-3 px-4">Scheme</th>
                <th className="py-3 px-4">Application Date</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Workflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBeneficiaries.map((b) => {
                const statusBadge = getVerificationStatusBadge(b.verificationStatus);
                const riskBadge = getRiskColorClass(b.riskSeverity);

                return (
                  <tr key={b.id} className="hover:bg-[#F7F6F0]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#174C3C]/10 text-[#174C3C] font-bold flex items-center justify-center shrink-0 text-xs">
                          {b.fullName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#192D3A]">{isHi ? b.fullNameHi : b.fullName}</p>
                          <span className="text-[10px] font-mono text-[#789B82]">{b.beneficiaryCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#66756F]">
                      <p className="font-medium text-[#192D3A]">{b.village}</p>
                      <span className="text-[10px]">{b.block}, {b.district}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#192D3A] line-clamp-1">{b.schemeName}</p>
                      <span className="text-[10px] text-[#66756F]">Inst #{b.currentInstallmentNo} of {b.totalInstallments}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#66756F] whitespace-nowrap">
                      {formatDate(b.applicationDate)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${riskBadge.badge}`}>
                          {b.riskScore}/100 {b.riskSeverity}
                        </span>
                        {b.riskFlags.length > 0 && (
                          <span title={b.riskFlags.join(', ')}>
                            <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                        {b.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedBeneficiary(b)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => openWorkflow(b)}
                          className="px-2.5 py-1 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-lg text-xs font-bold shadow-2xs"
                        >
                          Verify
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Beneficiary Profile Modal */}
      {selectedBeneficiary && !workflowModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-300 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-bold">
                  {selectedBeneficiary.beneficiaryCode}
                </span>
                <h3 className="font-bold text-base mt-1">
                  {isHi ? selectedBeneficiary.fullNameHi : selectedBeneficiary.fullName}
                </h3>
              </div>
              <button onClick={() => setSelectedBeneficiary(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Duplicate or Risk Warning Banner if flagged */}
              {selectedBeneficiary.riskFlags.length > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800">
                  <div className="flex items-center gap-2 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Risk Anomaly Detected ({selectedBeneficiary.riskScore}/100)</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {selectedBeneficiary.notes || 'Automated cross-record audit detected duplicate evidence references.'}
                  </p>
                </div>
              )}

              {/* Personal Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F7F6F0] p-3.5 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Village & Block</span>
                  <p className="font-semibold text-[#192D3A] mt-0.5">{selectedBeneficiary.village}, {selectedBeneficiary.block}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Age & Gender</span>
                  <p className="font-semibold text-[#192D3A] mt-0.5">{selectedBeneficiary.age} yrs • {selectedBeneficiary.gender}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Contact</span>
                  <p className="font-mono text-[#192D3A] mt-0.5">{selectedBeneficiary.phoneMasked}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Assigned Officer</span>
                  <p className="font-semibold text-[#192D3A] mt-0.5 truncate">{selectedBeneficiary.assignedOfficer}</p>
                </div>
              </div>

              {/* Eligibility Checklist */}
              <div>
                <h4 className="font-bold text-[#0D3B2E] mb-2">{isHi ? 'पात्रता मानक चेकलिस्ट' : 'Statutory Eligibility Criteria'}</h4>
                <div className="space-y-1.5">
                  {selectedBeneficiary.eligibilityChecklist.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg border border-gray-200 flex items-center justify-between bg-gray-50">
                      <span className="text-[#192D3A]">{c.criterion}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.met ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {c.met ? 'Met' : 'Unmet'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents with Cryptographic Hashes */}
              <div>
                <h4 className="font-bold text-[#0D3B2E] mb-2">{isHi ? 'जमा किए गए साक्ष्य व दस्तावेज' : 'Submitted Evidence & Documents'}</h4>
                <div className="space-y-2">
                  {selectedBeneficiary.documents.map((doc) => (
                    <div key={doc.id} className="p-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white">
                      <div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#174C3C]" />
                          <span className="font-bold text-[#192D3A]">{doc.docType}</span>
                          <span className="text-[10px] font-mono bg-gray-100 px-1.5 py-0.2 rounded text-gray-600">
                            {doc.docNumberMasked}
                          </span>
                        </div>
                        <p className="text-[10px] font-mono text-[#66756F] mt-1">
                          SHA-256: {truncateHash(doc.sha256Hash, 14)}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setActiveEvidenceModal({
                            photoUrl: doc.docType === 'Field Geo-Photo' 
                              ? 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=400&q=80'
                              : 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=400&q=80',
                            sha256: doc.sha256Hash,
                            caption: `${doc.docType} for ${selectedBeneficiary.fullName}`,
                            timestamp: doc.uploadedDate,
                            gps: { lat: selectedBeneficiary.coordinates.lat, lng: selectedBeneficiary.coordinates.lng, isDeviceGps: true }
                          });
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#174C3C] hover:text-[#0D3B2E] bg-[#F7F6F0] px-2.5 py-1.5 rounded-lg border border-gray-200"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Proof</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => setSelectedBeneficiary(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => openWorkflow(selectedBeneficiary)}
                className="px-4 py-2 bg-[#174C3C] text-white rounded-xl text-xs font-bold"
              >
                Proceed to Verification Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9-Step Verification Workflow Modal */}
      {workflowModalOpen && selectedBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-gray-300 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-bold">
                  Statutory Step-by-Step Verification
                </span>
                <h3 className="font-bold text-sm mt-0.5">
                  Verifying: {selectedBeneficiary.fullName} ({selectedBeneficiary.beneficiaryCode})
                </h3>
              </div>
              <button onClick={() => setWorkflowModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={submitWorkflowDecision} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Step indicator */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-900 leading-relaxed">
                Step 1 of 9: Please review the checklist criteria and inspect evidence integrity hashes prior to signing your decision.
              </div>

              {/* Checklist */}
              <div>
                <label className="font-bold text-[#192D3A] block mb-2">
                  1. Statutory Eligibility Verification Criteria
                </label>
                <div className="space-y-2">
                  {selectedBeneficiary.eligibilityChecklist.map((c) => {
                    const current = checklistState.find((item) => item.id === c.id)?.met ?? c.met;
                    return (
                      <div
                        key={c.id}
                        onClick={() => {
                          setChecklistState((prev) =>
                            prev.map((item) =>
                              item.id === c.id ? { ...item, met: !item.met } : item
                            )
                          );
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-colors ${
                          current ? 'bg-emerald-50/70 border-emerald-300' : 'bg-red-50/50 border-red-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 ${current ? 'bg-[#23865B] text-white' : 'bg-gray-200'}`}>
                          {current && <Check className="w-3 h-3" />}
                        </div>
                        <span className="flex-1 text-[#192D3A] font-medium">{c.criterion}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Decision selection */}
              <div>
                <label className="font-bold text-[#192D3A] block mb-2">
                  2. Authorized Verification Finding
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: 'Verified', label: 'Approve & Verify', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
                    { val: 'Correction Requested', label: 'Request Correction', color: 'border-purple-400 bg-purple-50 text-purple-900' },
                    { val: 'Flagged', label: 'Flag for Audit', color: 'border-amber-500 bg-amber-50 text-amber-900' },
                    { val: 'Rejected', label: 'Reject Application', color: 'border-red-500 bg-red-50 text-red-900' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setDecision(opt.val as VerificationStatus)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                        decision === opt.val ? opt.color + ' ring-2 ring-emerald-700' : 'bg-gray-50 border-gray-200 text-gray-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mandatory Reason */}
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">
                  3. Field Inspector Remarks / Mandatory Reason *
                </label>
                <textarea
                  required={decision !== 'Verified'}
                  rows={2}
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder={decision === 'Verified' ? 'e.g. Ground inspection confirmed kutcha hut and genuine family roster' : 'Specify exact non-compliance or document anomaly...'}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              {/* Signing info */}
              <div className="p-3 bg-[#F7F6F0] rounded-xl border border-gray-200 text-[11px] text-[#66756F]">
                Signing as: <strong className="text-[#192D3A]">{currentRole}</strong> • Timestamp: <span className="font-mono">{new Date().toISOString().slice(0, 19)}</span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setWorkflowModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#174C3C] text-white rounded-xl font-bold shadow-2xs"
                >
                  Sign & Record in Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
