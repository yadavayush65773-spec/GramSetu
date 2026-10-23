import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/formatters';
import { 
  Globe2, 
  Search, 
  HelpCircle, 
  CheckCircle2, 
  Send, 
  Building2, 
  FileCheck, 
  Users, 
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const PublicTransparencyPortal: React.FC = () => {
  const { schemes, submitGrievance, grievances, language, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'schemes' | 'grievance_file' | 'grievance_track'>('schemes');
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackedGrievance, setTrackedGrievance] = useState<any>(null);

  // Grievance Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [village, setVillage] = useState('Rohaniya');
  const [district, setDistrict] = useState('Varanasi');
  const [schemeName, setSchemeName] = useState('Pradhan Mantri Awas Yojana - Gramin');
  const [category, setCategory] = useState<any>('Delayed Installment');
  const [description, setDescription] = useState('');
  const [generatedId, setGeneratedId] = useState<string | null>(null);

  const isHi = language === 'hi';

  const handleSubmitGrievance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) {
      addToast(isHi ? 'कृपया आवश्यक विवरण भरें' : 'Please provide required fields', 'error');
      return;
    }

    const newTrackId = submitGrievance({
      citizenName: name,
      phoneMasked: phone ? `+91 ${phone.slice(0, 4)}••••${phone.slice(-2)}` : '+91 9839••••12',
      village,
      district,
      schemeName,
      category,
      description,
    });

    setGeneratedId(newTrackId);
    setName('');
    setDescription('');
    addToast(
      isHi ? `शिकायत दर्ज! संदर्भ संख्या: ${newTrackId}` : `Grievance Registered! Tracking ID: ${newTrackId}`,
      'success'
    );
  };

  const handleTrackGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackIdInput.trim()) return;

    const found = grievances.find(
      (g) => g.trackingId.toLowerCase() === trackIdInput.trim().toLowerCase()
    );
    if (found) {
      setTrackedGrievance(found);
      return;
    }

    // Query backend endpoint for tracking code
    try {
      const res = await fetch(`/api/grievances/${encodeURIComponent(trackIdInput.trim())}`);
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setTrackedGrievance({
          id: json.data.id || json.data.trackingCode,
          trackingId: json.data.trackingCode || json.data.trackingId,
          citizenName: json.data.citizenName || 'Citizen Complainant',
          phoneMasked: json.data.phoneMasked || 'XXXXXX0000',
          village: json.data.village || 'Panchayat Area',
          district: json.data.district || 'District Scope',
          schemeName: json.data.schemeName || 'Rural Development Scheme',
          category: json.data.category || 'General Grievance',
          description: json.data.description,
          status: json.data.status,
          submissionDate: json.data.createdAt ? json.data.createdAt.split('T')[0] : '2026-02-15',
          officerRemarks: json.data.officerRemarks,
        });
      } else {
        setTrackedGrievance('NOT_FOUND');
      }
    } catch (_) {
      setTrackedGrievance('NOT_FOUND');
    }
  };

  return (
    <div className="space-y-6">
      {/* Citizen Banner */}
      <div className="bg-linear-to-r from-[#174C3C] via-[#0D3B2E] to-[#174C3C] text-white rounded-2xl p-6 shadow-md border border-[#174C3C] relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-mono">
              Public Citizen Portal (जन मंच)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1.5">
              {isHi ? 'ग्रामसेतु जन पारदर्शिता मंच' : 'GramSetu Public Transparency Portal'}
            </h2>
            <p className="text-xs sm:text-sm text-[#C4D1C9] mt-1 max-w-2xl leading-relaxed">
              {isHi 
                ? 'प्रत्येक ग्रामीण नागरिक के लिए सरकारी योजनाओं के स्वीकृत बजट, ग्राम-स्तरीय कार्य प्रगति एवं पारदर्शी शिकायत निवारण की खुली सुविधा।'
                : 'Open public accountability portal for citizens: track sanctioned village outlays, project milestones, and lodge grievances.'}
            </p>
          </div>

          <div className="flex bg-[#0B3126] p-1 rounded-xl border border-[#174C3C] self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('schemes')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'schemes' ? 'bg-[#E99A36] text-[#0D3B2E]' : 'text-[#789B82] hover:text-white'
              }`}
            >
              {isHi ? 'योजनाएं व बजट' : 'Public Schemes'}
            </button>
            <button
              onClick={() => setActiveTab('grievance_file')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'grievance_file' ? 'bg-[#E99A36] text-[#0D3B2E]' : 'text-[#789B82] hover:text-white'
              }`}
            >
              {isHi ? 'शिकायत दर्ज करें' : 'Lodge Grievance'}
            </button>
            <button
              onClick={() => setActiveTab('grievance_track')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                activeTab === 'grievance_track' ? 'bg-[#E99A36] text-[#0D3B2E]' : 'text-[#789B82] hover:text-white'
              }`}
            >
              {isHi ? 'स्थिति देखें' : 'Track Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Public Schemes Directory */}
      {activeTab === 'schemes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((scheme) => {
            const pct = Math.round((scheme.completedProjects / scheme.targetBeneficiaries) * 100);

            return (
              <div key={scheme.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-2xs space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold bg-[#F7F6F0] text-[#174C3C] px-2 py-0.5 rounded border border-gray-200">
                    {scheme.code}
                  </span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Active Programme
                  </span>
                </div>

                <h3 className="font-bold text-sm text-[#0D3B2E] line-clamp-1">{scheme.name}</h3>
                <p className="text-xs text-[#66756F] line-clamp-2 leading-relaxed">{scheme.description}</p>

                <div className="p-3 bg-[#F7F6F0] rounded-xl border border-gray-200 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#66756F]">Public Budget Outlay:</span>
                    <span className="font-bold font-mono text-[#0D3B2E]">{formatINR(scheme.allocatedBudget, true)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#66756F]">Rural Work Completed:</span>
                    <span className="font-bold font-mono text-[#23865B]">{pct}% ({scheme.completedProjects} works)</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#23865B] h-full rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                <p className="text-[11px] text-[#66756F]">Nodal Officer: {scheme.responsibleOfficer}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Lodge Grievance Form */}
      {activeTab === 'grievance_file' && (
        <div className="bg-white rounded-2xl border border-[#C4D1C9] p-6 shadow-2xs max-w-2xl mx-auto space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="font-bold text-base text-[#0D3B2E]">
              {isHi ? 'नागरिक शिकायत निवारण पंजीकरण' : 'Citizen Grievance Submission'}
            </h3>
            <p className="text-xs text-[#66756F]">
              Directly report delayed installment, poor masonry, contractor issues or exclusion from list.
            </p>
          </div>

          {generatedId && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1">
              <p className="font-bold text-emerald-900 text-sm">
                Grievance Successfully Registered!
              </p>
              <p className="text-[#192D3A]">
                Your statutory reference number is: <strong className="font-mono text-emerald-800 text-sm">{generatedId}</strong>
              </p>
              <p className="text-gray-500 text-[11px]">Keep this ID to monitor resolution progress in the Track Status tab.</p>
            </div>
          )}

          <form onSubmit={handleSubmitGrievance} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Citizen Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Mobile Contact</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9839000000"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Village</label>
                <input
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">District</label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="Varanasi">Varanasi</option>
                  <option value="Prayagraj">Prayagraj</option>
                  <option value="Gorakhpur">Gorakhpur</option>
                  <option value="Mirzapur">Mirzapur</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Scheme</label>
                <select
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  {schemes.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Grievance Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                >
                  <option value="Delayed Installment">Delayed Installment</option>
                  <option value="Inspection Irregularity">Inspection Irregularity</option>
                  <option value="Application Grievance">Application Grievance</option>
                  <option value="Corrupt Practice Allegation">Corrupt Practice Allegation</option>
                </select>
              </div>
            </div>

            <div>
              <label className="font-bold text-[#192D3A] block mb-1">Detailed Grievance Narrative *</label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your issue with dates, house location, or inspection details..."
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Submit Grievance to District Portal
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Track Status */}
      {activeTab === 'grievance_track' && (
        <div className="bg-white rounded-2xl border border-[#C4D1C9] p-6 shadow-2xs max-w-xl mx-auto space-y-4">
          <div>
            <h3 className="font-bold text-base text-[#0D3B2E]">Track Existing Grievance</h3>
            <p className="text-xs text-[#66756F]">Enter your tracking code (e.g. GRV-2026-UP-0881)</p>
          </div>

          <form onSubmit={handleTrackGrievance} className="flex gap-2">
            <input
              type="text"
              value={trackIdInput}
              onChange={(e) => setTrackIdInput(e.target.value)}
              placeholder="GRV-2026-UP-0881"
              className="flex-1 p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-xs uppercase"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#174C3C] text-white rounded-xl text-xs font-bold"
            >
              Track
            </button>
          </form>

          {trackedGrievance && trackedGrievance !== 'NOT_FOUND' && (
            <div className="p-4 bg-[#F7F6F0] rounded-xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-mono font-bold text-[#0D3B2E]">{trackedGrievance.trackingId}</span>
                <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  {trackedGrievance.status}
                </span>
              </div>
              <p className="font-semibold text-[#192D3A]">{trackedGrievance.category} • {trackedGrievance.schemeName}</p>
              <p className="text-[#66756F]">{trackedGrievance.description}</p>
              {trackedGrievance.officerRemarks && (
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-[11px] text-[#174C3C]">
                  <strong>Action by Department:</strong> {trackedGrievance.officerRemarks}
                </div>
              )}
            </div>
          )}

          {trackedGrievance === 'NOT_FOUND' && (
            <p className="text-xs text-red-600 text-center py-4">No grievance found for this reference code.</p>
          )}
        </div>
      )}
    </div>
  );
};
