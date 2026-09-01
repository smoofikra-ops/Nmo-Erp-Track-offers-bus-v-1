import { ExpiryRiskLevel, ExpiryStatusResult } from '@/types/documents';

/**
 * Safely parses any date representation into a Date object or null
 */
export function safeParseDate(val: any): Date | null {
  if (!val) return null;
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }
  
  if (typeof val === 'number') {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(val).trim();
  if (!str || str === '-' || str === 'null' || str === 'undefined') return null;

  // Try standard ISO / YYYY-MM-DD
  const isoDate = new Date(str);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[/.-]/);
  if (parts.length === 3) {
    const p0 = parseInt(parts[0], 10);
    const p1 = parseInt(parts[1], 10);
    const p2 = parseInt(parts[2], 10);

    // If first part is 4 digits -> YYYY/MM/DD
    if (p0 > 1000) {
      const d = new Date(p0, p1 - 1, p2);
      if (!isNaN(d.getTime())) return d;
    } else if (p2 > 1000) {
      // DD/MM/YYYY
      const d = new Date(p2, p1 - 1, p0);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/**
 * Safely formats a date into YYYY-MM-DD for forms or display
 */
export function formatDateArabic(val: any, fallback: string = '-'): string {
  const d = safeParseDate(val);
  if (!d) return fallback;
  try {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  } catch {
    return fallback;
  }
}

/**
 * Robust Expiry Engine for Company Documents
 * Thresholds:
 * - HasExpiry = false -> NO_EXPIRY
 * - Empty / unparseable -> NOT_SET
 * - Past expiry -> EXPIRED
 * - 0 to 7 days -> CRITICAL
 * - 8 to 30 days -> WARNING
 * - 31 to 60 days -> ATTENTION
 * - > 60 days (or > reminderThreshold) -> SAFE
 */
export function calculateDocumentExpiry(
  expiryDateVal: any,
  hasExpiry: boolean = true,
  customReminderDays: number = 60,
  issueDateVal?: any
): ExpiryStatusResult {
  if (!hasExpiry) {
    return {
      status: 'NO_EXPIRY',
      daysRemaining: 9999,
      isExpired: false,
      label: 'لا تتطلب تجديد دوري',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      borderClass: 'border-slate-200 dark:border-slate-800',
      bgGlowClass: '',
      progressPercent: 100,
      urgencyRank: 5,
    };
  }

  const expDate = safeParseDate(expiryDateVal);
  if (!expDate) {
    return {
      status: 'NOT_SET',
      daysRemaining: 0,
      isExpired: false,
      label: 'تاريخ الانتهاء غير محدد',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      borderClass: 'border-amber-200 dark:border-amber-900',
      bgGlowClass: '',
      progressPercent: 0,
      urgencyRank: 4,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expClone = new Date(expDate);
  expClone.setHours(0, 0, 0, 0);

  const diffTime = expClone.getTime() - today.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Determine progress if issue date is available
  let progressPercent = 100;
  const issDate = safeParseDate(issueDateVal);
  if (issDate) {
    const totalDuration = expClone.getTime() - issDate.getTime();
    if (totalDuration > 0) {
      const elapsed = today.getTime() - issDate.getTime();
      progressPercent = Math.max(0, Math.min(100, Math.round((1 - elapsed / totalDuration) * 100)));
    }
  }

  if (daysRemaining < 0) {
    const positiveDays = Math.abs(daysRemaining);
    return {
      status: 'EXPIRED',
      daysRemaining,
      isExpired: true,
      label: `منتهية منذ ${positiveDays === 1 ? 'يوم واحد' : positiveDays === 2 ? 'يومين' : `${positiveDays} يوم`}`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
      borderClass: 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-500/20',
      bgGlowClass: 'shadow-sm shadow-rose-500/10',
      progressPercent: 0,
      urgencyRank: 0,
    };
  }

  if (daysRemaining === 0) {
    return {
      status: 'CRITICAL',
      daysRemaining: 0,
      isExpired: false,
      label: 'تنتهي اليوم!',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700',
      borderClass: 'border-rose-400 dark:border-rose-700 ring-2 ring-rose-500/30',
      bgGlowClass: 'shadow-md shadow-rose-500/20',
      progressPercent: 5,
      urgencyRank: 1,
    };
  }

  if (daysRemaining <= 7) {
    return {
      status: 'CRITICAL',
      daysRemaining,
      isExpired: false,
      label: `عاجل: متبقي ${daysRemaining === 1 ? 'يوم واحد' : daysRemaining === 2 ? 'يومين' : `${daysRemaining} أيام`}`,
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
      borderClass: 'border-rose-300 dark:border-rose-800 ring-1 ring-rose-500/20',
      bgGlowClass: 'shadow-sm shadow-rose-500/10',
      progressPercent: Math.max(10, Math.min(25, daysRemaining * 3)),
      urgencyRank: 1,
    };
  }

  if (daysRemaining <= 30) {
    return {
      status: 'WARNING',
      daysRemaining,
      isExpired: false,
      label: `متبقي ${daysRemaining} يوم`,
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800',
      borderClass: 'border-amber-300 dark:border-amber-800',
      bgGlowClass: 'shadow-sm shadow-amber-500/10',
      progressPercent: Math.max(25, Math.min(50, daysRemaining * 1.5)),
      urgencyRank: 2,
    };
  }

  if (daysRemaining <= Math.max(60, customReminderDays)) {
    return {
      status: 'ATTENTION',
      daysRemaining,
      isExpired: false,
      label: `متبقي ${daysRemaining} يوم`,
      badgeClass: 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
      borderClass: 'border-yellow-200 dark:border-yellow-800/80',
      bgGlowClass: '',
      progressPercent: Math.max(50, Math.min(75, daysRemaining)),
      urgencyRank: 3,
    };
  }

  return {
    status: 'SAFE',
    daysRemaining,
    isExpired: false,
    label: `سارية (متبقي ${daysRemaining} يوم)`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    borderClass: 'border-emerald-200/80 dark:border-emerald-900/60',
    bgGlowClass: '',
    progressPercent: 100,
    urgencyRank: 4,
  };
}
