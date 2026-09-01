import React, { useState } from 'react';
import {
  Building2,
  Receipt,
  ShieldCheck,
  Building,
  Users2,
  HeartHandshake,
  BadgeCheck,
  MapPin,
  CreditCard,
  ShieldAlert,
  Shield,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Clock,
  ChevronRight,
  MoreVertical,
  RefreshCw,
  Eye,
  FileDown,
  Archive,
  Trash2,
} from 'lucide-react';
import { CompanyDocument, DocumentCategory, DocumentType } from '@/types/documents';
import { calculateDocumentExpiry, formatDateArabic } from '@/utils/documentExpiry';
import { cn } from '@/utils/cn';

interface DigitalDocumentCardProps {
  document: CompanyDocument;
  documentTypes: DocumentType[];
  categories: DocumentCategory[];
  onViewDetails: (doc: CompanyDocument) => void;
  onRenew: (doc: CompanyDocument) => void;
  onEdit: (doc: CompanyDocument) => void;
  onArchive: (doc: CompanyDocument) => void;
  onDelete: (doc: CompanyDocument) => void;
}

const ICON_MAP: Record<string, any> = {
  Building2,
  Receipt,
  ShieldCheck,
  Building,
  Users2,
  HeartHandshake,
  BadgeCheck,
  MapPin,
  CreditCard,
  ShieldAlert,
  Shield,
  FileText,
};

export const DigitalDocumentCard: React.FC<DigitalDocumentCardProps> = ({
  document: doc,
  documentTypes,
  categories,
  onViewDetails,
  onRenew,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const docType = documentTypes.find(t => t.Type_ID === doc.Document_Type_ID);
  const category = categories.find(c => c.CategoryID === doc.Category_ID);
  const hasExpiry = docType ? docType.HasExpiry : Boolean(doc.Expiry_Date);
  const reminderDays = doc.Reminder_Days || docType?.DefaultReminderDays || 60;

  const expiry = calculateDocumentExpiry(doc.Expiry_Date, hasExpiry, reminderDays, doc.Issue_Date);

  const IconComponent = docType?.Icon && ICON_MAP[docType.Icon] ? ICON_MAP[docType.Icon] : FileText;

  const handleCopy = (text: string, keyName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  let customFields: Record<string, any> = {};
  try {
    if (doc.Custom_Fields_JSON) {
      customFields = typeof doc.Custom_Fields_JSON === 'string'
        ? JSON.parse(doc.Custom_Fields_JSON)
        : doc.Custom_Fields_JSON;
    }
  } catch {
    customFields = {};
  }

  // Get field definitions configured to display on card
  let cardFieldConfigs: any[] = [];
  try {
    if (docType?.CustomFieldsConfig_JSON) {
      const parsed = JSON.parse(docType.CustomFieldsConfig_JSON);
      if (Array.isArray(parsed)) {
        cardFieldConfigs = parsed.filter(f => f.displayOnCard && !f.isPrimaryNumber && !f.isSecondaryNumber);
      }
    }
  } catch {
    cardFieldConfigs = [];
  }

  return (
    <div
      id={`doc-card-${doc.Document_ID}`}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 hover:shadow-lg overflow-hidden',
        expiry.borderClass,
        expiry.bgGlowClass
      )}
    >
      {/* Decorative Security Watermark Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025] dark:opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Official Top Accent Header */}
      <div className="relative p-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/60 shadow-xs">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {category?.CategoryNameAR || 'مستند رسمي'}
                </span>
                {doc.Branch && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                    {doc.Branch}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                {doc.Document_Name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <span>{doc.Issuing_Authority || docType?.IssuingAuthorityDefault || 'الجهة المصدرة'}</span>
              </p>
            </div>
          </div>

          {/* Top Right Options Menu */}
          <div className="relative shrink-0">
            <button
              id={`doc-menu-btn-${doc.Document_ID}`}
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="خيارات"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setMenuOpen(false)} />
                <div className="absolute end-0 mt-1 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 py-1.5 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in zoom-in-95">
                  <button
                    onClick={() => { setMenuOpen(false); onViewDetails(doc); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Eye className="w-4 h-4 text-indigo-600" />
                    <span>عرض التفاصيل الكاملة</span>
                  </button>
                  {hasExpiry && (
                    <button
                      onClick={() => { setMenuOpen(false); onRenew(doc); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 font-medium"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>تجديد الوثيقة</span>
                    </button>
                  )}
                  <button
                    onClick={() => { setMenuOpen(false); onEdit(doc); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>تعديل البيانات</span>
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); onArchive(doc); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600"
                  >
                    <Archive className="w-4 h-4" />
                    <span>{doc.Is_Archived ? 'استعادة من الأرشيف' : 'نقل إلى الأرشيف'}</span>
                  </button>
                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                  <button
                    onClick={() => { setMenuOpen(false); onDelete(doc); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-start hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>حذف الوثيقة</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Card Content (Digital Certificate Look) */}
      <div className="p-5 space-y-4">
        {/* Primary Identifier Box with Instant One-Click Copy */}
        {doc.Primary_Number && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                {docType?.TypeNameAR === 'السجل التجاري' ? 'الرقم الموحد (700)' : 'رقم الوثيقة / الترخيص'}
              </span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate block">
                {doc.Primary_Number}
              </span>
            </div>
            <button
              id={`copy-primary-${doc.Document_ID}`}
              type="button"
              onClick={(e) => handleCopy(doc.Primary_Number, 'primary', e)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0',
                copiedKey === 'primary'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
              )}
              title="نسخ الرقم"
            >
              {copiedKey === 'primary' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Secondary Identifier (e.g. CR Number if primary is 700) */}
        {doc.Secondary_Number && (
          <div className="p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="block text-[10px] font-bold text-slate-600 dark:text-slate-400">
                رقم السجل التجاري الفرعي
              </span>
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">
                {doc.Secondary_Number}
              </span>
            </div>
            <button
              id={`copy-secondary-${doc.Document_ID}`}
              type="button"
              onClick={(e) => handleCopy(doc.Secondary_Number!, 'secondary', e)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-all shrink-0',
                copiedKey === 'secondary'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600'
              )}
              title="نسخ الرقم الفرعي"
            >
              {copiedKey === 'secondary' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
        )}

        {/* Dynamic Card Fields Configured for this Type */}
        {cardFieldConfigs.length > 0 && (
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {cardFieldConfigs.slice(0, 4).map((field) => {
              const val = customFields[field.id];
              if (!val) return null;
              return (
                <div key={field.id} className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-600 dark:text-slate-400 block truncate">
                    {field.labelAR}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Expiry & Validity Status Indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              حالة الصلاحية:
            </span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-bold border', expiry.badgeClass)}>
              {expiry.label}
            </span>
          </div>

          {/* Progress Bar (Visual Expiry Gauge) */}
          {hasExpiry && doc.Expiry_Date && (
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all duration-500 rounded-full',
                  expiry.status === 'SAFE' && 'bg-emerald-500',
                  expiry.status === 'ATTENTION' && 'bg-yellow-500',
                  expiry.status === 'WARNING' && 'bg-amber-500',
                  (expiry.status === 'CRITICAL' || expiry.status === 'EXPIRED') && 'bg-rose-500'
                )}
                style={{ width: `${expiry.progressPercent}%` }}
              />
            </div>
          )}

          {/* Issue and Expiry Dates */}
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1">
            <span>
              الإصدار: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatDateArabic(doc.Issue_Date)}</strong>
            </span>
            {hasExpiry && (
              <span>
                الانتهاء: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatDateArabic(doc.Expiry_Date)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer Quick Action Bar */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          id={`btn-details-${doc.Document_ID}`}
          type="button"
          onClick={() => onViewDetails(doc)}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
        >
          <span>عرض التفاصيل</span>
          <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        </button>

        <div className="flex items-center gap-1.5">
          {doc.Attachment_URL && (
            <a
              href={doc.Attachment_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors"
              title="عرض المرفق الرسمي"
              onClick={(e) => e.stopPropagation()}
            >
              <FileDown className="w-4 h-4" />
            </a>
          )}

          {hasExpiry && (
            <button
              id={`btn-quick-renew-${doc.Document_ID}`}
              type="button"
              onClick={() => onRenew(doc)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold shadow-xs transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>تجديد</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
