import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { truncateHash } from '../utils/crypto';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  FileText, 
  Clock, 
  User, 
  Lock, 
  Eye, 
  Download, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint
} from 'lucide-react';

export const AuditTrail: React.FC = () => {
  const { auditLogs, language, setActiveEvidenceModal, addToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('All');

  const isHi = language === 'hi';

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesEntity = entityFilter === 'All' || log.targetEntity === entityFilter;
    return matchesSearch && matchesEntity;
  });

  const handleExportAuditCSV = () => {
    const headers = ['AuditID', 'Timestamp', 'Actor', 'ActorRole', 'Action', 'TargetEntity', 'TargetCode', 'PreviousValue', 'NewValue', 'Reason', 'SHA256EvidenceRef'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.timestamp,
      `"${l.actor}"`,
      `"${l.actorRole}"`,
      l.action,
      l.targetEntity,
      `"${l.targetCode}"`,
      `"${l.previousValue || ''}"`,
      `"${l.newValue || ''}"`,
      `"${l.reason || ''}"`,
      l.sha256EvidenceRef || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GramSetu_Cryptographic_Audit_Trail_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(isHi ? 'ऑडिट ट्रेल रिकॉर्ड डाउनलोड हो गया।' : 'Cryptographic Audit Log CSV Exported!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono flex items-center gap-1">
              <Fingerprint className="w-3.5 h-3.5" /> Immutable Audit Protocol
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'प्रशासनिक ऑडिट ट्रेल व डिजिटल साक्ष्य सत्यता' : 'Cryptographic Audit Trail & Evidence Integrity'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'प्रत्येक अनुमोदन, निरीक्षण व स्थिति परिवर्तन का हस्ताक्षरित एवं अपरिवर्तनीय डिजिटल लॉग' : 'Full tamper-evident chronology of all administrative decisions, stage approvals, and SHA-256 evidence records'}
          </p>
        </div>

        <button
          onClick={handleExportAuditCSV}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Log</span>
        </button>
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
              placeholder="Search by officer name, action keyword or reference ID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F6F0] border border-gray-200 rounded-xl text-[#192D3A] focus:outline-hidden"
            />
          </div>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="text-xs bg-[#F7F6F0] border border-gray-200 text-[#174C3C] font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
          >
            <option value="All">All Entity Types</option>
            <option value="Beneficiary">Beneficiary (लाभार्थी)</option>
            <option value="Inspection">Inspection (निरीक्षण)</option>
            <option value="Installment">Installment (किश्त)</option>
            <option value="RiskCase">Risk Anomaly Case (जोखिम)</option>
            <option value="Scheme">Scheme (योजना)</option>
            <option value="System">System Daemon (स्वचालित)</option>
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] p-6 shadow-2xs space-y-6">
        <div className="relative border-l-2 border-[#174C3C]/30 ml-4 space-y-6">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative pl-6 group">
              {/* Timeline marker */}
              <div className="absolute -left-2.5 top-1.5 w-5 h-5 rounded-full bg-[#174C3C] border-4 border-white shadow-xs flex items-center justify-center text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E99A36]" />
              </div>

              <div className="bg-[#F7F6F0]/80 group-hover:bg-[#F7F6F0] p-4 rounded-2xl border border-gray-200 transition-colors space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0D3B2E] text-xs sm:text-sm">{log.action}</span>
                    <span className="text-[10px] font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-[#174C3C] font-semibold">
                      {log.targetEntity}: {log.targetCode}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#66756F] flex items-center gap-1 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {log.timestamp}
                  </span>
                </div>

                <div className="text-xs text-[#192D3A] space-y-1">
                  <p className="font-medium text-[#66756F]">
                    Officer: <strong className="text-[#192D3A]">{log.actor}</strong> ({log.actorRole})
                  </p>
                  {log.previousValue && (
                    <div className="text-[11px] text-gray-500 font-mono">
                      <span>Previous: {log.previousValue}</span>
                    </div>
                  )}
                  {log.newValue && (
                    <div className="text-[11px] text-[#23865B] font-mono font-semibold">
                      <span>Updated: {log.newValue}</span>
                    </div>
                  )}
                  {log.reason && (
                    <p className="text-[11px] text-[#192D3A] bg-white p-2 rounded-lg border border-gray-200 mt-1">
                      Reason: {log.reason}
                    </p>
                  )}
                </div>

                {log.sha256EvidenceRef && (
                  <div className="pt-2 border-t border-gray-200/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono text-[#174C3C] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#23865B]" />
                      SHA-256 Digest: {truncateHash(log.sha256EvidenceRef, 12)}
                    </span>
                    <button
                      onClick={() => {
                        setActiveEvidenceModal({
                          photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=400&q=80',
                          sha256: log.sha256EvidenceRef,
                          caption: `Audit Proof Reference for ${log.targetCode}`,
                          timestamp: log.timestamp,
                        });
                      }}
                      className="text-xs font-bold text-[#174C3C] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect Hash Proof</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
