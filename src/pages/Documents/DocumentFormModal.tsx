import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Upload,
  Calendar,
  Building2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Trash2,
  Building,
} from 'lucide-react';
import { CompanyDocument, DocumentCategory, DocumentType, DynamicFieldDefinition } from '@/types/documents';
import { documentService } from '@/services/documentService';
import { cn } from '@/utils/cn';

interface DocumentFormModalProps {
  document?: CompanyDocument | null;
  documentTypes: DocumentType[];
  categories: DocumentCategory[];
  companyId?: string;
  onClose: () => void;
  onSuccess: (savedDoc: CompanyDocument) => void;
}

export const DocumentFormModal: React.FC<DocumentFormModalProps> = ({
  document: existingDoc,
  documentTypes,
  categories,
  companyId = 'COM-0001',
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(existingDoc);

  const [documentTypeId, setDocumentTypeId] = useState<string>(
    existingDoc?.Document_Type_ID || (documentTypes[0]?.Type_ID || '')
  );
  const [categoryId, setCategoryId] = useState<string>(
    existingDoc?.Category_ID || (categories[0]?.CategoryID || '')
  );
  const [documentName, setDocumentName] = useState<string>(existingDoc?.Document_Name || '');
  const [issuingAuthority, setIssuingAuthority] = useState<string>(existingDoc?.Issuing_Authority || '');
  const [primaryNumber, setPrimaryNumber] = useState<string>(existingDoc?.Primary_Number || '');
  const [secondaryNumber, setSecondaryNumber] = useState<string>(existingDoc?.Secondary_Number || '');
  const [issueDate, setIssueDate] = useState<string>(existingDoc?.Issue_Date || '');
  const [expiryDate, setExpiryDate] = useState<string>(existingDoc?.Expiry_Date || '');
  const [reminderDays, setReminderDays] = useState<number>(existingDoc?.Reminder_Days || 60);
  const [branch, setBranch] = useState<string>(existingDoc?.Branch || '');
  const [notes, setNotes] = useState<string>(existingDoc?.Notes || '');
  
  // Custom Dynamic Fields
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  
  // File Upload State
  const [attachmentUrl, setAttachmentUrl] = useState<string>(existingDoc?.Attachment_URL || '');
  const [attachmentFileName, setAttachmentFileName] = useState<string>(existingDoc?.Attachment_File_Name || '');
  const [uploadingFile, setUploadingFile] = useState<boolean>(false);

  // Form State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected Type
  const selectedType = documentTypes.find(t => t.Type_ID === documentTypeId);

  // Parse Dynamic Field Config
  const dynamicFieldConfigs: DynamicFieldDefinition[] = React.useMemo(() => {
    if (!selectedType?.CustomFieldsConfig_JSON) return [];
    try {
      return typeof selectedType.CustomFieldsConfig_JSON === 'string'
        ? JSON.parse(selectedType.CustomFieldsConfig_JSON)
        : selectedType.CustomFieldsConfig_JSON;
    } catch {
      return [];
    }
  }, [selectedType]);

  // When changing Document Type in creation mode, prefill defaults
  const handleTypeChange = (newTypeId: string) => {
    setDocumentTypeId(newTypeId);
    const newType = documentTypes.find(t => t.Type_ID === newTypeId);
    if (newType) {
      if (!isEditing || !documentName) {
        setDocumentName(newType.TypeNameAR);
      }
      if (newType.Category_ID) {
        setCategoryId(newType.Category_ID);
      }
      if (newType.IssuingAuthorityDefault) {
        setIssuingAuthority(newType.IssuingAuthorityDefault);
      }
      if (newType.DefaultReminderDays) {
        setReminderDays(newType.DefaultReminderDays);
      }
    }
  };

  // Populate custom fields on initial load
  useEffect(() => {
    if (existingDoc?.Custom_Fields_JSON) {
      try {
        const parsed = typeof existingDoc.Custom_Fields_JSON === 'string'
          ? JSON.parse(existingDoc.Custom_Fields_JSON)
          : existingDoc.Custom_Fields_JSON;
        setCustomFields(parsed);
      } catch {
        setCustomFields({});
      }
    } else if (!isEditing && selectedType) {
      // Default name if creating
      if (!documentName) setDocumentName(selectedType.TypeNameAR);
      if (!issuingAuthority) setIssuingAuthority(selectedType.IssuingAuthorityDefault);
      if (selectedType.Category_ID && !categoryId) setCategoryId(selectedType.Category_ID);
    }
  }, [existingDoc]);

  // Handle dynamic field changes
  const handleCustomFieldChange = (fieldId: string, val: any) => {
    setCustomFields(prev => ({
      ...prev,
      [fieldId]: val,
    }));

    // If this field is flagged as primary number, sync it
    const def = dynamicFieldConfigs.find(f => f.id === fieldId);
    if (def?.isPrimaryNumber && (!primaryNumber || primaryNumber === customFields[fieldId])) {
      setPrimaryNumber(String(val));
    }
    if (def?.isSecondaryNumber && (!secondaryNumber || secondaryNumber === customFields[fieldId])) {
      setSecondaryNumber(String(val));
    }
  };

  // Handle File Attachment Selection
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
              documentType: selectedType?.TypeNameAR || 'General',
              category: categories.find(c => c.CategoryID === categoryId)?.CategoryNameAR || 'General',
              companyId,
            });

            if (uploadRes.success && uploadRes.data) {
              setAttachmentUrl(uploadRes.data.fileUrl);
              setAttachmentFileName(uploadRes.data.fileName);
            }
          } catch (uploadErr: any) {
            console.error('File upload error', uploadErr);
            // Fallback to local Data URL
            setAttachmentUrl(event.target?.result as string);
            setAttachmentFileName(file.name);
          }
        }
        setUploadingFile(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('فشل قراءة الملف المرفق: ' + err.message);
      setUploadingFile(false);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!documentName.trim()) {
      setErrorMsg('يرجى كتابة اسم الوثيقة');
      return;
    }

    if (!primaryNumber.trim()) {
      setErrorMsg('يرجى إدخال رقم الوثيقة أو المعرف الأساسي');
      return;
    }

    setIsSubmitting(true);

    const docPayload: Partial<CompanyDocument> = {
      Document_Type_ID: documentTypeId,
      Category_ID: categoryId,
      Document_Name: documentName.trim(),
      Issuing_Authority: issuingAuthority.trim(),
      Primary_Number: primaryNumber.trim(),
      Secondary_Number: secondaryNumber.trim() || undefined,
      Issue_Date: issueDate || undefined,
      Expiry_Date: selectedType?.HasExpiry ? (expiryDate || undefined) : undefined,
      Reminder_Days: reminderDays,
      Branch: branch.trim() || undefined,
      Notes: notes.trim() || undefined,
      Custom_Fields_JSON: JSON.stringify(customFields),
      Attachment_URL: attachmentUrl || undefined,
      Attachment_File_Name: attachmentFileName || undefined,
    };

    try {
      let result;
      if (isEditing && existingDoc) {
        result = await documentService.updateCompanyDocument(existingDoc.Document_ID, docPayload, companyId);
      } else {
        result = await documentService.createCompanyDocument(docPayload, companyId);
      }

      if (result.success && result.data) {
        onSuccess(result.data);
      } else {
        throw new Error(result.message || 'فشلت العملية');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الوثيقة');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        id="document-form-modal"
        className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                {isEditing ? 'تعديل بيانات الوثيقة' : 'إضافة وثيقة / ترخيص جديد'}
              </h2>
              <p className="text-xs text-slate-500">
                تسجيل مستند نظامي أو رخصة حكومية في ملف المنشأة
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

        {/* Error Banner */}
        {errorMsg && (
          <div className="m-5 mb-0 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-3 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Document Type & Category Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع الوثيقة <span className="text-rose-500">*</span>
              </label>
              <select
                value={documentTypeId}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {documentTypes.map((t) => (
                  <option key={t.Type_ID} value={t.Type_ID}>
                    {t.TypeNameAR}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                التصنيف الرئيسي <span className="text-rose-500">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c.CategoryID} value={c.CategoryID}>
                    {c.CategoryNameAR}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Document Name & Issuing Authority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                مسمى الوثيقة / الشهادة <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                placeholder="مثال: السجل التجاري الرئيسي"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الجهة المصدرة
              </label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                placeholder="مثال: وزارة التجارة / أمانة الرياض"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Primary and Secondary Numbers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                الرقم الأساسي / الرقم الموحد <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={primaryNumber}
                onChange={(e) => setPrimaryNumber(e.target.value)}
                placeholder="مثال: 7001234567 أو 1010123456"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم ثانوي / رقم السجل الفرعي (إن وجد)
              </label>
              <input
                type="text"
                value={secondaryNumber}
                onChange={(e) => setSecondaryNumber(e.target.value)}
                placeholder="مثال: 1010894562"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Dynamic Specific Fields Configured for this Document Type */}
          {dynamicFieldConfigs.length > 0 && (
            <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" />
                حقول إضافية خاصة بـ {selectedType?.TypeNameAR}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dynamicFieldConfigs.map((field) => (
                  <div key={field.id}>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {field.labelAR} {field.required && <span className="text-rose-500">*</span>}
                    </label>
                    <input
                      type={field.type === 'NUMBER' ? 'number' : field.type === 'DATE' ? 'date' : 'text'}
                      value={customFields[field.id] || ''}
                      onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
                      placeholder={field.placeholderAR || ''}
                      className="w-full h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dates & Reminder Engine Config */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ الإصدار
              </label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {selectedType?.HasExpiry ? (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  تاريخ الانتهاء <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            ) : (
              <div className="flex items-center pt-6 text-xs text-slate-500">
                <span>(شهادة دائمة غير خاضعة لانتهاء دوري)</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                التنبيه قبل (أيام)
              </label>
              <input
                type="number"
                value={reminderDays}
                onChange={(e) => setReminderDays(Number(e.target.value) || 30)}
                min="1"
                max="180"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Branch & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                المقر / الفرع
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="مثال: الإدارة العامة / مستودع السلي"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                ملاحظات
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أي تفاصيل أو ملاحظات تنظيمية"
                className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* File Attachment Upload */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              إرفاق نسخة رقمية من الوثيقة (PDF / صورة)
            </label>
            {attachmentUrl ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="truncate max-w-xs">{attachmentFileName || 'ملف الوثيقة المرفق'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachmentUrl('');
                    setAttachmentFileName('');
                  }}
                  className="p-1 text-rose-500 hover:text-rose-700"
                  title="إزالة المرفق"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 cursor-pointer bg-white dark:bg-slate-800/60 transition-colors">
                {uploadingFile ? (
                  <div className="flex items-center gap-2 text-xs text-indigo-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري رفع وتشفير الملف...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      اضغط لاختيار ملف أو اسحبه إلى هنا
                    </span>
                    <span className="text-[10px] text-slate-500 mt-0.5">
                      يدعم صيغ PDF، JPG، PNG بحجم حتى 10 ميغابايت
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

          {/* Modal Footer Controls */}
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
                  <span>جاري الحفظ والتحقق...</span>
                </>
              ) : (
                <span>{isEditing ? 'حفظ التعديلات' : 'تسجيل الوثيقة'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
