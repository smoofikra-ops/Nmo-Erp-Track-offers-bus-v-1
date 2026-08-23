import React from 'react';
import { Vehicle } from '@/types/fleet';
import { ReadinessGauge } from './ReadinessGauge';
import { 
  Truck, Car, Gauge, User, AlertTriangle, ShieldCheck, 
  Fuel, Wrench, MoreVertical, Eye, Edit, Trash2, Calendar
} from 'lucide-react';

interface VehicleCardProps {
  key?: React.Key;
  vehicle: Vehicle;
  onViewDetails: (vehicleId: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onQuickFuel: (vehicleId: string) => void;
  onQuickMaint: (vehicleId: string) => void;
}

export function VehicleCard({
  vehicle,
  onViewDetails,
  onEdit,
  onDelete,
  onQuickFuel,
  onQuickMaint,
}: VehicleCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);

  // Status mapping
  const statusConfig = {
    ACTIVE: { label: 'نشطة في الخدمة', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300' },
    IN_MAINTENANCE: { label: 'في الصيانة', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300' },
    STOPPED: { label: 'متوقفة', bg: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300' },
    NOT_READY: { label: 'غير جاهزة', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300' },
    ACCIDENT: { label: 'حادث', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300' },
    RESERVE: { label: 'احتياط', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-300' },
    SOLD: { label: 'مباعة', bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border-gray-300' },
  }[vehicle.Operational_Status] || { label: vehicle.Operational_Status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };

  // Expiry check
  const hasExpiryWarning = vehicle.Readiness_Reasons && vehicle.Readiness_Reasons.some(r => r.includes('منتهي') || r.includes('ينتهي'));

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Status */}
      <div className="p-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-3.5">
          {/* Saudi Plate Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-stretch border-2 border-slate-900 dark:border-slate-300 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-800">
              <div className="bg-emerald-600 px-2 py-1 flex items-center justify-center text-[10px] font-black text-white uppercase tracking-tighter">
                KSA
              </div>
              <div className="px-3 py-1 text-sm font-mono font-black text-slate-900 dark:text-white tracking-wider flex items-center">
                {vehicle.Plate_Number}
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.bg}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Card Menu Button */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <div 
                className="absolute left-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-20 text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => { setShowMenu(false); onViewDetails(vehicle.Vehicle_ID); }}
                  className="w-full px-3.5 py-1.5 text-right text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Eye className="w-3.5 h-3.5 text-indigo-500" />
                  عرض الملف الكامل
                </button>
                <button
                  onClick={() => { setShowMenu(false); onEdit(vehicle); }}
                  className="w-full px-3.5 py-1.5 text-right text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5 text-blue-500" />
                  تعديل البيانات
                </button>
                <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                <button
                  onClick={() => { setShowMenu(false); onDelete(vehicle); }}
                  className="w-full px-3.5 py-1.5 text-right text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  أرشفة المركبة
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Brand & Model */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h3 
              onClick={() => onViewDetails(vehicle.Vehicle_ID)}
              className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors"
            >
              {vehicle.Brand} {vehicle.Model}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              موديل {vehicle.Year} • {vehicle.Color} • {vehicle.Vehicle_Type}
            </p>
          </div>
          {/* Readiness Ring */}
          <div className="shrink-0">
            <ReadinessGauge score={vehicle.Readiness_Score ?? 100} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
          {/* Driver */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block">السائق المسند</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block">
                {vehicle.Primary_Driver_Name || 'بدون سائق'}
              </span>
            </div>
          </div>

          {/* Odometer */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block">قراءة العداد</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                {vehicle.Current_Odometer?.toLocaleString('en-US') || 0} كم
              </span>
            </div>
          </div>
        </div>

        {/* Expiration or Alert Banner if any */}
        {hasExpiryWarning && (
          <div className="mt-3 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">{vehicle.Readiness_Reasons?.[0]}</span>
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onQuickFuel(vehicle.Vehicle_ID)}
            title="تسجيل وقود سريع"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors shadow-2xs"
          >
            <Fuel className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onQuickMaint(vehicle.Vehicle_ID)}
            title="تسجيل صيانة سريعة"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onViewDetails(vehicle.Vehicle_ID)}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs shadow-indigo-600/20 transition-all flex items-center gap-1.5"
        >
          <Eye className="w-3.5 h-3.5" />
          عرض الملف
        </button>
      </div>
    </div>
  );
}
