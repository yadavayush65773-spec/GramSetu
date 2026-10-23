import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/formatters';
import { 
  WifiOff, 
  Wifi, 
  RefreshCw, 
  HardDrive, 
  Search, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Check, 
  X, 
  Database,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';

export const OfflineWorkspace: React.FC = () => {
  const { 
    isOfflineSimulated, 
    toggleSimulatedOffline, 
    offlineSyncQueue, 
    triggerOfflineSync, 
    isSyncing,
    beneficiaries, 
    inspections,
    language,
    setActivePage,
    addToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCachedBeneficiary, setSelectedCachedBeneficiary] = useState<any>(null);
  const [conflictModalOpen, setConflictModalOpen] = useState(false);

  const isHi = language === 'hi';

  const cachedBeneficiaries = beneficiaries.filter(
    (b) =>
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.beneficiaryCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono ${
              isOfflineSimulated ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {isOfflineSimulated ? 'Offline Workspace Active' : 'Online / Connected to Central State Node'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'ऑफलाइन फील्ड वर्कस्पेस एवं डाटा समन्वय' : 'Offline Field Workspace & Synchronization Engine'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'दूरस्थ ग्रामीण अंचलों में बिना इंटरनेट के निरीक्षण रिकॉर्ड करें व बाद में सर्वर पर सिंक करें' : 'Conduct field inspections with local browser IndexedDB storage and seamless synchronization'}
          </p>
        </div>

        {/* Big Offline Toggle Button */}
        <button
          onClick={toggleSimulatedOffline}
          className={`
            flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs transition-all border
            ${isOfflineSimulated 
              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 ring-2 ring-amber-300' 
              : 'bg-white hover:bg-gray-50 text-[#174C3C] border-gray-300'}
          `}
        >
          {isOfflineSimulated ? (
            <>
              <WifiOff className="w-4 h-4" />
              <span>Simulated Offline Mode: ON</span>
            </>
          ) : (
            <>
              <Wifi className="w-4 h-4 text-emerald-600" />
              <span>Simulate Rural Offline Drop</span>
            </>
          )}
        </button>
      </div>

      {/* Sync Status Banner */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${offlineSyncQueue.length > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {offlineSyncQueue.length > 0 ? `${offlineSyncQueue.length} Unsynchronized Records Pending` : 'Local IndexedDB Cache In Sync'}
              </h3>
              <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded font-mono text-gray-600">
                IndexedDB v1
              </span>
            </div>
            <p className="text-xs text-[#66756F] mt-0.5">
              {offlineSyncQueue.length > 0
                ? 'Inspections or verification edits captured offline are securely encrypted in client storage.'
                : 'All 35 local beneficiary dossiers and ground maps are cached for offline field traversal.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={triggerOfflineSync}
            disabled={isSyncing || offlineSyncQueue.length === 0 || isOfflineSimulated}
            className="flex items-center gap-2 px-4 py-2 bg-[#174C3C] hover:bg-[#0D3B2E] disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Synchronizing...' : 'Push Sync to Central Server'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Workspace: Left = Queue, Right = Offline Search */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unsynchronized Queue */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-[#0D3B2E] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#174C3C]" />
              Local Change Queue ({offlineSyncQueue.length})
            </h3>
            <span className="text-[10px] text-gray-500">Auto-syncs upon reconnect</span>
          </div>

          {offlineSyncQueue.length > 0 ? (
            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {offlineSyncQueue.map((item) => (
                <div key={item.id} className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#192D3A]">
                      {item.type === 'inspection_draft' ? 'Field Inspection Capture' : 'Verification Update'}
                    </span>
                    <span className="text-[10px] font-mono bg-white px-1.5 py-0.5 rounded border border-amber-300 text-amber-800">
                      Local Queue
                    </span>
                  </div>
                  <p className="text-[#66756F] text-[11px]">
                    Record: <strong>{item.payload?.inspectionCode || item.recordId}</strong> • For: {item.payload?.beneficiaryName || 'Beneficiary'}
                  </p>
                  <span className="text-[10px] text-gray-400 block">Created: {item.createdOfflineAt.slice(0, 19)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-gray-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-75" />
              <p className="font-semibold text-gray-600">No pending unsynchronized records.</p>
              <p className="text-[11px] max-w-xs mx-auto">
                Toggle simulated offline mode above, submit an inspection in the Field Inspections module, and see it populate this local cache.
              </p>
            </div>
          )}

          {/* Test conflict button */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#66756F]">Simulate server sync conflict:</span>
            <button
              onClick={() => setConflictModalOpen(true)}
              className="text-xs text-[#174C3C] hover:underline font-bold"
            >
              Test Conflict Resolution
            </button>
          </div>
        </div>

        {/* Offline Permitted Beneficiary Lookup */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-[#0D3B2E] flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#174C3C]" />
              Offline Permitted Beneficiary Cache (35 Records)
            </h3>
            <p className="text-xs text-[#66756F] mt-0.5">
              Available instantly without internet during village door-to-door inspections.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-[#66756F] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cached village records..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F6F0] border border-gray-200 rounded-xl"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {cachedBeneficiaries.slice(0, 6).map((b) => (
              <div
                key={b.id}
                onClick={() => setSelectedCachedBeneficiary(b)}
                className="p-2.5 rounded-xl border border-gray-200 hover:border-[#174C3C] hover:bg-[#F7F6F0] cursor-pointer flex items-center justify-between text-xs transition-colors"
              >
                <div>
                  <p className="font-bold text-[#192D3A]">{b.fullName} ({b.village})</p>
                  <span className="text-[10px] text-[#66756F] font-mono">{b.beneficiaryCode} • {b.schemeName.slice(0, 20)}...</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#23865B] bg-emerald-50 px-2 py-0.5 rounded">
                    {b.verificationStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Conflict Resolution Modal Simulator */}
      {conflictModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-300 overflow-hidden text-xs">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Sync Conflict Detected (Record #GS-BEN-2026-1004)
              </h3>
              <button onClick={() => setConflictModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-[#66756F] leading-relaxed">
                The local inspector tablet updated milestone to <strong>"Lintel Complete"</strong> while the district server recorded <strong>"Correction Requested"</strong> from an office review.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">Local Field Version</span>
                  <p className="text-[11px] text-[#192D3A]">Status: Lintel & Roof Casting</p>
                  <span className="text-[10px] text-gray-500">Inspector R. K. Singh</span>
                </div>

                <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
                  <span className="font-bold text-sky-900 block mb-1">Central Server Version</span>
                  <p className="text-[11px] text-[#192D3A]">Status: Name Correction Pending</p>
                  <span className="text-[10px] text-gray-500">BDO Office Desk</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setConflictModalOpen(false);
                    addToast('Resolved with Server authoritative state.', 'info');
                  }}
                  className="px-3.5 py-2 border border-gray-300 rounded-xl font-semibold"
                >
                  Accept Server Version
                </button>
                <button
                  onClick={() => {
                    setConflictModalOpen(false);
                    addToast('Field evidence merged successfully!', 'success');
                  }}
                  className="px-3.5 py-2 bg-[#174C3C] text-white rounded-xl font-bold"
                >
                  Keep Field Evidence & Merge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
