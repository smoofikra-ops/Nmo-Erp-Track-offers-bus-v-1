import React, { useState } from 'react';
import {
  Copy,
  Check,
  Eye,
  RefreshCw,
  Edit,
  Archive,
  Trash2,
  FileDown,
  Clock,
  ChevronDown,
  ArrowUpDown,
} from 'lucide-react';
import { CompanyDocument, DocumentCategory, DocumentType } from '@/types/documents';
import { calculateDocumentExpiry, formatDateArabic } from '@/utils/documentExpiry';
import { cn } from '@/utils/cn';

interface DocumentTableViewProps {
  documents: CompanyDocument[];
  documentTypes: DocumentType[];
  categories: DocumentCategory[];
  onViewDetails: (doc: CompanyDocument) => void;
  onRenew: (doc: CompanyDocument) => void;
  onEdit: (doc: CompanyDocument) => void;
  onArchive: (doc: CompanyDocument) => void;
  onDelete: (doc: CompanyDocument) => void;
}

export const DocumentTableView: React.FC<DocumentTableViewProps> = ({
  documents,
  documentTypes,
  categories,
  onViewDetails,
  onRenew,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, keyName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
      <table className="w-full text-start text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
          <tr>
            <th className="py-3.5 px-4 text-start">مسمى الوثيقة والتصنيف</th>
            <th className="py-3.5 px-4 text-start">الجهة المصدرة</th>
            <th className="py-3.5 px-4 text-start">الرقم الأساسي (نسخ سريع)</th>
            <th className="py-3.5 px-4 text-start">تاريخ الإصدار</th>
            <th className="py-3.5 px-4 text-start">تاريخ الانتهاء والصلاحية</th>
            <th className="py-3.5 px-4 text-center">المرفق</th>
            <th className="py-3.5 px-4 text-end">إجراءات</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
          {documents.map((doc) => {
            const docType = documentTypes.find((t) => t.Type_ID === doc.Document_Type_ID);
            const category = categories.find((c) => c.CategoryID === doc.Category_ID);
            const hasExpiry = docType ? docType.HasExpiry : Boolean(doc.Expiry_Date);
            const reminderDays = doc.Reminder_Days || docType?.DefaultReminderDays || 60;
            const expiry = calculateDocumentExpiry(doc.Expiry_Date, hasExpiry, reminderDays, doc.Issue_Date);

            return (
              <tr
                key={doc.Document_ID}
                id={`doc-row-${doc.Document_ID}`}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                onClick={() => onViewDetails(doc)}
              >
                {/* Document Name & Category */}
                <td className="py-3.5 px-4">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{doc.Document_Name}</span>
                    {doc.Is_Archived && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        مؤرشف
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {category?.CategoryNameAR || 'مستند رسمي'}
                    {doc.Branch && ` • ${doc.Branch}`}
                  </div>
                </td>

                {/* Issuing Authority */}
                <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                  {doc.Issuing_Authority || docType?.IssuingAuthorityDefault || '-'}
                </td>

                {/* Primary Number with Quick Copy */}
                <td className="py-3.5 px-4">
                  {doc.Primary_Number ? (
                    <button
                      type="button"
                      onClick={(e) => handleCopy(doc.Primary_Number, doc.Document_ID, e)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold transition-all',
                        copiedKey === doc.Document_ID
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600'
                      )}
                      title="اضغط لنسخ الرقم"
                    >
                      <span>{doc.Primary_Number}</span>
                      {copiedKey === doc.Document_ID ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </td>

                {/* Issue Date */}
                <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                  {formatDateArabic(doc.Issue_Date)}
                </td>

                {/* Expiry Date & Badge */}
                <td className="py-3.5 px-4">
                  {hasExpiry ? (
                    <div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">
                        {formatDateArabic(doc.Expiry_Date)}
                      </div>
                      <span className={cn('inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1', expiry.badgeClass)}>
                        {expiry.label}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-500 font-medium">شهادة دائمة</span>
                  )}
                </td>

                {/* Attachment */}
                <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                  {doc.Attachment_URL ? (
                    <a
                      href={doc.Attachment_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 inline-block text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg"
                      title="عرض المرفق"
                    >
                      <FileDown className="w-4 h-4" />
                    </a>
                  ) : (
                    <span className="text-slate-300 dark:text-slate-700">-</span>
                  )}
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-end" onClick={(e) => e.stopPropagation()}>
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => onViewDetails(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="عرض التفاصيل"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {hasExpiry && (
                      <button
                        onClick={() => onRenew(doc)}
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                        title="تجديد الوثيقة"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onEdit(doc)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="تعديل"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onArchive(doc)}
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                      title={doc.Is_Archived ? 'استعادة' : 'أرشفة'}
                    >
                      <Archive className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(doc)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
