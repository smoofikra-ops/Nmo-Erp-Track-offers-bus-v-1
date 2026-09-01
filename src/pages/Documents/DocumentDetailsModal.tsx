import React, { useState } from 'react';
import {
  X,
  Building2,
  Calendar,
  Clock,
  Copy,
  Check,
  FileDown,
  ExternalLink,
  RefreshCw,
  Edit,
  Archive,
  Trash2,
  Printer,
  History,
  FileText,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { CompanyDocument, DocumentCategory, DocumentType } from '@/types/documents';
import { calculateDocumentExpiry, formatDateArabic } from '@/utils/documentExpiry';
import { cn } from '@/utils/cn';

interface DocumentDetailsModalProps {
  document: CompanyDocument;
  documentTypes: DocumentType[];
  categories: DocumentCategory[];
  onClose: () => void;
  onRenew: (doc: CompanyDocument) => void;
  onEdit: (doc: CompanyDocument) => void;
  onArchive: (doc: CompanyDocument) => void;
  onDelete: (doc: CompanyDocument) => void;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  document: doc,
  documentTypes,
  categories,
  onClose,
  onRenew,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'history' | 'preview'>('info');

  const docType = documentTypes.find(t => t.Type_ID === doc.Document_Type_ID);
  const category = categories.find(c => c.CategoryID === doc.Category_ID);
  const hasExpiry = docType ? docType.HasExpiry : Boolean(doc.Expiry_Date);
  const reminderDays = doc.Reminder_Days || docType?.DefaultReminderDays || 60;

  const expiry = calculateDocumentExpiry(doc.Expiry_Date, hasExpiry, reminderDays, doc.Issue_Date);

  const handleCopy = (text: string, keyName: string) => {
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

  let fieldDefinitions: any[] = [];
  try {
    if (docType?.CustomFieldsConfig_JSON) {
      fieldDefinitions = typeof docType.CustomFieldsConfig_JSON === 'string'
        ? JSON.parse(docType.CustomFieldsConfig_JSON)
        : docType.CustomFieldsConfig_JSON;
    }
  } catch {
    fieldDefinitions = [];
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        id="document-details-modal"
        className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header (Official Certificate Theme) */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {category?.CategoryNameAR || 'المستندات والوثائق'}
                </span>
                <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-bold border', expiry.badgeClass)}>
                  {expiry.label}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mt-0.5">
                {doc.Document_Name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                الجهة المصدرة: <strong className="text-slate-700 dark:text-slate-300">{doc.Issuing_Authority || docType?.IssuingAuthorityDefault || '-'}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
              title="طباعة بطاقة الوثيقة"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-4 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={cn(
              'py-3 border-b-2 transition-colors',
              activeTab === 'info'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            )}
          >
            البيانات الرسمية
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'py-3 border-b-2 transition-colors flex items-center gap-1.5',
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            )}
          >
            <History className="w-4 h-4" />
            سجل التجديدات والأرشيف
          </button>
          {doc.Attachment_URL && (
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                'py-3 border-b-2 transition-colors flex items-center gap-1.5',
                activeTab === 'preview'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              )}
            >
              <FileDown className="w-4 h-4" />
              المرفق الرقمي
            </button>
          )}
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Primary Key Numbers Bar with Fast Copy */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      الرقم الأساسي / الرقم الموحد
                    </span>
                    <span className="font-mono text-lg font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                      {doc.Primary_Number || 'غير محدد'}
                    </span>
                  </div>
                  {doc.Primary_Number && (
                    <button
                      onClick={() => handleCopy(doc.Primary_Number, 'primary')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0',
                        copiedKey === 'primary'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                      )}
                    >
                      {copiedKey === 'primary' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {doc.Secondary_Number && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                        الرقم الفرعي / رقم السجل
                      </span>
                      <span className="font-mono text-lg font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                        {doc.Secondary_Number}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(doc.Secondary_Number!, 'secondary')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all shrink-0',
                        copiedKey === 'secondary'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                      )}
                    >
                      {copiedKey === 'secondary' ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تم النسخ</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Dates & Timeline Summary */}
              <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">تاريخ الإصدار:</span>
                  <strong className="font-mono text-sm text-slate-900 dark:text-white block mt-0.5">
                    {formatDateArabic(doc.Issue_Date)}
                  </strong>
                </div>
                {hasExpiry && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block">تاريخ الانتهاء:</span>
                    <strong className="font-mono text-sm text-slate-900 dark:text-white block mt-0.5">
                      {formatDateArabic(doc.Expiry_Date)}
                    </strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">آخر تجديد مسجل:</span>
                  <strong className="font-mono text-sm text-slate-900 dark:text-white block mt-0.5">
                    {formatDateArabic(doc.Last_Renewal_Date || doc.Issue_Date)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">مهلة التنبيه المبكر:</span>
                  <strong className="text-sm text-slate-900 dark:text-white block mt-0.5">
                    قبل {reminderDays} يوم
                  </strong>
                </div>
              </div>

              {/* Dynamic Specific Fields for this Document Type */}
              {fieldDefinitions.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    البيانات التفصيلية المخصصة
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {fieldDefinitions.map((field) => {
                      const val = customFields[field.id];
                      return (
                        <div
                          key={field.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                              {field.labelAR}
                            </span>
                            <span className="text-xs font-semibold text-slate-900 dark:text-white block mt-0.5">
                              {val || '-'}
                            </span>
                          </div>
                          {val && (
                            <button
                              onClick={() => handleCopy(String(val), field.id)}
                              className="p-1 rounded-md text-slate-400 hover:text-indigo-600 transition-colors shrink-0"
                              title="نسخ"
                            >
                              {copiedKey === field.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* General Notes & Branch */}
              {(doc.Notes || doc.Branch) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                  {doc.Branch && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-semibold">المقر / الفرع التابع:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{doc.Branch}</span>
                    </div>
                  )}
                  {doc.Notes && (
                    <div>
                      <span className="text-slate-500 font-semibold block mb-1">ملاحظات إدارية:</span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        {doc.Notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="w-4 h-4 text-indigo-600" />
                  سجل تجديدات الوثيقة عبر الزمن
                </h4>
                {hasExpiry && (
                  <button
                    onClick={() => onRenew(doc)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>تجديد جديد</span>
                  </button>
                )}
              </div>

              {doc.renewalHistory && doc.renewalHistory.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:inset-0 before:start-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                  {doc.renewalHistory.map((item, idx) => (
                    <div key={item.Renewal_ID || idx} className="relative flex items-start gap-4 ps-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 ring-4 ring-white dark:ring-slate-900 z-10">
                        <RefreshCw className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            تجديد بتاريخ: {formatDateArabic(item.Renewal_Date)}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            المسؤول: {item.Updated_By || 'الإدارة'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span>الانتهاء السابق: </span>
                            <strong className="font-mono">{formatDateArabic(item.Previous_Expiry_Date)}</strong>
                          </div>
                          <div>
                            <span>الانتهاء الجديد: </span>
                            <strong className="font-mono text-emerald-600 dark:text-emerald-400">{formatDateArabic(item.New_Expiry_Date)}</strong>
                          </div>
                        </div>
                        {item.Notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                            {item.Notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-60" />
                  <p className="text-xs text-slate-500">
                    هذه الوثيقة جديدة ولم يتم تسجيل تجديدات سابقة لها بعد.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'preview' && doc.Attachment_URL && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  اسم الملف: {doc.Attachment_File_Name || 'مرفق رسمي'}
                </span>
                <a
                  href={doc.Attachment_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline"
                >
                  <span>فتح في نافذة جديدة</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="h-96 w-full rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                {doc.Attachment_URL.startsWith('data:image/') || doc.Attachment_URL.match(/\.(jpg|jpeg|png|webp)/i) ? (
                  <img
                    src={doc.Attachment_URL}
                    alt={doc.Document_Name}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <iframe
                    src={doc.Attachment_URL}
                    title="Attachment Preview"
                    className="w-full h-full border-0"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(doc)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 text-xs font-bold hover:bg-slate-50 shadow-xs"
            >
              <Edit className="w-4 h-4" />
              <span>تعديل</span>
            </button>
            <button
              onClick={() => onArchive(doc)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold"
            >
              <Archive className="w-4 h-4" />
              <span>{doc.Is_Archived ? 'استعادة' : 'أرشفة'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {hasExpiry && (
              <button
                onClick={() => onRenew(doc)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تجديد الوثيقة</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
