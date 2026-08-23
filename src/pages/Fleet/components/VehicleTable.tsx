import React from 'react';
import { Vehicle } from '@/types/fleet';
import { ReadinessGauge } from './ReadinessGauge';
import { 
  Eye, Edit, Trash2, Fuel, Wrench, AlertTriangle, 
  ArrowUpDown, MoreHorizontal, User, Gauge
} from 'lucide-react';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onViewDetails: (vehicleId: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onQuickFuel: (vehicleId: string) => void;
  onQuickMaint: (vehicleId: string) => void;
}

export function VehicleTable({
  vehicles,
  onViewDetails,
  onEdit,
  onDelete,
  onQuickFuel,
  onQuickMaint,
}: VehicleTableProps) {
  const [activeMenuId, setActiveMenuId] = React.useState<string | null>(null);

  const statusConfig = {
    ACTIVE: { label: 'نشطة', bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300' },
    IN_MAINTENANCE: { label: 'في الصيانة', bg: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300' },
    STOPPED: { label: 'متوقفة', bg: 'bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    NOT_READY: { label: 'غير جاهزة', bg: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300' },
    ACCIDENT: { label: 'حادث', bg: 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300' },
    RESERVE: { label: 'احتياط', bg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300' },
    SOLD: { label: 'مباعة', bg: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
  };

  return (
    <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-right text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold">
          <tr>
            <th className="py-3.5 px-4">رقم اللوحة</th>
            <th className="py-3.5 px-4">المركبة والموديل</th>
            <th className="py-3.5 px-4">السائق المعتمد</th>
            <th className="py-3.5 px-4">قراءة العداد</th>
            <th className="py-3.5 px-4">حالة التشغيل</th>
            <th className="py-3.5 px-4">مؤشر الجاهزية</th>
            <th className="py-3.5 px-4 text-center">إجراءات سريعة</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {vehicles.map((v) => {
            const status = statusConfig[v.Operational_Status] || { label: v.Operational_Status, bg: 'bg-slate-100 text-slate-700' };
            const isMenuOpen = activeMenuId === v.Vehicle_ID;

            return (
              <tr 
                key={v.Vehicle_ID}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
              >
                {/* Plate Badge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div 
                    onClick={() => onViewDetails(v.Vehicle_ID)}
                    className="inline-flex items-stretch border-2 border-slate-900 dark:border-slate-400 rounded-lg overflow-hidden shadow-2xs bg-white dark:bg-slate-800 cursor-pointer group-hover:border-indigo-600 transition-colors"
                  >
                    <div className="bg-emerald-600 px-1.5 py-0.5 flex items-center justify-center text-[9px] font-black text-white">
                      KSA
                    </div>
                    <div className="px-2 py-0.5 text-xs font-mono font-black text-slate-900 dark:text-white">
                      {v.Plate_Number}
                    </div>
                  </div>
                </td>

                {/* Model & Year */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div 
                    onClick={() => onViewDetails(v.Vehicle_ID)}
                    className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 cursor-pointer"
                  >
                    {v.Brand} {v.Model}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {v.Year} • {v.Color} • {v.Fuel_Type === 'DIESEL' ? 'ديزل' : 'بنزين'}
                  </div>
                </td>

                {/* Driver */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {v.Primary_Driver_Name ? v.Primary_Driver_Name[0] : '-'}
                    </div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {v.Primary_Driver_Name || <span className="text-slate-400 italic">غير مسند</span>}
                    </span>
                  </div>
                </td>

                {/* Odometer */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    {v.Current_Odometer?.toLocaleString('en-US') || 0}
                  </span>
                  <span className="text-[10px] text-slate-400 mr-1">كم</span>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${status.bg}`}>
                    {status.label}
                  </span>
                </td>

                {/* Readiness Gauge */}
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <ReadinessGauge score={v.Readiness_Score ?? 100} size="sm" showLabel={true} reasons={v.Readiness_Reasons} />
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => onQuickFuel(v.Vehicle_ID)}
                      title="تسجيل وقود"
                      className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                    >
                      <Fuel className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onQuickMaint(v.Vehicle_ID)}
                      title="تسجيل صيانة"
                      className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                    >
                      <Wrench className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onViewDetails(v.Vehicle_ID)}
                      title="عرض الملف"
                      className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(v)}
                      title="تعديل"
                      className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(v)}
                      title="أرشفة"
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
