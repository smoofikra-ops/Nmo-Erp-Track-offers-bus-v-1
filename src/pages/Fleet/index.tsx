import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Vehicle, OperationalStatus, VehicleType } from '@/types/fleet';
import { Employee } from '@/types/models';
import { fleetService } from '@/services/fleetService';
import { employeeService } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/contexts/AdminSecurityContext';
import { VehicleCard } from './components/VehicleCard';
import { VehicleTable } from './components/VehicleTable';
import { VehicleDetails } from './VehicleDetails';
import { VehicleModal } from './components/VehicleModal';
import { BusQuickEntryModal } from './components/BusQuickEntryModal';
import { BusServiceLogsList } from './components/BusServiceLogsList';
import { AddFuelModal } from './components/AddFuelModal';
import { AddMaintenanceModal } from './components/AddMaintenanceModal';
import { ImportExportModal } from './components/ImportExportModal';
import { 
  Truck, Plus, Zap, FileSpreadsheet, Search, Filter, 
  LayoutGrid, List, Gauge, Wrench, ShieldAlert, 
  TrendingUp, RefreshCw, AlertTriangle, CheckCircle, ArrowUpDown, Trash2, Upload,
  Layers, History
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function FleetPage() {
  const { user } = useAuth();
  const { requireAdminAuth } = useAdminAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';
  const queryClient = useQueryClient();

  const [activeMainTab, setActiveMainTab] = useState<'BUSES' | 'LOGS'>('BUSES');

  const {
    data: vehiclesRes,
    isLoading,
    isFetching,
    refetch: refetchVehicles
  } = useQuery({
    queryKey: ['vehicles', companyId],
    queryFn: () => fleetService.getVehicles(companyId),
    enabled: Boolean(companyId),
    staleTime: 1000 * 60 * 3,
  });

  const { data: employeesRes } = useQuery({
    queryKey: ['employees', companyId],
    queryFn: () => employeeService.getEmployees(companyId),
    enabled: Boolean(companyId),
    staleTime: 1000 * 60 * 5,
  });

  const employees: Employee[] = employeesRes?.data || [];
  const vehicles: Vehicle[] = vehiclesRes?.data || [];
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  const getLinkedEmployee = (v: Vehicle): Employee | null => {
    if (!employees || employees.length === 0) return null;
    const empId = v.Assigned_Employee_ID || v.Primary_Driver_ID;
    if (empId) {
      const found = employees.find(e => e.EmployeeID === empId);
      if (found) return found;
    }
    const name = v.Assigned_User_Name || v.Primary_Driver_Name || (v as any).Driver_Name;
    if (name && typeof name === 'string' && name.trim() !== '') {
      const trimmed = name.trim().toLowerCase();
      const found = employees.find(e => 
        (e.ArabicName && e.ArabicName.trim().toLowerCase() === trimmed) ||
        (e.EnglishName && e.EnglishName.trim().toLowerCase() === trimmed) ||
        (e.Alias && e.Alias.trim().toLowerCase() === trimmed)
      );
      if (found) return found;
    }
    return null;
  };

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [readinessFilter, setReadinessFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'GRID' | 'TABLE'>('GRID');

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickEntryVehicleId, setQuickEntryVehicleId] = useState<string | null>(null);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isClearAllModalOpen, setIsClearAllModalOpen] = useState(false);
  
  // Specific Quick Modals from Table/Cards
  const [quickFuelVehicleId, setQuickFuelVehicleId] = useState<string | null>(null);
  const [quickMaintVehicleId, setQuickMaintVehicleId] = useState<string | null>(null);

  // Delete/Archive Confirmation
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);
  const [archiveReason, setArchiveReason] = useState('بيع الباص أو خروجه من الخدمة');
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  const handleOpenClearFleet = () => {
    // Strict Admin authorization check
    if (user?.role !== 'ADMIN') {
      toast.error('هذا الإجراء مقصور على مدراء النظام فقط.');
      return;
    }
    requireAdminAuth('تفريغ كافة بيانات أسطول الباصات وحذفها نهائياً', () => {
      setIsClearAllModalOpen(true);
    });
  };

  const handleClearAllVehicles = async () => {
    try {
      await fleetService.clearAllVehicles(companyId);
      queryClient.setQueryData(['vehicles', companyId], { success: true, data: [] });
      queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] });
      queryClient.invalidateQueries({ queryKey: ['fleetKPIs', companyId] });
      setIsClearAllModalOpen(false);
      toast.success('تم تفريغ بيانات الأسطول بنجاح');
    } catch (err) {
      console.error('Failed to clear fleet vehicles:', err);
      toast.error('حدث خطأ أثناء تفريغ الأسطول');
    }
  };

  // KPI Calculations
  const totalVehicles = vehicles.length;
  const activeCount = vehicles.filter(v => v.Operational_Status === 'ACTIVE').length;
  const maintCount = vehicles.filter(v => v.Operational_Status === 'IN_MAINTENANCE').length;
  const stoppedCount = vehicles.filter(v => v.Operational_Status === 'STOPPED' || v.Operational_Status === 'NOT_READY' || v.Operational_Status === 'ACCIDENT').length;
  
  const avgReadiness = totalVehicles > 0 
    ? Math.round(vehicles.reduce((acc, v) => acc + (v.Readiness_Score || 0), 0) / totalVehicles) 
    : 100;

  const lowReadinessCount = vehicles.filter(v => (v.Readiness_Score || 100) < 75).length;

  // Filtered List
  const filteredVehicles = vehicles.filter(v => {
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      String(v.Plate_Number || '').toLowerCase().includes(term) ||
      String(v.Brand || '').toLowerCase().includes(term) ||
      String(v.Model || '').toLowerCase().includes(term) ||
      (v.Assigned_User_Name && String(v.Assigned_User_Name).toLowerCase().includes(term)) ||
      (v.Primary_Driver_Name && String(v.Primary_Driver_Name).toLowerCase().includes(term)) ||
      (v.Owner_Name && String(v.Owner_Name).toLowerCase().includes(term)) ||
      (v.VIN_Chassis_Number && String(v.VIN_Chassis_Number).toLowerCase().includes(term)) ||
      (v.VIN && String(v.VIN).toLowerCase().includes(term)) ||
      (v.Serial_Number && String(v.Serial_Number).toLowerCase().includes(term)) ||
      (v.Assigned_Employee_ID && String(v.Assigned_Employee_ID).toLowerCase().includes(term))
    );

    const matchesStatus = statusFilter === 'ALL' || v.Operational_Status === statusFilter;
    const matchesType = typeFilter === 'ALL' || v.Vehicle_Type === typeFilter;
    
    let matchesReadiness = true;
    if (readinessFilter === 'EXCELLENT') matchesReadiness = (v.Readiness_Score || 0) >= 90;
    else if (readinessFilter === 'ATTENTION') matchesReadiness = (v.Readiness_Score || 0) >= 70 && (v.Readiness_Score || 0) < 90;
    else if (readinessFilter === 'CRITICAL') matchesReadiness = (v.Readiness_Score || 0) < 70;

    return matchesSearch && matchesStatus && matchesType && matchesReadiness;
  });

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    if (!archiveReason.trim()) {
      setArchiveError('يرجى تحديد أو كتابة سبب الأرشفة');
      return;
    }
    setIsArchiving(true);
    setArchiveError('');
    try {
      const res = await fleetService.archiveVehicle(vehicleToDelete.Vehicle_ID, archiveReason.trim(), companyId);
      if (res && res.success) {
        setVehicleToDelete(null);
        setArchiveReason('بيع المركبة أو خروجها من الخدمة');
        queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] });
        queryClient.invalidateQueries({ queryKey: ['fleetKPIs', companyId] });
      } else {
        setArchiveError(res?.message || 'تعذر أرشفة المركبة في الخادم');
      }
    } catch (err: any) {
      setArchiveError(err.message || 'حدث خطأ أثناء أرشفة المركبة');
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRefreshData = () => {
    queryClient.invalidateQueries({ queryKey: ['vehicles', companyId] });
    queryClient.invalidateQueries({ queryKey: ['fleetKPIs', companyId] });
  };

  // If a vehicle detail is open, display the detail view
  if (selectedVehicleId) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <VehicleDetails
          vehicleId={selectedVehicleId}
          onBack={() => setSelectedVehicleId(null)}
          onVehicleUpdated={handleRefreshData}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fadeIn" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              إدارة أسطول الباصات والعمليات
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              متابعة حركة الباصات، الإدخال السريع للوقود والصيانة، أرشفة الفواتير في Google Drive، ومؤشرات الجاهزية
            </p>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {vehicles.length > 0 && user?.role === 'ADMIN' && (
            <button
              onClick={handleOpenClearFleet}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/70 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/80 shadow-2xs flex items-center gap-1.5 transition-colors"
              title="حذف وتفريغ كافة بيانات الباصات الحالية (يتطلب صلاحية مدير النظام)"
            >
              <Trash2 className="w-4 h-4" />
              تفريغ الأسطول
            </button>
          )}

          <button
            onClick={() => setIsImportExportOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            استيراد / تصدير
          </button>
          
          <button
            onClick={() => {
              setQuickEntryVehicleId(null);
              setIsQuickEntryOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Zap className="w-4 h-4" />
            الإدخال السريع للباصات
          </button>

          <button
            onClick={() => {
              setEditingVehicle(null);
              setIsVehicleModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
          >
            <Plus className="w-4 h-4" />
            إضافة باص جديد
          </button>
        </div>
      </div>

      {/* Main Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
        <button
          onClick={() => setActiveMainTab('BUSES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'BUSES'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4" />
          أسطول الباصات ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveMainTab('LOGS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeMainTab === 'LOGS'
              ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          سجل العمليات وفواتير Drive
        </button>
      </div>

      {activeMainTab === 'LOGS' ? (
        <BusServiceLogsList
          companyId={companyId}
          vehicles={vehicles}
          onRefreshNeeded={handleRefreshData}
        />
      ) : (
        <>

      {/* KPI Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Fleet */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold">إجمالي الأسطول</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalVehicles}</span>
            <span className="text-[11px] text-slate-400 font-medium">مركبة</span>
          </div>
        </div>

        {/* Active Vehicles */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold">في الخدمة (نشطة)</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">{activeCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">مركبة</span>
          </div>
        </div>

        {/* In Maintenance */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold">في الصيانة / الورشة</span>
            <Wrench className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-600 font-mono">{maintCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">مركبة</span>
          </div>
        </div>

        {/* Average Readiness */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold">مؤشر الجاهزية العام</span>
            <Gauge className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-black font-mono ${avgReadiness >= 85 ? 'text-teal-600' : 'text-amber-600'}`}>
              {avgReadiness}%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">جاهزية تشغيلية</span>
          </div>
        </div>

        {/* Alerts & Expiries */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold">تنبيهات وتجديدات</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-600 font-mono">{lowReadinessCount}</span>
            <span className="text-[11px] text-slate-400 font-medium">بحاجة متابعة</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باللوحة، الموديل، السائق..."
              className="w-full pr-10 pl-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filters & View Switcher */}
          <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">كافة حالات التشغيل</option>
              <option value="ACTIVE">نشطة في الخدمة</option>
              <option value="IN_MAINTENANCE">في الصيانة</option>
              <option value="STOPPED">متوقفة</option>
              <option value="NOT_READY">غير جاهزة</option>
              <option value="ACCIDENT">حادث</option>
              <option value="RESERVE">احتياط</option>
            </select>

            {/* Vehicle Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">كافة أنواع المركبات</option>
              <option value="SEDAN">سيدان</option>
              <option value="VAN">فان بضائع</option>
              <option value="TRUCK">شاحنة / دينا</option>
              <option value="PICKUP">ونيت</option>
              <option value="SUV">جيب / دفع رباعي</option>
            </select>

            {/* Readiness Filter */}
            <select
              value={readinessFilter}
              onChange={(e) => setReadinessFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="ALL">كافة نسب الجاهزية</option>
              <option value="EXCELLENT">جاهزية ممتازة (90%+)</option>
              <option value="ATTENTION">تتطلب انتباه (70-89%)</option>
              <option value="CRITICAL">جاهزية حرجة (&lt; 70%)</option>
            </select>

            {/* View Switcher Toggle */}
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 shrink-0">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'GRID' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs' : 'text-slate-400'
                }`}
                title="عرض البطاقات"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-1.5 rounded-lg transition-all ${
                  viewMode === 'TABLE' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-2xs' : 'text-slate-400'
                }`}
                title="عرض الجدول"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleRefreshData}
              title="تحديث البيانات"
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content View (Grid or Table) */}
      {vehicles.length === 0 ? (
        <div className="p-10 sm:p-14 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <Truck className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              جاهز لرفع وتسجيل مركبات الأسطول الفعلي
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تم إفراغ كافة البيانات التجريبية بنجاح. يمكنك الآن استيراد قائمة مركبات شركتك دفعة واحدة من ملف Excel / CSV أو إضافة أول مركبة يدوياً.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setIsImportExportOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Upload className="w-4 h-4" />
              استيراد المركبات (Excel / CSV / JSON)
            </button>

            <button
              onClick={() => {
                setEditingVehicle(null);
                setIsVehicleModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              إضافة مركبة جديدة يدوياً
            </button>
          </div>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">لا توجد مركبات مطابقة</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            لم يتم العثور على أي مركبة تطابق معايير البحث والفلترة المحددة.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('ALL');
              setTypeFilter('ALL');
              setReadinessFilter('ALL');
            }}
            className="mt-4 px-4 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredVehicles.map((vehicle, index) => (
            <VehicleCard
              key={`${vehicle.Vehicle_ID}-${index}`}
              vehicle={vehicle}
              linkedEmployee={getLinkedEmployee(vehicle)}
              onViewDetails={(id) => setSelectedVehicleId(id)}
              onEdit={(v) => {
                setEditingVehicle(v);
                setIsVehicleModalOpen(true);
              }}
              onDelete={(v) => setVehicleToDelete(v)}
              onQuickFuel={(id) => setQuickFuelVehicleId(id)}
              onQuickMaint={(id) => setQuickMaintVehicleId(id)}
            />
          ))}
        </div>
      ) : (
        <VehicleTable
          vehicles={filteredVehicles}
          getLinkedEmployee={getLinkedEmployee}
          onViewDetails={(id) => setSelectedVehicleId(id)}
          onEdit={(v) => {
            setEditingVehicle(v);
            setIsVehicleModalOpen(true);
          }}
          onDelete={(v) => setVehicleToDelete(v)}
          onQuickFuel={(id) => setQuickFuelVehicleId(id)}
          onQuickMaint={(id) => setQuickMaintVehicleId(id)}
        />
      )}
      </>
      )}

      {/* Central Modals */}
      {isVehicleModalOpen && (
        <VehicleModal
          isOpen={isVehicleModalOpen}
          onClose={() => {
            setIsVehicleModalOpen(false);
            setEditingVehicle(null);
          }}
          vehicle={editingVehicle}
          onSuccess={handleRefreshData}
        />
      )}

      {isQuickEntryOpen && (
        <BusQuickEntryModal
          isOpen={isQuickEntryOpen}
          onClose={() => {
            setIsQuickEntryOpen(false);
            setQuickEntryVehicleId(null);
          }}
          vehicles={vehicles}
          defaultVehicleId={quickEntryVehicleId || undefined}
          onSuccess={handleRefreshData}
        />
      )}

      {isImportExportOpen && (
        <ImportExportModal
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
          vehicles={vehicles}
          onImportSuccess={handleRefreshData}
        />
      )}

      {/* Quick Fuel Modal */}
      {quickFuelVehicleId && (
        <AddFuelModal
          isOpen={Boolean(quickFuelVehicleId)}
          onClose={() => setQuickFuelVehicleId(null)}
          vehicles={vehicles}
          defaultVehicleId={quickFuelVehicleId}
          onSuccess={() => {
            handleRefreshData();
            setQuickFuelVehicleId(null);
          }}
        />
      )}

      {/* Quick Maintenance Modal */}
      {quickMaintVehicleId && (
        <AddMaintenanceModal
          isOpen={Boolean(quickMaintVehicleId)}
          onClose={() => setQuickMaintVehicleId(null)}
          vehicles={vehicles}
          defaultVehicleId={quickMaintVehicleId}
          onSuccess={() => {
            handleRefreshData();
            setQuickMaintVehicleId(null);
          }}
        />
      )}

      {/* Archive Confirmation Dialog */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleIn">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تأكيد أرشفة المركبة
              </h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                هل أنت متأكد من رغبتك في أرشفة المركبة <strong>({vehicleToDelete.Plate_Number} - {vehicleToDelete.Brand} {vehicleToDelete.Model})</strong>؟ سيتم نقلها لمركز الأرشيف العام مع إمكانية استعادتها لاحقاً والحفاظ على كافة سجلات الوقود والصيانة وتوثيق سبب الأرشفة في سجل التدقيق.
              </p>
            </div>

            {archiveError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold">
                {archiveError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                سبب الأرشفة (إلزامي للتوثيق والتدقيق) *
              </label>
              <select
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-rose-500 mb-2"
              >
                <option value="بيع المركبة أو خروجها من الخدمة">بيع المركبة أو خروجها من الخدمة</option>
                <option value="تالف / حادث غير قابل للإصلاح">تالف / حادث غير قابل للإصلاح</option>
                <option value="انتهاء عقد الإيجار / التشغيل">انتهاء عقد الإيجار / التشغيل</option>
                <option value="استبدال بمركبة أحدث">استبدال بمركبة أحدث</option>
                <option value="خطأ في الإدخال أو سجل مكرر">خطأ في الإدخال أو سجل مكرر</option>
                <option value="سبب آخر">سبب آخر (تحديد يدوي)...</option>
              </select>

              {archiveReason === 'سبب آخر' && (
                <input
                  type="text"
                  placeholder="اكتب سبب الأرشفة بالتفصيل..."
                  onChange={(e) => setArchiveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-rose-300 dark:border-rose-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                />
              )}
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setVehicleToDelete(null);
                  setArchiveError('');
                }}
                disabled={isArchiving}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDeleteVehicle}
                disabled={isArchiving}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isArchiving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                    جاري الأرشفة والتوثيق...
                  </>
                ) : (
                  'تأكيد الأرشفة والترحيل'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Fleet Confirmation Dialog */}
      {isClearAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs" dir="rtl">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 animate-scaleUp">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                تفريغ وحذف كافة المركبات الحالية
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                هل أنت متأكد من رغبتك في حذف وتفريغ كافة بيانات المركبات وسجلاتها من النظام للبدء برفع مركباتك الفعلية؟
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                onClick={() => setIsClearAllModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleClearAllVehicles}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                تأكيد تفريغ البيانات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
