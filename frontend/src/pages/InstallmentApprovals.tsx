import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Installment, InstallmentStatus } from '../types';
import { formatINR, formatDate, getInstallmentStatusBadge } from '../utils/formatters';
import { 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ArrowRight, 
  Check, 
  X, 
  ShieldCheck, 
  FileCheck2, 
  Eye, 
  DollarSign,
  Building2,
  Landmark
} from 'lucide-react';

export const InstallmentApprovals: React.FC = () => {
  const { 
    installments, 
    approveInstallment, 
    rejectInstallment, 
    language, 
    selectedDistrict, 
    setActiveEvidenceModal, 
    currentRole,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  
  // Action Modals
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [actionReason, setActionReason] = useState('');

  const isHi = language === 'hi';

  const filteredInstallments = installments.filter((inst) => {
    const matchesDistrict = selectedDistrict === 'All' || inst.district === selectedDistrict;
    const matchesSearch = 
      inst.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.schemeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.village.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inst.status === statusFilter;
    return matchesDistrict && matchesSearch && matchesStatus;
  });

  // Financial Stats
  const totalAmount = filteredInstallments.reduce((acc, i) => acc + i.amount, 0);
  const disbursedAmount = filteredInstallments.filter(i => i.status === 'Disbursed').reduce((acc, i) => acc + i.amount, 0);
  const pendingAmount = filteredInstallments.filter(i => i.status === 'Pending Approval').reduce((acc, i) => acc + i.amount, 0);

  const handleApprove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallment) return;
    approveInstallment(selectedInstallment.id, actionReason || 'All milestone inspection criteria and photo hashes verified');
    setIsApproveOpen(false);
    setSelectedInstallment(null);
    setActionReason('');
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstallment || !actionReason.trim()) {
      addToast(isHi ? 'अस्वीकृति का कारण अनिवार्य है।' : 'Rejection reason is mandatory.', 'error');
      return;
    }
    rejectInstallment(selectedInstallment.id, actionReason);
    setIsRejectOpen(false);
    setSelectedInstallment(null);
    setActionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'किश्त प्रत्यक्ष लाभ अंतरण (DBT) व अनुमोदन' : 'Installment Approvals & Disbursement Register'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'भौतिक निरीक्षण, SHA-256 साक्ष्य व वित्तीय आवंटन आधारित चरणबद्ध स्वीकृति' : 'Milestone-based stage tranches with statutory verification and audit trail'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-[#174C3C] text-white px-3 py-1.5 rounded-xl shadow-xs">
            Total Value: {formatINR(totalAmount)}
          </span>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-[#66756F]">Pending Approval</span>
          <p className="text-xl font-black text-amber-700 mt-1 font-mono">{formatINR(pendingAmount)}</p>
          <span className="text-[10px] text-amber-800 font-semibold">
            {installments.filter(i => i.status === 'Pending Approval').length} Tranches Awaiting Signature
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Disbursed (DBT)</span>
          <p className="text-xl font-black text-emerald-800 mt-1 font-mono">{formatINR(disbursedAmount)}</p>
          <span className="text-[10px] text-emerald-800 font-semibold">
            {installments.filter(i => i.status === 'Disbursed').length} Credited to Beneficiaries
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-[#0D3B2E]">Approved</span>
          <p className="text-xl font-black text-[#0D3B2E] mt-1 font-mono">
            {installments.filter(i => i.status === 'Approved').length}
          </p>
          <span className="text-[10px] text-[#23865B] font-semibold">Pending Bank Push</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-red-700">Rejected / Returned</span>
          <p className="text-xl font-black text-red-800 mt-1 font-mono">
            {installments.filter(i => i.status === 'Rejected' || i.status === 'On Hold').length}
          </p>
          <span className="text-[10px] text-red-700 font-semibold">Flagged Anomalies</span>
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
              placeholder={isHi ? 'लाभार्थी, योजना या ग्राम खोजें...' : 'Search beneficiary name, scheme or village...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F6F0] border border-gray-200 rounded-xl text-[#192D3A] focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F6F0] border border-gray-200 text-[#174C3C] font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
          >
            <option value="All">{isHi ? 'सभी किश्त स्थिति' : 'All Installment Status'}</option>
            <option value="Pending Approval">Pending Approval (अनुमोदन प्रतीक्षारत)</option>
            <option value="Approved">Approved (स्वीकृत)</option>
            <option value="Disbursed">Disbursed (बैंक अंतरित)</option>
            <option value="On Hold">On Hold (रोकी गई)</option>
            <option value="Rejected">Rejected (अस्वीकृत)</option>
          </select>
        </div>
      </div>

      {/* Installments Table */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F6F0] text-[#174C3C] border-b border-gray-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Scheme & Village</th>
                <th className="py-3 px-4">Installment #</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Prerequisites Met</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Approval Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInstallments.map((inst) => {
                const badge = getInstallmentStatusBadge(inst.status);
                const prereqsPassed = 
                  inst.prerequisitesMet.physicalMilestoneVerified && 
                  inst.prerequisitesMet.photoEvidenceShaVerified && 
                  inst.prerequisitesMet.blockOfficerEndorsement;

                return (
                  <tr key={inst.id} className="hover:bg-[#F7F6F0]/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#192D3A]">{inst.beneficiaryName}</p>
                      <span className="text-[10px] font-mono text-[#789B82]">ID: {inst.beneficiaryId}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-[#192D3A] line-clamp-1">{inst.schemeName}</p>
                      <span className="text-[10px] text-[#66756F]">{inst.village}, {inst.district}</span>
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-[#0D3B2E]">
                      Tranche #{inst.installmentNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold font-mono text-sm text-[#0D3B2E]">
                      {formatINR(inst.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        prereqsPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {prereqsPassed ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                        {prereqsPassed ? 'All 4 Checks Passed' : 'Incomplete / Defect'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {inst.status}
                      </span>
                      {inst.disbursementRef && (
                        <p className="text-[9px] font-mono text-gray-500 mt-0.5">{inst.disbursementRef}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {inst.status === 'Pending Approval' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedInstallment(inst);
                              setIsApproveOpen(true);
                            }}
                            className="px-2.5 py-1 bg-[#23865B] hover:bg-[#1b6b48] text-white rounded-lg text-xs font-bold shadow-2xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedInstallment(inst);
                              setIsRejectOpen(true);
                            }}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedInstallment(inst)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                        >
                          Details
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approval Confirmation Modal */}
      {isApproveOpen && selectedInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-300 overflow-hidden">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Authorize Installment Disbursement ({formatINR(selectedInstallment.amount)})
              </h3>
              <button onClick={() => setIsApproveOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApprove} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-2">
                <p className="font-bold text-emerald-900">
                  Beneficiary: {selectedInstallment.beneficiaryName} (Tranche #{selectedInstallment.installmentNumber})
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  By authorizing, you certify that physical field inspection report has been verified and cryptographic photo hash is tamper-free.
                </p>
              </div>

              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Authorization Notes / Reference</label>
                <input
                  type="text"
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="e.g. Lintel stage inspection certified by BDO Sevapuri"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="p-3 bg-[#F7F6F0] rounded-xl border border-gray-200 text-[11px] text-[#66756F]">
                Approving Officer: <strong className="text-[#192D3A]">{currentRole}</strong> • Mode: Simulated Direct Benefit Transfer (DBT)
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsApproveOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#23865B] hover:bg-[#1b6b48] text-white rounded-xl font-bold shadow-2xs"
                >
                  Confirm & Approve Disbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectOpen && selectedInstallment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-300 overflow-hidden">
            <div className="px-6 py-4 bg-[#C64242] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Reject / Return Installment Claim
              </h3>
              <button onClick={() => setIsRejectOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReject} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Mandatory Rejection Reason *</label>
                <textarea
                  required
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="State non-compliance, photo hash mismatch or missing milestone..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRejectOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C64242] hover:bg-[#a53232] text-white rounded-xl font-bold shadow-2xs"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Installment Detail Modal */}
      {selectedInstallment && !isApproveOpen && !isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-300 overflow-hidden text-xs">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Installment #{selectedInstallment.installmentNumber} Details
              </h3>
              <button onClick={() => setSelectedInstallment(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-2 bg-[#F7F6F0] p-3.5 rounded-xl border border-gray-200">
                <div className="flex justify-between">
                  <span className="text-[#66756F]">Beneficiary</span>
                  <span className="font-bold text-[#192D3A]">{selectedInstallment.beneficiaryName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66756F]">Scheme</span>
                  <span className="font-bold text-[#192D3A]">{selectedInstallment.schemeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66756F]">Tranche Amount</span>
                  <span className="font-mono font-bold text-[#0D3B2E]">{formatINR(selectedInstallment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#66756F]">Status</span>
                  <span className="font-bold">{selectedInstallment.status}</span>
                </div>
                {selectedInstallment.disbursementRef && (
                  <div className="flex justify-between">
                    <span className="text-[#66756F]">PFMS Reference</span>
                    <span className="font-mono text-[10px] text-[#23865B]">{selectedInstallment.disbursementRef}</span>
                  </div>
                )}
                {selectedInstallment.rejectionReason && (
                  <div className="pt-2 border-t border-red-200 text-red-700">
                    <span className="font-bold block">Rejection Justification:</span>
                    <p className="mt-0.5">{selectedInstallment.rejectionReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedInstallment(null)}
                className="px-4 py-2 bg-[#174C3C] text-white rounded-xl font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
