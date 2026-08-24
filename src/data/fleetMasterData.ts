export interface VehicleBrandModel {
  brand: string;
  brandEn?: string;
  models: string[];
}

export const DEFAULT_VEHICLE_BRANDS: VehicleBrandModel[] = [
  {
    brand: 'تويوتا',
    brandEn: 'Toyota',
    models: [
      'كامري', 'كورولا', 'يارس', 'لاندكروزر', 'برادو', 'هايلكس', 'هايس', 
      'فورتشنر', 'راف فور (RAV4)', 'أفالون', 'إينوفا', 'كوستر', 'رايز', 'كراون', 'فيلوز', 'أوربان كروزر', 'أوربان كروزر هايلاندر'
    ]
  },
  {
    brand: 'هيونداي',
    brandEn: 'Hyundai',
    models: [
      'إلنترا', 'أكسنت', 'سوناتا', 'أزيرا', 'توسان', 'سنتافي', 'ستاريا', 
      'كريتا', 'فينيو', 'باليسيد', 'إتش 1 (H1)', 'كونا', 'كاستو'
    ]
  },
  {
    brand: 'نيسان',
    brandEn: 'Nissan',
    models: [
      'صني', 'باترول', 'التيما', 'سنترا', 'باثفايندر', 'ماكسيما', 
      'كيكس', 'نافارا', 'إكس تريل', 'أورفان', 'باترول سفاري'
    ]
  },
  {
    brand: 'فورد',
    brandEn: 'Ford',
    models: [
      'تورس', 'رينجر', 'إف 150 (F-150)', 'إكسبلورر', 'إكسبيديشن', 
      'تيريتوري', 'ترانزيت', 'إيفرست', 'إيدج'
    ]
  },
  {
    brand: 'إيسوزو',
    brandEn: 'Isuzu',
    models: [
      'ديماكس (D-Max)', 'إم يو إكس (MU-X)', 'شاحنة إن بي آر (NPR)', 
      'شاحنة إف تي آر (FTR)', 'شاحنة إن إم آر (NMR)', 'شاحنة فوروارد (Forward)'
    ]
  },
  {
    brand: 'كيا',
    brandEn: 'Kia',
    models: [
      'بيجاس', 'سيراتو (K3)', 'K5', 'سونيت', 'سبورتاج', 
      'سورينتو', 'كرنفال', 'تيلورايد', 'كارينز', 'سيلتوس'
    ]
  },
  {
    brand: 'شيفروليه',
    brandEn: 'Chevrolet',
    models: [
      'تاهو', 'سوبربان', 'سيلفرادو', 'كابتيفا', 'جرووف', 'ترافيرس', 'كابرس', 'بليزر'
    ]
  },
  {
    brand: 'ميتسوبيشي',
    brandEn: 'Mitsubishi',
    models: [
      'باجيرو', 'إل 200 (L200)', 'أوتلاندر', 'إكسباندر', 'مونتيرو سبورت', 
      'كانتر (Fuso Canter)', 'أتراج', 'سبيس ستار'
    ]
  },
  {
    brand: 'جي إم سي',
    brandEn: 'GMC',
    models: [
      'يوكون', 'سييرا', 'تيرين', 'سافانا', 'يوكون إكس إل (Yukon XL)'
    ]
  },
  {
    brand: 'مرسيدس بنز',
    brandEn: 'Mercedes-Benz',
    models: [
      'سبرينتر (Sprinter)', 'فيتو (Vito)', 'أكتروس (Actros)', 'أتيجو (Atego)', 
      'الفئة C', 'الفئة E', 'الفئة S', 'GLE', 'GLS'
    ]
  },
  {
    brand: 'هافال',
    brandEn: 'Haval',
    models: [
      'H6', 'جوليان (Jolion)', 'H9', 'دارجو (Dargo)', 'H6 GT'
    ]
  },
  {
    brand: 'إم جي',
    brandEn: 'MG',
    models: [
      'MG5', 'MG6', 'ZS', 'HS', 'RX5', 'RX8', 'GT', 'T60'
    ]
  },
  {
    brand: 'شانجان',
    brandEn: 'Changan',
    models: [
      'إيدو بلس (Eado Plus)', 'CS35 Plus', 'CS75 Plus', 'CS85', 'CS95', 'ألسفن (Alsvin)', 'هنتر (Hunter)'
    ]
  },
  {
    brand: 'سوزوكي',
    brandEn: 'Suzuki',
    models: [
      'ديزاير', 'سويفت', 'إرتيجا', 'بالينو', 'جيمني', 'جراند فيتارا', 'سياز', 'فيتارا'
    ]
  },
  {
    brand: 'هوندا',
    brandEn: 'Honda',
    models: [
      'أكورد', 'سيفيك', 'سيتي', 'CR-V', 'بايلوت', 'أوديسي', 'HR-V'
    ]
  },
  {
    brand: 'جيلي',
    brandEn: 'Geely',
    models: [
      'إمجراند', 'كولراي', 'أزكارا', 'مونجارو', 'توجيلا', 'أوكافانجو'
    ]
  },
  {
    brand: 'مازدا',
    brandEn: 'Mazda',
    models: [
      'مازدا 6', 'مازدا 3', 'CX-5', 'CX-9', 'CX-30', 'CX-60', 'BT-50'
    ]
  },
  {
    brand: 'أخرى',
    brandEn: 'Other',
    models: [
      'عام / طراز آخر'
    ]
  }
];

export const DEFAULT_VEHICLE_COLORS: string[] = [
  'أبيض',
  'لؤلؤي',
  'فضي',
  'رمادي',
  'أسود',
  'أزرق',
  'كحلي',
  'أحمر',
  'عودي',
  'بني',
  'بيج',
  'ذهبي',
  'برونزي',
  'أخضر',
  'زيتي',
  'برتقالي',
  'أصفر',
  'أخرى'
];

export const DEFAULT_REGISTRATION_TYPES: string[] = [
  'خصوصي',
  'نقل خاص',
  'نقل عام',
  'أجرة',
  'حافلة خاصة',
  'حافلة عامة',
  'مقطورة',
  'شبه مقطورة',
  'دراجة آلية',
  'أشغال عامة',
  'تصدير / مؤقت',
  'هيئة دبلوماسية'
];

export interface ExpiryAnalysis {
  daysRemaining: number;
  status: 'VALID' | 'WARNING_SOON' | 'WARNING_URGENT' | 'EXPIRED' | 'NOT_SET';
  label: string;
  badgeClass: string;
  textClass: string;
  bgClass: string;
}

export function parseRawDateSafely(val: unknown): Date | null {
  if (val === null || val === undefined || val === '') {
    return null;
  }

  // 1. JavaScript Date object
  if (val instanceof Date) {
    return isNaN(val.getTime()) ? null : val;
  }

  // 2. Excel serial number (e.g. 45524 for ~2024 dates)
  if (typeof val === 'number') {
    if (isNaN(val) || val <= 0) return null;
    // Excel epoch begins 1899-12-30 (due to Lotus 1-2-3 1900 leap year bug)
    // Excel serial date to JS Date:
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
    return isNaN(jsDate.getTime()) ? null : jsDate;
  }

  // 3. String representation
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'undefined') {
      return null;
    }

    // Check numeric string that might be an Excel serial number or timestamp
    if (/^\d{5}(\.\d+)?$/.test(trimmed)) {
      const numVal = parseFloat(trimmed);
      if (!isNaN(numVal)) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const jsDate = new Date(excelEpoch.getTime() + numVal * 86400000);
        if (!isNaN(jsDate.getTime())) return jsDate;
      }
    }

    // Standard date parsing (ISO YYYY-MM-DD, YYYY/MM/DD, DD-MM-YYYY, etc.)
    // Handle DD/MM/YYYY or DD-MM-YYYY formats commonly found in Arabic/Saudi spreadsheets
    const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (dmyMatch) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      const year = parseInt(dmyMatch[3], 10);
      const dmyDate = new Date(year, month, day);
      if (!isNaN(dmyDate.getTime())) return dmyDate;
    }

    const parsed = new Date(trimmed);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  // 4. Any other object with toString or valueOf
  try {
    const strVal = String(val).trim();
    if (!strVal || strVal === '[object Object]') return null;
    const fallbackParsed = new Date(strVal);
    return isNaN(fallbackParsed.getTime()) ? null : fallbackParsed;
  } catch {
    return null;
  }
}

/**
 * Format any date input safely into standard ISO YYYY-MM-DD string
 */
export function formatToIsoDateString(val: unknown): string {
  const d = parseRawDateSafely(val);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Calculate dynamic days remaining and alert level for vehicle documents
 * - Accepts unknown types: string, Date, number (Excel serial), null, undefined
 * - > 60 days: Green
 * - 31-60 days: Yellow
 * - 8-30 days: Orange
 * - 0-7 days: Red (Urgent)
 * - < 0 days: Red (Expired since X days)
 */
export function calculateExpiryStatus(rawDate?: unknown): ExpiryAnalysis {
  const target = parseRawDateSafely(rawDate);
  if (!target) {
    return {
      daysRemaining: 0,
      status: 'NOT_SET',
      label: 'غير محدد',
      badgeClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
      textClass: 'text-slate-500',
      bgClass: 'bg-slate-500',
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const expiredDaysAgo = Math.abs(diffDays);
    return {
      daysRemaining: diffDays,
      status: 'EXPIRED',
      label: `منتهي منذ ${expiredDaysAgo} ${expiredDaysAgo === 1 ? 'يوم' : expiredDaysAgo === 2 ? 'يومين' : expiredDaysAgo <= 10 ? 'أيام' : 'يوم'}`,
      badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-300 dark:border-rose-800 font-bold',
      textClass: 'text-rose-600 dark:text-rose-400 font-bold',
      bgClass: 'bg-rose-500',
    };
  }

  if (diffDays <= 7) {
    return {
      daysRemaining: diffDays,
      status: 'WARNING_URGENT',
      label: diffDays === 0 ? 'ينتهي اليوم' : `عاجل: باقي ${diffDays} ${diffDays === 1 ? 'يوم' : diffDays === 2 ? 'يومين' : diffDays <= 10 ? 'أيام' : 'يوم'}`,
      badgeClass: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border-red-300 dark:border-red-800 font-bold animate-pulse',
      textClass: 'text-red-600 dark:text-red-400 font-bold',
      bgClass: 'bg-red-500',
    };
  }

  if (diffDays <= 30) {
    return {
      daysRemaining: diffDays,
      status: 'WARNING_SOON',
      label: `باقي ${diffDays} يوم (تنبيه)`,
      badgeClass: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-300 dark:border-orange-800 font-semibold',
      textClass: 'text-orange-600 dark:text-orange-400 font-semibold',
      bgClass: 'bg-orange-500',
    };
  }

  if (diffDays <= 60) {
    return {
      daysRemaining: diffDays,
      status: 'WARNING_SOON',
      label: `باقي ${diffDays} يوم`,
      badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 dark:border-amber-800 font-medium',
      textClass: 'text-amber-600 dark:text-amber-400 font-medium',
      bgClass: 'bg-amber-500',
    };
  }

  return {
    daysRemaining: diffDays,
    status: 'VALID',
    label: `ساري (باقي ${diffDays} يوم)`,
    badgeClass: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 font-medium',
    textClass: 'text-emerald-600 dark:text-emerald-400',
    bgClass: 'bg-emerald-500',
  };
}
