import React, { useState, useEffect } from 'react';
import { ComplianceLog, Vehicle } from '@/types/fleet';
import { fleetService } from '@/services/fleetService';
import { FileCheck, X } from 'lucide-react';

interface AddComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  onSuccess: (log: ComplianceLog) => void;
}

export function AddComplianceModal({ isOpen, onClose, vehicles, defaultVehicleId, onSuccess }: AddComplianceModalProps) {
  const [vehicleId, setVehicleId] = useState<string>(defaultVehicleId || (vehicles[0]?.Vehicle_ID || ''));
  const [inspectionDate, setInspectionDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [inspectionExpiry, setInspectionExpiry] = useState<string>('');
  const [inspectionResult, setInspectionResult] = useState<ComplianceLog['Inspection_Result']>('PASSED');
  const [licenseStart, setLicenseStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [licenseExpiry, setLicenseExpiry] = useState<string>('');
  const [regNumber, setRegNumber] = useState<string>('');
  const [cost, setCost] = useState<number | ''>(150);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultVehicleId) setVehicleId(defaultVehicleId);
    else if (vehicles.length > 0 && !vehicleId) setVehicleId(vehicles[0].Vehicle_ID);
  }, [defaultVehicleId, vehicles]);

  useEffect(() => {
    if (inspectionDate && !inspectionExpiry) {
      const d = new Date(inspectionDate);
      d.setFullYear(d.getFullYear() + 1);
      setInspectionExpiry(d.toISOString().split('T')[0]);
    }
  }, [inspectionDate]);

  useEffect(() => {
    if (licenseStart && !licenseExpiry) {
      const d = new Date(licenseStart);
      d.setFullYear(d.getFullYear() + 3);
      setLicenseExpiry(d.toISOString().split('T')[0]);
    }
  }, [licenseStart]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!vehicleId || !inspectionExpiry || !licenseExpiry) return;

    setIsSubmitting(true);
    try {
      const res = await fleetService.addComplianceLog({
        Vehicle_ID: vehicleId,
        Inspection_Date: inspectionDate,
        Inspection_Expiry: inspectionExpiry,
        Inspection_Result: inspectionResult,
        License_Start: licenseStart,
        License_Expiry: licenseExpiry,
        Registration_Number: regNumber,
        Cost: Number(cost) || 0,
        Notes: notes,
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">الفحص الدوري ورخصة السير</h3>
              <p className="text-xs text-slate-500">تسجيل نتائج الفحص الدوري وتجديد استمارة المركبة</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">المركبة *</label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            >
              {vehicles.map(v => (
                <option key={v.Vehicle_ID} value={v.Vehicle_ID}>
                  {v.Plate_Number} — {v.Brand} {v.Model}
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-600" />
              بيانات الفحص الدوري (المعاينة السنوية)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">تاريخ الفحص</label>
                <input
                  type="date"
                  value={inspectionDate}
                  onChange={(e) => setInspectionDate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">تاريخ انتهاء الفحص *</label>
                <input
                  type="date"
                  value={inspectionExpiry}
                  onChange={(e) => setInspectionExpiry(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-purple-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">نتيجة الفحص</label>
                <select
                  value={inspectionResult}
                  onChange={(e) => setInspectionResult(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                >
                  <option value="PASSED">ناجح (اجتاز)</option>
                  <option value="CONDITIONAL">مشروط (إعادة فحص)</option>
                  <option value="FAILED">راسب</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-indigo-600" />
              رخصة السير (الاستمارة)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">تاريخ إصدار / تجديد الرخصة</label>
                <input
                  type="date"
                  value={licenseStart}
                  onChange={(e) => setLicenseStart(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">تاريخ انتهاء الاستمارة *</label>
                <input
                  type="date"
                  value={licenseExpiry}
                  onChange={(e) => setLicenseExpiry(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-indigo-600"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">الرقم التسلسلي / رقم الاستمارة</label>
              <input
                type="text"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                placeholder="REG-98123"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">رسوم الفحص والتجديد (ر.س)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
                placeholder="150"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">ملاحظات</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات حول محطة الفحص أو شروط الفحص..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={isSubmitting || !vehicleId || !inspectionExpiry || !licenseExpiry}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold shadow-md shadow-purple-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            حفظ البيانات
          </button>
        </div>
      </div>
    </div>
  );
}
