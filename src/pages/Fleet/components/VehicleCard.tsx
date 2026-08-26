import React from 'react';
import { Vehicle } from '@/types/fleet';
import { ReadinessGauge } from './ReadinessGauge';
import { calculateExpiryStatus } from '@/data/fleetMasterData';
import { 
  Truck, Car, Gauge, User, AlertTriangle, ShieldCheck, 
  Fuel, Wrench, MoreVertical, Eye, Edit, Trash2, Calendar,
  Shield, FileText, CheckCircle2, AlertCircle, Sparkles, Clock, Info
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

export type VehicleRiskLevel = 'CRITICAL' | 'WARNING' | 'ATTENTION' | 'NORMAL';

export function VehicleCard({
  vehicle,
  onViewDetails,
  onEdit,
  onDelete,
  onQuickFuel,
  onQuickMaint,
}: VehicleCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const [showIssuesTooltip, setShowIssuesTooltip] = React.useState(false);

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

  const readinessScore = vehicle.Readiness_Score ?? vehicle.Readiness_Index ?? 100;
  const displayUser = vehicle.Assigned_User_Name || vehicle.Primary_Driver_Name || 'بدون مستخدم';

  // Calculate Risk Level & Collect Issues List
  const { riskLevel, issues, primaryReason } = React.useMemo(() => {
    const list: { level: VehicleRiskLevel; text: string; icon: string }[] = [];

    // Critical checks: Expired docs
    if (insStatus.status === 'EXPIRED' || insStatus.daysRemaining < 0) {
      list.push({ 
        level: 'CRITICAL', 
        text: `التأمين منتهي منذ ${Math.abs(insStatus.daysRemaining)} يوم`,
        icon: 'shield'
      });
    }
    if (inspStatus.status === 'EXPIRED' || inspStatus.daysRemaining < 0) {
      list.push({ 
        level: 'CRITICAL', 
        text: `الفحص الدوري منتهي منذ ${Math.abs(inspStatus.daysRemaining)} يوم`,
        icon: 'wrench'
      });
    }
    if (regStatus.status === 'EXPIRED' || regStatus.daysRemaining < 0) {
      list.push({ 
        level: 'CRITICAL', 
        text: `رخصة السير (الاستمارة) منتهية`,
        icon: 'file'
      });
    }
    if (['ACCIDENT', 'NOT_READY', 'STOPPED'].includes(vehicle.Operational_Status)) {
      list.push({ 
        level: 'CRITICAL', 
        text: `حالة تشغيلية حرجة: ${statusConfig.label}`,
        icon: 'alert'
      });
    }
    if (readinessScore < 50) {
      list.push({ 
        level: 'CRITICAL', 
        text: `مؤشر الجاهزية حرج (${readinessScore}%)`,
        icon: 'gauge'
      });
    }

    // Warning checks: Urgent doc expiry (<= 15 days), In Maintenance, low readiness (50-74)
    if (insStatus.daysRemaining >= 0 && insStatus.daysRemaining <= 15) {
      list.push({ 
        level: 'WARNING', 
        text: `التأمين ينتهي قريباً (باقي ${insStatus.daysRemaining} يوم)`,
        icon: 'shield'
      });
    }
    if (inspStatus.daysRemaining >= 0 && inspStatus.daysRemaining <= 15) {
      list.push({ 
        level: 'WARNING', 
        text: `الفحص الدوري ينتهي خلال ${inspStatus.daysRemaining} يوم`,
        icon: 'wrench'
      });
    }
    if (regStatus.daysRemaining >= 0 && regStatus.daysRemaining <= 15) {
      list.push({ 
        level: 'WARNING', 
        text: `الاستمارة تنتهي خلال ${regStatus.daysRemaining} يوم`,
        icon: 'file'
      });
    }
    if (vehicle.Operational_Status === 'IN_MAINTENANCE') {
      list.push({ 
        level: 'WARNING', 
        text: `المركبة قيد الصيانة الفنية`,
        icon: 'wrench'
      });
    }
    if (readinessScore >= 50 && readinessScore < 75) {
      list.push({ 
        level: 'WARNING', 
        text: `مستوى الجاهزية يحتاج تحسين (${readinessScore}%)`,
        icon: 'gauge'
      });
    }

    // Attention checks: Expiry in 16-60 days, readiness 75-84
    if (insStatus.daysRemaining > 15 && insStatus.daysRemaining <= 60) {
      list.push({ 
        level: 'ATTENTION', 
        text: `متابعة تجديد التأمين (باقي ${insStatus.daysRemaining} يوم)`,
        icon: 'shield'
      });
    }
    if (inspStatus.daysRemaining > 15 && inspStatus.daysRemaining <= 60) {
      list.push({ 
        level: 'ATTENTION', 
        text: `متابعة حجز الفحص (باقي ${inspStatus.daysRemaining} يوم)`,
        icon: 'wrench'
      });
    }
    if (regStatus.daysRemaining > 15 && regStatus.daysRemaining <= 60) {
      list.push({ 
        level: 'ATTENTION', 
        text: `متابعة تجديد الاستمارة (باقي ${regStatus.daysRemaining} يوم)`,
        icon: 'file'
      });
    }
    if (readinessScore >= 75 && readinessScore < 85) {
      list.push({ 
        level: 'ATTENTION', 
        text: `الجاهزية متوسطة (${readinessScore}%)`,
        icon: 'gauge'
      });
    }

    // Determine overall level
    let overallLevel: VehicleRiskLevel = 'NORMAL';
    if (list.some(i => i.level === 'CRITICAL')) {
      overallLevel = 'CRITICAL';
    } else if (list.some(i => i.level === 'WARNING')) {
      overallLevel = 'WARNING';
    } else if (list.some(i => i.level === 'ATTENTION')) {
      overallLevel = 'ATTENTION';
    }

    const primary = list[0]?.text || `حالة آمنة وجاهزية تشغيلية كاملة (${readinessScore}%)`;

    return {
      riskLevel: overallLevel,
      issues: list,
      primaryReason: primary
    };
  }, [insStatus, inspStatus, regStatus, vehicle.Operational_Status, readinessScore, statusConfig.label]);

  // Visual Theme Config according to Risk Level (Refined Static 3D Neon Borders)
  const riskTheme = {
    CRITICAL: {
      cardWrapperClass: 'border-2 border-rose-500 vehicle-critical-pulse',
      badgeBg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dotBg: 'bg-rose-500',
      badgeLabel: 'حالة حرجة',
      reasonBanner: 'bg-rose-50/90 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200',
      reasonIcon: AlertCircle,
      reasonIconColor: 'text-rose-600 dark:text-rose-400'
    },
    WARNING: {
      cardWrapperClass: 'border-2 border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.3),inset_0_0_0_1px_rgba(249,115,22,0.2)]',
      badgeBg: 'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      dotBg: 'bg-orange-500',
      badgeLabel: 'تنبيه تشغيلي',
      reasonBanner: 'bg-orange-50/90 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900/60 text-orange-900 dark:text-orange-200',
      reasonIcon: AlertTriangle,
      reasonIconColor: 'text-orange-600 dark:text-orange-400'
    },
    ATTENTION: {
      cardWrapperClass: 'border-2 border-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.3),inset_0_0_0_1px_rgba(251,191,36,0.2)]',
      badgeBg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dotBg: 'bg-amber-400',
      badgeLabel: 'تحتاج متابعة',
      reasonBanner: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200',
      reasonIcon: Info,
      reasonIconColor: 'text-amber-600 dark:text-amber-400'
    },
    NORMAL: {
      cardWrapperClass: 'border-2 border-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.25),inset_0_0_0_1px_rgba(16,185,129,0.15)]',
      badgeBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dotBg: 'bg-emerald-500',
      badgeLabel: 'آمنة / نشطة',
      reasonBanner: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200',
      reasonIcon: CheckCircle2,
      reasonIconColor: 'text-emerald-600 dark:text-emerald-400'
    }
  }[riskLevel];

  const ReasonIconComponent = riskTheme.reasonIcon;

  return (
    <div className={`relative bg-white dark:bg-slate-900 rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden group ${riskTheme.cardWrapperClass}`}>
      {/* Main Body */}
      <div className="p-3.5 pb-2.5 space-y-2.5">
        
        {/* Header: Saudi Plate + Risk Badge + Gauge & Menu */}
        <div className="flex items-center justify-between gap-2">
          {/* Saudi Plate Badge & Risk Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Saudi Plate Badge */}
            <div className="inline-flex items-stretch border-2 border-slate-900 dark:border-slate-300 rounded-lg overflow-hidden shadow-2xs bg-white dark:bg-slate-800">
              <div className="bg-emerald-600 px-1.5 py-0.5 flex items-center justify-center text-[9px] font-black text-white uppercase tracking-tighter">
                KSA
              </div>
              <div className="px-2 py-0.5 text-xs font-mono font-black text-slate-900 dark:text-white tracking-wider flex items-center">
                {vehicle.Plate_Number}
              </div>
            </div>

            {/* Smart Risk Indicator Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border shadow-2xs ${riskTheme.badgeBg}`}>
              <span className="relative flex h-2 w-2">
                <span className={`inline-flex rounded-full h-2 w-2 ${riskLevel === 'CRITICAL' ? 'bg-rose-500' : riskLevel === 'WARNING' ? 'bg-orange-500' : riskLevel === 'ATTENTION' ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
              </span>
              <span>{riskTheme.badgeLabel}</span>
            </div>
          </div>

          {/* Readiness Gauge & Menu Dropdown */}
          <div className="flex items-center gap-1.5">
            <ReadinessGauge score={readinessScore} size="sm" showLabel={false} />
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="خيارات المركبة"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div 
                  className="absolute left-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-30 text-xs animate-fadeIn"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <button
                    onClick={() => { setShowMenu(false); onViewDetails(vehicle.Vehicle_ID); }}
                    className="w-full px-3 py-1.5 text-right text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-500" />
                    <span>عرض الملف الكامل</span>
                  </button>
                  <button
                    onClick={() => { setShowMenu(false); onEdit(vehicle); }}
                    className="w-full px-3 py-1.5 text-right text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <Edit className="w-3.5 h-3.5 text-blue-500" />
                    <span>تعديل البيانات</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
                  <button
                    onClick={() => { setShowMenu(false); onDelete(vehicle); }}
                    className="w-full px-3 py-1.5 text-right text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>أرشفة المركبة</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Vehicle Brand & Model & Specs */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 
              onClick={() => onViewDetails(vehicle.Vehicle_ID)}
              className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors leading-tight truncate"
            >
              {vehicle.Brand} {vehicle.Model}
            </h3>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${statusConfig.bg}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            موديل {vehicle.Manufacturing_Year || vehicle.Year} • {vehicle.Color || 'أبيض'} • {vehicle.Registration_Type || 'خصوصي'}
          </p>
        </div>

        {/* Smart Risk Reason Summary Banner */}
        <div className="relative">
          <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${riskTheme.reasonBanner}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <ReasonIconComponent className={`w-3.5 h-3.5 shrink-0 ${riskTheme.reasonIconColor}`} />
              <span className="font-semibold text-[11px] truncate leading-tight">
                {primaryReason}
              </span>
            </div>

            {issues.length > 1 && (
              <div className="relative shrink-0">
                <button
                  type="button"
                  onMouseEnter={() => setShowIssuesTooltip(true)}
                  onMouseLeave={() => setShowIssuesTooltip(false)}
                  onClick={() => setShowIssuesTooltip(!showIssuesTooltip)}
                  className="px-1.5 py-0.5 rounded-md bg-white/80 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-white transition-all cursor-pointer"
                >
                  +{issues.length - 1} تنبيهات
                </button>

                {/* Issues Dropdown Tooltip */}
                {showIssuesTooltip && (
                  <div className="absolute left-0 bottom-full mb-1 w-52 p-2 rounded-xl bg-slate-900 text-white text-[10px] shadow-2xl border border-slate-700 z-30 space-y-1 animate-fadeIn pointer-events-none">
                    <p className="font-bold text-indigo-300 border-b border-slate-700 pb-1">كافة تنبيهات المركبة:</p>
                    {issues.map((iss, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-slate-200">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${iss.level === 'CRITICAL' ? 'bg-red-400' : iss.level === 'WARNING' ? 'bg-amber-400' : 'bg-yellow-400'}`} />
                        <span className="truncate">{iss.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
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
      <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
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
          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>عرض الملف</span>
        </button>
      </div>
    </div>
  );
}

