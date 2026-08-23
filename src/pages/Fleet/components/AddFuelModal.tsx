import React, { useState, useEffect } from 'react';
import { FuelLog, Vehicle } from '@/types/fleet';
import { fleetService } from '@/services/fleetService';
import { Fuel, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { calculateFuelMetrics } from '@/utils/fleetCalculations';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  defaultVehicleId?: string;
  onSuccess: (log: FuelLog) => void;
  onSaveAndNew?: (log: FuelLog) => void;
}

export function AddFuelModal({ isOpen, onClose, vehicles, defaultVehicleId, onSuccess, onSaveAndNew }: AddFuelModalProps) {
  const [vehicleId, setVehicleId] = useState<string>(defaultVehicleId || (vehicles[0]?.Vehicle_ID || ''));
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number | ''>('');
  const [liters, setLiters] = useState<number | ''>('');
  const [cost, setCost] = useState<number | ''>('');
  const [pricePerLiter, setPricePerLiter] = useState<number>(2.18);
  const [station, setStation] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<FuelLog['Payment_Method']>('PETROL_CARD');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedVehicle = vehicles.find(v => v.Vehicle_ID === vehicleId);

  useEffect(() => {
    if (defaultVehicleId) setVehicleId(defaultVehicleId);
    else if (vehicles.length > 0 && !vehicleId) setVehicleId(vehicles[0].Vehicle_ID);
  }, [defaultVehicleId, vehicles]);

  useEffect(() => {
    if (selectedVehicle) {
      if (selectedVehicle.Fuel_Type === 'DIESEL') {
        setPricePerLiter(1.15);
      } else if (selectedVehicle.Fuel_Type === 'GASOLINE_95') {
        setPricePerLiter(2.33);
      } else {
        setPricePerLiter(2.18);
      }
      if (odometer === '' && selectedVehicle.Current_Odometer) {
        setOdometer(selectedVehicle.Current_Odometer + 450);
      }
    }
  }, [vehicleId, selectedVehicle]);

  // Auto calculate cost if liters changes
  const handleLitersChange = (val: number | '') => {
    setLiters(val);
    if (typeof val === 'number' && val > 0) {
      setCost(Number((val * pricePerLiter).toFixed(2)));
    }
  };

  // Real-time metric & anomaly calculation
  const metrics = selectedVehicle && typeof odometer === 'number' && typeof liters === 'number' && typeof cost === 'number'
    ? calculateFuelMetrics(odometer, liters, cost, selectedVehicle.Current_Odometer, selectedVehicle.Avg_km_per_L || 10)
    : null;

  if (!isOpen) return null;

  const handleSubmit = async (andNew: boolean = false) => {
    if (!vehicleId || !odometer || !liters || !cost) return;

    setIsSubmitting(true);
    try {
      const res = await fleetService.addFuelLog({
        Vehicle_ID: vehicleId,
        Date: date,
        Odometer: Number(odometer),
        Liters: Number(liters),
        Cost: Number(cost),
        Price_Per_Liter: pricePerLiter,
        Station: station,
        Invoice_No: invoiceNo,
        Payment_Method: paymentMethod,
        Notes: notes,
      });

      if (res.success && res.data) {
        if (andNew) {
          onSaveAndNew?.(res.data);
          setLiters('');
          setCost('');
          setInvoiceNo('');
          setNotes('');
          if (typeof odometer === 'number') {
            setOdometer(odometer + 450);
          }
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
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">تسجيل تعبئة وقود</h3>
              <p className="text-xs text-slate-500">إدخال كمية وتكلفة وقراءة عداد الوقود للمركبة</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Vehicle Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              المركبة *
            </label>
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              id="fuel-vehicle-select"
            >
              {vehicles.map(v => (
                <option key={v.Vehicle_ID} value={v.Vehicle_ID}>
                  {v.Plate_Number} — {v.Brand} {v.Model} ({v.Primary_Driver_Name || 'بدون سائق'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                تاريخ التعبئة *
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
                قراءة العداد الحالية (كم) *
              </label>
              <input
                type="number"
                value={odometer}
                onChange={(e) => setOdometer(e.target.value ? Number(e.target.value) : '')}
                placeholder={selectedVehicle?.Current_Odometer ? `الحالي: ${selectedVehicle.Current_Odometer}` : 'مثال: 48500'}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
              {selectedVehicle?.Current_Odometer && typeof odometer === 'number' && odometer < selectedVehicle.Current_Odometer && (
                <p className="text-xs text-rose-500 mt-1 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  قراءة العداد أقل من آخر قراءة مسجلة ({selectedVehicle.Current_Odometer} كم)
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الكمية (لتر) *
              </label>
              <input
                type="number"
                step="0.1"
                value={liters}
                onChange={(e) => handleLitersChange(e.target.value ? Number(e.target.value) : '')}
                placeholder="60"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                سعر اللتر (ر.س)
              </label>
              <input
                type="number"
                step="0.01"
                value={pricePerLiter}
                onChange={(e) => {
                  const p = Number(e.target.value);
                  setPricePerLiter(p);
                  if (typeof liters === 'number') setCost(Number((liters * p).toFixed(2)));
                }}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                الإجمالي (ر.س) *
              </label>
              <input
                type="number"
                step="0.1"
                value={cost}
                onChange={(e) => setCost(e.target.value ? Number(e.target.value) : '')}
                placeholder="130.80"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-bold text-amber-600"
              />
            </div>
          </div>

          {/* Anomaly / Variance Banner */}
          {metrics && (
            <div className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
              metrics.isAnomaly 
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-800 dark:text-rose-300' 
                : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
            }`}>
              {metrics.isAnomaly ? <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <div>
                <span className="font-semibold">
                  المسافة المقطوعة: {metrics.kmSinceLast} كم | معدل الاستهلاك الفعلي: {metrics.actualKmPerLiter} كم/لتر ({metrics.variancePercentage > 0 ? `+${metrics.variancePercentage}%` : `${metrics.variancePercentage}%`})
                </span>
                {metrics.anomalyMessage && <p className="mt-0.5 text-[11px] font-medium">{metrics.anomalyMessage}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                محطة الوقود
              </label>
              <input
                type="text"
                value={station}
                onChange={(e) => setStation(e.target.value)}
                placeholder="مثال: الدريس، ساسكو، بترومين"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                طريقة الدفع
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                <option value="PETROL_CARD">بطاقة وقود (بترول كارد)</option>
                <option value="COMPANY_ACCOUNT">حساب الشركة / آجل</option>
                <option value="CARD">بطاقة بنكية / مدى</option>
                <option value="CASH">نقدي (كاش)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              رقم الفاتورة / المرجع
            </label>
            <input
              type="text"
              value={invoiceNo}
              onChange={(e) => setInvoiceNo(e.target.value)}
              placeholder="مثال: INV-98124"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ملاحظات إضافية
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أي ملاحظات حول الرحلة أو حالة الوقود..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm resize-none"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            إلغاء
          </button>
          {onSaveAndNew && (
            <button
              type="button"
              disabled={isSubmitting || !vehicleId || !odometer || !liters || !cost}
              onClick={() => handleSubmit(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              حفظ + عملية جديدة
            </button>
          )}
          <button
            type="button"
            disabled={isSubmitting || !vehicleId || !odometer || !liters || !cost}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-md shadow-amber-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <Fuel className="w-4 h-4" />
            حفظ العملية
          </button>
        </div>
      </div>
    </div>
  );
}
