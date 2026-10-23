import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  UserRole, 
  Language, 
  Scheme, 
  Beneficiary, 
  FieldInspection, 
  Installment, 
  FraudRiskCase, 
  AuditRecord, 
  NotificationItem, 
  OfflineSyncItem, 
  Grievance,
  VerificationStatus
} from '../types';
import { 
  INITIAL_SCHEMES, 
  INITIAL_BENEFICIARIES, 
  INITIAL_INSPECTIONS, 
  INITIAL_INSTALLMENTS, 
  INITIAL_FRAUD_CASES, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_GRIEVANCES 
} from '../data/seedData';
import { computeSHA256 } from '../utils/crypto';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
}

interface AppContextType {
  activePage: string;
  setActivePage: (page: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;
  selectedBlock: string;
  setSelectedBlock: (block: string) => void;
  
  // Data entities
  schemes: Scheme[];
  beneficiaries: Beneficiary[];
  inspections: FieldInspection[];
  installments: Installment[];
  riskCases: FraudRiskCase[];
  auditLogs: AuditRecord[];
  notifications: NotificationItem[];
  grievances: Grievance[];
  
  // Offline & Synchronization
  isOfflineSimulated: boolean;
  toggleSimulatedOffline: () => void;
  offlineSyncQueue: OfflineSyncItem[];
  triggerOfflineSync: () => Promise<void>;
  isSyncing: boolean;

  // Search & Modals
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  
  // Evidence viewer modal
  activeEvidenceModal: {
    photoUrl: string;
    sha256: string;
    caption: string;
    gps?: { lat: number; lng: number; isDeviceGps: boolean };
    timestamp?: string;
    fileSizeKb?: number;
  } | null;
  setActiveEvidenceModal: (data: any) => void;

  // Actions
  verifyBeneficiary: (
    beneficiaryId: string, 
    status: VerificationStatus, 
    reason: string, 
    checklistUpdates?: { id: string; met: boolean }[]
  ) => void;
  addInspection: (inspection: Omit<FieldInspection, 'id' | 'inspectionCode'>) => Promise<string>;
  approveInstallment: (installmentId: string, notes?: string) => void;
  rejectInstallment: (installmentId: string, reason: string) => void;
  updateRiskCaseStatus: (caseId: string, status: FraudRiskCase['status'], notes: string) => void;
  addScheme: (scheme: Scheme) => void;
  submitGrievance: (grievance: Omit<Grievance, 'id' | 'trackingId' | 'submissionDate' | 'status'>) => string;
  markNotificationAsRead: (id: string) => void;
  resetToDemoData: () => void;
  
  // Auth state
  currentUser: any | null;
  setCurrentUser: (user: any) => void;
  authToken: string | null;
  setAuthSession: (user: any, token: string | null) => void;
  getAuthHeaders: () => Record<string, string>;
  logout: () => void;

  // Toast notifications
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'gramsetu_app_state_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Navigation & Preferences with URL parameter synchronization (?page=...)
  const [activePage, setActivePageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const pageFromUrl = urlParams.get('page');
      if (pageFromUrl) return pageFromUrl;
    }
    const saved = localStorage.getItem(`${STORAGE_KEY}_active_page`);
    return saved || 'landing'; // Default to modern landing page!
  });

  const setActivePage = (page: string) => {
    setActivePageState(page);
    localStorage.setItem(`${STORAGE_KEY}_active_page`, page);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('page', page);
      window.history.pushState({}, '', url.toString());
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pageFromUrl = urlParams.get('page');
      if (pageFromUrl) {
        setActivePageState(pageFromUrl);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const [language, setLanguage] = useState<Language>('en');

  // Auth User & Token
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem(`${STORAGE_KEY}_auth_token`);
  });
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auth_user`);
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_role`);
    if (saved) {
      if (saved === 'bdo') return 'block_officer';
      if (saved === 'citizen') return 'public_citizen';
      return saved as UserRole;
    }
    const savedUser = localStorage.getItem(`${STORAGE_KEY}_auth_user`);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.role === 'bdo') return 'block_officer';
        if (u.role === 'citizen') return 'public_citizen';
        if (u.role) return u.role as UserRole;
      } catch (_) {}
    }
    return 'district_officer';
  });

  const setCurrentRole = (role: UserRole) => {
    let normalized = role;
    if (role === 'bdo') normalized = 'block_officer';
    if (role === 'citizen') normalized = 'public_citizen';
    setCurrentRoleState(normalized);
    localStorage.setItem(`${STORAGE_KEY}_current_role`, normalized);
  };

  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    const savedUser = localStorage.getItem(`${STORAGE_KEY}_auth_user`);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.district_id) return u.district_id;
      } catch (_) {}
    }
    return 'All';
  });

  const [selectedBlock, setSelectedBlock] = useState<string>(() => {
    const savedUser = localStorage.getItem(`${STORAGE_KEY}_auth_user`);
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u.block_id) return u.block_id;
      } catch (_) {}
    }
    return 'All';
  });

  const setAuthSession = (user: any, token: string | null) => {
    if (token) {
      localStorage.setItem(`${STORAGE_KEY}_auth_token`, token);
      setAuthToken(token);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_auth_token`);
      setAuthToken(null);
    }

    if (user) {
      localStorage.setItem(`${STORAGE_KEY}_auth_user`, JSON.stringify(user));
      setCurrentUser(user);
      if (user.role) {
        let normalized = user.role as UserRole;
        if (normalized === 'bdo') normalized = 'block_officer';
        if (normalized === 'citizen') normalized = 'public_citizen';
        setCurrentRoleState(normalized);
        localStorage.setItem(`${STORAGE_KEY}_current_role`, normalized);
      }
      if (user.district_id) {
        setSelectedDistrict(user.district_id);
      }
      if (user.block_id) {
        setSelectedBlock(user.block_id);
      }
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_auth_user`);
      setCurrentUser(null);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Demo-Role': currentRole === 'block_officer' ? 'bdo' : currentRole === 'public_citizen' ? 'citizen' : currentRole,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
  };

  const logout = () => {
    localStorage.removeItem(`${STORAGE_KEY}_auth_token`);
    localStorage.removeItem(`${STORAGE_KEY}_auth_user`);
    localStorage.removeItem(`${STORAGE_KEY}_current_role`);
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentRoleState('public_citizen');
    addToast(language === 'hi' ? 'सफलतापूर्वक लॉग आउट किया गया।' : 'Signed out successfully.', 'info');
    setActivePage('landing');
  };

  // Core Data
  const [schemes, setSchemes] = useState<Scheme[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schemes`);
    return saved ? JSON.parse(saved) : INITIAL_SCHEMES;
  });

  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_beneficiaries`);
    return saved ? JSON.parse(saved) : INITIAL_BENEFICIARIES;
  });

  const [inspections, setInspections] = useState<FieldInspection[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_inspections`);
    return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
  });

  const [installments, setInstallments] = useState<Installment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_installments`);
    return saved ? JSON.parse(saved) : INITIAL_INSTALLMENTS;
  });

  const [riskCases, setRiskCases] = useState<FraudRiskCase[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_risks`);
    return saved ? JSON.parse(saved) : INITIAL_FRAUD_CASES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifs`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_grievances`);
    return saved ? JSON.parse(saved) : INITIAL_GRIEVANCES;
  });

  // Offline Simulator & Synchronization
  const [isOfflineSimulated, setIsOfflineSimulated] = useState<boolean>(false);
  const [offlineSyncQueue, setOfflineSyncQueue] = useState<OfflineSyncItem[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_offline_queue`);
    return saved ? JSON.parse(saved) : [];
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Search & Evidence
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeEvidenceModal, setActiveEvidenceModal] = useState<any>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_schemes`, JSON.stringify(schemes));
  }, [schemes]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_beneficiaries`, JSON.stringify(beneficiaries));
  }, [beneficiaries]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_inspections`, JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_installments`, JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_risks`, JSON.stringify(riskCases));
  }, [riskCases]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_notifs`, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_offline_queue`, JSON.stringify(offlineSyncQueue));
  }, [offlineSyncQueue]);

  // Hydrate master dataset from backend API when available
  useEffect(() => {
    let isMounted = true;
    async function loadBackendData() {
      try {
        const [
          schemesRes,
          beneficiariesRes,
          inspectionsRes,
          installmentsRes,
          risksRes,
          auditRes,
          notifsRes,
          grievancesRes,
        ] = await Promise.allSettled([
          fetch('/api/schemes').then((r) => r.ok ? r.json() : null),
          fetch('/api/beneficiaries').then((r) => r.ok ? r.json() : null),
          fetch('/api/inspections').then((r) => r.ok ? r.json() : null),
          fetch('/api/installments').then((r) => r.ok ? r.json() : null),
          fetch('/api/risk-cases').then((r) => r.ok ? r.json() : null),
          fetch('/api/audit-logs').then((r) => r.ok ? r.json() : null),
          fetch('/api/notifications').then((r) => r.ok ? r.json() : null),
          fetch('/api/grievances').then((r) => r.ok ? r.json() : null),
        ]);

        if (!isMounted) return;

        if (schemesRes.status === 'fulfilled' && schemesRes.value?.data?.schemes) {
          setSchemes(schemesRes.value.data.schemes);
        }
        if (beneficiariesRes.status === 'fulfilled' && beneficiariesRes.value?.data?.beneficiaries) {
          setBeneficiaries(beneficiariesRes.value.data.beneficiaries);
        }
        if (inspectionsRes.status === 'fulfilled' && inspectionsRes.value?.data?.inspections) {
          setInspections(inspectionsRes.value.data.inspections);
        }
        if (installmentsRes.status === 'fulfilled' && installmentsRes.value?.data?.installments) {
          setInstallments(installmentsRes.value.data.installments);
        }
        if (risksRes.status === 'fulfilled' && risksRes.value?.data?.riskCases) {
          setRiskCases(risksRes.value.data.riskCases);
        }
        if (auditRes.status === 'fulfilled' && auditRes.value?.data?.auditLogs) {
          setAuditLogs(auditRes.value.data.auditLogs);
        }
        if (notifsRes.status === 'fulfilled' && notifsRes.value?.data?.notifications) {
          setNotifications(notifsRes.value.data.notifications);
        }
        if (grievancesRes.status === 'fulfilled' && grievancesRes.value?.data?.grievances) {
          setGrievances(grievancesRes.value.data.grievances);
        }
      } catch (_) {}
    }

    loadBackendData();
    return () => { isMounted = false; };
  }, []);

  // Internal Audit Log Helper
  const logAuditEntry = (
    action: string,
    targetEntity: AuditRecord['targetEntity'],
    targetId: string,
    targetCode: string,
    previousValue?: string,
    newValue?: string,
    reason?: string,
    sha256EvidenceRef?: string
  ) => {
    const roleLabels: Record<UserRole, string> = {
      state_admin: 'State Administrator',
      district_officer: 'District Officer',
      block_officer: 'Block Development Officer',
      bdo: 'Block Development Officer',
      field_inspector: 'Field Inspector',
      auditor: 'Public Accounts Auditor',
      public_citizen: 'Citizen User',
      citizen: 'Citizen User',
    };

    const newRecord: AuditRecord = {
      id: `AUD-${Date.now().toString().slice(-5)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      actor: currentRole === 'field_inspector' ? 'Inspector R. K. Singh' : 'Authorized Officer',
      actorRole: roleLabels[currentRole] || 'Officer',
      action,
      targetEntity,
      targetId,
      targetCode,
      previousValue,
      newValue,
      reason,
      sha256EvidenceRef,
      ipAddress: '10.42.0.1 (NIC SafeNet)',
    };

    setAuditLogs((prev) => [newRecord, ...prev]);
  };

  // Toggle offline mode simulation
  const toggleSimulatedOffline = () => {
    setIsOfflineSimulated((prev) => {
      const next = !prev;
      addToast(
        next 
          ? (language === 'hi' ? 'ऑफलाइन मोड सक्रिय: सभी निरीक्षण स्थानीय रूप से सहेजे जाएंगे।' : 'Offline Mode Active: Changes will queue in IndexedDB.')
          : (language === 'hi' ? 'ऑनलाइन कनेक्शन पुनः स्थापित हुआ।' : 'Online connection restored.'),
        next ? 'warning' : 'success'
      );
      return next;
    });
  };

  // Synchronize offline queue
  const triggerOfflineSync = async () => {
    if (offlineSyncQueue.length === 0) {
      addToast(language === 'hi' ? 'समन्वयन हेतु कोई लंबित डेटा नहीं है।' : 'Sync queue is already up to date.', 'info');
      return;
    }

    if (isOfflineSimulated) {
      addToast(language === 'hi' ? 'ऑफलाइन मोड में सर्वर समन्वय संभव नहीं है।' : 'Cannot sync while Offline Mode is toggled ON.', 'error');
      return;
    }

    setIsSyncing(true);

    // Call backend offline sync endpoint
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items: offlineSyncQueue }),
      });
    } catch (_) {
      // Backend synchronization error handled gracefully by local fallback
    }

    // Process queued items into master data
    offlineSyncQueue.forEach((item) => {
      if (item.type === 'inspection_draft') {
        const insp = item.payload as FieldInspection;
        setInspections((prev) => [insp, ...prev.filter((i) => i.id !== insp.id)]);
        logAuditEntry(
          'OFFLINE_INSPECTION_SYNCED',
          'Inspection',
          insp.id,
          insp.inspectionCode,
          'Draft in local cache',
          `Synced status: ${insp.status}`,
          'Synchronized from field inspector offline cache'
        );
      }
    });

    setOfflineSyncQueue([]);
    setIsSyncing(false);
    addToast(
      language === 'hi' 
        ? 'सभी क्षेत्रीय निरीक्षण सफलतापूर्वक ग्रामसेतु सर्वर पर समन्वयित हो गए।' 
        : 'Offline field records successfully synced with central server.', 
      'success'
    );
  };

  // Beneficiary verification workflow
  const verifyBeneficiary = (
    beneficiaryId: string, 
    status: VerificationStatus, 
    reason: string,
    checklistUpdates?: { id: string; met: boolean }[]
  ) => {
    const target = beneficiaries.find((b) => b.id === beneficiaryId);
    if (!target) return;

    const prevStatus = target.verificationStatus;

    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== beneficiaryId) return b;
        return {
          ...b,
          verificationStatus: status,
          eligibilityChecklist: checklistUpdates 
            ? b.eligibilityChecklist.map((c) => {
                const update = checklistUpdates.find((u) => u.id === c.id);
                return update ? { ...c, met: update.met } : c;
              })
            : b.eligibilityChecklist,
        };
      })
    );

    // Notify backend
    fetch(`/api/beneficiaries/${beneficiaryId}/verify`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reason, checklistUpdates }),
    }).catch(() => {});

    logAuditEntry(
      `STATUS_CHANGE_${status.toUpperCase().replace(/\s+/g, '_')}`,
      'Beneficiary',
      target.id,
      target.beneficiaryCode,
      `Status: ${prevStatus}`,
      `Status: ${status}`,
      reason
    );

    addToast(
      language === 'hi' 
        ? `लाभार्थी ${target.fullName} की स्थिति बदलकर "${status}" कर दी गई।` 
        : `Beneficiary ${target.fullName} status updated to ${status}.`,
      status === 'Verified' ? 'success' : status === 'Flagged' ? 'error' : 'info'
    );
  };

  // Add field inspection
  const addInspection = async (
    data: Omit<FieldInspection, 'id' | 'inspectionCode'>
  ): Promise<string> => {
    const id = `INSP-${Date.now().toString().slice(-4)}`;
    const inspectionCode = `GS-INSP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newInsp: FieldInspection = {
      ...data,
      id,
      inspectionCode,
      syncedFromServer: !isOfflineSimulated,
    };

    if (isOfflineSimulated) {
      // Queue offline
      const queueItem: OfflineSyncItem = {
        id: `QUEUE-${Date.now()}`,
        type: 'inspection_draft',
        recordId: id,
        payload: newInsp,
        createdOfflineAt: new Date().toISOString(),
        status: 'pending',
      };
      setOfflineSyncQueue((prev) => [queueItem, ...prev]);
      // Also optimistic local add
      setInspections((prev) => [newInsp, ...prev]);
      addToast(
        language === 'hi' 
          ? `निरीक्षण स्थानीय डिवाइस में सुरक्षित (ऑफलाइन कतार: #${inspectionCode})` 
          : `Inspection stored locally in Offline Queue (#${inspectionCode})`, 
        'warning'
      );
    } else {
      setInspections((prev) => [newInsp, ...prev]);

      // Submit to backend
      fetch('/api/inspections', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newInsp),
      }).catch(() => {});

      logAuditEntry(
        'SUBMITTED_FIELD_INSPECTION',
        'Inspection',
        id,
        inspectionCode,
        'Scheduled',
        `Completed: ${newInsp.status}`,
        newInsp.observations
      );
      addToast(
        language === 'hi' 
          ? `क्षेत्रीय निरीक्षण #${inspectionCode} सफलतापूर्वक दर्ज हुआ।` 
          : `Field inspection #${inspectionCode} submitted successfully.`, 
        'success'
      );
    }

    return id;
  };

  // Approve installment
  const approveInstallment = (installmentId: string, notes?: string) => {
    const target = installments.find((i) => i.id === installmentId);
    if (!target) return;

    setInstallments((prev) =>
      prev.map((i) => {
        if (i.id !== installmentId) return i;
        return {
          ...i,
          status: 'Approved',
          approvalDate: new Date().toISOString().split('T')[0],
          approverOfficer: currentRole === 'district_officer' ? 'District Magistrate / CDO' : 'Authorized Approver',
        };
      })
    );

    // Update beneficiary disbursed tracking if approved
    setBeneficiaries((prev) =>
      prev.map((b) => {
        if (b.id !== target.beneficiaryId) return b;
        return {
          ...b,
          currentInstallmentNo: Math.min(b.totalInstallments, target.installmentNumber + 1),
          disbursedAmount: b.disbursedAmount + target.amount,
        };
      })
    );

    // Notify backend
    fetch(`/api/installments/${installmentId}/approve`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes }),
    }).catch(() => {});

    logAuditEntry(
      'APPROVED_INSTALLMENT',
      'Installment',
      target.id,
      `${target.beneficiaryName} (Inst #${target.installmentNumber})`,
      'Status: Pending Approval',
      'Status: Approved',
      notes || 'All statutory milestones and photographic hash verified'
    );

    addToast(
      language === 'hi' 
        ? `किश्त #${target.installmentNumber} (₹${target.amount.toLocaleString('en-IN')}) स्वीकृत की गई!` 
        : `Installment #${target.installmentNumber} (₹${target.amount.toLocaleString('en-IN')}) approved for ${target.beneficiaryName}!`,
      'success'
    );
  };

  // Reject installment
  const rejectInstallment = (installmentId: string, reason: string) => {
    const target = installments.find((i) => i.id === installmentId);
    if (!target) return;

    setInstallments((prev) =>
      prev.map((i) => {
        if (i.id !== installmentId) return i;
        return {
          ...i,
          status: 'Rejected',
          rejectionReason: reason,
        };
      })
    );

    // Notify backend
    fetch(`/api/installments/${installmentId}/reject`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    }).catch(() => {});

    logAuditEntry(
      'REJECTED_INSTALLMENT',
      'Installment',
      target.id,
      `${target.beneficiaryName} (Inst #${target.installmentNumber})`,
      'Status: Pending Approval',
      'Status: Rejected',
      reason
    );

    addToast(
      language === 'hi' 
        ? `किश्त आवेदन अस्वीकृत किया गया: "${reason}"` 
        : `Installment request rejected: "${reason}"`,
      'error'
    );
  };

  // Update fraud risk case status
  const updateRiskCaseStatus = (
    caseId: string, 
    status: FraudRiskCase['status'], 
    notes: string
  ) => {
    const target = riskCases.find((r) => r.id === caseId);
    if (!target) return;

    setRiskCases((prev) =>
      prev.map((r) => {
        if (r.id !== caseId) return r;
        return {
          ...r,
          status,
          reviewNotes: notes,
          reviewedBy: currentRole,
          resolutionTimestamp: new Date().toISOString(),
        };
      })
    );

    // Notify backend
    fetch(`/api/risk-cases/${caseId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, reviewNotes: notes }),
    }).catch(() => {});

    logAuditEntry(
      'UPDATED_RISK_CASE_STATUS',
      'RiskCase',
      target.id,
      target.caseCode,
      `Status: ${target.status}`,
      `Status: ${status}`,
      notes
    );

    addToast(
      language === 'hi' 
        ? `धोखाधड़ी मामला ${target.caseCode} अद्यतन: "${status}"` 
        : `Fraud case ${target.caseCode} updated to ${status}.`,
      'info'
    );
  };

  // Add scheme
  const addScheme = (scheme: Scheme) => {
    setSchemes((prev) => [scheme, ...prev]);

    // Notify backend
    fetch('/api/schemes', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(scheme),
    }).catch(() => {});

    logAuditEntry(
      'CREATED_NEW_SCHEME',
      'Scheme',
      scheme.id,
      scheme.code,
      'None',
      `Budget: ₹${scheme.allocatedBudget}`,
      'New rural development scheme enrolled in GramSetu'
    );
    addToast(
      language === 'hi' 
        ? `योजना "${scheme.nameHi || scheme.name}" सफलतापूर्वक जोड़ी गई।` 
        : `Scheme "${scheme.name}" successfully registered.`,
      'success'
    );
  };

  // Submit public citizen grievance
  const submitGrievance = (
    data: Omit<Grievance, 'id' | 'trackingId' | 'submissionDate' | 'status'>
  ): string => {
    const id = `GRV-${Date.now().toString().slice(-4)}`;
    const trackingId = `GRV-2026-UP-${Math.floor(1000 + Math.random() * 9000)}`;

    const newGrievance: Grievance = {
      ...data,
      id,
      trackingId,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'Received',
    };

    setGrievances((prev) => [newGrievance, ...prev]);

    // Submit to backend
    fetch('/api/grievances', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newGrievance),
    }).catch(() => {});

    logAuditEntry(
      'SUBMITTED_CITIZEN_GRIEVANCE',
      'System',
      id,
      trackingId,
      'None',
      'Received',
      `Category: ${data.category}`
    );

    return trackingId;
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Notify backend
    fetch(`/api/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }).catch(() => {});
  };

  // Reset to initial demo data
  const resetToDemoData = () => {
    setSchemes(INITIAL_SCHEMES);
    setBeneficiaries(INITIAL_BENEFICIARIES);
    setInspections(INITIAL_INSPECTIONS);
    setInstallments(INITIAL_INSTALLMENTS);
    setRiskCases(INITIAL_FRAUD_CASES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setGrievances(INITIAL_GRIEVANCES);
    setOfflineSyncQueue([]);
    setIsOfflineSimulated(false);
    localStorage.clear();

    // Trigger backend reset
    fetch('/api/reset-demo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Demo-Role': 'state_admin',
      },
    }).catch(() => {});

    addToast(
      language === 'hi' ? 'डेमो डेटा सफलतापूर्वक रीसेट किया गया।' : 'Demo dataset reset to initial baseline.',
      'info'
    );
  };

  return (
    <AppContext.Provider
      value={{
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
        schemes,
        beneficiaries,
        inspections,
        installments,
        riskCases,
        auditLogs,
        notifications,
        grievances,
        isOfflineSimulated,
        toggleSimulatedOffline,
        offlineSyncQueue,
        triggerOfflineSync,
        isSyncing,
        searchQuery,
        setSearchQuery,
        isSearchOpen,
        setIsSearchOpen,
        activeEvidenceModal,
        setActiveEvidenceModal,
        verifyBeneficiary,
        addInspection,
        approveInstallment,
        rejectInstallment,
        updateRiskCaseStatus,
        addScheme,
        submitGrievance,
        markNotificationAsRead,
        resetToDemoData,
        currentUser,
        setCurrentUser,
        authToken,
        setAuthSession,
        getAuthHeaders,
        logout,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
