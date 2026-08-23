import React, { useState, useEffect } from 'react';
import { AccidentLog, Vehicle } from '@/types/fleet';
import { fleetService } from '@/services/fleetService';
import { AlertOctagon, X } from 'lucide-react';

interface AddAccidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  onSuccess: (log: AccidentLog) => void;
}

export function AddAccidentModal({ isOpen, onClose, vehicles, defaultVehicleId, onSuccess }: AddAccidentModalProps) {
  const [vehicleId, setVehicleId] = useState<string>(defaultVehicleId || (vehicles[0]?.Vehicle_ID || ''));
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>('12:00');
  const [location, setLocation] = useState<string>('');
  const [severity, setSeverity] = useState<AccidentLog['Severity']>('MINOR');
  const [status, setStatus] = useState<AccidentLog['Status']>('OPEN');
  const [cost, setCost] = useState<number | ''>('');
  const [description, setDescription] = useState<string>('');
  const [policeNo, setPoliceNo] = useState<string>('');
  const [claimNo, setClaimNo] = useState<string>('');
  const [otherParty, setOtherParty] = useState<string>('');
  const [responsibility, setResponsibility] = useState<number | ''>(0);
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVehicle = vehicles.find(v => v.Vehicle_ID === vehicleId);

  useEffect(() => {
    if (defaultVehicleId) setVehicleId(defaultVehicleId);
    else if (vehicles.length > 0 && !vehicleId) setVehicleId(vehicles[0].Vehicle_ID);
  }, [defaultVehicleId, vehicles]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!vehicleId || !date || !description) return;

    setIsSubmitting(true);
    try {
      const res = await fleetService.addAccidentLog({
        Vehicle_ID: vehicleId,
        Driver_Employee_ID: selectedVehicle?.Primary_Driver_ID,
        Driver_Name: selectedVehicle?.Primary_Driver_Name,
        Date: date,
        Time: time,
        Location: location,
        Severity: severity,
        Status: status,
        Cost: Number(cost) || 0,
        Description: description,
        Police_Report_No: policeNo,
        Insurance_Claim_No: claimNo,
        Other_Party_Details: otherParty,
        Responsibility_Percentage: Number(responsibility) || 0,
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
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">تسجيل تقرير حادث</h3>
              <p className="text-xs text-slate-500">توثيق الحادث وتقرير نجم ونسبة المسؤولية والمطالبة</p>
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
              {vehicles.map((v, idx) => (
                <option key={`${v.Vehicle_ID}-${idx}`} value={v.Vehicle_ID}>
                  {v.Plate_Number} — {v.Brand} {v.Model} ({v.Primary_Driver_Name || 'بدون سائق'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">درجة خطورة الحادث *</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="MINOR">خفيف (احتكاك بسيط / خدوش)</option>
                <option value="MODERATE">متوسط (أضرار بالهيكل قابلة للسير)</option>
                <option value="SEVERE">شديد (تلفيات كبيرة / سحب سطحة)</option>
                <option value="CRITICAL">جسيم (حادث خطر / خروج وسائد هوائية)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">حالة متابعة الحادث *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="OPEN">مفتوح (بانتظار الإجراءات)</option>
                <option value="IN_PROGRESS">تحت المعالجة</option>
                <option value="WAITING_INSURANCE">بانتظار تقدير / موافقة التأمين</option>
                <option value="WAITING_REPAIR">بانتظار الإصلاح بالورشة</option>
                <option value="CLOSED">مغلق (تم الإصلاح والتسوية)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">تاريخ الحادث *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">الوقت والموقع</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="الرياض - طريق الملك فهد"
                  className="col-span-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">وصف الحادث والأضرار *</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف تفصيلي للحادث، مكان الصدمة، ظروف وقوعه..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">رقم تقرير نجم / المرور</label>
              <input
                type="text"
                value={policeNo}
                onChange={(e) => setPoliceNo(e.target.value)}
                placeholder="NAJM-2026-1102"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">رقم مطالبة التأمين</label>
              <input
                type="text"
                value={claimNo}
                onChange={(e) => setClaimNo(e.target.value)}
                placeholder="CLM-98213"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">نسبة المسؤولية (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={responsibility}
                onChange={(e) => setResponsibility(e.target.value ? Number(e.target.value) : '')}
                placeholder="0% أو 50% أو 100%"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">بيانات الطرف الآخر (المركبة / السائق)</label>
              <input
                type="text"
                value={otherParty}
                onChange={(e) => setOtherParty(e.target.value)}
                placeholder="تويوتا كورولا - لوحة ب ل ر 4412"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">تكلفة الإصلاح / التحمل التقديرية (ر.س)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
                placeholder="600"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
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
            disabled={isSubmitting || !vehicleId || !date || !description}
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            <AlertOctagon className="w-4 h-4" />
            حفظ تقرير الحادث
          </button>
        </div>
      </div>
    </div>
  );
}
