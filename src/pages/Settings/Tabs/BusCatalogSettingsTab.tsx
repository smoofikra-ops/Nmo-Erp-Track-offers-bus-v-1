import React, { useState, useEffect } from 'react';
import { BusServiceCategory, BusServiceType } from '@/types/busOperations';
import { busOperationsService } from '@/services/busOperationsService';
import { DEFAULT_BUS_SERVICE_CATEGORIES, DEFAULT_BUS_SERVICE_TYPES } from '@/data/defaultBusCatalog';
import { 
  Wrench, Plus, Save, RefreshCw, Trash2, Edit2, 
  Check, X, Sparkles, Folder, Eye, CheckCircle2, 
  Sliders, Shield, Layers, HelpCircle, Fuel, Disc, Gauge, Zap, Wind, Car
} from 'lucide-react';
import toast from 'react-hot-toast';

export function BusCatalogSettingsTab() {
  const [categories, setCategories] = useState<BusServiceCategory[]>([]);
  const [serviceTypes, setServiceTypes] = useState<BusServiceType[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // New Type Modal/Form
  const [isAddingType, setIsAddingType] = useState(false);
  const [newTypeNameAR, setNewTypeNameAR] = useState('');
  const [newTypeNameEN, setNewTypeNameEN] = useState('');
  const [newTypeIsFrequent, setNewTypeIsFrequent] = useState(false);
  const [newTypeHasPartsLabor, setNewTypeHasPartsLabor] = useState(true);
  const [newTypeHasQuantity, setNewTypeHasQuantity] = useState(false);

  // Google Drive Folder ID
  const [driveFolderId, setDriveFolderId] = useState(() => {
    return localStorage.getItem('nmo_bus_invoices_folder_id') || 'NMO ERP / Bus Invoices / YYYY / MM';
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [catsRes, typesRes] = await Promise.all([
        busOperationsService.getCategories(),
        busOperationsService.getServiceTypes(),
      ]);
      if (catsRes.success && catsRes.data) {
        setCategories(catsRes.data);
        if (catsRes.data.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(catsRes.data[0].Category_ID);
        }
      }
      if (typesRes.success && typesRes.data) {
        setServiceTypes(typesRes.data);
      }
    } catch (e) {
      console.error('Failed to load catalog settings', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFrequent = async (type: BusServiceType) => {
    const updated: BusServiceType = {
      ...type,
      Is_Frequent: !type.Is_Frequent,
    };
    try {
      await busOperationsService.saveServiceType(updated);
      setServiceTypes(prev => prev.map(t => t.Service_Type_ID === type.Service_Type_ID ? updated : t));
      toast.success(updated.Is_Frequent ? 'تم تمييز العملية كشائعة ومفضلة' : 'تمت إزالة تمييز العملية');
    } catch (e) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleToggleActive = async (type: BusServiceType) => {
    const updated: BusServiceType = {
      ...type,
      Is_Active: !type.Is_Active,
    };
    try {
      await busOperationsService.saveServiceType(updated);
      setServiceTypes(prev => prev.map(t => t.Service_Type_ID === type.Service_Type_ID ? updated : t));
      toast.success(updated.Is_Active ? 'تم تفعيل العملية' : 'تم تعطيل العملية');
    } catch (e) {
      toast.error('حدث خطأ أثناء التحديث');
    }
  };

  const handleCreateType = async () => {
    if (!newTypeNameAR.trim()) {
      toast.error('يرجى كتابة اسم العملية بالعربية');
      return;
    }

    const typeId = `SRV-CUSTOM-${Date.now()}`;
    const newType: BusServiceType = {
      Service_Type_ID: typeId,
      Category_ID: selectedCategoryId,
      Service_Name_AR: newTypeNameAR.trim(),
      Service_Name_EN: newTypeNameEN.trim() || newTypeNameAR.trim(),
      Display_Order: serviceTypes.length + 1,
      Is_Frequent: newTypeIsFrequent,
      Is_Active: true,
      fieldConfig: {
        hasPartsLabor: newTypeHasPartsLabor,
        hasQuantityPrice: newTypeHasQuantity,
        hasRepairDetails: true,
      },
    };

    try {
      setIsSaving(true);
      await busOperationsService.saveServiceType(newType);
      setServiceTypes(prev => [...prev, newType]);
      toast.success('تمت إضافة العملية إلى الدليل بنجاح');
      setIsAddingType(false);
      setNewTypeNameAR('');
      setNewTypeNameEN('');
    } catch (e) {
      toast.error('فشل في حفظ العملية');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!window.confirm('هل أنت متأكد من استعادة دليل عمليات الباصات الافتراضي؟')) return;
    try {
      await busOperationsService.resetCatalogToDefaults();
      toast.success('تمت استعادة الدليل الافتراضي بنجاح');
      loadData();
    } catch (e) {
      toast.error('فشلت الاستعادة');
    }
  };

  const handleSaveDriveFolder = () => {
    localStorage.setItem('nmo_bus_invoices_folder_id', driveFolderId);
    toast.success('تم حفظ مسار أرشفة Google Drive بنجاح');
  };

  const currentCategoryTypes = serviceTypes.filter(t => t.Category_ID === selectedCategoryId);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" />
            دليل عمليات وصيانة الباصات ومجلد الفواتير
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            تخصيص تصنيفات وعمليات الباصات، تعيين العمليات الأكثر تكراراً، وضبط مجلد أرشفة Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            استعادة الدليل الافتراضي
          </button>
        </div>
      </div>

      {/* Google Drive Configuration Box */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Folder className="w-4 h-4 text-amber-500" />
          إعدادات مجلد أرشفة فواتير الباصات في Google Drive
        </h4>
        <p className="text-xs text-slate-500">
          يتم رفع وتخزين فواتير عمليات الباصات تلقائياً في حساب Google Drive المنظم وفق السنة والشهر:
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={driveFolderId}
              onChange={(e) => setDriveFolderId(e.target.value)}
              placeholder="معرّف المجلد أو المسار الافتراضي (NMO ERP / Bus Invoices)"
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white"
            />
          </div>
          <button
            onClick={handleSaveDriveFolder}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            حفظ مسار الأرشيف
          </button>
        </div>
      </div>

      {/* Catalog Manager (Categories & Operations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Categories Sidebar */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
            التصنيفات الرئيسية ({categories.length})
          </label>
          <div className="space-y-1.5">
            {categories.map((cat) => {
              const isSelected = cat.Category_ID === selectedCategoryId;
              const count = serviceTypes.filter(t => t.Category_ID === cat.Category_ID).length;
              return (
                <button
                  key={cat.Category_ID}
                  onClick={() => setSelectedCategoryId(cat.Category_ID)}
                  className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-900 dark:text-indigo-200 font-bold shadow-2xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs">{cat.Category_Name_AR}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Operations List in Category */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              العمليات التابعة للتصنيف المختار ({currentCategoryTypes.length})
            </h4>

            <button
              onClick={() => setIsAddingType(true)}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة عملية جديدة
            </button>
          </div>

          {/* Add New Type Form Inline */}
          {isAddingType && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  إضافة نوع عملية صيانة جديدة
                </span>
                <button
                  onClick={() => setIsAddingType(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم العملية (بالعربية) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newTypeNameAR}
                    onChange={(e) => setNewTypeNameAR(e.target.value)}
                    placeholder="مثال: تغيير طرمبة الديزل"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    اسم العملية (بالإنجليزية)
                  </label>
                  <input
                    type="text"
                    value={newTypeNameEN}
                    onChange={(e) => setNewTypeNameEN(e.target.value)}
                    placeholder="e.g., Diesel Pump Replacement"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeIsFrequent}
                    onChange={(e) => setNewTypeIsFrequent(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  عملية شائعة ومفضلة (اختصار سريع)
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newTypeHasQuantity}
                    onChange={(e) => setNewTypeHasQuantity(e.target.checked)}
                    className="rounded text-indigo-600"
                  />
                  تتطلب كمية وسعر وحدة (لتر/قطع)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddingType(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-500 hover:text-slate-700"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleCreateType}
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold"
                >
                  حفظ العملية
                </button>
              </div>
            </div>
          )}

          {/* Types Table/Cards */}
          <div className="space-y-2">
            {currentCategoryTypes.map((type) => (
              <div
                key={type.Service_Type_ID}
                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {type.Service_Name_AR}
                    </span>
                    {type.Is_Frequent && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        شائع
                      </span>
                    )}
                    {!type.Is_Active && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        معطل
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                    {type.Service_Name_EN || type.Service_Type_ID}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleFrequent(type)}
                    className={`p-2 rounded-xl text-xs font-bold transition-colors ${
                      type.Is_Frequent
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                    title="تعديل حالة الشائع / المفضلة"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleToggleActive(type)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-colors ${
                      type.Is_Active
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                    }`}
                  >
                    {type.Is_Active ? 'نشط' : 'معطل'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
