import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FieldInspection, InspectionStatus } from '../types';
import { formatDate, getInspectionStatusBadge } from '../utils/formatters';
import { computeSHA256, truncateHash } from '../utils/crypto';
import { 
  ClipboardCheck, 
  Search, 
  Filter, 
  Plus, 
  MapPin, 
  Camera, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  X, 
  Eye, 
  Calendar, 
  Check, 
  Smartphone,
  UploadCloud,
  FileCheck2
} from 'lucide-react';

export const FieldInspections: React.FC = () => {
  const { 
    inspections, 
    beneficiaries, 
    schemes, 
    addInspection, 
    language, 
    setActiveEvidenceModal, 
    isOfflineSimulated,
    addToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedInspection, setSelectedInspection] = useState<FieldInspection | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState('');
  const [stage, setStage] = useState<FieldInspection['stage']>('Foundation');
  const [inspectorName, setInspectorName] = useState('Suresh Chandra (BDO Sevapuri)');
  const [observations, setObservations] = useState('');
  const [correctiveActions, setCorrectiveActions] = useState('');
  const [statusFinding, setStatusFinding] = useState<InspectionStatus>('Passed');
  const [deviceGpsActive, setDeviceGpsActive] = useState(true);
  const [customLat, setCustomLat] = useState('25.2675');
  const [customLng, setCustomLng] = useState('82.9239');
  const [isHashingPhoto, setIsHashingPhoto] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<{
    id: string;
    caption: string;
    timestamp: string;
    fileSizeKb: number;
    sha256Hash: string;
    thumbnailUrl: string;
  }[]>([]);

  const [checklistItems, setChecklistItems] = useState<{
    item: string;
    status: 'Pass' | 'Fail' | 'NA';
    comment?: string;
  }[]>([
    { item: 'Foundation depth >= 1 meter on consolidated soil', status: 'Pass', comment: '' },
    { item: 'Plinth height >= 45 cm above road datum level', status: 'Pass', comment: '' },
    { item: 'First-class brick masonry with 1:6 cement ratio', status: 'Pass', comment: '' },
    { item: 'Physical presence of beneficiary with scheme registration ID', status: 'Pass', comment: '' },
  ]);

  const isHi = language === 'hi';

  const filteredInspections = inspections.filter((i) => {
    const matchesSearch = 
      i.beneficiaryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.inspectionCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.schemeName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSimulatePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsHashingPhoto(true);
    try {
      const buffer = await file.arrayBuffer();
      const hash = await computeSHA256(buffer);
      const newPhoto = {
        id: `PH-${Date.now()}`,
        caption: file.name || 'Site Field Inspection Proof',
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        fileSizeKb: Math.round(file.size / 1024),
        sha256Hash: hash,
        thumbnailUrl: URL.createObjectURL(file),
      };
      setUploadedPhotos((prev) => [...prev, newPhoto]);
      addToast(
        isHi ? `फोटो अपलोड हुई व SHA-256 हैश सुरक्षित हुआ (${truncateHash(hash, 6)})` : `Photo uploaded with cryptographic SHA-256 seal!`,
        'success'
      );
    } catch (err) {
      console.error(err);
    } finally {
      setIsHashingPhoto(false);
    }
  };

  const handleCaptureDeviceLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomLat(pos.coords.latitude.toFixed(5));
          setCustomLng(pos.coords.longitude.toFixed(5));
          setDeviceGpsActive(true);
          addToast(isHi ? 'डिवाइस हार्डवेयर GPS लॉक प्राप्त हुआ' : 'Hardware GPS coordinates acquired!', 'success');
        },
        () => {
          addToast('Could not retrieve hardware GPS, using regional demo coordinates.', 'warning');
        }
      );
    }
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    const ben = beneficiaries.find((b) => b.id === selectedBeneficiaryId) || beneficiaries[0];

    const photosToSubmit = uploadedPhotos.length > 0 ? uploadedPhotos : [
      {
        id: `PH-${Date.now()}`,
        caption: `${stage} stage execution evidence for ${ben.fullName}`,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
        fileSizeKb: 1340,
        sha256Hash: '9e12c1464c2089b21a37c4d5e89b37c02b34a1792f3479bc12e345890abec128',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861564?auto=format&fit=crop&w=400&q=80',
      }
    ];

    await addInspection({
      beneficiaryId: ben.id,
      beneficiaryName: ben.fullName,
      schemeId: ben.schemeId,
      schemeName: ben.schemeName,
      village: ben.village,
      block: ben.block,
      district: ben.district,
      scheduledDate: new Date().toISOString().split('T')[0],
      completedDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      inspectorName,
      status: statusFinding,
      stage,
      gpsLocation: {
        lat: parseFloat(customLat) || ben.coordinates.lat,
        lng: parseFloat(customLng) || ben.coordinates.lng,
        accuracyMeters: deviceGpsActive ? 4.2 : 15.0,
        isDeviceGps: deviceGpsActive,
      },
      checklist: checklistItems,
      evidencePhotos: photosToSubmit,
      observations: observations || 'All standard specifications complied with on ground.',
      correctiveActionsRequired: correctiveActions || undefined,
      syncedFromServer: !isOfflineSimulated,
    });

    setIsFormOpen(false);
    setUploadedPhotos([]);
    setObservations('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'स्थलीय निरीक्षण व साक्ष्य प्रमाणीकरण' : 'Field Inspection & Verification Workspace'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'ऑफलाइन अनुकूल निरीक्षण फॉर्म, डिवाइस जियोटैगिंग व SHA-256 फोटो हैशिंग' : 'Offline-ready field inspections with device GPS lock & cryptographic photo hashes'}
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedBeneficiaryId(beneficiaries[0]?.id || '');
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isHi ? 'नया निरीक्षण दर्ज करें' : 'Record Field Inspection'}</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-[#66756F]">Total Visits</span>
          <p className="text-xl font-black text-[#0D3B2E] mt-0.5">{inspections.length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Passed</span>
          <p className="text-xl font-black text-emerald-800 mt-0.5">{inspections.filter(i => i.status === 'Passed').length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-amber-700">Needs Work</span>
          <p className="text-xl font-black text-amber-800 mt-0.5">{inspections.filter(i => i.status === 'Needs Improvement').length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-red-700">Failed / Fraud</span>
          <p className="text-xl font-black text-red-800 mt-0.5">{inspections.filter(i => i.status === 'Failed').length}</p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-gray-200">
          <span className="text-[10px] uppercase font-bold text-rose-700">Overdue</span>
          <p className="text-xl font-black text-rose-800 mt-0.5">{inspections.filter(i => i.status === 'Overdue').length}</p>
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
              placeholder={isHi ? 'निरीक्षण कोड, लाभार्थी या ग्राम खोजें...' : 'Search inspection code, beneficiary or village...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F6F0] border border-gray-200 rounded-xl text-[#192D3A] focus:outline-hidden"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F6F0] border border-gray-200 text-[#174C3C] font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
          >
            <option value="All">{isHi ? 'सभी निरीक्षण स्थिति' : 'All Inspection Status'}</option>
            <option value="Passed">Passed (उत्तीर्ण)</option>
            <option value="Needs Improvement">Needs Improvement (सुधार आवश्यक)</option>
            <option value="Failed">Failed (अमान्य/धोखाधड़ी)</option>
            <option value="Scheduled">Scheduled (नियोजित)</option>
            <option value="Overdue">Overdue (विलंबित)</option>
          </select>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F6F0] text-[#174C3C] border-b border-gray-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Inspection Code</th>
                <th className="py-3 px-4">Beneficiary & Scheme</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Milestone Stage</th>
                <th className="py-3 px-4">GPS Verification</th>
                <th className="py-3 px-4">Evidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInspections.map((insp) => {
                const badge = getInspectionStatusBadge(insp.status);

                return (
                  <tr key={insp.id} className="hover:bg-[#F7F6F0]/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#174C3C]">
                      {insp.inspectionCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#192D3A]">{insp.beneficiaryName}</p>
                      <span className="text-[10px] text-[#66756F] line-clamp-1">{insp.schemeName}</span>
                    </td>
                    <td className="py-3.5 px-4 text-[#66756F]">
                      <p className="font-medium text-[#192D3A]">{insp.village}</p>
                      <span className="text-[10px]">{insp.block}, {insp.district}</span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#192D3A]">
                      {insp.stage}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        insp.gpsLocation.isDeviceGps ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        <MapPin className="w-3 h-3" />
                        {insp.gpsLocation.isDeviceGps ? 'Device GPS Lock' : 'Manual Coords'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {insp.evidencePhotos.length > 0 ? (
                        <button
                          onClick={() => {
                            const p = insp.evidencePhotos[0];
                            setActiveEvidenceModal({
                              photoUrl: p.thumbnailUrl,
                              sha256: p.sha256Hash,
                              caption: p.caption,
                              timestamp: p.timestamp,
                              fileSizeKb: p.fileSizeKb,
                              gps: insp.gpsLocation,
                            });
                          }}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#174C3C] bg-[#F7F6F0] px-2 py-1 rounded-md border border-gray-200 hover:bg-[#EFECE3]"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-[#23865B]" />
                          <span>{insp.evidencePhotos.length} Photo (SHA)</span>
                        </button>
                      ) : (
                        <span className="text-gray-400 text-[10px]">No photos</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                        {insp.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedInspection(insp)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Inspection Modal Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-300 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-bold">
                  {isOfflineSimulated ? 'Offline Workspace Capture' : 'Online Inspection Capture'}
                </span>
                <h3 className="font-bold text-sm mt-0.5">
                  {isHi ? 'नया स्थलीय निरीक्षण व साक्ष्य दर्ज करें' : 'Record Field Inspection & Capture Cryptographic Proof'}
                </h3>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitInspection} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Beneficiary & Scheme Select */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#192D3A] block mb-1">Select Beneficiary *</label>
                  <select
                    value={selectedBeneficiaryId}
                    onChange={(e) => setSelectedBeneficiaryId(e.target.value)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {beneficiaries.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.fullName} ({b.village} - {b.schemeName.slice(0, 15)}...)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-[#192D3A] block mb-1">Milestone Stage *</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    <option value="Foundation">Foundation & Trench</option>
                    <option value="Plinth Level">Plinth Level</option>
                    <option value="Lintel & Roof Casting">Lintel & Roof Casting</option>
                    <option value="Pipeline Installation">Pipeline Installation</option>
                    <option value="Solar Panel Mounting">Solar Panel Mounting</option>
                    <option value="Final Handover">Final Handover</option>
                  </select>
                </div>
              </div>

              {/* GPS Coordinates Section */}
              <div className="p-3.5 bg-[#F7F6F0] rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0D3B2E] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#174C3C]" />
                    Geotag Coordinates Lock
                  </span>
                  <button
                    type="button"
                    onClick={handleCaptureDeviceLocation}
                    className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-[#174C3C] border border-gray-300 rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    Lock Device GPS
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-gray-500 block">Latitude</label>
                    <input
                      type="text"
                      value={customLat}
                      onChange={(e) => {
                        setCustomLat(e.target.value);
                        setDeviceGpsActive(false);
                      }}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block">Longitude</label>
                    <input
                      type="text"
                      value={customLng}
                      onChange={(e) => {
                        setCustomLng(e.target.value);
                        setDeviceGpsActive(false);
                      }}
                      className="w-full p-2 bg-white border border-gray-200 rounded-lg font-mono text-xs"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className={`w-2 h-2 rounded-full ${deviceGpsActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[#66756F]">
                    {deviceGpsActive ? 'Device Hardware Sensor GPS (High Precision ±4m)' : 'Manual coordinate entry (Flagged for verification)'}
                  </span>
                </div>
              </div>

              {/* Photo Evidence with Automatic Real SHA-256 Hashing */}
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-[#192D3A] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#174C3C]" />
                    Upload Ground Evidence Photos
                  </label>
                  <label className="cursor-pointer px-3 py-1 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Browse & Calculate SHA-256</span>
                    <input type="file" accept="image/*" onChange={handleSimulatePhotoUpload} className="hidden" />
                  </label>
                </div>

                {uploadedPhotos.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    {uploadedPhotos.map((p) => (
                      <div key={p.id} className="p-2 bg-white rounded-lg border border-gray-200 flex items-center justify-between text-[11px]">
                        <span className="font-medium text-[#192D3A] truncate max-w-[200px]">{p.caption}</span>
                        <span className="font-mono text-[#23865B] text-[10px]">SHA-256: {truncateHash(p.sha256Hash, 8)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {uploadedPhotos.length === 0 && (
                  <p className="text-[11px] text-[#66756F]">
                    Selecting a photo triggers an immediate WebCrypto SHA-256 hash calculation to ensure tamper resistance.
                  </p>
                )}
              </div>

              {/* Checklist */}
              <div>
                <label className="font-bold text-[#192D3A] block mb-1.5">
                  Inspection Checklist Evaluation
                </label>
                <div className="space-y-2">
                  {checklistItems.map((item, idx) => (
                    <div key={idx} className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between gap-3">
                      <span className="text-[#192D3A] font-medium text-[11px] flex-1">{item.item}</span>
                      <div className="flex gap-1 shrink-0">
                        {(['Pass', 'Fail', 'NA'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => {
                              const next = [...checklistItems];
                              next[idx].status = st;
                              setChecklistItems(next);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                              item.status === st 
                                ? st === 'Pass' ? 'bg-[#23865B] text-white border-[#23865B]' 
                                  : st === 'Fail' ? 'bg-[#C64242] text-white border-[#C64242]' 
                                  : 'bg-gray-400 text-white border-gray-400'
                                : 'bg-white text-gray-700 border-gray-200'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Outcome */}
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Final Inspection Outcome</label>
                <select
                  value={statusFinding}
                  onChange={(e) => setStatusFinding(e.target.value as any)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-semibold"
                >
                  <option value="Passed">Passed (अनुमोदन योग्य)</option>
                  <option value="Needs Improvement">Needs Improvement (सुधार आवश्यक)</option>
                  <option value="Failed">Failed (अमान्य / विसंगति)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Observations & Notes</label>
                <textarea
                  rows={2}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Record masonry quality, foundation depth, and beneficiary statements..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#174C3C] text-white rounded-xl font-bold shadow-2xs"
                >
                  Submit Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspection Detail Modal */}
      {selectedInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-gray-300 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-bold">
                  {selectedInspection.inspectionCode}
                </span>
                <h3 className="font-bold text-sm mt-0.5">
                  Inspection Details: {selectedInspection.beneficiaryName}
                </h3>
              </div>
              <button onClick={() => setSelectedInspection(null)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#F7F6F0] p-3 rounded-xl border border-gray-200">
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Village & Block</span>
                  <p className="font-semibold text-[#192D3A]">{selectedInspection.village}, {selectedInspection.block}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Inspection Stage</span>
                  <p className="font-semibold text-[#192D3A]">{selectedInspection.stage}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Inspector</span>
                  <p className="font-semibold text-[#192D3A] truncate">{selectedInspection.inspectorName}</p>
                </div>
                <div>
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">Completed On</span>
                  <p className="font-semibold text-[#192D3A]">{selectedInspection.completedDate || selectedInspection.scheduledDate}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0D3B2E] mb-1.5">Observations & Remarks</h4>
                <p className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[#192D3A] leading-relaxed">
                  {selectedInspection.observations}
                </p>
              </div>

              {selectedInspection.evidencePhotos.length > 0 && (
                <div>
                  <h4 className="font-bold text-[#0D3B2E] mb-1.5">Photographic Evidence</h4>
                  <div className="space-y-2">
                    {selectedInspection.evidencePhotos.map((p) => (
                      <div key={p.id} className="p-3 rounded-xl border border-gray-200 flex items-center justify-between bg-white">
                        <div>
                          <p className="font-semibold text-[#192D3A]">{p.caption}</p>
                          <span className="text-[10px] font-mono text-gray-500">SHA-256: {truncateHash(p.sha256Hash, 14)}</span>
                        </div>
                        <button
                          onClick={() => {
                            setActiveEvidenceModal({
                              photoUrl: p.thumbnailUrl,
                              sha256: p.sha256Hash,
                              caption: p.caption,
                              timestamp: p.timestamp,
                              gps: selectedInspection.gpsLocation,
                            });
                          }}
                          className="px-2.5 py-1 bg-[#174C3C] text-white rounded-lg text-xs font-bold"
                        >
                          View Proof
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedInspection(null)}
                className="px-4 py-2 bg-[#174C3C] text-white rounded-xl text-xs font-bold"
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
