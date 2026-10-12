import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrencyLPA(lpa: number): string {
  return `₹${lpa.toFixed(2)} LPA`;
}

export function formatMonthlyStipend(stipend?: number): string {
  if (!stipend) return 'Not Disclosed';
  return `₹${stipend.toLocaleString('en-IN')}/mo`;
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'TBA';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatDateTime(dateStr?: string): string {
  if (!dateStr) return 'TBA';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'Super Dream':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'Dream':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'Tier 1':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Tier 2':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-200';
  }
}

export function getApplicationStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Selected':
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    case 'Interviewing':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'Shortlisted':
      return 'bg-amber-100 text-amber-800 border-amber-300';
    case 'Applied':
      return 'bg-slate-100 text-slate-700 border-slate-300';
    case 'Rejected':
      return 'bg-rose-100 text-rose-800 border-rose-300';
    case 'Withdrawn':
      return 'bg-gray-100 text-gray-600 border-gray-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
}

export function getDriveStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Ongoing':
      return 'bg-emerald-100 text-emerald-700 border-emerald-300 animate-pulse';
    case 'Upcoming':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    case 'Completed':
      return 'bg-slate-100 text-slate-600 border-slate-300';
    case 'Cancelled':
      return 'bg-rose-100 text-rose-700 border-rose-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
}
