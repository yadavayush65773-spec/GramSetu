import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate, getRiskColorClass } from '../utils/formatters';
import { 
  Users, 
  Layers, 
  UserCheck, 
  ClipboardCheck, 
  CreditCard, 
  ShieldAlert, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  ArrowRight,
  Filter,
  Activity,
  Calendar,
  Building2,
  FileCheck2
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export const OverviewDashboard: React.FC = () => {
  const { 
    schemes, 
    beneficiaries, 
    inspections, 
    installments, 
    riskCases, 
    auditLogs, 
    selectedDistrict, 
    language,
    setActivePage,
    addToast
  } = useApp();

  const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | '1y'>('6m');
  const isHi = language === 'hi';

  // Apply District Filter to metrics
  const filteredBeneficiaries = selectedDistrict === 'All' 
    ? beneficiaries 
    : beneficiaries.filter((b) => b.district === selectedDistrict);

  const filteredInspections = selectedDistrict === 'All'
    ? inspections
    : inspections.filter((i) => i.district === selectedDistrict);

  const filteredInstallments = selectedDistrict === 'All'
    ? installments
    : installments.filter((i) => i.district === selectedDistrict);

  const filteredRisks = selectedDistrict === 'All'
    ? riskCases
    : riskCases.filter((r) => r.district === selectedDistrict);

  // Computed KPIs
  const totalBeneficiaries = filteredBeneficiaries.length;
  const activeSchemesCount = schemes.filter((s) => s.status === 'Active').length;
  const pendingVerifications = filteredBeneficiaries.filter(
    (b) => b.verificationStatus === 'Pending' || b.verificationStatus === 'Under Review'
  ).length;
  const completedInspections = filteredInspections.filter((i) => i.status === 'Passed').length;
  const pendingApprovals = filteredInstallments.filter((i) => i.status === 'Pending Approval').length;
  const criticalRiskCount = filteredRisks.filter((r) => r.severity === 'Critical' || r.severity === 'High').length;

  // Chart A: Scheme Implementation Trend (6 Months Planned vs Actual Completed)
  const implementationTrendData = [
    { month: 'Sep 2025', planned: 45, actual: 40 },
    { month: 'Oct 2025', planned: 70, actual: 64 },
    { month: 'Nov 2025', planned: 110, actual: 98 },
    { month: 'Dec 2025', planned: 160, actual: 145 },
    { month: 'Jan 2026', planned: 210, actual: 189 },
    { month: 'Feb 2026', planned: 260, actual: 238 },
  ];

  // Chart B: Beneficiary Verification Status Donut
  const verificationCounts = {
    Verified: filteredBeneficiaries.filter((b) => b.verificationStatus === 'Verified').length,
    Pending: filteredBeneficiaries.filter((b) => b.verificationStatus === 'Pending').length,
    'Under Review': filteredBeneficiaries.filter((b) => b.verificationStatus === 'Under Review').length,
    Flagged: filteredBeneficiaries.filter((b) => b.verificationStatus === 'Flagged').length,
    Rejected: filteredBeneficiaries.filter((b) => b.verificationStatus === 'Rejected').length,
  };

  const verificationStatusData = [
    { name: isHi ? 'सत्यापित (Verified)' : 'Verified', value: verificationCounts.Verified || 1, color: '#23865B' },
    { name: isHi ? 'समीक्षाधीन (Under Review)' : 'Under Review', value: verificationCounts['Under Review'] || 1, color: '#0284C7' },
    { name: isHi ? 'लंबित (Pending)' : 'Pending', value: verificationCounts.Pending || 1, color: '#D99220' },
    { name: isHi ? 'संदिग्ध (Flagged)' : 'Flagged', value: verificationCounts.Flagged || 1, color: '#C64242' },
  ];

  // Chart C: Installment Disbursement Grouped Bar
  const installmentDisbursementData = [
    {
      stage: 'Inst #1 (Plinth)',
      Disbursed: 140000,
      Approved: 40000,
      Pending: 80000,
    },
    {
      stage: 'Inst #2 (Roof/Pipes)',
      Disbursed: 104000,
      Approved: 40000,
      Pending: 80000,
    },
    {
      stage: 'Inst #3 (Final)',
      Disbursed: 80000,
      Approved: 20000,
      Pending: 40000,
    },
  ];

  // Chart D: District Performance Horizontal Bar
  const districtPerformanceData = [
    { district: 'Varanasi', completion: 82, target: 100 },
    { district: 'Prayagraj', completion: 74, target: 100 },
    { district: 'Mirzapur', completion: 69, target: 100 },
    { district: 'Gorakhpur', completion: 61, target: 100 },
  ];

  // Chart E: Risk Distribution
  const riskDistributionData = [
    { name: 'Low', count: filteredBeneficiaries.filter((b) => b.riskSeverity === 'Low').length, color: '#23865B' },
    { name: 'Medium', count: filteredBeneficiaries.filter((b) => b.riskSeverity === 'Medium').length, color: '#E99A36' },
    { name: 'High', count: filteredBeneficiaries.filter((b) => b.riskSeverity === 'High').length, color: '#D99220' },
    { name: 'Critical', count: filteredBeneficiaries.filter((b) => b.riskSeverity === 'Critical').length, color: '#C64242' },
  ];

  // Chart F: Inspection Outcomes Stacked
  const inspectionOutcomeData = [
    { block: 'Sevapuri', passed: 4, review: 1, failed: 1 },
    { block: 'Phulpur', passed: 3, review: 1, failed: 0 },
    { block: 'Karchhana', passed: 2, review: 0, failed: 0 },
    { block: 'Sahjanwa', passed: 1, review: 0, failed: 1 },
    { block: 'Chunar', passed: 3, review: 0, failed: 0 },
  ];

  // Chart G: Funnel Stages
  const funnelStages = [
    { stage: '1. Submitted', count: 35, pct: '100%', color: 'bg-stone-200' },
    { stage: '2. Under Verification', count: 28, pct: '80%', color: 'bg-blue-100' },
    { stage: '3. Verified', count: 22, pct: '63%', color: 'bg-emerald-100' },
    { stage: '4. Stage Approved', count: 18, pct: '51%', color: 'bg-amber-100' },
    { stage: '5. Completed Handover', count: 11, pct: '31%', color: 'bg-emerald-200' },
  ];

  const handleExportCSV = () => {
    const headers = ['BeneficiaryCode', 'Name', 'Village', 'District', 'Scheme', 'Status', 'RiskScore'];
    const rows = filteredBeneficiaries.map(b => [
      b.beneficiaryCode,
      `"${b.fullName}"`,
      b.village,
      b.district,
      `"${b.schemeName}"`,
      b.verificationStatus,
      b.riskScore
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GramSetu_Executive_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(isHi ? 'डैशबोर्ड रिपोर्ट सफलतापूर्वक डाउनलोड हुई!' : 'Executive Report CSV downloaded!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-linear-to-r from-[#0D3B2E] via-[#174C3C] to-[#0D3B2E] text-white rounded-2xl p-6 shadow-md border border-[#174C3C] relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#E99A36]/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-[#E99A36] text-[#0D3B2E] px-2 py-0.5 rounded font-mono">
                TechTrix'26 • PS-1
              </span>
              <span className="text-xs text-[#789B82] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isHi ? 'अंतिम समन्वयन: 3 मिनट पूर्व' : 'Last synchronized: 3 mins ago'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {isHi ? 'ग्रामसेतु एकीकृत कमांड सेंटर' : 'GramSetu Command Centre'}
            </h2>
            <p className="text-xs sm:text-sm text-[#C4D1C9] mt-1 max-w-2xl leading-relaxed">
              {isHi 
                ? 'ग्रामीण विकास योजनाओं, प्रत्यक्ष लाभ अंतरण (DBT) किश्तों, स्थलीय भौतिक निरीक्षणों एवं पारदर्शी धोखाधड़ी रोकथाम की समग्र निगरानी।'
                : 'State-wide administrative monitoring of rural infrastructure, beneficiary verification, GPS-tagged inspections, and explainable fraud detection.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Time Filter */}
            <div className="flex bg-[#0B3126] p-1 rounded-xl border border-[#174C3C]">
              {(['30d', '90d', '6m', '1y'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    timeRange === range ? 'bg-[#E99A36] text-[#0D3B2E]' : 'text-[#789B82] hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Export Report Button */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-[#0D3B2E] hover:bg-[#F7F6F0] rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 text-[#174C3C]" />
              <span>{isHi ? 'रिपोर्ट निर्यात करें' : 'Export Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 6 Prominent KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Card 1: Registered Beneficiaries */}
        <div 
          onClick={() => setActivePage('beneficiaries')}
          className="bg-white p-4 rounded-2xl border border-[#C4D1C9] hover:border-[#174C3C] shadow-2xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#66756F]">
              {isHi ? 'कुल पंजीकृत लाभार्थी' : 'Registered Beneficiaries'}
            </span>
            <div className="p-2 bg-emerald-50 text-[#23865B] rounded-xl group-hover:bg-[#23865B] group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0D3B2E]">{totalBeneficiaries}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#23865B] font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+14.2%</span>
            <span className="text-[10px] text-[#66756F] font-normal font-mono">(Demo base)</span>
          </div>
        </div>

        {/* Card 2: Active Schemes */}
        <div 
          onClick={() => setActivePage('schemes')}
          className="bg-white p-4 rounded-2xl border border-[#C4D1C9] hover:border-[#174C3C] shadow-2xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#66756F]">
              {isHi ? 'सक्रिय विकास योजनाएं' : 'Active Rural Schemes'}
            </span>
            <div className="p-2 bg-sky-50 text-sky-700 rounded-xl group-hover:bg-sky-600 group-hover:text-white transition-colors">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0D3B2E]">{activeSchemesCount}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-sky-700 font-semibold">
            <span>6 Flagships</span>
            <span className="text-[10px] text-[#66756F] font-normal">(PMAY-G, JJM...)</span>
          </div>
        </div>

        {/* Card 3: Pending Verifications */}
        <div 
          onClick={() => setActivePage('beneficiaries')}
          className="bg-white p-4 rounded-2xl border border-[#C4D1C9] hover:border-[#174C3C] shadow-2xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#66756F]">
              {isHi ? 'लंबित पात्रता सत्यापन' : 'Pending Verifications'}
            </span>
            <div className="p-2 bg-amber-50 text-[#D99220] rounded-xl group-hover:bg-[#D99220] group-hover:text-white transition-colors">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#D99220]">{pendingVerifications}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-amber-800 font-semibold">
            <Clock className="w-3 h-3" />
            <span>{isHi ? 'कार्यवाही अपेक्षित' : 'Action needed'}</span>
          </div>
        </div>

        {/* Card 4: Inspections Completed */}
        <div 
          onClick={() => setActivePage('inspections')}
          className="bg-white p-4 rounded-2xl border border-[#C4D1C9] hover:border-[#174C3C] shadow-2xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#66756F]">
              {isHi ? 'पूर्ण स्थलीय निरीक्षण' : 'Inspections Completed'}
            </span>
            <div className="p-2 bg-emerald-50 text-[#23865B] rounded-xl group-hover:bg-[#23865B] group-hover:text-white transition-colors">
              <ClipboardCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#0D3B2E]">{completedInspections}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#23865B] font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>94% SHA-256 Valid</span>
          </div>
        </div>

        {/* Card 5: Installments Awaiting Approval */}
        <div 
          onClick={() => setActivePage('installments')}
          className="bg-white p-4 rounded-2xl border border-[#C4D1C9] hover:border-[#174C3C] shadow-2xs hover:shadow-md cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#66756F]">
              {isHi ? 'किश्त अनुमोदन प्रतीक्षारत' : 'Pending Approvals'}
            </span>
            <div className="p-2 bg-purple-50 text-purple-700 rounded-xl group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-purple-800">{pendingApprovals}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-purple-700 font-semibold">
            <span>₹80,000 Total</span>
          </div>
        </div>

        {/* Card 6: High Risk Cases */}
        <div 
          onClick={() => setActivePage('risk_fraud')}
          className="bg-white p-4 rounded-2xl border border-red-200 hover:border-red-400 shadow-2xs hover:shadow-md cursor-pointer transition-all group bg-red-50/20"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-red-700">
              {isHi ? 'उच्च जोखिम मामले' : 'High-Risk Cases'}
            </span>
            <div className="p-2 bg-red-100 text-[#C64242] rounded-xl group-hover:bg-[#C64242] group-hover:text-white transition-colors animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#C64242]">{criticalRiskCount}</p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-[#C64242] font-semibold">
            <AlertTriangle className="w-3 h-3" />
            <span>{isHi ? 'तत्काल समीक्षा' : 'Immediate Audit'}</span>
          </div>
        </div>
      </div>

      {/* Row 1: Implementation Trend + Verification Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Implementation Trend (2 cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {isHi ? 'योजना क्रियान्वयन व भौतिक प्रगति (6 माह)' : 'Scheme Implementation & Milestone Velocity (6 Months)'}
              </h3>
              <p className="text-xs text-[#66756F]">
                {isHi ? 'नियोजित लक्ष्य बनाम वास्तविक पूर्ण निर्माण कार्य' : 'Planned targets vs ground completed milestones'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[#23865B] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              91.5% Efficiency
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={implementationTrendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0E8" />
                <XAxis dataKey="month" stroke="#66756F" fontSize={11} tickLine={false} />
                <YAxis stroke="#66756F" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D3B2E', color: '#fff', borderRadius: '0.75rem', fontSize: '12px', border: 'none' }} 
                  itemStyle={{ color: '#E99A36' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="planned" name={isHi ? 'नियोजित लक्ष्य' : 'Target Planned'} stroke="#789B82" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                <Line type="monotone" dataKey="actual" name={isHi ? 'वास्तविक पूर्ण' : 'Ground Completed'} stroke="#174C3C" strokeWidth={3} dot={{ r: 4, fill: '#E99A36' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Status Donut (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0D3B2E]">
              {isHi ? 'लाभार्थी सत्यापन स्थिति' : 'Beneficiary Verification Status'}
            </h3>
            <p className="text-xs text-[#66756F] mb-2">
              {isHi ? 'पंजीकृत आवेदनों का श्रेणीवार विभाजन' : 'Categorical distribution of claims'}
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verificationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {verificationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0D3B2E', color: '#fff', borderRadius: '0.75rem', fontSize: '11px', border: 'none' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Grid */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 text-xs">
            {verificationStatusData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-[#66756F] text-[11px] truncate">{item.name}:</span>
                <span className="font-bold text-[#192D3A] text-[11px]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Installment Disbursement + District Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Installment Disbursement */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {isHi ? 'किश्त प्रत्यक्ष लाभ अंतरण (INR)' : 'Installment Disbursement Flow (INR)'}
              </h3>
              <p className="text-xs text-[#66756F]">
                {isHi ? 'चरणबद्ध अनुमोदित, लंबित व अंतरित राशि' : 'Approved, pending and credited stage tranches'}
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0D3B2E]">₹5.82 Lakhs Total</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={installmentDisbursementData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0E8" />
                <XAxis dataKey="stage" stroke="#66756F" fontSize={11} tickLine={false} />
                <YAxis stroke="#66756F" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip 
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0D3B2E', color: '#fff', borderRadius: '0.75rem', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                <Bar dataKey="Disbursed" name={isHi ? 'अंतरित (Disbursed)' : 'Disbursed'} fill="#23865B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Approved" name={isHi ? 'स्वीकृत (Approved)' : 'Approved'} fill="#789B82" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Pending" name={isHi ? 'लंबित (Pending)' : 'Pending'} fill="#E99A36" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Performance Horizontal */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {isHi ? 'जनपदवार योजना पूर्णता दर' : 'District Scheme Completion Benchmark'}
              </h3>
              <p className="text-xs text-[#66756F]">
                {isHi ? 'चारों जनपदों का तुलनात्मक प्रदर्शन प्रतिशत' : 'Relative delivery velocity across participating districts'}
              </p>
            </div>
            <span className="text-xs text-[#789B82] font-semibold">Target: 100%</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                layout="vertical" 
                data={districtPerformanceData} 
                margin={{ top: 10, right: 20, left: 25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0E8" />
                <XAxis type="number" domain={[0, 100]} stroke="#66756F" fontSize={11} unit="%" />
                <YAxis dataKey="district" type="category" stroke="#192D3A" fontSize={11} fontWeight={600} tickLine={false} />
                <Tooltip 
                  formatter={(val: any) => [`${val}%`, 'Completion']}
                  contentStyle={{ backgroundColor: '#0D3B2E', color: '#fff', borderRadius: '0.75rem', fontSize: '11px', border: 'none' }}
                />
                <Bar dataKey="completion" name={isHi ? 'पूर्णता दर' : 'Completion Rate'} fill="#174C3C" radius={[0, 6, 6, 0]}>
                  {districtPerformanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.completion > 75 ? '#23865B' : entry.completion > 65 ? '#E99A36' : '#D99220'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 3: Inspection Outcomes + Stage Funnel + Risk Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Inspection Outcomes Stacked */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs">
          <h3 className="font-bold text-sm text-[#0D3B2E] mb-1">
            {isHi ? 'ब्लॉक स्तरीय निरीक्षण परिणाम' : 'Block Inspection Outcomes'}
          </h3>
          <p className="text-xs text-[#66756F] mb-3">
            {isHi ? 'उत्तीर्ण, सुधार आवश्यक एवं असफल' : 'Passed, Needs Work & Failed evaluations'}
          </p>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inspectionOutcomeData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0E8" />
                <XAxis dataKey="block" stroke="#66756F" fontSize={10} tickLine={false} />
                <YAxis stroke="#66756F" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0D3B2E', color: '#fff', borderRadius: '0.75rem', fontSize: '11px', border: 'none' }} />
                <Bar dataKey="passed" name="Pass" stackId="a" fill="#23865B" />
                <Bar dataKey="review" name="Review" stackId="a" fill="#E99A36" />
                <Bar dataKey="failed" name="Failed" stackId="a" fill="#C64242" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Application Stage Funnel */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#0D3B2E] mb-1">
              {isHi ? 'आवेदन जीवन-चक्र फ़नल' : 'Application Lifecycle Funnel'}
            </h3>
            <p className="text-xs text-[#66756F] mb-3">
              {isHi ? 'प्रस्तुत से लेकर पूर्ण हस्तांतरण तक' : 'Submitted to final project handover'}
            </p>
          </div>

          <div className="space-y-2.5">
            {funnelStages.map((st, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#192D3A]">{st.stage}</span>
                  <span className="font-bold font-mono text-[#0D3B2E]">{st.count} ({st.pct})</span>
                </div>
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#174C3C] h-full rounded-full transition-all duration-500" 
                    style={{ width: st.pct }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explainable Risk Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {isHi ? 'जोखिम गंभीरता विश्लेषण' : 'Risk Severity Distribution'}
              </h3>
              <ShieldAlert className="w-4 h-4 text-[#C64242]" />
            </div>
            <p className="text-xs text-[#66756F] mb-3">
              {isHi ? 'पारदर्शी 0-100 जोखिम स्कोर के अनुसार' : 'Deterministic explainable scoring metrics'}
            </p>
          </div>

          <div className="space-y-3">
            {riskDistributionData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#F7F6F0] border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-[#192D3A]">{item.name} Severity</span>
                </div>
                <span className="text-xs font-mono font-black px-2 py-0.5 rounded-md text-white" style={{ backgroundColor: item.color }}>
                  {item.count} Cases
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setActivePage('risk_fraud')}
            className="w-full mt-3 py-2 bg-red-50 hover:bg-red-100 text-[#C64242] border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>{isHi ? 'धोखाधड़ी जांच पैनल खोलें' : 'Open Fraud Investigation Centre'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Row 4: Pending Tasks & Recent Real-time Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approval Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-50 text-purple-700 rounded-lg">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {isHi ? 'लंबित कार्य व स्वीकृति कतार' : 'Pending Tasks & Approval Queue'}
              </h3>
            </div>
            <button
              onClick={() => setActivePage('installments')}
              className="text-xs font-semibold text-[#174C3C] hover:underline flex items-center gap-1"
            >
              {isHi ? 'सभी देखें' : 'View All'} <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {installments.filter(i => i.status === 'Pending Approval').slice(0, 3).map((inst) => (
              <div key={inst.id} className="p-3 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#192D3A]">{inst.beneficiaryName}</p>
                  <p className="text-[11px] text-[#66756F]">
                    {inst.village}, {inst.district} • {inst.schemeName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-[#0D3B2E]">{formatINR(inst.amount)}</span>
                  <p className="text-[10px] text-amber-800 font-medium">Inst #{inst.installmentNumber}</p>
                </div>
              </div>
            ))}
            {installments.filter(i => i.status === 'Pending Approval').length === 0 && (
              <p className="text-xs text-gray-500 text-center py-4">No pending approvals at this time.</p>
            )}
          </div>
        </div>

        {/* Live Cryptographic Audit Stream */}
        <div className="bg-white p-5 rounded-2xl border border-[#C4D1C9] shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-50 text-[#23865B] rounded-lg">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-[#0D3B2E]">
                {isHi ? 'हालिया प्रशासनिक ऑडिट स्ट्रीम' : 'Recent Platform Audit Activity'}
              </h3>
            </div>
            <button
              onClick={() => setActivePage('audit_trail')}
              className="text-xs font-semibold text-[#174C3C] hover:underline flex items-center gap-1"
            >
              {isHi ? 'ऑडिट ट्रेल' : 'Full Log'} <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#F7F6F0] border border-gray-200 text-xs">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#174C3C]">{log.actor} ({log.actorRole})</span>
                  <span className="text-[#66756F]">{log.timestamp.slice(11, 19)}</span>
                </div>
                <p className="text-xs text-[#192D3A] font-medium">{log.action}</p>
                <p className="text-[11px] text-[#66756F] truncate mt-0.5">{log.reason || log.newValue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
