import { RiskSeverity, VerificationStatus, InspectionStatus, InstallmentStatus } from '../types';

/**
 * Format Indian currency with ₹ symbol and Lakhs/Crores when appropriate
 */
export function formatINR(amount: number, compact = false): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '₹0';
  
  if (compact) {
    if (Math.abs(amount) >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(amount) >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
    if (Math.abs(amount) >= 1000) {
      return `₹${(amount / 1000).toFixed(1)} K`;
    }
  }

  // Standard Indian formatting (e.g. 1,20,500)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function getRiskColorClass(severity: RiskSeverity): {
  bg: string;
  text: string;
  border: string;
  badge: string;
} {
  switch (severity) {
    case 'Critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        badge: 'bg-[#C64242] text-white',
      };
    case 'High':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        badge: 'bg-[#D99220] text-white',
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        badge: 'bg-[#E99A36] text-white',
      };
    case 'Low':
    default:
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        badge: 'bg-[#23865B] text-white',
      };
  }
}

export function getVerificationStatusBadge(status: VerificationStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Verified':
      return { bg: 'bg-[#23865B]/10', text: 'text-[#23865B]', border: 'border-[#23865B]/30' };
    case 'Under Review':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Pending':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Flagged':
      return { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-300' };
    case 'Correction Requested':
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' };
    case 'Rejected':
      return { bg: 'bg-[#C64242]/10', text: 'text-[#C64242]', border: 'border-[#C64242]/30' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

export function getInspectionStatusBadge(status: InspectionStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Passed':
      return { bg: 'bg-[#23865B]/10', text: 'text-[#23865B]', border: 'border-[#23865B]/30' };
    case 'In Progress':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'Scheduled':
      return { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200' };
    case 'Needs Improvement':
      return { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
    case 'Failed':
      return { bg: 'bg-[#C64242]/10', text: 'text-[#C64242]', border: 'border-[#C64242]/30' };
    case 'Overdue':
      return { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
}

export function getInstallmentStatusBadge(status: InstallmentStatus): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'Disbursed':
      return { bg: 'bg-[#23865B]/10', text: 'text-[#23865B]', border: 'border-[#23865B]/30' };
    case 'Approved':
      return { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
    case 'Pending Approval':
      return { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' };
    case 'Awaiting Inspection':
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' };
    case 'On Hold':
      return { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-300' };
    case 'Rejected':
      return { bg: 'bg-[#C64242]/10', text: 'text-[#C64242]', border: 'border-[#C64242]/30' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' };
  }
}
