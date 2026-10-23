import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  Eye, 
  UserPlus, 
  Building2, 
  MapPin, 
  Info,
  KeyRound
} from 'lucide-react';

export const UserRoleManagement: React.FC = () => {
  const { currentRole, setCurrentRole, language, addToast } = useApp();

  const isHi = language === 'hi';

  const roleDefinitions: {
    role: UserRole;
    title: string;
    titleHi: string;
    level: string;
    jurisdiction: string;
    permissions: string[];
    description: string;
  }[] = [
    {
      role: 'state_admin',
      title: 'State Administrator (ACS / Principal Secretary)',
      titleHi: 'राज्य प्रशासक (अपर मुख्य सचिव)',
      level: 'State Level (Tier 1)',
      jurisdiction: 'Entire State (All 75 Districts)',
      permissions: ['Create & Edit Schemes', 'Full Budget Allocation', 'System Audit Access', 'Cross-District Oversight'],
      description: 'Highest state executive authority. Manages policy allocations, scheme master registry, and executive cross-district reviews.',
    },
    {
      role: 'district_officer',
      title: 'District Officer (DM / CDO)',
      titleHi: 'जिला अधिकारी (जिलाधिकारी / मुख्य विकास अधिकारी)',
      level: 'District Level (Tier 2)',
      jurisdiction: 'District Scope (e.g. Varanasi, Prayagraj)',
      permissions: ['Authorize Installment DBT', 'Review Fraud Intelligence', 'Approve Milestone Handover', 'Issue Vigilance Enquiries'],
      description: 'Chief district administrative and financial authority. Authorizes DBT milestone tranches and reviews critical integrity alerts.',
    },
    {
      role: 'block_officer',
      title: 'Block Development Officer (BDO)',
      titleHi: 'खंड विकास अधिकारी (BDO)',
      level: 'Block Level (Tier 3)',
      jurisdiction: 'Block Scope (e.g. Sevapuri, Phulpur)',
      permissions: ['Verify Beneficiary Eligibility', 'Assign Field Inspectors', 'Request Rectifications', 'Validate Gram Sabha Rosters'],
      description: 'Sub-district operational lead. Endorses citizen eligibility checklists and assigns inspection schedules.',
    },
    {
      role: 'field_inspector',
      title: 'Field Inspector (JE / Panchayat Secretary)',
      titleHi: 'स्थलीय तकनीकी निरीक्षक (अवर अभियंता / ग्राम सचिव)',
      level: 'Village Ground Level (Tier 4)',
      jurisdiction: 'Assigned Gram Panchayats',
      permissions: ['Offline Inspection Capture', 'Hardware GPS Geotagging', 'Compute SHA-256 Photo Proof', 'Ground Milestone Checklists'],
      description: 'Ground frontline inspector. Utilizes offline workspace on tablets to capture physical progress with hardware GPS lock.',
    },
    {
      role: 'auditor',
      title: 'Public Accounts Auditor (CAG / Social Audit Directorate)',
      titleHi: 'सार्वजनिक लेखा परीक्षक (कैग / सामाजिक अंकेक्षण)',
      level: 'Independent Constitutional Oversight',
      jurisdiction: 'All Financial Tranches & Cryptographic Logs',
      permissions: ['Read-only Immutable Audit Trail', 'Verify Evidence SHA-256', 'Export Reconciliation Reports', 'Inspect Fraud Cases'],
      description: 'Independent inspection authority verifying evidence non-tampering and procurement compliance.',
    },
    {
      role: 'public_citizen',
      title: 'Public Citizen / Rural Beneficiary',
      titleHi: 'ग्रामीण नागरिक / लाभार्थी',
      level: 'Citizen Tier',
      jurisdiction: 'Public Directory',
      permissions: ['Track Application Progress', 'View Village Scheme Budgets', 'Lodge Public Grievances', 'Track Grievance Redressal'],
      description: 'Citizen view restricted to open public transparency portals, safeguarding sensitive personal identifiers.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono">
              RBAC Governance Simulator
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#0D3B2E]">
            {isHi ? 'प्रशासनिक भूमिका व पहुंच अधिकार प्रबंधन' : 'User Roles & Role-Based Access Control (RBAC)'}
          </h2>
          <p className="text-xs text-[#66756F]">
            {isHi ? 'प्रस्तुति व मूल्यांकन हेतु विभिन्न प्रशासनिक भूमिकाओं का तत्काल परीक्षण करें' : 'Switch roles interactively to evaluate interface access from State Admin to Field Inspector'}
          </p>
        </div>
      </div>

      {/* Explanatory Callout */}
      <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-xs text-sky-950 flex items-start gap-3">
        <Info className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Hackathon Judging Quick-Switch:</strong> Click any of the role cards below to instantaneously test GramSetu through that official's permissions. In a production deployment, these permissions are cryptographically verified via JWT tokens and backend authorization middleware.
        </div>
      </div>

      {/* Role Switcher Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {roleDefinitions.map((item) => {
          const isActive = currentRole === item.role;

          return (
            <div
              key={item.role}
              onClick={() => {
                setCurrentRole(item.role);
                addToast(isHi ? `सक्रिय भूमिका: ${item.titleHi}` : `Active Demo Role switched to: ${item.title}`, 'info');
              }}
              className={`
                p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between
                ${isActive 
                  ? 'bg-white border-[#174C3C] ring-2 ring-[#174C3C] shadow-md' 
                  : 'bg-white border-gray-200 hover:border-gray-400 shadow-2xs'}
              `}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 px-2 py-0.5 rounded text-gray-700 font-mono">
                    {item.level}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-bold bg-[#174C3C] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#E99A36]" />
                      Active Role
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-sm text-[#0D3B2E] mt-1">{isHi ? item.titleHi : item.title}</h3>
                <p className="text-[11px] text-[#66756F] mt-1 mb-3 leading-relaxed">{item.description}</p>

                <div className="p-3 bg-[#F7F6F0] rounded-xl border border-gray-200 text-xs space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#789B82] block">Jurisdiction:</span>
                  <p className="text-[#192D3A] font-semibold text-[11px]">{item.jurisdiction}</p>
                  
                  <span className="text-[10px] uppercase font-bold text-[#789B82] block pt-1">Key Permissions:</span>
                  <div className="space-y-1">
                    {item.permissions.map((p, idx) => (
                      <p key={idx} className="text-[11px] text-[#192D3A] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#23865B]" />
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`w-full mt-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  isActive ? 'bg-[#174C3C] text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {isActive ? 'Currently Active' : 'Switch to this Role'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
