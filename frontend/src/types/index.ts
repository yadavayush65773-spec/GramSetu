export type UserRole = 
  | 'state_admin' 
  | 'district_officer' 
  | 'block_officer' 
  | 'bdo'
  | 'field_inspector' 
  | 'auditor' 
  | 'public_citizen'
  | 'citizen';

export type Language = 'en' | 'hi';

export type SchemeCategory = 
  | 'Housing' 
  | 'Water & Sanitation' 
  | 'Rural Infrastructure' 
  | 'Livelihood & Employment' gi
  | 'Renewable Energy';

export type VerificationStatus = 
  | 'Pending' 
  | 'Under Review' 
  | 'Verified' 
  | 'Flagged' 
  | 'Rejected' 
  | 'Correction Requested';

export type InspectionStatus = 
  | 'Scheduled' 
  | 'In Progress' 
  | 'Passed' 
  | 'Needs Improvement' 
  | 'Failed' 
  | 'Overdue';

export type InstallmentStatus = 
  | 'Awaiting Inspection' 
  | 'Pending Approval' 
  | 'Approved' 
  | 'Disbursed' 
  | 'Rejected' 
  | 'On Hold';

export type RiskSeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export interface LocationHierarchy {
  districtId: string;
  districtName: string;
  districtNameHi: string;
  blockId: string;
  blockName: string;
  blockNameHi: string;
  villageId: string;
  villageName: string;
  villageNameHi: string;
  lat: number;
  lng: number;
}

export interface Scheme {
  id: string;
  code: string;
  name: string;
  nameHi: string;
  description: string;
  descriptionHi: string;
  category: SchemeCategory;
  district: string;
  allocatedBudget: number; // in INR
  utilizedBudget: number;  // in INR
  targetBeneficiaries: number;
  enrolledBeneficiaries: number;
  completedProjects: number;
  startDate: string;
  endDate: string;
  responsibleOfficer: string;
  status: 'Active' | 'Review' | 'Completed' | 'Delayed';
  milestones: {
    id: string;
    title: string;
    targetDate: string;
    completed: boolean;
    completionPct: number;
  }[];
  // Official Government Verification Metadata (myScheme & Ministry Portals)
  ministry?: string;
  ministryHi?: string;
  schemeType?: string;
  officialPortalUrl?: string;
  sourceVerificationUrl?: string;
  benefitsSummary?: string;
  benefitsSummaryHi?: string;
  eligibilityCriteria?: string[];
  requiredDocuments?: string[];
  verificationDate?: string;
  isOfficialVerified?: boolean;
}

export interface BeneficiaryDocument {
  id: string;
  docType: 'Simulated Ration Card' | 'Land Possession Certificate' | 'Bank Passbook Copy' | 'Job Card ID' | 'Field Geo-Photo';
  docNumberMasked: string; // Fictional masked
  fileUrl?: string;
  uploadedDate: string;
  sha256Hash: string;
  verified: boolean;
  notes?: string;
}

export interface Beneficiary {
  id: string;
  beneficiaryCode: string; // e.g., GS-BEN-2026-081
  fullName: string;
  fullNameHi: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  phoneMasked: string;
  village: string;
  villageHi: string;
  block: string;
  district: string;
  schemeId: string;
  schemeName: string;
  applicationDate: string;
  verificationStatus: VerificationStatus;
  assignedOfficer: string;
  riskScore: number; // 0-100
  riskSeverity: RiskSeverity;
  riskFlags: string[];
  eligibilityChecklist: {
    id: string;
    criterion: string;
    met: boolean;
  }[];
  documents: BeneficiaryDocument[];
  currentInstallmentNo: number;
  totalInstallments: number;
  totalApprovedAmount: number;
  disbursedAmount: number;
  coordinates: {
    lat: number;
    lng: number;
  };
  notes?: string;
}

export interface FieldInspection {
  id: string;
  inspectionCode: string; // e.g., GS-INSP-2026-104
  beneficiaryId: string;
  beneficiaryName: string;
  schemeId: string;
  schemeName: string;
  village: string;
  block: string;
  district: string;
  scheduledDate: string;
  completedDate?: string;
  inspectorName: string;
  status: InspectionStatus;
  stage: 'Foundation' | 'Plinth Level' | 'Lintel & Roof Casting' | 'Roof Cast' | 'Pipeline Installation' | 'Solar Panel Mounting' | 'Final Handover';
  gpsLocation: {
    lat: number;
    lng: number;
    accuracyMeters?: number;
    isDeviceGps: boolean; // true = device verified, false = manual entry
  };
  checklist: {
    item: string;
    status: 'Pass' | 'Fail' | 'NA';
    comment?: string;
  }[];
  evidencePhotos: {
    id: string;
    caption: string;
    timestamp: string;
    fileSizeKb: number;
    sha256Hash: string;
    thumbnailUrl: string;
  }[];
  observations: string;
  correctiveActionsRequired?: string;
  followUpDeadline?: string;
  syncedFromServer: boolean;
}

export interface Installment {
  id: string;
  installmentNumber: number;
  beneficiaryId: string;
  beneficiaryName: string;
  village: string;
  block: string;
  district: string;
  schemeId: string;
  schemeName: string;
  amount: number; // in INR
  requestedDate: string;
  approvalDate?: string;
  disbursementDate?: string;
  status: InstallmentStatus;
  linkedInspectionId?: string;
  prerequisitesMet: {
    physicalMilestoneVerified: boolean;
    photoEvidenceShaVerified: boolean;
    blockOfficerEndorsement: boolean;
    budgetAllocationAvailable: boolean;
  };
  approverOfficer?: string;
  rejectionReason?: string;
  disbursementRef?: string;
}

export interface FraudRiskCase {
  id: string;
  caseCode: string;
  title: string;
  titleHi: string;
  beneficiaryId: string;
  beneficiaryName: string;
  schemeName: string;
  district: string;
  block: string;
  village: string;
  riskScore: number; // 0-100
  severity: RiskSeverity;
  flagDate: string;
  status: 'Under Review' | 'Escalated' | 'Resolved (False Positive)' | 'Enforcement Initiated';
  indicators: {
    factor: string;
    points: number;
    evidenceText: string;
    evidenceRef?: string;
  }[];
  recommendedAction: string;
  reviewedBy?: string;
  reviewNotes?: string;
  resolutionTimestamp?: string;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  targetEntity: 'Beneficiary' | 'Inspection' | 'Installment' | 'Scheme' | 'RiskCase' | 'System';
  targetId: string;
  targetCode: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  sha256EvidenceRef?: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  titleHi: string;
  message: string;
  messageHi: string;
  type: 'alert' | 'approval' | 'sync' | 'inspection';
  severity: 'info' | 'warning' | 'critical' | 'success';
  timestamp: string;
  read: boolean;
  targetPage?: string;
  targetId?: string;
}

export interface OfflineSyncItem {
  id: string;
  type: 'inspection_draft' | 'verification_update' | 'installment_decision';
  recordId: string;
  payload: any;
  createdOfflineAt: string;
  status: 'pending' | 'syncing' | 'synced' | 'conflict';
  conflictDetails?: string;
}

export interface Grievance {
  id: string;
  trackingId: string;
  citizenName: string;
  phoneMasked: string;
  village: string;
  district: string;
  schemeName: string;
  category: 'Delayed Installment' | 'Inspection Irregularity' | 'Application Grievance' | 'Corrupt Practice Allegation';
  description: string;
  submissionDate: string;
  status: 'Received' | 'Under Investigation' | 'Redressed' | 'Closed';
  officerRemarks?: string;
}
