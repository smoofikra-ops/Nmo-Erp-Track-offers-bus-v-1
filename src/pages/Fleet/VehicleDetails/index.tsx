import React, { useState, useEffect } from 'react';
import { Vehicle, FuelLog, MaintenanceLog, InsuranceLog, ComplianceLog, AccidentLog, VehicleDocument } from '@/types/fleet';
import { Employee } from '@/types/models';
import { fleetService } from '@/services/fleetService';
import { employeeService } from '@/services/employeeService';
import { ReadinessGauge } from '../components/ReadinessGauge';
import { AddFuelModal } from '../components/AddFuelModal';
import { AddMaintenanceModal } from '../components/AddMaintenanceModal';
import { AddInsuranceModal } from '../components/AddInsuranceModal';
import { AddComplianceModal } from '../components/AddComplianceModal';
import { AddAccidentModal } from '../components/AddAccidentModal';
import { AddDocumentModal } from '../components/AddDocumentModal';
import { VehicleModal } from '../components/VehicleModal';
import { 
  Truck, Car, Gauge, Fuel, Wrench, Shield, FileCheck, 
  AlertOctagon, FileText, ArrowRight, Plus, Calendar, 
  DollarSign, User, AlertTriangle, CheckCircle, Clock, 
  ExternalLink, Edit, Trash2, ChevronRight, Activity, 
  Download, FileSpreadsheet, UserCheck, Hash, Scale, Info, Link as LinkIcon
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';

interface VehicleDetailsProps {
  vehicleId: string;
  onBack: () => void;
  onVehicleUpdated?: () => void;
}

export function VehicleDetails({ vehicleId, onBack, onVehicleUpdated }: VehicleDetailsProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [linkedEmployee, setLinkedEmployee] = useState<Employee | null>(null);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [maintLogs, setMaintLogs] = useState<MaintenanceLog[]>([]);
  const [insuranceLogs, setInsuranceLogs] = useState<InsuranceLog[]>([]);
  const [complianceLogs, setComplianceLogs] = useState<ComplianceLog[]>([]);
  const [accidentLogs, setAccidentLogs] = useState<AccidentLog[]>([]);
  const [documents, setDocuments] = useState<VehicleDocument[]>([]);
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FUEL' | 'MAINTENANCE' | 'INSURANCE' | 'COMPLIANCE' | 'ACCIDENTS' | 'DOCUMENTS'>('OVERVIEW');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isMaintModalOpen, setIsMaintModalOpen] = useState(false);
  const [isInsuranceModalOpen, setIsInsuranceModalOpen] = useState(false);
  const [isComplianceModalOpen, setIsComplianceModalOpen] = useState(false);
  const [isAccidentModalOpen, setIsAccidentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  useEffect(() => {
    loadVehicleData();
  }, [vehicleId]);

  const loadVehicleData = async () => {
    setIsLoading(true);
    try {
      const vRes = await fleetService.getVehicleById(vehicleId);
      if (vRes.success && vRes.data) {
        setVehicle(vRes.data);

        // Load linked employee
        const empId = vRes.data.Assigned_Employee_ID || vRes.data.Primary_Driver_ID;
        if (empId) {
          try {
            const allEmps = await employeeService.getEmployees(vRes.data.CompanyID || 'COM-0001');
            if (allEmps.success && allEmps.data) {
              const matched = allEmps.data.find(e => 
                e.EmployeeID === empId || e.EmployeeCode === empId
              );
              setLinkedEmployee(matched || null);
            }
          } catch (e) {
            console.error('Failed to load linked employee', e);
          }
        } else {
          setLinkedEmployee(null);
        }
      }

      // Use Promise.allSettled to ensure that failure in one log type does not block others
      const results = await Promise.allSettled([
        fleetService.getFuelLogs(vehicleId),
        fleetService.getMaintenanceLogs(vehicleId),
        fleetService.getInsuranceLogs(vehicleId),
        fleetService.getComplianceLogs(vehicleId),
        fleetService.getAccidentLogs(vehicleId),
        fleetService.getDocuments(vehicleId),
      ]);

      const [fRes, mRes, iRes, cRes, aRes, dRes] = results.map(r => 
        r.status === 'fulfilled' ? r.value : { success: false, data: [] }
      );

      if (fRes.success && fRes.data) setFuelLogs(fRes.data);
      if (mRes.success && mRes.data) setMaintLogs(mRes.data);
      if (iRes.success && iRes.data) setInsuranceLogs(iRes.data);
      if (cRes.success && cRes.data) setComplianceLogs(cRes.data);
      if (aRes.success && aRes.data) setAccidentLogs(aRes.data);
      if (dRes.success && dRes.data) setDocuments(dRes.data);
    } catch (err) {
      console.error('Error loading vehicle details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !vehicle) {
    return (
      <div className="p-8 text-center" dir="rtl">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-r-transparent mb-3" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">جاري تحميل ملف المركبة...</p>
      </div>
    );
  }

  // Cost Aggregations
  const totalFuelCost = fuelLogs.reduce((acc, l) => acc + (l.Cost || 0), 0);
  const totalFuelLiters = fuelLogs.reduce((acc, l) => acc + (l.Liters || 0), 0);
  const totalMaintCost = maintLogs.reduce((acc, l) => acc + (l.Cost || 0), 0);
  const totalAccidentCost = accidentLogs.reduce((acc, l) => acc + (l.Cost || 0), 0);
  const totalOverallCost = totalFuelCost + totalMaintCost + totalAccidentCost;

  // Monthly Cost Chart Data
  const monthlyCostData = [
    { month: 'أكتوبر', fuel: 850, maint: 300, accident: 0 },
    { month: 'نوفمبر', fuel: 920, maint: 450, accident: 0 },
    { month: 'ديسمبر', fuel: 880, maint: 0, accident: 0 },
    { month: 'يناير', fuel: 960, maint: 650, accident: 0 },
    { month: 'فبراير', fuel: 740, maint: 200, accident: 0 },
    { month: 'مارس', fuel: totalFuelCost > 0 ? totalFuelCost : 680, maint: totalMaintCost > 0 ? totalMaintCost : 350, accident: totalAccidentCost },
  ];

  // Latest records for quick glance
  const latestInsurance = insuranceLogs[0];
  const latestCompliance = complianceLogs[0];

  const handleStatusChange = async (newStatus: Vehicle['Operational_Status']) => {
    const res = await fleetService.updateVehicle(vehicle.Vehicle_ID, { Operational_Status: newStatus });
    if (res.success && res.data) {
      setVehicle(res.data);
      onVehicleUpdated?.();
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn" dir="rtl">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <button onClick={onBack} className="hover:text-indigo-600 flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            العودة إلى قائمة الأسطول
          </button>
          <ChevronRight className="w-3.5 h-3.5 rotate-180 text-slate-400" />
          <span className="text-slate-900 dark:text-white font-bold">{vehicle.Brand} {vehicle.Model} ({vehicle.Plate_Number})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 flex items-center gap-1.5 shadow-2xs"
          >
            <Edit className="w-3.5 h-3.5 text-blue-500" />
            تعديل المركبة
          </button>
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5"
          >
            <Fuel className="w-3.5 h-3.5" />
            تعبئة وقود
          </button>
          <button
            onClick={() => setIsMaintModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5"
          >
            <Wrench className="w-3.5 h-3.5" />
            طلب صيانة
          </button>
        </div>
      </div>

      {/* Hero Header Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Vehicle Visual & Main Info */}
          <div className="flex items-start gap-4">
            {/* Saudi Plate Graphic */}
            <div className="inline-flex items-stretch border-3 border-slate-900 dark:border-slate-200 rounded-2xl overflow-hidden shadow-md bg-white dark:bg-slate-800 shrink-0">
              <div className="bg-emerald-600 px-3 py-2 flex flex-col items-center justify-center text-white">
                <span className="text-[11px] font-black tracking-widest">KSA</span>
                <span className="text-[9px] font-bold">السعودية</span>
              </div>
              <div className="px-4 py-2 flex flex-col items-center justify-center">
                <span className="text-xl font-mono font-black text-slate-900 dark:text-white tracking-widest">
                  {vehicle.Plate_Number}
                </span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">{vehicle.Vehicle_Type}</span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                  {vehicle.Brand} {vehicle.Model}
                </h1>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  موديل {vehicle.Year}
                </span>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                  اللون: {vehicle.Color}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                <span>رقم الهيكل (VIN): <strong className="text-slate-700 dark:text-slate-300 font-mono">{vehicle.VIN || 'غير مسجل'}</strong></span>
                <span>نوع الملكية: <strong className="text-slate-700 dark:text-slate-300">{vehicle.Ownership_Type === 'OWNED' ? 'ملك الشركة' : 'إيجار / تشغيل'}</strong></span>
                <span>نوع الوقود: <strong className="text-slate-700 dark:text-slate-300">{vehicle.Fuel_Type}</strong></span>
              </div>
            </div>
          </div>

          {/* Operational Status Selector & Readiness Gauge */}
          <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-slate-100 dark:border-slate-800">
            {/* Status Dropdown */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 mb-1">حالة التشغيل</label>
              <select
                value={vehicle.Operational_Status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white shadow-2xs cursor-pointer focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ACTIVE">نشطة في الخدمة</option>
                <option value="IN_MAINTENANCE">في الصيانة</option>
                <option value="STOPPED">متوقفة</option>
                <option value="NOT_READY">غير جاهزة</option>
                <option value="ACCIDENT">حادث</option>
                <option value="RESERVE">احتياط</option>
                <option value="SOLD">مباعة</option>
              </select>
            </div>

            {/* Readiness Circular Meter */}
            <div className="text-center">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">مؤشر الجاهزية</label>
              <ReadinessGauge score={vehicle.Readiness_Score ?? 100} size="md" showLabel={true} reasons={vehicle.Readiness_Reasons} />
            </div>
          </div>
        </div>

        {/* Ownership & Driver / Employee Card Row */}
        <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* User & Employee Section */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">مستخدم المركبة الحالي</span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {vehicle.Assigned_User_Name || vehicle.Primary_Driver_Name || 'غير محدد'}
                    </h4>
                    {vehicle.User_ID_Number && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        هوية المستخدم: {vehicle.User_ID_Number}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  تعديل الربط
                </button>
              </div>

              {/* Linked Employee Information */}
              {linkedEmployee ? (
                <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <div className="font-bold text-emerald-900 dark:text-emerald-300">
                        {linkedEmployee.ArabicName || linkedEmployee.EnglishName}
                      </div>
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                        كود: <span className="font-mono">{linkedEmployee.EmployeeCode || linkedEmployee.EmployeeID}</span> • المسمى: {linkedEmployee.Role || 'موظف'} • الجوال: <span className="font-mono">{linkedEmployee.Mobile || 'غير مسجل'}</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold shrink-0">
                    مرتبط بقسم الموظفين
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>المستخدم غير مرتبط بموظف في النظام</span>
                  </div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow-2xs shrink-0 flex items-center gap-1"
                  >
                    <LinkIcon className="w-3 h-3" />
                    ربط بموظف
                  </button>
                </div>
              )}
            </div>

            {/* Ownership & Specifications Summary */}
            <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40 pb-2">
                <span className="text-slate-500 font-medium">مالك المركبة:</span>
                <strong className="text-slate-900 dark:text-white">{vehicle.Owner_Name || 'شركة المقاولات الحديثة'}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40 pb-2">
                <span className="text-slate-500 font-medium">هوية المالك:</span>
                <strong className="text-slate-900 dark:text-white font-mono">{vehicle.Owner_ID_Number || '7001234567'}</strong>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700/40 pb-2">
                <span className="text-slate-500 font-medium">نوع التسجيل والحمولة:</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">
                  {vehicle.Registration_Type || 'خصوصي'} {vehicle.Load_Capacity ? `• حمولة ${vehicle.Load_Capacity} كجم` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">الرقم التسلسلي للاستمارة:</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">
                  {vehicle.Serial_Number || vehicle.Registration_Number || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-1">
        {[
          { id: 'OVERVIEW', label: 'الملخص والجاهزية', icon: Activity },
          { id: 'FUEL', label: `سجل الوقود (${fuelLogs.length})`, icon: Fuel },
          { id: 'MAINTENANCE', label: `سجل الصيانة (${maintLogs.length})`, icon: Wrench },
          { id: 'INSURANCE', label: `وثائق التأمين (${insuranceLogs.length})`, icon: Shield },
          { id: 'COMPLIANCE', label: `الفحص والاستمارة (${complianceLogs.length})`, icon: FileCheck },
          { id: 'ACCIDENTS', label: `الحوادث والمطالبات (${accidentLogs.length})`, icon: AlertOctagon },
          { id: 'DOCUMENTS', label: `المستندات (${documents.length})`, icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition-all ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/20'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Quick Metrics 4 Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">العداد الحالي</span>
                <Gauge className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {vehicle.Current_Odometer?.toLocaleString('en-US') || 0}
                <span className="text-xs font-medium text-slate-400 mr-1.5">كم</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">آخر تحديث قبل يومين</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">إجمالي المصروفات التراكمية</span>
                <DollarSign className="w-4 h-4 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {totalOverallCost.toLocaleString('en-US')}
                <span className="text-xs font-medium text-slate-400 mr-1.5">ر.س</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">وقود + صيانة + حوادث</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">معدل استهلاك الوقود</span>
                <Fuel className="w-4 h-4 text-indigo-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {vehicle.Avg_km_per_L || 10.5}
                <span className="text-xs font-medium text-slate-400 mr-1.5">كم / لتر</span>
              </h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">ضمن المعدل القياسي الممتاز</p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold">الصيانة القادمة</span>
                <Wrench className="w-4 h-4 text-blue-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                {vehicle.Next_Scheduled_Odometer ? `${vehicle.Next_Scheduled_Odometer.toLocaleString('en-US')} كم` : '55,000 كم'}
              </h3>
              <p className="text-[11px] text-blue-600 font-semibold mt-1">متبقي 2,450 كم (صيانة 50 ألف)</p>
            </div>
          </div>

          {/* Vehicle Master Detailed Specifications Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  المواصفات الفنية وبطاقة المركبة (Vehicle Master Data)
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Edit className="w-3.5 h-3.5" />
                تعديل البيانات
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">الماركة والطراز:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{vehicle.Brand} {vehicle.Model}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">سنة الصنع:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{vehicle.Manufacturing_Year || vehicle.Year}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">اللون:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{vehicle.Color || 'أبيض'}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">نوع التسجيل:</span>
                <strong className="text-slate-900 dark:text-white font-bold">{vehicle.Registration_Type || 'خصوصي'}</strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">الحمولة المصرحة:</span>
                <strong className="text-slate-900 dark:text-white font-bold font-mono">
                  {vehicle.Load_Capacity ? `${vehicle.Load_Capacity.toLocaleString('en-US')} كجم` : 'غير محدد'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">الوزن الإجمالي:</span>
                <strong className="text-slate-900 dark:text-white font-bold font-mono">
                  {vehicle.Vehicle_Weight ? `${vehicle.Vehicle_Weight.toLocaleString('en-US')} كجم` : 'غير محدد'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">رقم الهيكل (VIN):</span>
                <strong className="text-slate-900 dark:text-white font-bold font-mono text-[11px]">
                  {vehicle.VIN_Chassis_Number || vehicle.VIN || 'غير مسجل'}
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block text-[11px] mb-1">الرقم التسلسلي:</span>
                <strong className="text-slate-900 dark:text-white font-bold font-mono">
                  {vehicle.Serial_Number || vehicle.Registration_Number || 'غير مسجل'}
                </strong>
              </div>
            </div>
          </div>

          {/* Expiration Alerts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Insurance Status Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  وثيقة التأمين
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {latestInsurance?.Insurance_Company || 'تأمين ساري'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  تنتهي في: <strong className="font-mono">{vehicle.Insurance_Expiry || latestInsurance?.End_Date || 'غير مسجل'}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsInsuranceModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-2xs"
              >
                تجديد
              </button>
            </div>

            {/* Periodic Inspection Status Card */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  الفحص الدوري
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {vehicle.Periodic_Inspection_Expiry || latestCompliance?.Inspection_Expiry ? 'مسجل ومحدد التاريخ' : 'بحاجة فحص'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  ينتهي في: <strong className="font-mono">{vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry || latestCompliance?.Inspection_Expiry || 'غير مسجل'}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsComplianceModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow-2xs"
              >
                تحديث
              </button>
            </div>

            {/* License Registration Card */}
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5" />
                  رخصة السير (الاستمارة)
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white">
                  {vehicle.Registration_Type || 'خصوصي'}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  تنتهي في: <strong className="font-mono">{vehicle.Registration_Expiry || vehicle.License_Expiry || latestCompliance?.License_Expiry || 'غير مسجل'}</strong>
                </p>
              </div>
              <button
                onClick={() => setIsComplianceModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-2xs"
              >
                تجديد
              </button>
            </div>
          </div>

          {/* 6-Month Cost Trend Chart */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  توزيع تكاليف المركبة الشهرية (آخر 6 أشهر)
                </h3>
                <p className="text-xs text-slate-400">مقارنة تكاليف الوقود، الصيانة، والإصلاحات بالريال السعودي</p>
              </div>
            </div>

            <div className="h-64 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyCostData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(val: any) => [`${val} ر.س`]}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="fuel" name="الوقود" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maint" name="الصيانة" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="accident" name="الحوادث" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: FUEL LOG */}
      {activeTab === 'FUEL' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs">
              <span>إجمالي اللترات: <strong className="font-bold text-amber-600 font-mono">{totalFuelLiters} لتر</strong></span>
              <span>إجمالي تكلفة الوقود: <strong className="font-bold text-slate-900 dark:text-white font-mono">{totalFuelCost.toLocaleString('en-US')} ر.س</strong></span>
            </div>
            <button
              onClick={() => setIsFuelModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              تسجيل تعبئة جديدة
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">قراءة العداد</th>
                  <th className="py-3 px-4">المسافة (كم)</th>
                  <th className="py-3 px-4">الكمية (لتر)</th>
                  <th className="py-3 px-4">السعر/لتر</th>
                  <th className="py-3 px-4">المبلغ الإجمالي</th>
                  <th className="py-3 px-4">معدل الاستهلاك</th>
                  <th className="py-3 px-4">المحطة وطريقة الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fuelLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      لا توجد سجلات وقود مسجلة لهذه المركبة بعد.
                    </td>
                  </tr>
                ) : (
                  fuelLogs.map((log, idx) => (
                    <tr key={log.Fuel_ID || log.Log_ID || `fuel-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-medium">{log.Date}</td>
                      <td className="py-3 px-4 font-mono font-bold">{log.Odometer?.toLocaleString('en-US')} كم</td>
                      <td className="py-3 px-4 font-mono text-indigo-600 font-semibold">{log.Km_Since_Last_Fuel ? `${log.Km_Since_Last_Fuel} كم` : '-'}</td>
                      <td className="py-3 px-4 font-mono">{log.Liters} لتر</td>
                      <td className="py-3 px-4 font-mono">{log.Price_Per_Liter} ر.س</td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-600">{log.Cost} ر.س</td>
                      <td className="py-3 px-4">
                        {log.Actual_km_per_L ? (
                          <span className={`px-2 py-0.5 rounded-md font-bold font-mono text-[11px] ${
                            log.Is_Anomaly ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            {log.Actual_km_per_L} كم/لتر
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        {log.Station || 'محطة عامة'} ({log.Payment_Method})
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: MAINTENANCE LOG */}
      {activeTab === 'MAINTENANCE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span>إجمالي تكلفة الصيانة: <strong className="font-bold text-blue-600 font-mono">{totalMaintCost.toLocaleString('en-US')} ر.س</strong></span>
            </div>
            <button
              onClick={() => setIsMaintModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              تسجيل أمر صيانة جديد
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">التاريخ</th>
                  <th className="py-3 px-4">نوع الصيانة</th>
                  <th className="py-3 px-4">قراءة العداد</th>
                  <th className="py-3 px-4">الورشة / المركز</th>
                  <th className="py-3 px-4">التكلفة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">الصيانة القادمة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {maintLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      لا توجد أوامر صيانة مسجلة لهذه المركبة.
                    </td>
                  </tr>
                ) : (
                  maintLogs.map((log, idx) => (
                    <tr key={log.Maintenance_ID || log.Log_ID || `maint-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-4 font-mono font-medium">{log.Date}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{log.Maintenance_Type}</td>
                      <td className="py-3 px-4 font-mono">{log.Odometer?.toLocaleString('en-US')} كم</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.Workshop || 'ورشة معتمدة'}</td>
                      <td className="py-3 px-4 font-mono font-bold text-blue-600">{log.Cost?.toLocaleString('en-US')} ر.س</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          log.Status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {log.Status === 'COMPLETED' ? 'مكتملة' : 'قيد التنفيذ'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {log.Next_Maintenance_Odometer ? `${log.Next_Maintenance_Odometer.toLocaleString('en-US')} كم` : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: INSURANCE */}
      {activeTab === 'INSURANCE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">تاريخ وثائق التأمين وتغطيات الحوادث</span>
            <button
              onClick={() => setIsInsuranceModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              إضافة وثيقة تأمين
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insuranceLogs.map((log, idx) => (
              <div key={log.Policy_ID || log.Log_ID || `ins-${idx}`} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold">
                      {log.Insurance_Type === 'COMPREHENSIVE' ? 'تأمين شامل' : 'ضد الغير'}
                    </span>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{log.Insurance_Company}</h4>
                    <p className="text-xs text-slate-500 font-mono">رقم الوثيقة: {log.Policy_Number}</p>
                  </div>
                  <Shield className="w-6 h-6 text-emerald-600" />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[11px]">تاريخ السريان:</span>
                    <strong className="font-mono">{log.Start_Date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">تاريخ الانتهاء:</span>
                    <strong className="font-mono text-rose-600">{log.End_Date}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">قسط التأمين السنوي:</span>
                    <strong className="font-mono">{log.Premium_Cost} ر.س</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">مبلغ التحمل:</span>
                    <strong className="font-mono">{log.Deductible} ر.س</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: COMPLIANCE & LICENSING */}
      {activeTab === 'COMPLIANCE' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">سجل الفحص الدوري وتجديد رخص السير</span>
            <button
              onClick={() => setIsComplianceModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              تسجيل فحص / ترخيص جديد
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <tr>
                  <th className="py-3 px-4">تاريخ الفحص</th>
                  <th className="py-3 px-4">انتهاء الفحص</th>
                  <th className="py-3 px-4">نتيجة الفحص</th>
                  <th className="py-3 px-4">رقم الاستمارة</th>
                  <th className="py-3 px-4">انتهاء الاستمارة</th>
                  <th className="py-3 px-4">الرسوم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {complianceLogs.map((log, idx) => (
                  <tr key={log.Record_ID || log.Log_ID || `comp-${idx}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-4 font-mono">{log.Inspection_Date}</td>
                    <td className="py-3 px-4 font-mono font-bold text-purple-600">{log.Inspection_Expiry}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        {log.Inspection_Result === 'PASSED' ? 'ناجح' : 'مشروط'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">{log.Registration_Number || '-'}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600">{log.License_Expiry}</td>
                    <td className="py-3 px-4 font-mono">{log.Cost || 0} ر.س</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: ACCIDENTS */}
      {activeTab === 'ACCIDENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">تقارير الحوادث ونسب المسؤولية والمطالبات</span>
            <button
              onClick={() => setIsAccidentModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              تسجيل تقرير حادث
            </button>
          </div>

          <div className="space-y-3">
            {accidentLogs.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">سجل المركبة خالٍ من الحوادث</p>
                <p className="text-xs text-slate-500 mt-0.5">لم يتم تسجيل أي حوادث لهذه المركبة حتى الآن.</p>
              </div>
            ) : (
              accidentLogs.map((log, idx) => (
                <div key={log.Accident_ID || log.Log_ID || `acc-${idx}`} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold text-[10px]">
                          حادث {log.Severity}
                        </span>
                        <span className="text-xs font-bold text-slate-500 font-mono">{log.Date} ({log.Time})</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{log.Description}</h4>
                      <p className="text-xs text-slate-500">الموقع: {log.Location || 'غير محدد'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      {log.Status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[11px]">تقرير نجم:</span>
                      <strong className="font-mono">{log.Police_Report_No || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">رقم المطالبة:</span>
                      <strong className="font-mono">{log.Insurance_Claim_No || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">نسبة المسؤولية:</span>
                      <strong className="font-mono text-rose-600">{log.Responsibility_Percentage}%</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">تكلفة الإصلاح:</span>
                      <strong className="font-mono font-bold text-slate-900 dark:text-white">{log.Cost} ر.س</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 7: DOCUMENTS */}
      {activeTab === 'DOCUMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">المستندات الرقمية وصور المركبة</span>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md shadow-teal-600/20 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              رفع مستند جديد
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {documents.map((doc, idx) => (
              <div key={doc.Document_ID || doc.Doc_ID || `doc-${idx}`} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{doc.File_Name}</h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">{doc.Document_Type}</span>
                    {doc.Expiry_Date && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-1">
                        انتهاء: {doc.Expiry_Date}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <a
                    href={doc.File_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="text-teal-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    معاينة المستند
                  </a>
                  <span className="text-[10px] text-slate-400">{doc.Created_At?.split('T')[0]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Embedded Modals */}
      {isEditModalOpen && (
        <VehicleModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          vehicle={vehicle}
          onSuccess={(updated) => {
            setVehicle(updated);
            onVehicleUpdated?.();
          }}
        />
      )}

      {isFuelModalOpen && (
        <AddFuelModal
          isOpen={isFuelModalOpen}
          onClose={() => setIsFuelModalOpen(false)}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.Vehicle_ID}
          onSuccess={() => {
            loadVehicleData();
            onVehicleUpdated?.();
          }}
        />
      )}

      {isMaintModalOpen && (
        <AddMaintenanceModal
          isOpen={isMaintModalOpen}
          onClose={() => setIsMaintModalOpen(false)}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.Vehicle_ID}
          onSuccess={() => {
            loadVehicleData();
            onVehicleUpdated?.();
          }}
        />
      )}

      {isInsuranceModalOpen && (
        <AddInsuranceModal
          isOpen={isInsuranceModalOpen}
          onClose={() => setIsInsuranceModalOpen(false)}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.Vehicle_ID}
          onSuccess={() => {
            loadVehicleData();
            onVehicleUpdated?.();
          }}
        />
      )}

      {isComplianceModalOpen && (
        <AddComplianceModal
          isOpen={isComplianceModalOpen}
          onClose={() => setIsComplianceModalOpen(false)}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.Vehicle_ID}
          onSuccess={() => {
            loadVehicleData();
            onVehicleUpdated?.();
          }}
        />
      )}

      {isAccidentModalOpen && (
        <AddAccidentModal
          isOpen={isAccidentModalOpen}
          onClose={() => setIsAccidentModalOpen(false)}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.Vehicle_ID}
          onSuccess={() => {
            loadVehicleData();
            onVehicleUpdated?.();
          }}
        />
      )}

      {isDocModalOpen && (
        <AddDocumentModal
          isOpen={isDocModalOpen}
          onClose={() => setIsDocModalOpen(false)}
          vehicles={[vehicle]}
          defaultVehicleId={vehicle.Vehicle_ID}
          onSuccess={() => {
            loadVehicleData();
          }}
        />
      )}
    </div>
  );
}
