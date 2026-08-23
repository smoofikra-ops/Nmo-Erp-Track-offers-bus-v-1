import React, { useState, useEffect } from 'react';
import { InsuranceLog, Vehicle } from '@/types/fleet';
import { fleetService } from '@/services/fleetService';
import { Shield, X } from 'lucide-react';

interface AddInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  onSuccess: (log: InsuranceLog) => void;
}

export function AddInsuranceModal({ isOpen, onClose, vehicles, defaultVehicleId, onSuccess }: AddInsuranceModalProps) {
  const [vehicleId, setVehicleId] = useState<string>(defaultVehicleId || (vehicles[0]?.Vehicle_ID || ''));
  const [company, setCompany] = useState<string>('شركة التعاونية للتأمين');
  const [policyNo, setPolicyNo] = useState<string>('');
  const [type, setType] = useState<InsuranceLog['Insurance_Type']>('COMPREHENSIVE');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>('');
  const [cost, setCost] = useState<number | ''>('');
  const [deductible, setDeductible] = useState<number | ''>(1000);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultVehicleId) setVehicleId(defaultVehicleId);
    else if (vehicles.length > 0 && !vehicleId) setVehicleId(vehicles[0].Vehicle_ID);
  }, [defaultVehicleId, vehicles]);

  useEffect(() => {
    if (startDate && !endDate) {
      const d = new Date(startDate);
      d.setFullYear(d.getFullYear() + 1);
      setEndDate(d.toISOString().split('T')[0]);
    }
  }, [startDate]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!vehicleId || !company || !policyNo || !startDate || !endDate) return;

    setIsSubmitting(true);
    try {
      const res = await fleetService.addInsuranceLog({
        Vehicle_ID: vehicleId,
        Insurance_Company: company,
        Policy_Number: policyNo,
        Insurance_Type: type,
        Start_Date: startDate,
        End_Date: endDate,
        Premium_Cost: Number(cost) || 0,
        Deductible: Number(deductible) || 0,
        Status: 'VALID',
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
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">إضافة وثيقة تأمين</h3>
              <p className="text-xs text-slate-500">تسجيل وثيقة التأمين الشامل أو ضد الغير وتواريخ السريان</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">شركة التأمين *</label>
              <input
                type="text"
                list="insurance-companies"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="التعاونية، ملاذ، تكافل الراجحي"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              <datalist id="insurance-companies">
                <option value="شركة التعاونية للتأمين" />
                <option value="شركة ملاذ للتأمين" />
                <option value="شركة تكافل الراجحي" />
                <option value="شركة بوبا العربية" />
                <option value="شركة سلامة للتأمين" />
                <option value="شركة أسيج للتأمين" />
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نوع التأمين *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="COMPREHENSIVE">تأمين شامل</option>
                <option value="THIRD_PARTY">ضد الغير (سند / طرف ثالث)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">رقم الوثيقة *</label>
            <input
              type="text"
              value={policyNo}
              onChange={(e) => setPolicyNo(e.target.value)}
              placeholder="مثال: TAW-2026-98124"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">تاريخ البداية *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">تاريخ الانتهاء *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">قسط التأمين السنوي (ر.س)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
                placeholder="2800"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">مبلغ التحمل (ر.س)</label>
              <input
                type="number"
                value={deductible}
                onChange={(e) => setDeductible(e.target.value ? Number(e.target.value) : '')}
                placeholder="1000"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">ملاحظات والتغطيات الإضافية</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تغطية السائق، خدمة المساعدة على الطريق، شروط خاصة..."
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
            disabled={isSubmitting || !vehicleId || !company || !policyNo || !startDate || !endDate}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            حفظ الوثيقة
          </button>
        </div>
      </div>
    </div>
  );
}
