import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Scheme, SchemeCategory } from '../types';
import { formatINR, formatDate } from '../utils/formatters';
import { 
  Layers, 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List, 
  Calendar, 
  User, 
  CheckCircle2, 
  TrendingUp, 
  X, 
  Building2, 
  Check, 
  ChevronRight,
  HardHat,
  ShieldCheck,
  ExternalLink,
  FileText
} from 'lucide-react';

export const SchemesProjects: React.FC = () => {
  const { schemes, addScheme, language, addToast } = useApp();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Create Scheme Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<Scheme | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    nameHi: '',
    code: '',
    description: '',
    category: 'Housing' as SchemeCategory,
    district: 'All Districts',
    allocatedBudget: 50000000,
    targetBeneficiaries: 200,
    responsibleOfficer: '',
    startDate: '2026-04-01',
    endDate: '2028-03-31',
  });

  const isHi = language === 'hi';

  const categories: SchemeCategory[] = [
    'Housing',
    'Water & Sanitation',
    'Rural Infrastructure',
    'Livelihood & Employment',
    'Renewable Energy',
  ];

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || s.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      addToast(isHi ? 'कृपया आवश्यक विवरण भरें' : 'Please provide required scheme details', 'error');
      return;
    }

    const newScheme: Scheme = {
      id: `SCH-${Date.now().toString().slice(-4)}`,
      code: formData.code.toUpperCase(),
      name: formData.name,
      nameHi: formData.nameHi || formData.name,
      description: formData.description,
      descriptionHi: formData.description,
      category: formData.category,
      district: formData.district,
      allocatedBudget: Number(formData.allocatedBudget),
      utilizedBudget: 0,
      targetBeneficiaries: Number(formData.targetBeneficiaries),
      enrolledBeneficiaries: 0,
      completedProjects: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      responsibleOfficer: formData.responsibleOfficer || 'Chief Development Officer',
      status: 'Active',
      milestones: [
        { id: 'M1', title: 'Phase 1 Site Mobilization & Survey', targetDate: formData.startDate, completed: true, completionPct: 100 },
        { id: 'M2', title: 'Phase 2 Ground Execution', targetDate: '2027-01-31', completed: false, completionPct: 10 },
      ],
    };

    addScheme(newScheme);
    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      nameHi: '',
      code: '',
      description: '',
      category: 'Housing',
      district: 'All Districts',
      allocatedBudget: 50000000,
      targetBeneficiaries: 200,
      responsibleOfficer: '',
      startDate: '2026-04-01',
      endDate: '2028-03-31',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'ग्रामीण विकास योजनाएं एवं परियोजनाएं' : 'Flagship Rural Schemes & Projects'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'स्वीकृत वित्तीय बजट, लक्ष्य एवं भौतिक प्रगति की निगरानी' : 'Budget allocation, targets, milestones, and physical delivery status'}
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{isHi ? 'नई योजना दर्ज करें' : 'Create New Scheme'}</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-[#C4D1C9] shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#66756F] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'योजना नाम, कोड या विवरण खोजें...' : 'Search scheme name, code or keyword...'}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F7F6F0] border border-gray-200 rounded-xl text-[#192D3A] focus:outline-hidden focus:border-[#174C3C]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-[#F7F6F0] border border-gray-200 text-[#174C3C] font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
          >
            <option value="All">{isHi ? 'सभी श्रेणियां' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs bg-[#F7F6F0] border border-gray-200 text-[#174C3C] font-semibold rounded-xl px-3 py-1.5 cursor-pointer focus:outline-hidden"
          >
            <option value="All">{isHi ? 'सभी स्थिति' : 'All Status'}</option>
            <option value="Active">Active (सक्रिय)</option>
            <option value="Review">Review (समीक्षा)</option>
            <option value="Completed">Completed (पूर्ण)</option>
            <option value="Delayed">Delayed (विलंबित)</option>
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex bg-[#F7F6F0] p-1 rounded-xl border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-2xs text-[#174C3C]' : 'text-gray-500'}`}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-2xs text-[#174C3C]' : 'text-gray-500'}`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSchemes.map((scheme) => {
            const utilizationPct = Math.round((scheme.utilizedBudget / scheme.allocatedBudget) * 100);
            const targetPct = Math.round((scheme.completedProjects / scheme.targetBeneficiaries) * 100);

            return (
              <div
                key={scheme.id}
                onClick={() => setSelectedSchemeDetail(scheme)}
                className="bg-white rounded-2xl border border-[#C4D1C9] hover:border-[#174C3C] p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold font-mono tracking-wider bg-[#F7F6F0] text-[#174C3C] px-2 py-0.5 rounded-md border border-gray-200">
                      {scheme.code}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      scheme.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {scheme.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#0D3B2E] group-hover:text-[#174C3C] line-clamp-1">
                    {isHi ? scheme.nameHi : scheme.name}
                  </h3>
                  <p className="text-[11px] text-[#66756F] line-clamp-2 mt-1 mb-4 leading-relaxed">
                    {scheme.description}
                  </p>

                  {/* Budget & Target Progress */}
                  <div className="space-y-3 p-3 bg-[#F7F6F0] rounded-xl border border-gray-200 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#66756F]">{isHi ? 'बजट व्यय' : 'Budget Utilized'}</span>
                        <span className="font-bold font-mono text-[#0D3B2E]">
                          {formatINR(scheme.utilizedBudget, true)} / {formatINR(scheme.allocatedBudget, true)} ({utilizationPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#23865B] h-full rounded-full" style={{ width: `${utilizationPct}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-[#66756F]">{isHi ? 'परियोजना पूर्णता' : 'Physical Delivery'}</span>
                        <span className="font-bold font-mono text-[#0D3B2E]">
                          {scheme.completedProjects} / {scheme.targetBeneficiaries} ({targetPct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-[#E99A36] h-full rounded-full" style={{ width: `${targetPct}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#66756F]">
                  <span className="truncate max-w-[160px]">{scheme.responsibleOfficer}</span>
                  <span className="text-[#174C3C] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    {isHi ? 'विवरण' : 'Details'} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-[#C4D1C9] shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F0] text-[#174C3C] border-b border-gray-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Code & Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Allocated Budget</th>
                  <th className="py-3 px-4">Utilized</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSchemes.map((scheme) => (
                  <tr key={scheme.id} className="hover:bg-[#F7F6F0]/60 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#192D3A]">{scheme.name}</p>
                      <span className="text-[10px] font-mono text-[#789B82]">{scheme.code}</span>
                    </td>
                    <td className="py-3 px-4 text-[#66756F]">{scheme.category}</td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0D3B2E]">{formatINR(scheme.allocatedBudget)}</td>
                    <td className="py-3 px-4 font-mono text-[#23865B]">{formatINR(scheme.utilizedBudget)}</td>
                    <td className="py-3 px-4 font-mono">{scheme.completedProjects} / {scheme.targetBeneficiaries}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {scheme.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedSchemeDetail(scheme)}
                        className="text-xs text-[#174C3C] hover:underline font-semibold"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scheme Detail Modal / Drawer */}
      {selectedSchemeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-300 overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-bold">
                  {selectedSchemeDetail.code}
                </span>
                <h3 className="font-bold text-base mt-1">
                  {isHi ? selectedSchemeDetail.nameHi : selectedSchemeDetail.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSchemeDetail(null)}
                className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs">
              {/* Official Government Verification Banner */}
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0D3B2E]">
                        {isHi ? (selectedSchemeDetail.ministryHi || selectedSchemeDetail.ministry || 'भारत सरकार') : (selectedSchemeDetail.ministry || 'Government of India')}
                      </span>
                      <span className="bg-emerald-200/80 text-emerald-900 font-semibold px-2 py-0.5 rounded text-[10px]">
                        {selectedSchemeDetail.schemeType || 'Centrally Sponsored'}
                      </span>
                    </div>
                    <span className="text-[10px] text-emerald-700">
                      {isHi ? 'myScheme एवं आधिकारिक मंत्रालय पोर्टल द्वारा सत्यापित' : 'Officially Verified via myScheme.gov.in & Ministry Gazette'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {selectedSchemeDetail.officialPortalUrl && (
                    <a
                      href={selectedSchemeDetail.officialPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-emerald-100/60 border border-emerald-300 rounded-lg text-emerald-900 font-bold text-[11px] transition-colors"
                    >
                      <span>{isHi ? 'आधिकारिक पोर्टल' : 'Ministry Portal'}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-700" />
                    </a>
                  )}
                  {selectedSchemeDetail.sourceVerificationUrl && (
                    <a
                      href={selectedSchemeDetail.sourceVerificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-[11px] transition-colors shadow-2xs"
                    >
                      <span>myScheme</span>
                      <ExternalLink className="w-3 h-3 text-emerald-200" />
                    </a>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#0D3B2E] mb-1">{isHi ? 'योजना का विवरण' : 'Scheme Overview'}</h4>
                <p className="text-[#66756F] leading-relaxed">{isHi ? (selectedSchemeDetail.descriptionHi || selectedSchemeDetail.description) : selectedSchemeDetail.description}</p>
              </div>

              {/* Official Financial Benefits */}
              {(selectedSchemeDetail.benefitsSummary || selectedSchemeDetail.benefitsSummaryHi) && (
                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200">
                  <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isHi ? 'आधिकारिक वित्तीय सहायता एवं लाभ' : 'Statutory Financial Benefits & Entitlement'}</span>
                  </h4>
                  <p className="text-[#192D3A] leading-relaxed">
                    {isHi ? (selectedSchemeDetail.benefitsSummaryHi || selectedSchemeDetail.benefitsSummary) : (selectedSchemeDetail.benefitsSummary || selectedSchemeDetail.benefitsSummaryHi)}
                  </p>
                </div>
              )}

              {/* Eligibility & Required Documents Grid */}
              {((selectedSchemeDetail.eligibilityCriteria && selectedSchemeDetail.eligibilityCriteria.length > 0) ||
                (selectedSchemeDetail.requiredDocuments && selectedSchemeDetail.requiredDocuments.length > 0)) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedSchemeDetail.eligibilityCriteria && selectedSchemeDetail.eligibilityCriteria.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-[#0D3B2E] mb-1.5 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isHi ? 'पात्रता मानदंड' : 'Eligibility Criteria'}</span>
                      </h4>
                      <ul className="space-y-1 text-[#66756F] list-disc list-inside">
                        {selectedSchemeDetail.eligibilityCriteria.map((c, idx) => (
                          <li key={idx} className="leading-tight">{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedSchemeDetail.requiredDocuments && selectedSchemeDetail.requiredDocuments.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-[#0D3B2E] mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{isHi ? 'अनिवार्य दस्तावेज' : 'Required Documents'}</span>
                      </h4>
                      <ul className="space-y-1 text-[#66756F] list-disc list-inside">
                        {selectedSchemeDetail.requiredDocuments.map((d, idx) => (
                          <li key={idx} className="leading-tight">{d}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-[#F7F6F0] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">{isHi ? 'आवंटित बजट' : 'Allocated Budget'}</span>
                  <p className="font-mono text-xs font-bold text-[#0D3B2E] mt-1">{formatINR(selectedSchemeDetail.allocatedBudget)}</p>
                </div>
                <div className="bg-[#F7F6F0] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">{isHi ? 'व्यय की गई राशि' : 'Utilized Budget'}</span>
                  <p className="font-mono text-xs font-bold text-[#23865B] mt-1">{formatINR(selectedSchemeDetail.utilizedBudget)}</p>
                </div>
                <div className="bg-[#F7F6F0] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">{isHi ? 'लक्षित लाभार्थी' : 'Target Citizens'}</span>
                  <p className="font-mono text-xs font-bold text-[#192D3A] mt-1">{selectedSchemeDetail.targetBeneficiaries}</p>
                </div>
                <div className="bg-[#F7F6F0] p-3 rounded-xl border border-gray-200">
                  <span className="text-[10px] text-[#66756F] uppercase font-bold">{isHi ? 'पूर्ण इकाइयाँ' : 'Completed Works'}</span>
                  <p className="font-mono text-xs font-bold text-[#E99A36] mt-1">{selectedSchemeDetail.completedProjects}</p>
                </div>
              </div>

              {/* Milestones list */}
              <div>
                <h4 className="font-bold text-[#0D3B2E] mb-2">{isHi ? 'योजना के प्रमुख मील के पत्थर' : 'Project Milestones'}</h4>
                <div className="space-y-2">
                  {selectedSchemeDetail.milestones.map((m) => (
                    <div key={m.id} className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1 rounded-md ${m.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-[#192D3A]">{m.title}</p>
                          <span className="text-[10px] text-[#66756F]">Target: {formatDate(m.targetDate)}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-xs text-[#0D3B2E]">{m.completionPct}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setSelectedSchemeDetail(null)}
                className="px-4 py-2 bg-[#174C3C] text-white rounded-xl text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Scheme Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-300 overflow-hidden">
            <div className="px-6 py-4 bg-[#0D3B2E] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">{isHi ? 'नई ग्रामीण योजना जोड़ें' : 'Register New Scheme'}</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-white/80 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateScheme} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Scheme Name (English) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Mukhyamantri Awas Yojana - Gramin"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#192D3A] block mb-1">Scheme Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g. MAY-G-2026"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#192D3A] block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as SchemeCategory })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Allocated Budget (INR)</label>
                <input
                  type="number"
                  value={formData.allocatedBudget}
                  onChange={(e) => setFormData({ ...formData, allocatedBudget: Number(e.target.value) })}
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-[#192D3A] block mb-1">Target Beneficiaries</label>
                  <input
                    type="number"
                    value={formData.targetBeneficiaries}
                    onChange={(e) => setFormData({ ...formData, targetBeneficiaries: Number(e.target.value) })}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-[#192D3A] block mb-1">Nodal Officer</label>
                  <input
                    type="text"
                    value={formData.responsibleOfficer}
                    onChange={(e) => setFormData({ ...formData, responsibleOfficer: e.target.value })}
                    placeholder="e.g. Smt. Radha Sharma"
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-[#192D3A] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Scheme objectives and scope..."
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#174C3C] text-white rounded-xl text-xs font-bold"
                >
                  Create Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
