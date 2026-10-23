import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatINR, formatDate } from '../utils/formatters';
import { 
  BarChart3, 
  Download, 
  Printer, 
  Filter, 
  Calendar, 
  FileSpreadsheet, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Building2,
  Table
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';

export const ReportsAnalytics: React.FC = () => {
  const { 
    schemes, 
    beneficiaries, 
    inspections, 
    installments, 
    riskCases, 
    selectedDistrict, 
    language,
    addToast 
  } = useApp();

  const [reportType, setReportType] = useState<
    'scheme_perf' | 'beneficiary_verif' | 'inspections' | 'installments' | 'risk_exceptions'
  >('scheme_perf');

  const [dateFilter, setDateFilter] = useState('All');
  const isHi = language === 'hi';

  // Apply filters
  const filteredBeneficiaries = selectedDistrict === 'All' 
    ? beneficiaries 
    : beneficiaries.filter((b) => b.district === selectedDistrict);

  const filteredInstallments = selectedDistrict === 'All'
    ? installments
    : installments.filter((i) => i.district === selectedDistrict);

  // Export CSV based on currently active report type
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number | boolean)[][] = [];
    let fileName = `GramSetu_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;

    if (reportType === 'scheme_perf') {
      headers = ['SchemeCode', 'SchemeName', 'Category', 'AllocatedBudget', 'UtilizedBudget', 'Target', 'Completed', 'Status'];
      rows = schemes.map(s => [s.code, `"${s.name}"`, s.category, s.allocatedBudget, s.utilizedBudget, s.targetBeneficiaries, s.completedProjects, s.status]);
    } else if (reportType === 'beneficiary_verif') {
      headers = ['Code', 'Name', 'Village', 'District', 'Scheme', 'Status', 'RiskScore', 'InstallmentsPaid'];
      rows = filteredBeneficiaries.map(b => [b.beneficiaryCode, `"${b.fullName}"`, b.village, b.district, `"${b.schemeName}"`, b.verificationStatus, b.riskScore, b.disbursedAmount]);
    } else if (reportType === 'installments') {
      headers = ['InstallmentID', 'Beneficiary', 'Scheme', 'Amount', 'Status', 'DisbursementDate', 'PFMSRef'];
      rows = filteredInstallments.map(i => [i.id, `"${i.beneficiaryName}"`, `"${i.schemeName}"`, i.amount, i.status, i.disbursementDate || '-', i.disbursementRef || '-']);
    } else if (reportType === 'risk_exceptions') {
      headers = ['CaseCode', 'Title', 'Beneficiary', 'RiskScore', 'Severity', 'Status', 'FlagDate'];
      rows = riskCases.map(r => [r.caseCode, `"${r.title}"`, `"${r.beneficiaryName}"`, r.riskScore, r.severity, r.status, r.flagDate]);
    } else {
      headers = ['InspectionCode', 'Beneficiary', 'Stage', 'Status', 'Inspector', 'CompletedDate', 'DeviceGPS'];
      rows = inspections.map(i => [i.inspectionCode, `"${i.beneficiaryName}"`, i.stage, i.status, `"${i.inspectorName}"`, i.completedDate || '-', i.gpsLocation.isDeviceGps ? 'Device Lock' : 'Manual']);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast(isHi ? 'CSV रिपोर्ट सफलतापूर्वक डाउनलोड हुई!' : 'Filtered CSV Report Exported!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  // Scheme Budget Comparison Chart Data
  const budgetChartData = schemes.map((s) => ({
    name: s.code.split('-')[0],
    Allocated: Math.round(s.allocatedBudget / 100000), // in Lakhs
    Utilized: Math.round(s.utilizedBudget / 100000),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'रिपोर्ट व सांख्यिकीय विश्लेषिकी' : 'Executive Reports & Analytics Workspace'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'जनपद व योजना प्रगति, बजट व्यय एवं ऑडिट हेतु प्रमाणित डाटा निर्यात' : 'Statutory periodic reports, budget outlays, and CSV exports'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#174C3C] hover:bg-[#0D3B2E] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-print">
        {[
          { id: 'scheme_perf', label: 'Scheme Performance', labelHi: 'योजना प्रदर्शन' },
          { id: 'beneficiary_verif', label: 'Beneficiary Verification', labelHi: 'लाभार्थी सत्यापन' },
          { id: 'installments', label: 'Installment Approvals', labelHi: 'किश्त अनुमोदन' },
          { id: 'inspections', label: 'Field Inspections', labelHi: 'क्षेत्रीय निरीक्षण' },
          { id: 'risk_exceptions', label: 'Risk & Fraud Exceptions', labelHi: 'जोखिम अपवाद' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              reportType === tab.id 
                ? 'bg-[#174C3C] text-white shadow-2xs' 
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-[#F7F6F0]'
            }`}
          >
            {isHi ? tab.labelHi : tab.label}
          </button>
        ))}
      </div>

      {/* Printable Report Header */}
      <div className="print-only hidden p-6 bg-white border-b-2 border-black text-center mb-6">
        <h1 className="text-2xl font-black">GOVERNMENT OF UTTAR PRADESH • RURAL DEVELOPMENT</h1>
        <h2 className="text-lg font-bold mt-1">GramSetu Official Scheme Monitoring Report</h2>
        <p className="text-xs text-gray-600 mt-1">Generated: {new Date().toLocaleString()} | Scope: {selectedDistrict}</p>
      </div>

      {/* Active Report Table & Visualizer */}
      <div className="bg-white rounded-2xl border border-[#C4D1C9] p-5 shadow-2xs space-y-5">
        {reportType === 'scheme_perf' && (
          <>
            <div>
              <h3 className="font-bold text-sm text-[#0D3B2E] mb-1">Budget Allocation vs Utilization by Scheme (₹ Lakhs)</h3>
              <p className="text-xs text-[#66756F]">Comparative financial delivery velocity across approved programmes</p>
            </div>

            <div className="h-60 w-full no-print">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F0E8" />
                  <XAxis dataKey="name" stroke="#66756F" fontSize={11} tickLine={false} />
                  <YAxis stroke="#66756F" fontSize={11} tickLine={false} tickFormatter={(v) => `₹${v}L`} />
                  <Tooltip 
                    formatter={(val: any) => [`₹${val} Lakhs`, '']}
                    contentStyle={{ backgroundColor: '#0D3B2E', color: '#fff', borderRadius: '0.75rem', fontSize: '11px', border: 'none' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
                  <Bar dataKey="Allocated" name="Allocated Budget" fill="#789B82" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Utilized" name="Utilized Expenditure" fill="#174C3C" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F7F6F0] text-[#174C3C] font-bold uppercase text-[10px] tracking-wider border-b">
                  <tr>
                    <th className="py-2.5 px-3">Scheme</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3">Budget Allocated</th>
                    <th className="py-2.5 px-3">Budget Utilized</th>
                    <th className="py-2.5 px-3">Delivery %</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schemes.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F7F6F0]/40">
                      <td className="py-3 px-3 font-bold text-[#192D3A]">{s.name}</td>
                      <td className="py-3 px-3 text-[#66756F]">{s.category}</td>
                      <td className="py-3 px-3 font-mono font-bold text-[#0D3B2E]">{formatINR(s.allocatedBudget)}</td>
                      <td className="py-3 px-3 font-mono text-[#23865B]">{formatINR(s.utilizedBudget)}</td>
                      <td className="py-3 px-3 font-mono">{Math.round((s.completedProjects / s.targetBeneficiaries) * 100)}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {reportType === 'beneficiary_verif' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F0] text-[#174C3C] font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-2.5 px-3">Beneficiary Code</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Village</th>
                  <th className="py-2.5 px-3">Scheme</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBeneficiaries.map((b) => (
                  <tr key={b.id} className="hover:bg-[#F7F6F0]/40">
                    <td className="py-3 px-3 font-mono text-[#789B82]">{b.beneficiaryCode}</td>
                    <td className="py-3 px-3 font-bold text-[#192D3A]">{b.fullName}</td>
                    <td className="py-3 px-3 text-[#66756F]">{b.village}, {b.district}</td>
                    <td className="py-3 px-3">{b.schemeName}</td>
                    <td className="py-3 px-3 font-mono font-bold">{b.riskScore}/100</td>
                    <td className="py-3 px-3 font-semibold">{b.verificationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'installments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F0] text-[#174C3C] font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-2.5 px-3">Beneficiary</th>
                  <th className="py-2.5 px-3">Scheme</th>
                  <th className="py-2.5 px-3">Installment #</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">PFMS Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredInstallments.map((i) => (
                  <tr key={i.id} className="hover:bg-[#F7F6F0]/40">
                    <td className="py-3 px-3 font-bold text-[#192D3A]">{i.beneficiaryName}</td>
                    <td className="py-3 px-3 text-[#66756F]">{i.schemeName}</td>
                    <td className="py-3 px-3 font-mono">Tranche #{i.installmentNumber}</td>
                    <td className="py-3 px-3 font-mono font-bold text-[#0D3B2E]">{formatINR(i.amount)}</td>
                    <td className="py-3 px-3 font-semibold">{i.status}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-gray-500">{i.disbursementRef || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'inspections' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F0] text-[#174C3C] font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Beneficiary</th>
                  <th className="py-2.5 px-3">Stage</th>
                  <th className="py-2.5 px-3">Inspector</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {inspections.map((insp) => (
                  <tr key={insp.id} className="hover:bg-[#F7F6F0]/40">
                    <td className="py-3 px-3 font-mono text-[#174C3C] font-bold">{insp.inspectionCode}</td>
                    <td className="py-3 px-3 font-bold text-[#192D3A]">{insp.beneficiaryName}</td>
                    <td className="py-3 px-3">{insp.stage}</td>
                    <td className="py-3 px-3 text-[#66756F]">{insp.inspectorName}</td>
                    <td className="py-3 px-3 font-semibold">{insp.status}</td>
                    <td className="py-3 px-3 text-[#66756F]">{insp.completedDate || insp.scheduledDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'risk_exceptions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F0] text-[#174C3C] font-bold uppercase text-[10px] tracking-wider border-b">
                <tr>
                  <th className="py-2.5 px-3">Case Code</th>
                  <th className="py-2.5 px-3">Anomaly Title</th>
                  <th className="py-2.5 px-3">Beneficiary</th>
                  <th className="py-2.5 px-3">Risk Score</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {riskCases.map((rc) => (
                  <tr key={rc.id} className="hover:bg-[#F7F6F0]/40">
                    <td className="py-3 px-3 font-mono font-bold text-red-700">{rc.caseCode}</td>
                    <td className="py-3 px-3 font-semibold text-[#192D3A]">{rc.title}</td>
                    <td className="py-3 px-3 text-[#66756F]">{rc.beneficiaryName}</td>
                    <td className="py-3 px-3 font-mono font-black">{rc.riskScore}/100</td>
                    <td className="py-3 px-3 font-bold text-red-600">{rc.severity}</td>
                    <td className="py-3 px-3">{rc.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
