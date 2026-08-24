import React from 'react';
import { Vehicle } from '@/types/fleet';
import { ReadinessGauge } from './ReadinessGauge';
import { calculateExpiryStatus } from '@/data/fleetMasterData';
import { 
  Truck, Car, Gauge, User, AlertTriangle, ShieldCheck, 
  Fuel, Wrench, MoreVertical, Eye, Edit, Trash2, Calendar,
  Shield, FileText, CheckCircle2, AlertCircle
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

  // Expiry checks for 3 core documents
  const regExpiry = vehicle.Registration_Expiry || vehicle.License_Expiry;
  const insExpiry = vehicle.Insurance_Expiry;
  const inspExpiry = vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry;

  const regStatus = calculateExpiryStatus(regExpiry);
  const insStatus = calculateExpiryStatus(insExpiry);
  const inspStatus = calculateExpiryStatus(inspExpiry);

  const displayUser = vehicle.Assigned_User_Name || vehicle.Primary_Driver_Name || 'بدون مستخدم';

  return (
    <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group">
      {/* Top Banner & Status */}
      <div className="p-3.5 pb-2.5 space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Saudi Plate Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-stretch border-2 border-slate-900 dark:border-slate-300 rounded-lg overflow-hidden shadow-2xs bg-white dark:bg-slate-800">
              <div className="bg-emerald-600 px-1.5 py-0.5 flex items-center justify-center text-[9px] font-black text-white uppercase tracking-tighter">
                KSA
              </div>
              <div className="px-2 py-0.5 text-xs font-mono font-black text-slate-900 dark:text-white tracking-wider flex items-center">
                {vehicle.Plate_Number}
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusConfig.bg}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Readiness Gauge & Card Menu Button */}
          <div className="flex items-center gap-1.5">
            <ReadinessGauge score={vehicle.Readiness_Score ?? 100} size="sm" showLabel={false} />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div 
                  className="absolute left-0 mt-1 w-36 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20 text-xs"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => { setShowMenu(false); onViewDetails(vehicle.Vehicle_ID); }}
                    className="w-full px-3 py-1.5 text-right text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    عرض الملف الكامل
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onEdit(vehicle); }}
                    className="w-full px-3 py-1.5 text-right text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" />
                    تعديل البيانات
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                  <button
                    onClick={() => { setShowMenu(false); onDelete(vehicle); }}
                    className="w-full px-3 py-1.5 text-right text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    أرشفة المركبة
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Brand & Model */}
        <div>
          <h3 
            onClick={() => onViewDetails(vehicle.Vehicle_ID)}
            className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors leading-tight truncate"
          >
            {vehicle.Brand} {vehicle.Model}
          </h3>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            موديل {vehicle.Manufacturing_Year || vehicle.Year} • {vehicle.Color || 'أبيض'} • {vehicle.Registration_Type || 'خصوصي'}
          </p>
        </div>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs">
          {/* Assigned Driver/User */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 shrink-0">
              <User className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-slate-400 block leading-tight">المستخدم / العهدة</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                {displayUser}
              </span>
            </div>
          </div>

          {/* Odometer */}
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="p-1 rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 shrink-0">
              <Gauge className="w-3 h-3" />
            </div>
            <div className="min-w-0">
              <span className="text-[9px] text-slate-400 block leading-tight">العداد</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 truncate block text-[11px]">
                {vehicle.Current_Odometer?.toLocaleString('en-US') || 0} كم
              </span>
            </div>
          </div>
        </div>

        {/* Expiry Status Badges (Insurance, Registration, Inspection) */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-0.5">
            <span>الوثائق والتراخيص</span>
            <span>الأيام المتبقية</span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {/* Registration */}
            <div className={`py-1 px-1 rounded-lg border flex flex-col justify-center items-center text-center ${regStatus.badgeClass}`}>
              <span className="text-[8px] font-medium opacity-75">الاستمارة</span>
              <span className="font-bold leading-tight mt-0.5">{regStatus.label}</span>
            </div>

            {/* Insurance */}
            <div className={`py-1 px-1 rounded-lg border flex flex-col justify-center items-center text-center ${insStatus.badgeClass}`}>
              <span className="text-[8px] font-medium opacity-75">التأمين</span>
              <span className="font-bold leading-tight mt-0.5">{insStatus.label}</span>
            </div>

            {/* Inspection */}
            <div className={`py-1 px-1 rounded-lg border flex flex-col justify-center items-center text-center ${inspStatus.badgeClass}`}>
              <span className="text-[8px] font-medium opacity-75">الفحص</span>
              <span className="font-bold leading-tight mt-0.5">{inspStatus.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer Actions */}
      <div className="px-3.5 py-2 bg-slate-50/70 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onQuickFuel(vehicle.Vehicle_ID)}
            title="تسجيل وقود سريع"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors shadow-2xs"
          >
            <Fuel className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onQuickMaint(vehicle.Vehicle_ID)}
            title="تسجيل صيانة سريعة"
            className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors shadow-2xs"
          >
            <Wrench className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => onViewDetails(vehicle.Vehicle_ID)}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" />
          عرض الملف
        </button>
      </div>
    </div>
  );
}
