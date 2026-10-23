import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { EvidenceModal } from '../common/EvidenceModal';
import { UserRole } from '../../types';
import { 
  Menu, 
  Search, 
  Globe, 
  Wifi, 
  WifiOff, 
  Bell, 
  RefreshCw, 
  ChevronDown, 
  UserCheck, 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  X,
  Sparkles,
  Command,
  FileCheck2,
  Download,
  Home,
  LogOut,
  ExternalLink,
  UserPlus,
  ArrowRight
} from 'lucide-react';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activePage,
    setActivePage,
    language,
    setLanguage,
    currentRole,
    setCurrentRole,
    selectedDistrict,
    setSelectedDistrict,
    selectedBlock,
    setSelectedBlock,
    isOfflineSimulated,
    toggleSimulatedOffline,
    offlineSyncQueue,
    triggerOfflineSync,
    isSyncing,
    notifications,
    markNotificationAsRead,
    searchQuery,
    setSearchQuery,
    isSearchOpen,
    setIsSearchOpen,
    beneficiaries,
    schemes,
    toasts,
    removeToast,
    currentUser,
    logout,
  } = useApp();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const isHi = language === 'hi';

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Search Results
  const searchResults = searchQuery.trim()
    ? {
        beneficiaries: beneficiaries.filter(
          (b) =>
            b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.beneficiaryCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
            b.village.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        schemes: schemes.filter(
          (s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.code.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      }
    : null;

  const roleLabels: Record<string, { en: string; hi: string; color: string }> = {
    state_admin: { en: 'State Administrator', hi: 'राज्य प्रशासक', color: 'bg-purple-100 text-purple-800' },
    district_officer: { en: 'District Officer (DM/CDO)', hi: 'जिला अधिकारी (DM/CDO)', color: 'bg-emerald-100 text-emerald-800' },
    block_officer: { en: 'Block Officer (BDO)', hi: 'खंड विकास अधिकारी (BDO)', color: 'bg-blue-100 text-blue-800' },
    bdo: { en: 'Block Officer (BDO)', hi: 'खंड विकास अधिकारी (BDO)', color: 'bg-blue-100 text-blue-800' },
    field_inspector: { en: 'Field Inspector', hi: 'क्षेत्रीय निरीक्षक', color: 'bg-amber-100 text-amber-800' },
    auditor: { en: 'Public Auditor (CAG/NIC)', hi: 'सार्वजनिक लेखा परीक्षक', color: 'bg-indigo-100 text-indigo-800' },
    public_citizen: { en: 'Public Citizen', hi: 'नागरिक दर्शक', color: 'bg-stone-100 text-stone-800' },
    citizen: { en: 'Public Citizen', hi: 'नागरिक दर्शक', color: 'bg-stone-100 text-stone-800' },
  };

  const selectableRoles: { role: UserRole; en: string; hi: string }[] = [
    { role: 'state_admin', en: 'State Administrator', hi: 'राज्य प्रशासक' },
    { role: 'district_officer', en: 'District Officer (DM/CDO)', hi: 'जिला अधिकारी (DM/CDO)' },
    { role: 'block_officer', en: 'Block Officer (BDO)', hi: 'खंड विकास अधिकारी (BDO)' },
    { role: 'field_inspector', en: 'Field Inspector', hi: 'क्षेत्रीय निरीक्षक' },
    { role: 'auditor', en: 'Public Auditor (CAG/NIC)', hi: 'सार्वजनिक लेखा परीक्षक' },
    { role: 'public_citizen', en: 'Public Citizen', hi: 'नागरिक दर्शक' },
  ];

  const pageTitles: Record<string, { en: string; hi: string; subtitleEn: string; subtitleHi: string }> = {
    overview: {
      en: 'GramSetu Command Centre',
      hi: 'ग्रामसेतु कमांड सेन्टर',
      subtitleEn: 'Rural Development Monitoring & Scheme Accountability',
      subtitleHi: 'ग्रामीण विकास निगरानी एवं योजना जवाबदेही प्रणाली',
    },
    schemes: {
      en: 'Schemes & Flagship Projects',
      hi: 'योजनाएं एवं प्रमुख परियोजनाएं',
      subtitleEn: 'Comprehensive Rural Development Project Directory',
      subtitleHi: 'समग्र ग्रामीण विकास योजना निर्देशिका',
    },
    beneficiaries: {
      en: 'Beneficiary Verification Register',
      hi: 'लाभार्थी सत्यापन पंजिका',
      subtitleEn: '9-Step Verification & Duplicate Claim Inspection',
      subtitleHi: '9-चरणीय पात्रता सत्यापन एवं डुप्लिकेट दावा रोकथाम',
    },
    inspections: {
      en: 'Field Inspection & Verification',
      hi: 'स्थलीय निरीक्षण व साक्ष्य प्रमाणीकरण',
      subtitleEn: 'Device GPS Tagging & SHA-256 Photographic Evidence',
      subtitleHi: 'डिवाइस जियोटैगिंग व क्रिप्टोग्राफिक फोटोग्राफिक साक्ष्य',
    },
    installments: {
      en: 'Installment Approvals & Disbursement',
      hi: 'किश्त अनुमोदन एवं प्रत्यक्ष लाभ अंतरण',
      subtitleEn: 'Milestone-based Stage Approvals with Statutory Audit',
      subtitleHi: 'भौतिक प्रगति आधारित चरणबद्ध वित्तीय स्वीकृति',
    },
    risk_fraud: {
      en: 'Risk & Fraud Intelligence',
      hi: 'जोखिम एवं धोखाधड़ी विश्लेषिकी',
      subtitleEn: 'Explainable Anomaly Detection & Collision Scanners',
      subtitleHi: 'पारदर्शी विसंगति पहचान व दोहराव फोटो हैश डिटेक्टर',
    },
    geo_map: {
      en: 'Geographic Intelligence & Spatial Coverage',
      hi: 'भौगोलिक मानचित्र व स्थानिक विश्लेषिकी',
      subtitleEn: 'Interactive Village & District Project Distribution',
      subtitleHi: 'इंटरैक्टिव ग्राम व ब्लॉक स्तरीय परियोजना मानचित्र',
    },
    offline_workspace: {
      en: 'Offline Field Workspace',
      hi: 'ऑफलाइन फील्ड वर्कस्पेस',
      subtitleEn: 'Uninterrupted Inspections in Remote Rural Connectivity',
      subtitleHi: 'दूरस्थ ग्रामीण अंचलों हेतु ऑफलाइन डाटा समन्वय प्रणाली',
    },
    reports: {
      en: 'Reports & Executive Analytics',
      hi: 'रिपोर्ट व सांख्यिकीय विश्लेषिकी',
      subtitleEn: 'Data Export, District Comparisons & Filtered Metrics',
      subtitleHi: 'डाटा निर्यात, जनपद तुलना एवं विस्तृत प्रगति रिपोर्ट',
    },
    audit_trail: {
      en: 'Audit Trail & Evidence Integrity',
      hi: 'ऑडिट ट्रेल व डिजिटल साक्ष्य',
      subtitleEn: 'Cryptographically Verifiable Government Decision Log',
      subtitleHi: 'प्रशासनिक निर्णयों का पारदर्शी व सत्यापित डिजिटल रिकॉर्ड',
    },
    public_portal: {
      en: 'Public Transparency Portal',
      hi: 'जन पारदर्शिता पोर्टल (नागरिक मंच)',
      subtitleEn: 'Public Scheme Outlay, Village Progress & Grievance Lodging',
      subtitleHi: 'सार्वजनिक योजना प्रगति, ग्रामवार सांख्यिकी एवं शिकायत पंजीकरण',
    },
    ai_assistant: {
      en: 'GramSetu Sahayak (AI Co-pilot)',
      hi: 'ग्रामसेतु सहायक (द्विभाषी AI)',
      subtitleEn: 'Natural Language Scheme Querying & Policy Guidance',
      subtitleHi: 'सहज हिंदी/अंग्रेजी में योजना परामर्श एवं तत्काल सांख्यिकी',
    },
    user_roles: {
      en: 'User Roles & Access Governance',
      hi: 'भूमिका व अधिकार प्रबंधन',
      subtitleEn: 'Granular Role-based View Simulator for Presentations',
      subtitleHi: 'प्रस्तुति हेतु विभिन्न प्रशासनिक भूमिकाओं का त्वरित स्विच',
    },
    settings: {
      en: 'System Settings & Data Cache',
      hi: 'सिस्टम सेटिंग्स व डाटा कैश',
      subtitleEn: 'Localization, Offline Storage & Reset Options',
      subtitleHi: 'भाषा चयन, स्थानीय भंडारण व डाटा प्रबंधन',
    },
  };

  const currentTitle = pageTitles[activePage] || {
    en: 'GramSetu',
    hi: 'ग्रामसेतु',
    subtitleEn: 'Rural Monitoring Platform',
    subtitleHi: 'ग्रामीण निगरानी मंच',
  };

  return (
    <div className="min-h-screen bg-[#F7F6F0] flex flex-col selection:bg-[#E99A36]/30">
      {/* Toast notifications container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border text-xs leading-relaxed
              animate-in slide-in-from-top-2 duration-200
              ${toast.type === 'success' ? 'bg-[#0D3B2E] text-white border-emerald-600' : ''}
              ${toast.type === 'error' ? 'bg-[#C64242] text-white border-red-500' : ''}
              ${toast.type === 'warning' ? 'bg-[#D99220] text-white border-amber-600' : ''}
              ${toast.type === 'info' ? 'bg-[#192D3A] text-white border-blue-500' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-200 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0 mt-0.5" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-blue-200 shrink-0 mt-0.5" />}
            <span className="flex-1 font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navigation Bar */}
          <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-2xs">
            <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-3">
              {/* Left: Mobile Toggle + Title & Breadcrumb */}
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden p-2 text-[#192D3A] hover:bg-gray-100 rounded-lg"
                  aria-label="Open sidebar"
                >
                  <Menu className="w-5 h-5" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm lg:text-base font-bold text-[#0D3B2E] truncate">
                      {isHi ? currentTitle.hi : currentTitle.en}
                    </h1>
                    <span className="hidden sm:inline-flex text-[10px] font-semibold bg-[#23865B]/10 text-[#23865B] px-2 py-0.5 rounded-full border border-[#23865B]/20">
                      UP Rural Dev
                    </span>
                  </div>
                  <p className="text-[11px] text-[#66756F] truncate hidden sm:block">
                    {isHi ? currentTitle.subtitleHi : currentTitle.subtitleEn}
                  </p>
                </div>
              </div>

              {/* Right: Controls & Selectors */}
              <div className="flex items-center gap-2 lg:gap-3 shrink-0">
                {/* Global Search Button */}
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#F7F6F0] hover:bg-[#F1F0E8] border border-[#C4D1C9] rounded-lg text-xs text-[#66756F] transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-[#174C3C]" />
                  <span>{isHi ? 'खोजें (योजना, लाभार्थी, ग्राम)...' : 'Search schemes, records...'}</span>
                  <kbd className="hidden lg:inline-flex bg-white px-1.5 py-0.5 rounded text-[10px] font-mono border border-gray-300 text-gray-500">
                    ⌘K
                  </kbd>
                </button>

                {/* District Filter Pill */}
                <div className="relative hidden xl:block">
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedBlock('All');
                    }}
                    className="text-xs font-semibold bg-white border border-[#C4D1C9] text-[#174C3C] rounded-lg px-2.5 py-1.5 pr-7 appearance-none cursor-pointer hover:border-[#174C3C] focus:outline-hidden focus:ring-1 focus:ring-[#174C3C]"
                  >
                    <option value="All">{isHi ? 'सभी जनपद (All Districts)' : 'All Districts (4)'}</option>
                    <option value="Varanasi">Varanasi (वाराणसी)</option>
                    <option value="Prayagraj">Prayagraj (प्रयागराज)</option>
                    <option value="Gorakhpur">Gorakhpur (गोरखपुर)</option>
                    <option value="Mirzapur">Mirzapur (मिर्जापुर)</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#66756F] absolute right-2 top-2.5 pointer-events-none" />
                </div>

                {/* Offline Mode Indicator & Simulator Toggle */}
                <button
                  onClick={toggleSimulatedOffline}
                  title={isOfflineSimulated ? 'Simulated Offline Mode is ON. Click to reconnect.' : 'Click to simulate field offline mode'}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border
                    ${isOfflineSimulated 
                      ? 'bg-amber-500/10 text-amber-900 border-amber-400 animate-pulse' 
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'}
                  `}
                >
                  {isOfflineSimulated ? (
                    <>
                      <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline font-bold">{isHi ? 'ऑफलाइन' : 'Offline'}</span>
                      {offlineSyncQueue.length > 0 && (
                        <span className="bg-amber-600 text-white text-[10px] px-1 rounded-full font-bold">
                          {offlineSyncQueue.length}
                        </span>
                      )}
                    </>
                  ) : (
                    <>
                      <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="hidden sm:inline">{isHi ? 'ऑनलाइन' : 'Online'}</span>
                    </>
                  )}
                </button>

                {/* Sync Action Button when queue has items */}
                {offlineSyncQueue.length > 0 && !isOfflineSimulated && (
                  <button
                    onClick={triggerOfflineSync}
                    disabled={isSyncing}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-[#E99A36] hover:bg-[#D99220] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">
                      {isHi ? `सिंक (${offlineSyncQueue.length})` : `Sync (${offlineSyncQueue.length})`}
                    </span>
                  </button>
                )}

                {/* Download Project ZIP */}
                <a
                  href="/gramsetu-techtrix26.zip"
                  download="gramsetu-techtrix26.zip"
                  className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#E99A36]/10 hover:bg-[#E99A36]/20 border border-[#E99A36]/40 rounded-lg text-xs font-bold text-[#0D3B2E] transition-colors"
                  title="Download complete project source ZIP"
                >
                  <Download className="w-3.5 h-3.5 text-[#E99A36]" />
                  <span className="hidden lg:inline">{isHi ? 'प्रोजेक्ट ZIP' : 'Download ZIP'}</span>
                </a>

                {/* Portal Home / Landing Page Button */}
                <button
                  onClick={() => setActivePage('landing')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] border border-[#C4D1C9] rounded-lg text-xs font-semibold text-[#174C3C] transition-colors"
                  title={isHi ? 'मुख्य पोर्टल पृष्ठ देखें' : 'View Public Landing Page'}
                >
                  <Home className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{isHi ? 'होम' : 'Home'}</span>
                </button>

                {/* Language Switcher */}
                <button
                  onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-[#F7F6F0] hover:bg-[#EFECE3] border border-[#C4D1C9] rounded-lg text-xs font-semibold text-[#174C3C] transition-colors"
                  title="Toggle Language"
                >
                  <Globe className="w-3.5 h-3.5 text-[#E99A36]" />
                  <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
                </button>

                {/* Notifications Dropdown Toggle */}
                <div className="relative">
                  <button
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 text-[#192D3A] hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4 text-[#174C3C]" />
                    {unreadNotifs.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C64242] ring-2 ring-white animate-ping" />
                    )}
                  </button>

                  {/* Dropdown Panel */}
                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-3 animate-in fade-in duration-100">
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-[#174C3C]" />
                          <span className="text-xs font-bold text-[#0D3B2E]">
                            {isHi ? 'अधिसूचना केंद्र' : 'Administrative Alerts'}
                          </span>
                        </div>
                        <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-bold">
                          {unreadNotifs.length} {isHi ? 'नया' : 'new'}
                        </span>
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.targetPage) setActivePage(notif.targetPage);
                              setNotifDropdownOpen(false);
                            }}
                            className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                              notif.read ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-amber-50/60 border-amber-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1 mb-1">
                              <span className="font-semibold text-[#192D3A]">
                                {isHi ? notif.titleHi : notif.title}
                              </span>
                              <span className="text-[10px] text-[#66756F] shrink-0">{notif.timestamp}</span>
                            </div>
                            <p className="text-[11px] text-[#66756F] leading-tight">
                              {isHi ? notif.messageHi : notif.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Role Switcher (For presentation/judging walkthrough) */}
                <div className="relative">
                  <button
                    onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 bg-[#F7F6F0] hover:bg-[#EFECE3] border border-[#C4D1C9] rounded-xl transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg bg-[#174C3C] text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : currentRole[0].toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left text-xs leading-none">
                      <p className="font-bold text-[#0D3B2E] truncate max-w-[130px]">
                        {currentUser?.full_name || (isHi ? (roleLabels[currentRole]?.hi || 'उपयोगकर्ता') : (roleLabels[currentRole]?.en || 'User'))}
                      </p>
                      <span className="text-[10px] text-[#789B82] font-medium">
                        {currentUser ? (isHi ? (roleLabels[currentRole]?.hi || 'सत्यापित') : (roleLabels[currentRole]?.en || 'Verified')) : 'Demo Role'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#66756F]" />
                  </button>

                  {/* Role Dropdown */}
                  {roleDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-50 p-2 animate-in fade-in duration-100">
                      {/* Active Authenticated User Banner */}
                      {currentUser && (
                        <div className="px-3 py-2 bg-emerald-50 rounded-xl mb-2 border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span className="font-bold text-xs text-emerald-950 truncate">
                              {currentUser.full_name}
                            </span>
                          </div>
                          <p className="text-[10px] text-emerald-700 mt-0.5 truncate">{currentUser.email}</p>
                          <div className="mt-1 flex items-center gap-1.5 text-[9px] text-emerald-800">
                            <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded font-semibold uppercase">
                              {currentUser.role}
                            </span>
                            {currentUser.district_id && <span>• {currentUser.district_id}</span>}
                          </div>
                        </div>
                      )}

                      <div className="px-3 py-1.5 border-b border-gray-100 mb-1">
                        <p className="text-[10px] uppercase font-bold text-[#789B82] tracking-wider">
                          {isHi ? 'भूमिका चयन (जज प्रदर्शन)' : 'Switch Role (Judging Demo)'}
                        </p>
                      </div>

                      {selectableRoles.map((item) => {
                        const isSelected =
                          currentRole === item.role ||
                          (item.role === 'block_officer' && currentRole === 'bdo') ||
                          (item.role === 'public_citizen' && currentRole === 'citizen');

                        return (
                          <button
                            key={item.role}
                            onClick={() => {
                              setCurrentRole(item.role);
                              setRoleDropdownOpen(false);
                            }}
                            className={`
                              w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between font-medium transition-colors
                              ${isSelected ? 'bg-[#174C3C] text-white' : 'text-[#192D3A] hover:bg-gray-100'}
                            `}
                          >
                            <span>{isHi ? item.hi : item.en}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#E99A36]" />}
                          </button>
                        );
                      })}

                      {/* Portal Navigation & Sign Out Options */}
                      <div className="pt-2 mt-2 border-t border-gray-100 space-y-1">
                        {!currentUser && (
                          <button
                            onClick={() => {
                              setActivePage('login');
                              setRoleDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between"
                          >
                            <span className="flex items-center gap-2">
                              <UserPlus className="w-3.5 h-3.5 text-emerald-700" />
                              {isHi ? 'लॉग इन / नया खाता बनाएं' : 'Sign In / Register'}
                            </span>
                            <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setActivePage('landing');
                            setRoleDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-stone-700 hover:bg-stone-100 flex items-center justify-between"
                        >
                          <span className="flex items-center gap-2">
                            <Home className="w-3.5 h-3.5 text-emerald-700" />
                            {isHi ? 'मुख्य पोर्टल पर जाएं' : 'Public Landing Page'}
                          </span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </button>
                        <button
                          onClick={() => {
                            setRoleDropdownOpen(false);
                            logout();
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut className="w-3.5 h-3.5 text-red-600" />
                          <span>{isHi ? 'सत्र समाप्त (लॉग आउट)' : 'Sign Out'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>

      {/* Global Search Dialog Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-xs pt-16 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-gray-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-[#174C3C]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isHi ? 'लाभार्थी नाम, योजना कोड, ग्राम या आईडी टाइप करें...' : 'Type beneficiary name, scheme code, village, or ID...'}
                className="flex-1 text-sm bg-transparent outline-hidden text-[#192D3A] placeholder:text-gray-400"
                autoFocus
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Result lists */}
            <div className="p-4 max-h-96 overflow-y-auto space-y-4">
              {searchResults ? (
                <>
                  {searchResults.beneficiaries.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#789B82] uppercase mb-2">
                        {isHi ? 'लाभार्थी रिकॉर्ड' : 'Beneficiaries'} ({searchResults.beneficiaries.length})
                      </p>
                      <div className="space-y-1.5">
                        {searchResults.beneficiaries.map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setActivePage('beneficiaries');
                              setIsSearchOpen(false);
                            }}
                            className="p-2.5 rounded-xl hover:bg-[#F7F6F0] border border-transparent hover:border-gray-200 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-[#192D3A]">{b.fullName} ({b.village}, {b.district})</p>
                              <span className="text-[11px] text-[#66756F]">{b.beneficiaryCode} • {b.schemeName}</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {b.verificationStatus}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.schemes.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-[#789B82] uppercase mb-2">
                        {isHi ? 'योजनाएं' : 'Schemes'} ({searchResults.schemes.length})
                      </p>
                      <div className="space-y-1.5">
                        {searchResults.schemes.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              setActivePage('schemes');
                              setIsSearchOpen(false);
                            }}
                            className="p-2.5 rounded-xl hover:bg-[#F7F6F0] border border-transparent hover:border-gray-200 cursor-pointer flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-[#192D3A]">{s.name}</p>
                              <span className="text-[11px] text-[#66756F]">{s.code} • {s.category}</span>
                            </div>
                            <span className="font-mono text-xs text-[#0D3B2E] font-bold">
                              ₹{(s.allocatedBudget / 10000000).toFixed(2)} Cr
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchResults.beneficiaries.length === 0 && searchResults.schemes.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-xs">
                      {isHi ? 'कोई मेल खाता रिकॉर्ड नहीं मिला।' : 'No matching records found for query.'}
                    </div>
                  )}
                </>
              ) : (
                <div className="py-6 text-center text-xs text-[#66756F] space-y-2">
                  <p className="font-medium">
                    {isHi ? 'शीघ्र खोज हेतु सुझाव:' : 'Quick search suggestions:'}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {['Ramesh Kumar', 'PMAY-G', 'Rohaniya', 'Jal Jeevan', 'Dubawal'].map((s) => (
                      <button
                        key={s}
                        onClick={() => setSearchQuery(s)}
                        className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs text-gray-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cryptographic Evidence Inspector Modal */}
      <EvidenceModal />
    </div>
  );
};
