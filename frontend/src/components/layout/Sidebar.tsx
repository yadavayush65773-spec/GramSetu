import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Layers, 
  UserCheck, 
  ClipboardCheck, 
  CreditCard, 
  ShieldAlert, 
  Map, 
  WifiOff, 
  BarChart3, 
  History, 
  Globe2, 
  Sparkles, 
  Users, 
  Settings,
  ChevronRight,
  Shield,
  Landmark,
  Home
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, mobileOpen, setMobileOpen }) => {
  const { 
    activePage, 
    setActivePage, 
    language, 
    beneficiaries, 
    installments, 
    riskCases, 
    offlineSyncQueue 
  } = useApp();

  const isHi = language === 'hi';

  const pendingBeneficiariesCount = beneficiaries.filter(
    (b) => b.verificationStatus === 'Pending' || b.verificationStatus === 'Under Review'
  ).length;

  const pendingInstallmentsCount = installments.filter(
    (i) => i.status === 'Pending Approval'
  ).length;

  const criticalRisksCount = riskCases.filter(
    (r) => r.severity === 'Critical' || r.severity === 'High'
  ).length;

  const offlineQueueCount = offlineSyncQueue.length;

  const navigationItems = [
    {
      id: 'landing',
      label: 'Portal Home (Landing)',
      labelHi: 'मुख्य पृष्ठ (पोर्टल होम)',
      icon: Home,
      badge: 'Public',
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'overview',
      label: 'Overview Dashboard',
      labelHi: 'कमांड सेंटर डैशबोर्ड',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'schemes',
      label: 'Schemes & Projects',
      labelHi: 'योजनाएं व परियोजनाएं',
      icon: Layers,
      badge: null,
    },
    {
      id: 'beneficiaries',
      label: 'Beneficiary Verification',
      labelHi: 'लाभार्थी सत्यापन',
      icon: UserCheck,
      badge: pendingBeneficiariesCount > 0 ? pendingBeneficiariesCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 border border-amber-200',
    },
    {
      id: 'inspections',
      label: 'Field Inspections',
      labelHi: 'क्षेत्रीय निरीक्षण',
      icon: ClipboardCheck,
      badge: null,
    },
    {
      id: 'installments',
      label: 'Installment Approvals',
      labelHi: 'किश्त अनुमोदन कार्यप्रवाह',
      icon: CreditCard,
      badge: pendingInstallmentsCount > 0 ? pendingInstallmentsCount : null,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-200',
    },
    {
      id: 'risk_fraud',
      label: 'Risk & Fraud Detection',
      labelHi: 'जोखिम व धोखाधड़ी पहचान',
      icon: ShieldAlert,
      badge: criticalRisksCount > 0 ? criticalRisksCount : null,
      badgeColor: 'bg-red-100 text-red-800 border border-red-200 animate-pulse',
    },
    {
      id: 'geo_map',
      label: 'Geographic Intelligence',
      labelHi: 'भौगोलिक मानचित्र विश्लेषिकी',
      icon: Map,
      badge: null,
    },
    {
      id: 'offline_workspace',
      label: 'Offline Field Workspace',
      labelHi: 'ऑफलाइन फील्ड वर्कस्पेस',
      icon: WifiOff,
      badge: offlineQueueCount > 0 ? offlineQueueCount : null,
      badgeColor: 'bg-orange-100 text-orange-800 border border-orange-200',
    },
    {
      id: 'reports',
      label: 'Reports & Analytics',
      labelHi: 'रिपोर्ट व आंकड़े',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'audit_trail',
      label: 'Audit Trail & Integrity',
      labelHi: 'ऑडिट ट्रेल व साक्ष्य',
      icon: History,
      badge: null,
    },
    {
      id: 'public_portal',
      label: 'Public Transparency',
      labelHi: 'जन पारदर्शिता पोर्टल',
      icon: Globe2,
      badge: 'Public',
      badgeColor: 'bg-sky-100 text-sky-800 border border-sky-200',
    },
    {
      id: 'ai_assistant',
      label: 'GramSetu Sahayak AI',
      labelHi: 'ग्रामसेतु सहायक AI',
      icon: Sparkles,
      badge: 'AI',
      badgeColor: 'bg-amber-500/20 text-[#E99A36] border border-[#E99A36]/40',
    },
    {
      id: 'user_roles',
      label: 'User & Role Access',
      labelHi: 'भूमिका व अनुमति प्रबंधन',
      icon: Users,
      badge: null,
    },
    {
      id: 'settings',
      label: 'Platform Settings',
      labelHi: 'प्लेटफॉर्म सेटिंग्स',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 left-0 z-40 h-screen shrink-0
        bg-[#0D3B2E] text-white flex flex-col justify-between
        transition-all duration-200 ease-in-out border-r border-[#174C3C]
        ${mobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'lg:w-20' : 'lg:w-68'}
      `}>
        {/* Top Branding */}
        <div className="h-16 flex items-center px-4 border-b border-[#174C3C]/80 gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-[#E99A36] to-[#174C3C] flex items-center justify-center shadow-md shrink-0 border border-amber-300/30">
            <Landmark className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-wide text-white">GramSetu</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#E99A36] text-[#0D3B2E] px-1.5 py-0.2 rounded font-mono">
                  PS-1
                </span>
              </div>
              <p className="text-[10px] text-[#789B82] font-medium truncate">
                {isHi ? 'डिजिटल ग्रामीण निगरानी' : 'TechTrix\'26 Rural Platform'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {!collapsed && (
            <p className="text-[10px] uppercase font-semibold text-[#789B82] px-3 py-1 tracking-wider">
              {isHi ? 'प्रशासनिक मॉड्यूल' : 'Administrative Modules'}
            </p>
          )}

          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActivePage(item.id);
                  setMobileOpen(false);
                }}
                title={collapsed ? (isHi ? item.labelHi : item.label) : undefined}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left font-medium text-xs
                  transition-all duration-150 group relative
                  ${isActive 
                    ? 'bg-[#174C3C] text-white shadow-xs border-l-4 border-[#E99A36]' 
                    : 'text-[#C4D1C9] hover:bg-[#174C3C]/40 hover:text-white'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-[#E99A36] scale-110' : 'text-[#789B82] group-hover:text-white'}`} />
                
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate tracking-normal">
                      {isHi ? item.labelHi : item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${item.badgeColor || 'bg-[#789B82]/20 text-[#C4D1C9]'}`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}

                {/* Collapsed view badge indicator dot */}
                {collapsed && item.badge && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E99A36] ring-2 ring-[#0D3B2E]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Status / Tech info */}
        <div className="p-3 border-t border-[#174C3C]/80 bg-[#0B3126]">
          {!collapsed ? (
            <div className="bg-[#174C3C]/60 rounded-xl p-2.5 text-xs border border-[#174C3C]">
              <div className="flex items-center justify-between text-[11px] mb-1">
                <span className="text-[#789B82] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  NIC Secure Grid
                </span>
                <span className="text-emerald-400 font-mono text-[10px]">Active</span>
              </div>
              <p className="text-[10px] text-[#A2B5AA] leading-relaxed">
                TechTrix'26 • Problem Statement 1
              </p>
            </div>
          ) : (
            <div className="flex justify-center py-1">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
