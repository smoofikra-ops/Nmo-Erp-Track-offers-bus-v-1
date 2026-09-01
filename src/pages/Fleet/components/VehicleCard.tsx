import React from 'react';
import { Vehicle } from '@/types/fleet';
import { Employee } from '@/types/models';
import { ReadinessGauge } from './ReadinessGauge';
import { calculateExpiryStatus } from '@/data/fleetMasterData';
import { 
  Gauge, User, AlertTriangle, 
  Fuel, Wrench, MoreVertical, Eye, Edit, Trash2,
  CheckCircle2, AlertCircle, Info, Shield, FileText, IdCard
} from 'lucide-react';

interface VehicleCardProps {
  key?: React.Key;
  vehicle: Vehicle;
  linkedEmployee?: Employee | null;
  onViewDetails: (vehicleId: string) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
  onQuickFuel: (vehicleId: string) => void;
  onQuickMaint: (vehicleId: string) => void;
}

export type VehicleRiskLevel = 'CRITICAL' | 'WARNING' | 'ATTENTION' | 'NORMAL';

export function VehicleCard({
  vehicle,
  linkedEmployee,
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

  // Expiry checks for 3 core documents + Driver License
  const regExpiry = vehicle.Registration_Expiry || vehicle.License_Expiry;
  const insExpiry = vehicle.Insurance_Expiry;
  const inspExpiry = vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry;
  const driverLicenseExpiry = linkedEmployee?.DrivingLicenseExpiryDate || (linkedEmployee as any)?.DriverLicenseExpiryDate;

  const regStatus = calculateExpiryStatus(regExpiry);
  const insStatus = calculateExpiryStatus(insExpiry);
  const inspStatus = calculateExpiryStatus(inspExpiry);
  const driverLicenseStatus = driverLicenseExpiry ? calculateExpiryStatus(driverLicenseExpiry) : null;

  const readinessScore = vehicle.Readiness_Score ?? vehicle.Readiness_Index ?? 100;
  const displayUser = vehicle.Assigned_User_Name || vehicle.Primary_Driver_Name || (vehicle as any).Driver_Name || vehicle.Owner_Name || 'سائق غير محدد';

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
    if (driverLicenseStatus && (driverLicenseStatus.status === 'EXPIRED' || driverLicenseStatus.daysRemaining < 0)) {
      list.push({ 
        level: 'CRITICAL', 
        text: `رخصة قيادة السائق (${displayUser}) منتهية`,
        icon: 'license'
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
    if (driverLicenseStatus && driverLicenseStatus.daysRemaining >= 0 && driverLicenseStatus.daysRemaining <= 15) {
      list.push({ 
        level: 'WARNING', 
        text: `رخصة قيادة السائق تنتهي خلال ${driverLicenseStatus.daysRemaining} يوم`,
        icon: 'license'
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
    if (driverLicenseStatus && driverLicenseStatus.daysRemaining > 15 && driverLicenseStatus.daysRemaining <= 60) {
      list.push({ 
        level: 'ATTENTION', 
        text: `متابعة تجديد رخصة قيادة السائق (باقي ${driverLicenseStatus.daysRemaining} يوم)`,
        icon: 'license'
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
  }, [insStatus, inspStatus, regStatus, driverLicenseStatus, vehicle.Operational_Status, readinessScore, statusConfig.label, displayUser]);

  // Visual Theme Config according to Risk Level (3D Neon-style Borders)
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
      cardWrapperClass: 'border-2 border-orange-500 shadow-[0_2px_10px_rgba(249,115,22,0.25),inset_0_0_0_1px_rgba(249,115,22,0.15)]',
      badgeBg: 'bg-orange-50 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      dotBg: 'bg-orange-500',
      badgeLabel: 'تحذير تشغيلي',
      reasonBanner: 'bg-orange-50/90 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900/60 text-orange-900 dark:text-orange-200',
      reasonIcon: AlertTriangle,
      reasonIconColor: 'text-orange-600 dark:text-orange-400'
    },
    ATTENTION: {
      cardWrapperClass: 'border-2 border-amber-400 shadow-[0_2px_8px_rgba(251,191,36,0.2),inset_0_0_0_1px_rgba(251,191,36,0.15)]',
      badgeBg: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dotBg: 'bg-amber-400',
      badgeLabel: 'تحتاج متابعة',
      reasonBanner: 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200',
      reasonIcon: Info,
      reasonIconColor: 'text-amber-600 dark:text-amber-400'
    },
    NORMAL: {
      cardWrapperClass: 'border-2 border-emerald-500/80 shadow-[0_2px_8px_rgba(16,185,129,0.15),inset_0_0_0_1px_rgba(16,185,129,0.1)]',
      badgeBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dotBg: 'bg-emerald-500',
      badgeLabel: 'سليم / آمنة',
      reasonBanner: 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200',
      reasonIcon: CheckCircle2,
      reasonIconColor: 'text-emerald-600 dark:text-emerald-400'
    }
  }[riskLevel];

  const ReasonIconComponent = riskTheme.reasonIcon;

  return (
    <div className={`relative bg-white dark:bg-slate-900 rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden group ${riskTheme.cardWrapperClass}`}>
      {/* Main Body Content */}
      <div className="p-3.5 pb-2.5 space-y-2.5">
        
        {/* ======================================================== */}
        {/* HEADER: LEVEL 1 (Plate) + LEVEL 3 (Risk & Readiness Gauge) */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between gap-2">
          {/* Right Group: Saudi Plate Badge + Risk Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Saudi Plate Badge */}
            <div className="inline-flex items-stretch border-2 border-slate-900 dark:border-slate-300 rounded-lg overflow-hidden shadow-xs bg-white dark:bg-slate-800">
              <div className="bg-emerald-600 px-1.5 py-0.5 flex items-center justify-center text-[9px] font-black text-white uppercase tracking-tighter">
                KSA
              </div>
              <div className="px-2 py-0.5 text-xs font-mono font-black text-slate-900 dark:text-white tracking-wider flex items-center">
                {vehicle.Plate_Number}
              </div>
            </div>

            {/* Risk Indicator Badge */}
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black border shadow-2xs ${riskTheme.badgeBg}`}>
              <span className="relative flex h-2 w-2">
                <span className={`inline-flex rounded-full h-2 w-2 ${riskLevel === 'CRITICAL' ? 'bg-rose-500' : riskLevel === 'WARNING' ? 'bg-orange-500' : riskLevel === 'ATTENTION' ? 'bg-amber-400' : 'bg-emerald-500'}`}></span>
              </span>
              <span>{riskTheme.badgeLabel}</span>
            </div>
          </div>

          {/* Left Group: Unified "جاهزية الباص" Gauge & Quick Menu */}
          <div className="flex items-center gap-1.5">
            <ReadinessGauge score={readinessScore} size="xs" busLabel={true} />
            
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

        {/* ======================================================== */}
        {/* LEVEL 1: Vehicle Brand & Model & Specs + Operational Status */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 
              onClick={() => onViewDetails(vehicle.Vehicle_ID)}
              className="text-sm font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors leading-tight truncate"
            >
              {vehicle.Brand} {vehicle.Model}
            </h3>
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border shrink-0 ${statusConfig.bg}`}>
              {statusConfig.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            موديل {vehicle.Manufacturing_Year || vehicle.Year} • {vehicle.Color || 'أبيض'} • {vehicle.Registration_Type || 'خصوصي'}
          </p>
        </div>

        {/* ======================================================== */}
        {/* LEVEL 2 & LEVEL 5: DRIVER IDENTITY (3D Badge) + ODOMETER */}
        {/* ======================================================== */}
        <div className="grid grid-cols-12 gap-2">
          {/* Driver Identity Block (Col 7 / 8) - High Priority */}
          <div 
            className="col-span-7 sm:col-span-8 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-slate-50 via-indigo-50/50 to-slate-50 dark:from-slate-800/90 dark:via-indigo-950/40 dark:to-slate-800/90 border border-indigo-100/90 dark:border-indigo-900/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_1px_3px_rgba(0,0,0,0.2)] min-w-0"
            title={`السائق: ${displayUser}`}
          >
            {/* 3D Driver Avatar Icon */}
            <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-500/20 border-t border-indigo-400/50">
              <User className="w-3.5 h-3.5" />
            </div>

            {/* Driver Text Hierarchy */}
            <div className="min-w-0 flex-1 text-right">
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block">
                  السائق
                </span>
                {driverLicenseStatus && (
                  <span 
                    className={`text-[8px] font-bold px-1 py-0.5 rounded border leading-none shrink-0 ${driverLicenseStatus.badgeClass}`}
                    title={`رخصة القيادة: ${driverLicenseStatus.label} (${driverLicenseExpiry})`}
                  >
                    رخصة {driverLicenseStatus.label}
                  </span>
                )}
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white truncate block text-xs sm:text-[13px] leading-tight mt-1">
                {displayUser}
              </span>
            </div>
          </div>

          {/* Odometer Block (Col 5 / 4) */}
          <div 
            className="col-span-5 sm:col-span-4 flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.03)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.04)] min-w-0"
            title={`العداد: ${vehicle.Current_Odometer?.toLocaleString('en-US') || 0} كم`}
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-b from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-amber-500/20 border-t border-amber-300/60">
              <Gauge className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1 text-right">
              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400 block leading-none">
                العداد
              </span>
              <span className="font-extrabold text-slate-900 dark:text-white truncate block text-xs sm:text-[12px] font-mono leading-tight mt-0.5">
                {vehicle.Current_Odometer?.toLocaleString('en-US') || 0} <span className="text-[9px] font-medium text-slate-500">كم</span>
              </span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* LEVEL 4: PRIMARY ALERT BANNER (Immediate Problem)        */}
        {/* ======================================================== */}
        <div className="relative">
          <div className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${riskTheme.reasonBanner}`}>
            <div className="flex items-center gap-1.5 min-w-0">
              <ReasonIconComponent className={`w-3.5 h-3.5 shrink-0 ${riskTheme.reasonIconColor}`} />
              <span className="font-bold text-[11px] truncate leading-tight">
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
                  className="px-1.5 py-0.5 rounded-md bg-white/90 dark:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-white transition-all cursor-pointer"
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

        {/* ======================================================== */}
        {/* LEVEL 5: THREE DOCUMENT STATUSES (Registration, Insurance, Inspection) */}
        {/* ======================================================== */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 px-0.5">
            <span>الوثائق والتراخيص</span>
            <span>الأيام المتبقية</span>
          </div>

          <div className="grid grid-cols-3 gap-1 text-[10px]">
            {/* Registration */}
            <div className={`py-1 px-1 rounded-lg border flex flex-col justify-center items-center text-center shadow-2xs ${regStatus.badgeClass}`}>
              <span className="text-[8px] font-medium opacity-75">الاستمارة</span>
              <span className="font-bold leading-tight mt-0.5 truncate max-w-full px-0.5">{regStatus.label}</span>
            </div>

            {/* Insurance */}
            <div className={`py-1 px-1 rounded-lg border flex flex-col justify-center items-center text-center shadow-2xs ${insStatus.badgeClass}`}>
              <span className="text-[8px] font-medium opacity-75">التأمين</span>
              <span className="font-bold leading-tight mt-0.5 truncate max-w-full px-0.5">{insStatus.label}</span>
            </div>

            {/* Inspection */}
            <div className={`py-1 px-1 rounded-lg border flex flex-col justify-center items-center text-center shadow-2xs ${inspStatus.badgeClass}`}>
              <span className="text-[8px] font-medium opacity-75">الفحص</span>
              <span className="font-bold leading-tight mt-0.5 truncate max-w-full px-0.5">{inspStatus.label}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* LEVEL 6: CARD ACTIONS FOOTER                             */}
      {/* ======================================================== */}
      <div className="px-3.5 py-2 bg-slate-50/90 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
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


