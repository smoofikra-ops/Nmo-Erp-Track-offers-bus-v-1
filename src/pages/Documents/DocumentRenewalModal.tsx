import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  Calendar,
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Clock,
} from 'lucide-react';
import { CompanyDocument } from '@/types/documents';
import { documentService } from '@/services/documentService';
import { formatDateArabic } from '@/utils/documentExpiry';

interface DocumentRenewalModalProps {
  document: CompanyDocument;
  companyId?: string;
  onClose: () => void;
  onSuccess: (updatedDoc: CompanyDocument) => void;
}

export const DocumentRenewalModal: React.FC<DocumentRenewalModalProps> = ({
  document: doc,
  companyId = 'COM-0001',
  onClose,
  onSuccess,
}) => {
  const [renewalDate, setRenewalDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [newExpiryDate, setNewExpiryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentFileName, setAttachmentFileName] = useState<string>('');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-calculate suggested new expiry (+1 year from today or from old expiry)
  React.useEffect(() => {
    try {
      const base = doc.Expiry_Date ? new Date(doc.Expiry_Date) : new Date();
      if (!isNaN(base.getTime())) {
        const nextYear = new Date(base);
        nextYear.setFullYear(nextYear.getFullYear() + 1);
        setNewExpiryDate(nextYear.toISOString().split('T')[0]);
      }
    } catch {
      // ignore
    }
  }, [doc]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    setErrorMsg(null);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = (event.target?.result as string)?.split(',')[1];
        if (base64Data) {
          try {
            const uploadRes = await documentService.uploadDocumentFile({
              fileName: file.name,
              mimeType: file.type,
              base64Data,
              documentType: doc.Document_Name,
              category: doc.Category_ID || 'General',
              companyId,
            });

            if (uploadRes.success && uploadRes.data) {
              setAttachmentUrl(uploadRes.data.fileUrl);
              setAttachmentFileName(uploadRes.data.fileName);
            }
          } catch {
            setAttachmentUrl(event.target?.result as string);
            setAttachmentFileName(file.name);
          }
        }
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('فشل قراءة الملف: ' + err.message);
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newExpiryDate) {
      setErrorMsg('يرجى تحديد تاريخ الانتهاء الجديد بعد التجديد');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await documentService.renewDocument(
        doc.Document_ID,
        {
          newExpiryDate,
          renewalDate,
          notes: notes.trim() || 'تجديد دوري للوثيقة',
          attachmentUrl: attachmentUrl || undefined,
          attachmentFileName: attachmentFileName || undefined,
        },
        companyId
      );

      if (res.success && res.data) {
        onSuccess(res.data);
      } else {
        throw new Error(res.message || 'فشل تجديد الوثيقة');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تجديد الوثيقة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        id="document-renewal-modal"
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                تجديد الوثيقة الرسمية
              </h2>
              <p className="text-xs text-slate-500">
                تسجيل تاريخ الصلاحية الجديد مع حفظ التاريخ السابق بالأرشيف
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Document Summary Banner */}
        <div className="m-5 mb-0 p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block">اسم الوثيقة:</span>
              <strong className="text-sm font-bold text-slate-900 dark:text-white">
                {doc.Document_Name}
              </strong>
            </div>
            <div className="text-end">
              <span className="text-[11px] text-slate-500 block">تاريخ الانتهاء الحالي:</span>
              <strong className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                {formatDateArabic(doc.Expiry_Date)}
              </strong>
            </div>
          </div>
          {doc.Primary_Number && (
            <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-900/40 text-xs text-slate-600 dark:text-slate-400 flex items-center justify-between">
              <span>الرقم الأساسي:</span>
              <span className="font-mono font-bold">{doc.Primary_Number}</span>
            </div>
          )}
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="m-5 mb-0 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ تنفيذ التجديد <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ الانتهاء الجديد <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={newExpiryDate}
                onChange={(e) => setNewExpiryDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 text-xs font-bold text-emerald-900 dark:text-emerald-300 focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              ملاحظات عملية التجديد
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: تم سداد الرسوم عبر سداد وتجديد الاشتراك لمدة سنة ميلادية كاملة"
              rows={2}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* New Attachment Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              إرفاق الوثيقة المجددة (اختياري)
            </label>
            {attachmentUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="truncate max-w-xs">{attachmentFileName || 'ملف التجديد'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { setAttachmentUrl(''); setAttachmentFileName(''); }}
                  className="p-1 text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 cursor-pointer bg-slate-50 dark:bg-slate-800/40 transition-colors">
                {uploadingFile ? (
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      رفع شهادة / إيصال التجديد
                    </span>
                  </>
                )}
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,image/*"
                  className="hidden"
                  disabled={uploadingFile}
                />
              </label>
            )}
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingFile}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 shadow-md shadow-indigo-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل التجديد...</span>
                </>
              ) : (
                <span>تأكيد التجديد وحفظ الأرشيف</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
