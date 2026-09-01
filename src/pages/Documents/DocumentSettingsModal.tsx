import React, { useState } from 'react';
import {
  X,
  Settings,
  Plus,
  Edit2,
  Trash2,
  Check,
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
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { DocumentCategory, DocumentType, DynamicFieldDefinition } from '@/types/documents';
import { documentService } from '@/services/documentService';
import { cn } from '@/utils/cn';

interface DocumentSettingsModalProps {
  documentTypes: DocumentType[];
  categories: DocumentCategory[];
  companyId?: string;
  onClose: () => void;
  onRefresh: () => void;
}

const AVAILABLE_ICONS = [
  { id: 'Building2', label: 'مبنى تجاري', icon: Building2 },
  { id: 'Receipt', label: 'إيصال / ضريبة', icon: Receipt },
  { id: 'ShieldCheck', label: 'درع معتمد', icon: ShieldCheck },
  { id: 'Building', label: 'منشأة', icon: Building },
  { id: 'Users2', label: 'موارد بشرية', icon: Users2 },
  { id: 'HeartHandshake', label: 'تأمينات', icon: HeartHandshake },
  { id: 'BadgeCheck', label: 'غرفة تجارية', icon: BadgeCheck },
  { id: 'MapPin', label: 'عنوان وطني', icon: MapPin },
  { id: 'CreditCard', label: 'مدفوعات', icon: CreditCard },
  { id: 'Shield', label: 'سلامة ودفاع مدني', icon: Shield },
  { id: 'FileText', label: 'مستند عام', icon: FileText },
];

export const DocumentSettingsModal: React.FC<DocumentSettingsModalProps> = ({
  documentTypes,
  categories,
  companyId = 'COM-0001',
  onClose,
  onRefresh,
}) => {
  const [editingType, setEditingType] = useState<Partial<DocumentType> | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic Custom Fields State when editing/creating a type
  const [customFieldDefs, setCustomFieldDefs] = useState<DynamicFieldDefinition[]>([]);

  const handleStartEdit = (type: DocumentType) => {
    setEditingType({ ...type });
    setIsCreatingNew(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const parsed = type.CustomFieldsConfig_JSON
        ? JSON.parse(type.CustomFieldsConfig_JSON)
        : [];
      setCustomFieldDefs(Array.isArray(parsed) ? parsed : []);
    } catch {
      setCustomFieldDefs([]);
    }
  };

  const handleStartCreate = () => {
    setEditingType({
      Type_ID: `DT_${Date.now()}`,
      CompanyID: companyId,
      Category_ID: categories[0]?.CategoryID || 'CAT_OTHER',
      TypeNameAR: '',
      TypeNameEN: '',
      IssuingAuthorityDefault: '',
      Code: '',
      Icon: 'FileText',
      HasExpiry: true,
      DefaultReminderDays: 45,
      DisplayOrder: documentTypes.length + 1,
      Status: 'ACTIVE',
    });
    setCustomFieldDefs([
      { id: 'DocNumber', labelAR: 'رقم الوثيقة', type: 'TEXT', isPrimaryNumber: true, displayOnCard: true, required: true }
    ]);
    setIsCreatingNew(true);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleAddFieldDef = () => {
    const newFieldId = `field_${Date.now()}`;
    setCustomFieldDefs(prev => [
      ...prev,
      { id: newFieldId, labelAR: 'حقل جديد', type: 'TEXT', displayOnCard: true, required: false }
    ]);
  };

  const handleUpdateFieldDef = (index: number, updates: Partial<DynamicFieldDefinition>) => {
    setCustomFieldDefs(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveFieldDef = (index: number) => {
    setCustomFieldDefs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType?.TypeNameAR?.trim()) {
      setErrorMsg('يرجى إدخال اسم نوع الوثيقة');
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const payload: Partial<DocumentType> = {
      ...editingType,
      CustomFieldsConfig_JSON: JSON.stringify(customFieldDefs),
    };

    try {
      const res = await documentService.saveDocumentType(payload, companyId);
      if (res.success) {
        setSuccessMsg('تم حفظ نوع الوثيقة بنجاح');
        setTimeout(() => {
          setEditingType(null);
          setIsCreatingNew(false);
          onRefresh();
        }, 1000);
      } else {
        throw new Error(res.message || 'فشل الحفظ');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ نوع الوثيقة');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div
        id="document-settings-modal"
        className="relative w-full max-w-3xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                إعدادات وأنواع الوثائق والتراخيص
              </h2>
              <p className="text-xs text-slate-500">
                تخصيص أنواع الوثائق، الحقول الديناميكية، والتنبيهات
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {editingType ? (
            /* Editing / Creating Form */
            <form onSubmit={handleSaveType} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {isCreatingNew ? 'إضافة نوع وثيقة جديد' : `تعديل: ${editingType.TypeNameAR}`}
                </h3>
                <button
                  type="button"
                  onClick={() => { setEditingType(null); setIsCreatingNew(false); }}
                  className="text-xs text-slate-500 hover:text-slate-900 font-semibold"
                >
                  ← العودة للقائمة
                </button>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم نوع الوثيقة بالعربي <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingType.TypeNameAR || ''}
                    onChange={(e) => setEditingType({ ...editingType, TypeNameAR: e.target.value })}
                    placeholder="مثال: ترخيص الهيئة العامة للنقل"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    التصنيف التابع
                  </label>
                  <select
                    value={editingType.Category_ID || ''}
                    onChange={(e) => setEditingType({ ...editingType, Category_ID: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c.CategoryID} value={c.CategoryID}>
                        {c.CategoryNameAR}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الجهة المصدرة الافتراضية
                  </label>
                  <input
                    type="text"
                    value={editingType.IssuingAuthorityDefault || ''}
                    onChange={(e) => setEditingType({ ...editingType, IssuingAuthorityDefault: e.target.value })}
                    placeholder="مثال: الهيئة العامة للنقل"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    أيام التنبيه الافتراضية
                  </label>
                  <input
                    type="number"
                    value={editingType.DefaultReminderDays || 30}
                    onChange={(e) => setEditingType({ ...editingType, DefaultReminderDays: Number(e.target.value) || 30 })}
                    min="1"
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    الأيقونة
                  </label>
                  <select
                    value={editingType.Icon || 'FileText'}
                    onChange={(e) => setEditingType({ ...editingType, Icon: e.target.value })}
                    className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    {AVAILABLE_ICONS.map((ic) => (
                      <option key={ic.id} value={ic.id}>
                        {ic.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Has Expiry Checkbox */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <input
                  type="checkbox"
                  id="hasExpiryCheck"
                  checked={editingType.HasExpiry !== false}
                  onChange={(e) => setEditingType({ ...editingType, HasExpiry: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="hasExpiryCheck" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                  هذه الوثيقة تخضع لصلاحية وتتطلب تجديد دوري وتنبيهات
                </label>
              </div>

              {/* Dynamic Custom Fields Builder */}
              <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                      الحقول المخصصة لـ هذا النوع من الوثائق
                    </h4>
                    <p className="text-[10px] text-slate-500">
                      تظهر هذه الحقول تلقائياً في نموذج الإضافة وبطاقة الوثيقة
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddFieldDef}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                  >
                    <Plus className="w-3 h-3" />
                    <span>إضافة حقل</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {customFieldDefs.map((f, idx) => (
                    <div
                      key={f.id || idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center text-xs"
                    >
                      <div className="sm:col-span-5">
                        <label className="text-[10px] text-slate-500 block mb-0.5">مسمى الحقل (عربي)</label>
                        <input
                          type="text"
                          value={f.labelAR}
                          onChange={(e) => handleUpdateFieldDef(idx, { labelAR: e.target.value })}
                          className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-[10px] text-slate-500 block mb-0.5">نوع البيانات</label>
                        <select
                          value={f.type}
                          onChange={(e) => handleUpdateFieldDef(idx, { type: e.target.value as any })}
                          className="w-full h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium"
                        >
                          <option value="TEXT">نصي</option>
                          <option value="NUMBER">رقمي</option>
                          <option value="DATE">تاريخ</option>
                        </select>
                      </div>
                      <div className="sm:col-span-3 flex items-center gap-2 pt-4 sm:pt-0">
                        <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          <input
                            type="checkbox"
                            checked={Boolean(f.displayOnCard)}
                            onChange={(e) => handleUpdateFieldDef(idx, { displayOnCard: e.target.checked })}
                            className="rounded text-indigo-600 h-3.5 w-3.5"
                          />
                          <span>عرض بالبطاقة</span>
                        </label>
                      </div>
                      <div className="sm:col-span-1 text-end">
                        <button
                          type="button"
                          onClick={() => handleRemoveFieldDef(idx)}
                          className="p-1 text-rose-500 hover:text-rose-700"
                          title="حذف الحقل"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setEditingType(null); setIsCreatingNew(false); }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>حفظ نوع الوثيقة</span>}
                </button>
              </div>
            </form>
          ) : (
            /* Types List View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    أنواع الوثائق المعرفة ({documentTypes.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    يمكنك تعديل أي نوع أو إضافة نماذج وثائق وتراخيص جديدة
                  </p>
                </div>
                <button
                  onClick={handleStartCreate}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة نوع وثيقة</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {documentTypes.map((t) => {
                  const cat = categories.find(c => c.CategoryID === t.Category_ID);
                  const IconComp = t.Icon && AVAILABLE_ICONS.find(i => i.id === t.Icon)?.icon || FileText;

                  return (
                    <div
                      key={t.Type_ID}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                          <IconComp className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-semibold text-slate-500 block">
                            {cat?.CategoryNameAR || 'مستند'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {t.TypeNameAR}
                          </h4>
                          <span className="text-[10px] text-slate-500">
                            {t.HasExpiry ? `تنبيه: ${t.DefaultReminderDays} يوم` : 'دائم بدون انتهاء'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartEdit(t)}
                        className="p-2 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-700 transition-colors shrink-0"
                        title="تعديل الإعدادات"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
