import React, { useState, useEffect } from 'react';
import { Vehicle, OperationalStatus } from '@/types/fleet';
import { Employee } from '@/types/models';
import { employeeService } from '@/services/employeeService';
import { fleetService } from '@/services/fleetService';
import { 
  Truck, Car, UserCheck, ShieldAlert, X, Sparkles, 
  Calendar, Hash, Scale, User, Shield, FileCheck, Info
} from 'lucide-react';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null; // if provided -> edit mode
  companyId?: string;
  onSuccess: (vehicle: Vehicle) => void;
}

export function VehicleModal({ isOpen, onClose, vehicle, companyId = 'COM-0001', onSuccess }: VehicleModalProps) {
  const isEdit = Boolean(vehicle);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // 1. Ownership & Usage (بيانات الملكية والاستخدام)
  const [ownerName, setOwnerName] = useState(vehicle?.Owner_Name || 'شركة المقاولات الحديثة');
  const [ownerIdNumber, setOwnerIdNumber] = useState(vehicle?.Owner_ID_Number || '7001234567');
  const [assignedUserName, setAssignedUserName] = useState(vehicle?.Assigned_User_Name || vehicle?.Primary_Driver_Name || '');
  const [userIdNumber, setUserIdNumber] = useState(vehicle?.User_ID_Number || '');
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(vehicle?.Assigned_Employee_ID || vehicle?.Primary_Driver_ID || '');

  // 2. Vehicle Identification (بيانات تعريف المركبة)
  const [vinChassisNumber, setVinChassisNumber] = useState(vehicle?.VIN_Chassis_Number || vehicle?.VIN || '');
  const [serialNumber, setSerialNumber] = useState(vehicle?.Serial_Number || vehicle?.Registration_Number || '');
  const [plateNumber, setPlateNumber] = useState(vehicle?.Plate_Number || '');

  // 3. Vehicle Specifications (مواصفات المركبة)
  const [brand, setBrand] = useState(vehicle?.Brand || 'تويوتا');
  const [model, setModel] = useState(vehicle?.Model || '');
  const [manufacturingYear, setManufacturingYear] = useState<number>(vehicle?.Manufacturing_Year || vehicle?.Year || new Date().getFullYear());
  const [color, setColor] = useState(vehicle?.Color || 'أبيض');
  const [registrationType, setRegistrationType] = useState(vehicle?.Registration_Type || 'خصوصي');
  const [loadCapacity, setLoadCapacity] = useState<number | ''>(vehicle?.Load_Capacity ?? '');
  const [vehicleWeight, setVehicleWeight] = useState<number | ''>(vehicle?.Vehicle_Weight ?? '');

  // 4. Document Expiries (تواريخ الوثائق)
  const [registrationExpiry, setRegistrationExpiry] = useState(vehicle?.Registration_Expiry || vehicle?.License_Expiry || '');
  const [insuranceExpiry, setInsuranceExpiry] = useState(vehicle?.Insurance_Expiry || '');
  const [periodicInspectionExpiry, setPeriodicInspectionExpiry] = useState(vehicle?.Periodic_Inspection_Expiry || vehicle?.Inspection_Expiry || '');

  // 5. Operational Status (البيانات التشغيلية)
  const [status, setStatus] = useState<OperationalStatus>(vehicle?.Operational_Status || 'ACTIVE');
  const [currentOdometer, setCurrentOdometer] = useState<number | ''>(vehicle?.Current_Odometer ?? 0);
  const [notes, setNotes] = useState(vehicle?.Notes || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      if (vehicle) {
        setOwnerName(vehicle.Owner_Name || 'شركة المقاولات الحديثة');
        setOwnerIdNumber(vehicle.Owner_ID_Number || '7001234567');
        setAssignedUserName(vehicle.Assigned_User_Name || vehicle.Primary_Driver_Name || '');
        setUserIdNumber(vehicle.User_ID_Number || '');
        setAssignedEmployeeId(vehicle.Assigned_Employee_ID || vehicle.Primary_Driver_ID || '');

        setVinChassisNumber(vehicle.VIN_Chassis_Number || vehicle.VIN || '');
        setSerialNumber(vehicle.Serial_Number || vehicle.Registration_Number || '');
        setPlateNumber(vehicle.Plate_Number || '');

        setBrand(vehicle.Brand || '');
        setModel(vehicle.Model || '');
        setManufacturingYear(vehicle.Manufacturing_Year || vehicle.Year || new Date().getFullYear());
        setColor(vehicle.Color || 'أبيض');
        setRegistrationType(vehicle.Registration_Type || 'خصوصي');
        setLoadCapacity(vehicle.Load_Capacity ?? '');
        setVehicleWeight(vehicle.Vehicle_Weight ?? '');

        setRegistrationExpiry(vehicle.Registration_Expiry || vehicle.License_Expiry || '');
        setInsuranceExpiry(vehicle.Insurance_Expiry || '');
        setPeriodicInspectionExpiry(vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry || '');

        setStatus(vehicle.Operational_Status || 'ACTIVE');
        setCurrentOdometer(vehicle.Current_Odometer ?? 0);
        setNotes(vehicle.Notes || '');
      } else {
        setOwnerName('شركة المقاولات الحديثة');
        setOwnerIdNumber('7001234567');
        setAssignedUserName('');
        setUserIdNumber('');
        setAssignedEmployeeId('');

        setVinChassisNumber('');
        setSerialNumber('');
        setPlateNumber('');

        setBrand('تويوتا');
        setModel('');
        setManufacturingYear(new Date().getFullYear());
        setColor('أبيض');
        setRegistrationType('خصوصي');
        setLoadCapacity('');
        setVehicleWeight('');

        setRegistrationExpiry('');
        setInsuranceExpiry('');
        setPeriodicInspectionExpiry('');

        setStatus('ACTIVE');
        setCurrentOdometer(0);
        setNotes('');
      }
      setErrorMsg('');
    }
  }, [isOpen, vehicle]);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const res = await employeeService.getEmployees(companyId);
      if (res.success && res.data) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to load employees for fleet:', err);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleEmployeeSelect = (empId: string) => {
    setAssignedEmployeeId(empId);
    if (!empId) {
      return;
    }
    const matched = employees.find(e => e.EmployeeID === empId || e.EmployeeCode === empId);
    if (matched) {
      if (!assignedUserName || assignedUserName === '') {
        setAssignedUserName(matched.ArabicName || matched.EnglishName || '');
      }
      if (matched.NationalID && (!userIdNumber || userIdNumber === '')) {
        setUserIdNumber(matched.NationalID);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) {
      setErrorMsg('يرجى إدخال رقم اللوحة');
      return;
    }
    if (!brand.trim() || !model.trim()) {
      setErrorMsg('يرجى إدخال الماركة والطراز');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const matchedEmp = employees.find(e => e.EmployeeID === assignedEmployeeId || e.EmployeeCode === assignedEmployeeId);
      const empName = matchedEmp ? (matchedEmp.ArabicName || matchedEmp.EnglishName) : assignedUserName;

      const payload: Partial<Vehicle> = {
        // Ownership & Usage
        Owner_Name: ownerName.trim(),
        Owner_ID_Number: ownerIdNumber.trim(),
        Assigned_User_Name: assignedUserName.trim() || empName,
        User_ID_Number: userIdNumber.trim() || matchedEmp?.NationalID || '',
        Assigned_Employee_ID: assignedEmployeeId || undefined,

        // Identification & Specs
        VIN_Chassis_Number: vinChassisNumber.trim(),
        VIN: vinChassisNumber.trim(),
        Serial_Number: serialNumber.trim(),
        Plate_Number: plateNumber.trim(),
        Brand: brand.trim(),
        Model: model.trim(),
        Manufacturing_Year: Number(manufacturingYear) || new Date().getFullYear(),
        Year: Number(manufacturingYear) || new Date().getFullYear(),
        Color: color.trim(),
        Registration_Type: registrationType.trim(),
        Load_Capacity: typeof loadCapacity === 'number' ? loadCapacity : 0,
        Vehicle_Weight: typeof vehicleWeight === 'number' ? vehicleWeight : 0,

        // Expiries
        Registration_Expiry: registrationExpiry || undefined,
        License_Expiry: registrationExpiry || undefined,
        Insurance_Expiry: insuranceExpiry || undefined,
        Periodic_Inspection_Expiry: periodicInspectionExpiry || undefined,
        Inspection_Expiry: periodicInspectionExpiry || undefined,

        // Operational Status
        Operational_Status: status,
        Current_Odometer: typeof currentOdometer === 'number' ? currentOdometer : 0,
        Notes: notes.trim(),

        // Primary Driver synced for compatibility
        Primary_Driver_ID: assignedEmployeeId || undefined,
        Primary_Driver_Name: assignedUserName.trim() || empName,
      };

      let res;
      if (isEdit && vehicle) {
        res = await fleetService.updateVehicle(vehicle.Vehicle_ID, payload, companyId);
      } else {
        res = await fleetService.createVehicle(payload, companyId);
      }

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setErrorMsg(res.message || 'حدث خطأ أثناء حفظ المركبة');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل الاتصال بالنظام');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedEmployee = employees.find(e => e.EmployeeID === assignedEmployeeId || e.EmployeeCode === assignedEmployeeId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEdit ? `تعديل سجل المركبة (${vehicle?.Plate_Number})` : 'إضافة مركبة جديدة إلى Vehicle Master'}
              </h3>
              <p className="text-xs text-slate-500">
                تسجيل بيانات المركبة الفعلية، مواصفات الهيكل، وتوثيق الربط بقسم الموظفين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* SECTION 1: بيانات الملكية والاستخدام */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  1. بيانات الملكية والاستخدام
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    المالك (Owner_Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="اسم مالك المركبة أو المؤسسة"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    هوية المالك (Owner_ID_Number)
                  </label>
                  <input
                    type="text"
                    value={ownerIdNumber}
                    onChange={(e) => setOwnerIdNumber(e.target.value)}
                    placeholder="رقم الهوية الوطنية / السجل التجاري"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    المستخدم (Assigned_User_Name)
                  </label>
                  <input
                    type="text"
                    value={assignedUserName}
                    onChange={(e) => setAssignedUserName(e.target.value)}
                    placeholder="اسم السائق أو المستخدم الفعلي"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    هوية المستخدم (User_ID_Number)
                  </label>
                  <input
                    type="text"
                    value={userIdNumber}
                    onChange={(e) => setUserIdNumber(e.target.value)}
                    placeholder="رقم هوية أو إقامة المستخدم"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Employee linking integration with Employees module */}
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5" />
                        ربط بموظف معتمد في النظام (Assigned_Employee_ID)
                      </span>
                      {isLoadingEmployees && <span className="text-[10px] text-slate-400">جاري تحميل الموظفين...</span>}
                    </label>
                    <select
                      value={assignedEmployeeId}
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">-- غير مرتبط بموظف (أو إدخال يدوي) --</option>
                      {employees.map(emp => (
                        <option key={emp.EmployeeID} value={emp.EmployeeID}>
                          {emp.EmployeeCode ? `[${emp.EmployeeCode}] ` : ''}{emp.ArabicName || emp.EnglishName} {emp.Role ? `(${emp.Role})` : ''} - {emp.Status === 'ACTIVE' ? 'نشط' : emp.Status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Linked Employee Info Card */}
                  {selectedEmployee ? (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-emerald-900 dark:text-emerald-300">
                          {selectedEmployee.ArabicName || selectedEmployee.EnglishName}
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400">
                          كود: {selectedEmployee.EmployeeCode || selectedEmployee.EmployeeID} • الجوال: {selectedEmployee.Mobile || 'غير مسجل'}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                        موظف مطابق
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 flex items-center gap-2">
                      <Info className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>يمكنك ترك الحقل فارغاً أو ربط المركبة بأحد موظفي الشركة لتمكين تتبع الرحلات والعهد</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: تعريف المركبة */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    2. بيانات تعريف المركبة
                  </h4>
                </div>

                {/* Saudi Plate Graphic Live Badge */}
                {plateNumber && (
                  <div className="inline-flex items-stretch border-2 border-slate-900 dark:border-slate-300 rounded-lg overflow-hidden shadow-2xs bg-white dark:bg-slate-800">
                    <div className="bg-emerald-600 px-1.5 py-0.5 flex items-center justify-center text-[9px] font-black text-white">
                      KSA
                    </div>
                    <div className="px-2.5 py-0.5 text-xs font-mono font-black text-slate-900 dark:text-white tracking-wider">
                      {plateNumber}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم اللوحة (Plate_Number) *
                  </label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="مثال: أ ب ج 1234 أو ABC 1234"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    رقم الهيكل (VIN_Chassis_Number)
                  </label>
                  <input
                    type="text"
                    value={vinChassisNumber}
                    onChange={(e) => setVinChassisNumber(e.target.value.toUpperCase())}
                    placeholder="17 حرف/رقم (الشاسيه)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الرقم التسلسلي (Serial_Number)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="الرقم التسلسلي للاستمارة"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: مواصفات المركبة */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                <Car className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  3. مواصفات المركبة
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الماركة (Brand) *
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="تويوتا، ايسوزو، فورد، إلخ"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الطراز (Model) *
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="هايلكس، دينا NPR، يارس..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    سنة الصنع (Manufacturing_Year) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1990}
                    max={new Date().getFullYear() + 2}
                    value={manufacturingYear}
                    onChange={(e) => setManufacturingYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-semibold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    اللون (Color)
                  </label>
                  <input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    placeholder="أبيض، رصاصي، أسود..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    نوع التسجيل (Registration_Type)
                  </label>
                  <select
                    value={registrationType}
                    onChange={(e) => setRegistrationType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="خصوصي">خصوصي</option>
                    <option value="نقل خاص">نقل خاص</option>
                    <option value="نقل عام">نقل عام</option>
                    <option value="حافلة خاصة">حافلة خاصة</option>
                    <option value="معدة ثقيلة">معدة ثقيلة</option>
                    <option value="دراجة آلية">دراجة آلية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الحمولة (Load_Capacity - كجم)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={loadCapacity}
                    onChange={(e) => setLoadCapacity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="مثال: 1500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الوزن الإجمالي (Vehicle_Weight - كجم)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={vehicleWeight}
                    onChange={(e) => setVehicleWeight(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="مثال: 2800"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: تواريخ الوثائق الرسمية */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  4. تواريخ الوثائق والانتهاء
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    انتهاء الاستمارة (Registration_Expiry)
                  </label>
                  <input
                    type="date"
                    value={registrationExpiry}
                    onChange={(e) => setRegistrationExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    انتهاء التأمين (Insurance_Expiry)
                  </label>
                  <input
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    انتهاء الفحص الدوري (Periodic_Inspection_Expiry)
                  </label>
                  <input
                    type="date"
                    value={periodicInspectionExpiry}
                    onChange={(e) => setPeriodicInspectionExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 5: البيانات التشغيلية والملاحظات */}
            <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2.5">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  5. البيانات التشغيلية والملاحظات
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    الحالة التشغيلية (Operational_Status) *
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-bold"
                  >
                    <option value="ACTIVE">نشطة في الخدمة (ACTIVE)</option>
                    <option value="IN_MAINTENANCE">في الصيانة (IN_MAINTENANCE)</option>
                    <option value="STOPPED">متوقفة (STOPPED)</option>
                    <option value="NOT_READY">غير جاهزة (NOT_READY)</option>
                    <option value="ACCIDENT">حادث (ACCIDENT)</option>
                    <option value="RESERVE">احتياط (RESERVE)</option>
                    <option value="SOLD">مباعة (SOLD)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    قراءة العداد الحالية (كم)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={currentOdometer}
                    onChange={(e) => setCurrentOdometer(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-mono font-bold focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="أي بيانات أو شروط تعاقدية أو ملاحظات فنية خاصة بالمركبة..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {isEdit ? 'حفظ التعديلات' : 'إضافة المركبة'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
