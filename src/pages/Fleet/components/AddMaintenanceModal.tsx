import React, { useState, useEffect } from 'react';
import { MaintenanceLog, Vehicle } from '@/types/fleet';
import { fleetService } from '@/services/fleetService';
import { Wrench, X } from 'lucide-react';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  onSuccess: (log: MaintenanceLog) => void;
  onSaveAndNew?: (log: MaintenanceLog) => void;
}

export function AddMaintenanceModal({ isOpen, onClose, vehicles, defaultVehicleId, onSuccess, onSaveAndNew }: AddMaintenanceModalProps) {
  const [vehicleId, setVehicleId] = useState<string>(defaultVehicleId || (vehicles[0]?.Vehicle_ID || ''));
  const [maintType, setMaintType] = useState<string>('صيانة دورية 10,000 كم');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [status, setStatus] = useState<MaintenanceLog['Status']>('COMPLETED');
  const [workshop, setWorkshop] = useState<string>('بترومين إكسبرس');
  const [technician, setTechnician] = useState<string>('');
  const [nextDate, setNextDate] = useState<string>('');
  const [nextOdo, setNextOdo] = useState<number | ''>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVehicle = vehicles.find(v => v.Vehicle_ID === vehicleId);

  useEffect(() => {
    if (defaultVehicleId) setVehicleId(defaultVehicleId);
    else if (vehicles.length > 0 && !vehicleId) setVehicleId(vehicles[0].Vehicle_ID);
  }, [defaultVehicleId, vehicles]);

  useEffect(() => {
    if (selectedVehicle && odometer === '' && selectedVehicle.Current_Odometer) {
      setOdometer(selectedVehicle.Current_Odometer);
      setNextOdo(selectedVehicle.Current_Odometer + 10000);
      const d = new Date();
      d.setMonth(d.getMonth() + 3);
      setNextDate(d.toISOString().split('T')[0]);
    }
  }, [vehicleId, selectedVehicle]);

  if (!isOpen) return null;

  const handleSubmit = async (andNew: boolean = false) => {
    if (!vehicleId || !maintType || !odometer || cost === '') return;

    setIsSubmitting(true);
    try {
      const res = await fleetService.addMaintenanceLog({
        Vehicle_ID: vehicleId,
        Maintenance_Type: maintType,
        Date: date,
        Odometer: Number(odometer),
        Cost: Number(cost),
        Status: status,
        Workshop: workshop,
        Technician: technician,
        Next_Maintenance_Date: nextDate,
        Next_Maintenance_Odometer: nextOdo ? Number(nextOdo) : undefined,
        Invoice_No: invoiceNo,
        Notes: notes,
      });

      if (res.success && res.data) {
        if (andNew) {
          onSaveAndNew?.(res.data);
          setCost('');
          setInvoiceNo('');
          setNotes('');
        } else {
          onSuccess(res.data);
          onClose();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">تسجيل أمر صيانة</h3>
              <p className="text-xs text-slate-500">إدخال تفاصيل الصيانة الدورية أو الطارئة والورشة والتكلفة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              المركبة *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
            >
              {vehicles.map((v, idx) => (
                <option key={`${v.Vehicle_ID}-${idx}`} value={v.Vehicle_ID}>
                  {v.Plate_Number} — {v.Brand} {v.Model}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                نوع الصيانة *
              </label>
              <input
                type="text"
                list="maintenance-types"
                value={maintType}
                onChange={(e) => setMaintType(e.target.value)}
                placeholder="مثال: تغيير زيت وفلتر، فرامل، إطارات"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              <datalist id="maintenance-types">
                <option value="صيانة دورية 5,000 كم (زيت وفلتر)" />
                <option value="صيانة دورية 10,000 كم شاملة" />
                <option value="صيانة مكابح وتغيير فحمات" />
                <option value="تغيير إطارات وترصيص" />
                <option value="صيانة نظام التكييف والرديتر" />
                <option value="صيانة ميكانيكية عامة" />
                <option value="سمكرة ودهان" />
                <option value="صيانة كهربائية وبطارية" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                حالة الصيانة *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="COMPLETED">مكتملة</option>
                <option value="IN_PROGRESS">قيد التنفيذ (المركبة في الورشة)</option>
                <option value="SCHEDULED">مجدولة</option>
                <option value="WAITING_PARTS">بانتظار قطع الغيار</option>
                <option value="OPEN">مفتوحة</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ الصيانة *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                قراءة العداد (كم) *
              </label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value ? Number(e.target.value) : '')}
                placeholder="48250"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                التكلفة الإجمالية (ر.س) *
              </label>
              <input
                type="number"
                step="0.01"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
                placeholder="450"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold text-blue-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الورشة / المركز
              </label>
              <input
                type="text"
                value={workshop}
                onChange={(e) => setWorkshop(e.target.value)}
                placeholder="بترومين، عبداللطيف جميل، الوعلان"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                رقم الفاتورة / أمر العمل
              </label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                placeholder="INV-MNT-9821"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              تذكير الصيانة القادمة
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  تاريخ الصيانة القادمة
                </label>
                <input
                  type="date"
                  value={nextDate}
                  onChange={(e) => setNextDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  عداد الصيانة القادمة (كم)
                </label>
                <input
                  type="number"
                  value={nextOdo}
                  onChange={(e) => setNextOdo(e.target.value ? Number(e.target.value) : '')}
                  placeholder="58000"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              تفاصيل وملاحظات الصيانة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="القطع المستبدلة، فحص الفرامل، الزيوت المستخدمة..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            إلغاء
          </button>
          {onSaveAndNew && (
            <button
              type="button"
              disabled={isSubmitting || !vehicleId || !maintType || !odometer || cost === ''}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
            >
              حفظ + عملية جديدة
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting || !vehicleId || !maintType || !odometer || cost === ''}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Wrench className="w-4 h-4" />
            حفظ أمر الصيانة
          </button>
        </div>
      </div>
    </div>
  );
}
