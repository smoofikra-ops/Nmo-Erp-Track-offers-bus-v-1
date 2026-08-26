import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Vehicle } from '@/types/fleet';
import { Employee } from '@/types/models';
import { fleetService } from '@/services/fleetService';
import { employeeService } from '@/services/employeeService';
import { formatToIsoDateString } from '@/data/fleetMasterData';
import { 
  Download, Upload, FileSpreadsheet, Check, AlertCircle, 
  X, CheckCircle2, AlertTriangle, UserCheck, ShieldAlert, 
  Search, Filter, RefreshCw, FileCheck2, ArrowUpDown, ChevronDown
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  companyId?: string;
  onImportSuccess: () => void;
}

interface ParsedVehicleRow {
  rowIndex: number;
  raw: any;
  vehicle: Partial<Vehicle>;
  employeeIdInput?: string;
  matchedEmployee?: Employee | null;
  status: 'VALID_MATCHED' | 'VALID_NO_EMPLOYEE' | 'WARNING_EMP_NOT_FOUND' | 'ERROR_DUPLICATE_VIN' | 'ERROR_DUPLICATE_PLATE' | 'ERROR_MISSING_REQ';
  messages: string[];
}

export function ImportExportModal({ 
  isOpen, 
  onClose, 
  vehicles, 
  companyId = 'COM-0001', 
  onImportSuccess 
}: ImportExportModalProps) {
  const [activeTab, setActiveTab] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Import State
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedVehicleRow[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSummary, setImportSummary] = useState<{ 
    imported: number; 
    failed: number; 
    skipped: number; 
    total: number;
    errors: { row?: number; error: string }[];
    message: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
      setFile(null);
      setParsedRows([]);
      setImportSummary(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    try {
      const res = await employeeService.getEmployees(companyId);
      if (res.success && res.data) {
        setEmployees(res.data);
      }
    } catch (err) {
      console.error('Failed to load employees for fleet template:', err);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  if (!isOpen) return null;

  // ==========================================
  // 1. GENERATE OFFICIAL 2-SHEET EXCEL TEMPLATE
  // ==========================================
  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Vehicles Template with exact real data columns
      const vehiclesHeaders = [
        'رقم الموظف (Employee_ID)',
        'اسم الموظف (للمرجع فقط)',
        'المالك (Owner_Name)',
        'المستخدم (Assigned_User_Name)',
        'هوية المالك (Owner_ID_Number)',
        'هوية المستخدم (User_ID_Number)',
        'رقم الهيكل (VIN_Chassis_Number)',
        'رقم اللوحة (Plate_Number)',
        'الماركة (Brand)',
        'الطراز (Model)',
        'نوع التسجيل (Registration_Type)',
        'الحمولة (Load_Capacity)',
        'الوزن (Vehicle_Weight)',
        'اللون (Color)',
        'سنة الصنع (Manufacturing_Year)',
        'الرقم التسلسلي (Serial_Number)',
        'انتهاء الاستمارة (Registration_Expiry)',
        'انتهاء التأمين (Insurance_Expiry)',
        'انتهاء الفحص الدوري (Periodic_Inspection_Expiry)',
        'قراءة العداد الحالية (Current_Odometer)',
        'الحالة التشغيلية (Operational_Status)',
        'الملاحظات (Notes)',
      ];

      // Sample sample rows referencing actual employees if available
      const sampleEmp1 = employees[0];
      const sampleEmp2 = employees[1];

      const sampleRows = [
        [
          sampleEmp1 ? (sampleEmp1.EmployeeCode || sampleEmp1.EmployeeID) : 'EMP-1001',
          sampleEmp1 ? (sampleEmp1.ArabicName || sampleEmp1.EnglishName) : 'محمد أحمد السعيد',
          'شركة المقاولات الحديثة',
          sampleEmp1 ? (sampleEmp1.ArabicName || sampleEmp1.EnglishName) : 'محمد أحمد السعيد',
          '7001234567',
          sampleEmp1?.NationalID || '1087654321',
          'AHTBA31K800123456',
          'أ ب ج 1020',
          'تويوتا',
          'هايلكس غمارتين',
          'نقل خاص',
          1200,
          2750,
          'أبيض',
          2023,
          'SN-9823412',
          '2026-11-15',
          '2026-08-20',
          '2026-09-10',
          45200,
          'ACTIVE',
          'مركبة قسم الصيانة الميدانية',
        ],
        [
          sampleEmp2 ? (sampleEmp2.EmployeeCode || sampleEmp2.EmployeeID) : 'EMP-1002',
          sampleEmp2 ? (sampleEmp2.ArabicName || sampleEmp2.EnglishName) : 'عبدالله صالح الشهري',
          'شركة المقاولات الحديثة',
          sampleEmp2 ? (sampleEmp2.ArabicName || sampleEmp2.EnglishName) : 'عبدالله صالح الشهري',
          '7001234567',
          sampleEmp2?.NationalID || '1043219876',
          'JA4AB31E500789012',
          'د ر س 5544',
          'ايسوزو',
          'دينا NPR شاسيه طويل',
          'نقل عام',
          4500,
          6500,
          'أبيض',
          2024,
          'SN-4412098',
          '2027-02-28',
          '2026-12-15',
          '2026-10-05',
          18400,
          'ACTIVE',
          'شاحنة توزيع بضائع فرع الرياض',
        ]
      ];

      const wsVehicles = XLSX.utils.aoa_to_sheet([vehiclesHeaders, ...sampleRows]);

      // Set column widths for readability
      wsVehicles['!cols'] = [
        { wch: 22 }, { wch: 24 }, { wch: 22 }, { wch: 22 },
        { wch: 18 }, { wch: 18 }, { wch: 24 }, { wch: 16 },
        { wch: 14 }, { wch: 20 }, { wch: 15 }, { wch: 12 },
        { wch: 12 }, { wch: 12 }, { wch: 14 }, { wch: 16 },
        { wch: 16 }, { wch: 16 }, { wch: 18 }, { wch: 16 },
        { wch: 14 }, { wch: 25 },
      ];

      // Sheet 2: Employees Reference Sheet (مرجع الموظفين الحاليين)
      const empHeaders = [
        'رقم الموظف (Employee_ID)',
        'كود الموظف (EmployeeCode)',
        'اسم الموظف بالعربي',
        'اسم الموظف بالإنجليزي',
        'المسمى الوظيفي (Role)',
        'رقم الهوية الوطنية / الإقامة',
        'رقم الجوال',
        'البريد الإلكتروني',
        'حالة الموظف (Status)',
      ];

      const empRows = employees.map(e => [
        e.EmployeeID || '',
        e.EmployeeCode || '',
        e.ArabicName || '',
        e.EnglishName || '',
        e.Role || '',
        e.NationalID || '',
        e.Mobile || '',
        e.Email || '',
        e.Status === 'ACTIVE' ? 'نشط (ACTIVE)' : e.Status,
      ]);

      const wsEmployees = XLSX.utils.aoa_to_sheet([empHeaders, ...empRows]);
      wsEmployees['!cols'] = [
        { wch: 24 }, { wch: 18 }, { wch: 22 }, { wch: 22 },
        { wch: 20 }, { wch: 22 }, { wch: 16 }, { wch: 22 }, { wch: 16 }
      ];

      XLSX.utils.book_append_sheet(wb, wsVehicles, 'المركبات');
      XLSX.utils.book_append_sheet(wb, wsEmployees, 'مرجع الموظفين');

      XLSX.writeFile(wb, `قالب_استيراد_المركبات_Vehicle_Master_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Failed to generate template:', err);
      setErrorMessage('فشل إنشاء قالب Excel، يرجى المحاولة مرة أخرى.');
    }
  };

  // ==========================================
  // 2. EXPORT CURRENT VEHICLES TO EXCEL
  // ==========================================
  const handleExportVehicles = () => {
    try {
      const wb = XLSX.utils.book_new();

      const headers = [
        'معرف المركبة (Vehicle_ID)',
        'رقم اللوحة (Plate_Number)',
        'رقم الهيكل (VIN_Chassis_Number)',
        'الرقم التسلسلي (Serial_Number)',
        'الماركة (Brand)',
        'الطراز (Model)',
        'سنة الصنع (Manufacturing_Year)',
        'اللون (Color)',
        'نوع التسجيل (Registration_Type)',
        'الحمولة (كجم)',
        'الوزن (كجم)',
        'المالك (Owner_Name)',
        'هوية المالك (Owner_ID_Number)',
        'المستخدم الحالي (Assigned_User_Name)',
        'هوية المستخدم (User_ID_Number)',
        'رقم الموظف المرتبط (Assigned_Employee_ID)',
        'اسم الموظف في النظام',
        'حالة التشغيل (Operational_Status)',
        'مؤشر الجاهزية (%)',
        'العداد الحالي (كم)',
        'انتهاء الاستمارة',
        'انتهاء التأمين',
        'انتهاء الفحص الدوري',
        'تكلفة الوقود للشهر الحالي',
        'تكلفة الصيانة للشهر الحالي',
        'الملاحظات',
      ];

      const rows = vehicles.map(v => {
        const linkedEmp = employees.find(e => e.EmployeeID === v.Assigned_Employee_ID || e.EmployeeCode === v.Assigned_Employee_ID);
        const empName = linkedEmp ? (linkedEmp.ArabicName || linkedEmp.EnglishName) : '';

        return [
          v.Vehicle_ID,
          v.Plate_Number,
          v.VIN_Chassis_Number || v.VIN || '',
          v.Serial_Number || '',
          v.Brand,
          v.Model,
          v.Manufacturing_Year || v.Year,
          v.Color,
          v.Registration_Type || 'خصوصي',
          v.Load_Capacity || 0,
          v.Vehicle_Weight || 0,
          v.Owner_Name || '',
          v.Owner_ID_Number || '',
          v.Assigned_User_Name || v.Primary_Driver_Name || '',
          v.User_ID_Number || '',
          v.Assigned_Employee_ID || '',
          empName,
          v.Operational_Status,
          v.Readiness_Index ?? 100,
          v.Current_Odometer || 0,
          v.Registration_Expiry || v.License_Expiry || '',
          v.Insurance_Expiry || '',
          v.Periodic_Inspection_Expiry || v.Inspection_Expiry || '',
          v.Fuel_Cost_MTD || 0,
          v.Maint_Cost_MTD || 0,
          v.Notes || '',
        ];
      });

      const wsVehicles = XLSX.utils.aoa_to_sheet([headers, ...rows]);
      XLSX.utils.book_append_sheet(wb, wsVehicles, 'المركبات الفعلية');

      // Add employees reference sheet
      const empHeaders = ['رقم الموظف', 'كود الموظف', 'الاسم بالعربي', 'الاسم بالإنجليزي', 'المسمى الوظيفي', 'رقم الهوية', 'الجوال', 'الحالة'];
      const empRows = employees.map(e => [
        e.EmployeeID || '',
        e.EmployeeCode || '',
        e.ArabicName || '',
        e.EnglishName || '',
        e.Role || '',
        e.NationalID || '',
        e.Mobile || '',
        e.Status || '',
      ]);
      const wsEmployees = XLSX.utils.aoa_to_sheet([empHeaders, ...empRows]);
      XLSX.utils.book_append_sheet(wb, wsEmployees, 'مرجع الموظفين');

      XLSX.writeFile(wb, `سجل_الأسطول_الفعلية_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (err) {
      console.error('Failed to export vehicles:', err);
      setErrorMessage('فشل تصدير البيانات إلى Excel.');
    }
  };

  // ==========================================
  // 3. PARSE UPLOADED EXCEL / CSV FILE
  // ==========================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMessage('');
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Get first sheet or sheet named 'المركبات'
        const sheetName = workbook.SheetNames.find(n => n.includes('مركب') || n.toLowerCase().includes('vehic')) || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          setErrorMessage('الملف لا يحتوي على أوراق عمل صالحة.');
          return;
        }

        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        if (rawJson.length < 2) {
          setErrorMessage('الملف لا يحتوي على صفوف بيانات.');
          return;
        }

        const headerRow = (rawJson[0] as any[]).map(h => String(h || '').trim());
        
        // Helper to find column index by synonyms
        const findColIndex = (...candidates: string[]) => {
          return headerRow.findIndex(h => candidates.some(c => h.toLowerCase().includes(c.toLowerCase())));
        };

        const colEmpId = findColIndex('Employee_ID', 'رقم الموظف', 'كود الموظف', 'emp_id', 'employee');
        const colEmpName = findColIndex('اسم الموظف', 'employee_name');
        const colOwner = findColIndex('المالك', 'Owner_Name', 'owner');
        const colUser = findColIndex('المستخدم', 'Assigned_User_Name', 'user', 'driver', 'السائق');
        const colOwnerId = findColIndex('هوية المالك', 'Owner_ID_Number', 'owner_id');
        const colUserId = findColIndex('هوية المستخدم', 'User_ID_Number', 'user_id', 'driver_id');
        const colVin = findColIndex('رقم الهيكل', 'VIN_Chassis_Number', 'VIN', 'الهيكل', 'الشاسيه', 'chassis');
        const colPlate = findColIndex('رقم اللوحة', 'Plate_Number', 'plate', 'اللوحة');
        const colBrand = findColIndex('الماركة', 'Brand', 'الصانع', 'brand');
        const colModel = findColIndex('الطراز', 'Model', 'الموديل', 'model');
        const colRegType = findColIndex('نوع التسجيل', 'Registration_Type', 'reg_type');
        const colCapacity = findColIndex('الحمولة', 'Load_Capacity', 'capacity');
        const colWeight = findColIndex('الوزن', 'Vehicle_Weight', 'weight');
        const colColor = findColIndex('اللون', 'Color', 'color');
        const colYear = findColIndex('سنة الصنع', 'Manufacturing_Year', 'Year', 'سنة', 'السنة', 'year');
        const colSerial = findColIndex('الرقم التسلسلي', 'Serial_Number', 'serial');
        const colRegExpiry = findColIndex('انتهاء الاستمارة', 'Registration_Expiry', 'الاستمارة', 'license_expiry');
        const colInsExpiry = findColIndex('انتهاء التأمين', 'Insurance_Expiry', 'التأمين', 'insurance_expiry');
        const colInspExpiry = findColIndex('انتهاء الفحص', 'Periodic_Inspection_Expiry', 'Inspection_Expiry', 'الفحص الدوري', 'الفحص');
        const colOdometer = findColIndex('العداد', 'Current_Odometer', 'odometer', 'قراءة العداد');
        const colStatus = findColIndex('حالة التشغيل', 'Operational_Status', 'status', 'الحالة');
        const colNotes = findColIndex('الملاحظات', 'Notes', 'ملاحظات', 'notes');

        const existingVins = new Set(vehicles.map(v => String(v.VIN_Chassis_Number || v.VIN || '').trim().toUpperCase()).filter(Boolean));
        const existingPlates = new Set(vehicles.map(v => String(v.Plate_Number || '').trim().toUpperCase()).filter(Boolean));
        const seenVinsInFile = new Set<string>();
        const seenPlatesInFile = new Set<string>();

        const parsed: ParsedVehicleRow[] = [];

        for (let r = 1; r < rawJson.length; r++) {
          const row = rawJson[r] as any[];
          if (!row || row.every(cell => cell === '' || cell === null || cell === undefined)) {
            continue; // Skip empty rows
          }

          const getVal = (idx: number) => (idx >= 0 && row[idx] !== undefined ? String(row[idx]).trim() : '');

          const empIdInput = getVal(colEmpId);
          const empNameInput = getVal(colEmpName);
          const owner = getVal(colOwner) || 'شركة المقاولات الحديثة';
          const user = getVal(colUser);
          const ownerId = getVal(colOwnerId);
          const userId = getVal(colUserId);
          const vin = getVal(colVin);
          const plate = getVal(colPlate);
          const brand = getVal(colBrand);
          const model = getVal(colModel);
          const regType = getVal(colRegType) || 'خصوصي';
          const capacity = Number(getVal(colCapacity)) || 0;
          const weight = Number(getVal(colWeight)) || 0;
          const color = getVal(colColor) || 'أبيض';
          const year = Number(getVal(colYear)) || new Date().getFullYear();
          const serial = getVal(colSerial);
          const rawRegExpiry = colRegExpiry >= 0 ? row[colRegExpiry] : '';
          const rawInsExpiry = colInsExpiry >= 0 ? row[colInsExpiry] : '';
          const rawInspExpiry = colInspExpiry >= 0 ? row[colInspExpiry] : '';
          
          const regExpiry = formatToIsoDateString(rawRegExpiry);
          const insExpiry = formatToIsoDateString(rawInsExpiry);
          const inspExpiry = formatToIsoDateString(rawInspExpiry);
          const odometer = Number(getVal(colOdometer)) || 0;
          const statusRaw = getVal(colStatus).toUpperCase();
          const notes = getVal(colNotes);

          let operationalStatus: Vehicle['Operational_Status'] = 'ACTIVE';
          if (['IN_MAINTENANCE', 'صيانة', 'في الصيانة'].includes(statusRaw)) operationalStatus = 'IN_MAINTENANCE';
          else if (['STOPPED', 'متوقفة'].includes(statusRaw)) operationalStatus = 'STOPPED';
          else if (['NOT_READY', 'غير جاهزة'].includes(statusRaw)) operationalStatus = 'NOT_READY';
          else if (['ACCIDENT', 'حادث'].includes(statusRaw)) operationalStatus = 'ACCIDENT';
          else if (['RESERVE', 'احتياط'].includes(statusRaw)) operationalStatus = 'RESERVE';
          else if (['SOLD', 'مباعة'].includes(statusRaw)) operationalStatus = 'SOLD';

          const messages: string[] = [];
          let rowStatus: ParsedVehicleRow['status'] = 'VALID_NO_EMPLOYEE';

          // 1. Check Required Basic Fields
          if (!plate) {
            rowStatus = 'ERROR_MISSING_REQ';
            messages.push('رقم اللوحة مفقود (حقل إلزامي)');
          }
          if (!brand || !model) {
            rowStatus = 'ERROR_MISSING_REQ';
            messages.push('الماركة أو الطراز مفقود');
          }

          // 2. Check Duplicates
          const normalizedPlate = plate.toUpperCase();
          if (plate) {
            if (existingPlates.has(normalizedPlate)) {
              rowStatus = 'ERROR_DUPLICATE_PLATE';
              messages.push(`رقم اللوحة "${plate}" موجود بالفعل في النظام`);
            } else if (seenPlatesInFile.has(normalizedPlate)) {
              rowStatus = 'ERROR_DUPLICATE_PLATE';
              messages.push(`رقم اللوحة "${plate}" مكرر داخل هذا الملف`);
            }
            seenPlatesInFile.add(normalizedPlate);
          }

          const normalizedVin = vin.toUpperCase();
          if (vin) {
            if (existingVins.has(normalizedVin)) {
              rowStatus = 'ERROR_DUPLICATE_VIN';
              messages.push(`رقم الهيكل VIN "${vin}" مسجل مسبقاً لمركبة أخرى في الأسطول`);
            } else if (seenVinsInFile.has(normalizedVin)) {
              rowStatus = 'ERROR_DUPLICATE_VIN';
              messages.push(`رقم الهيكل VIN "${vin}" مكرر داخل هذا الملف`);
            }
            seenVinsInFile.add(normalizedVin);
          }

          // 3. Match Employee
          let matchedEmp: Employee | null = null;
          if (empIdInput) {
            const cleanEmpId = empIdInput.trim().toUpperCase();
            matchedEmp = employees.find(e => 
              (e.EmployeeID && e.EmployeeID.toUpperCase() === cleanEmpId) ||
              (e.EmployeeCode && e.EmployeeCode.toUpperCase() === cleanEmpId) ||
              (e.NationalID && e.NationalID === cleanEmpId)
            ) || null;

            if (matchedEmp) {
              if (rowStatus !== 'ERROR_MISSING_REQ' && rowStatus !== 'ERROR_DUPLICATE_PLATE' && rowStatus !== 'ERROR_DUPLICATE_VIN') {
                rowStatus = 'VALID_MATCHED';
                messages.push(`تم الربط بالموظف: ${matchedEmp.ArabicName || matchedEmp.EnglishName} (${matchedEmp.EmployeeCode || matchedEmp.EmployeeID})`);
              }
            } else {
              if (rowStatus !== 'ERROR_MISSING_REQ' && rowStatus !== 'ERROR_DUPLICATE_PLATE' && rowStatus !== 'ERROR_DUPLICATE_VIN') {
                rowStatus = 'WARNING_EMP_NOT_FOUND';
                messages.push(`رقم الموظف [${empIdInput}] غير مسجل في قسم الموظفين (سيتم الاستيراد بدون ربط)`);
              }
            }
          }

          const finalUserName = user || (matchedEmp ? (matchedEmp.ArabicName || matchedEmp.EnglishName) : empNameInput || '');
          const finalUserId = userId || (matchedEmp?.NationalID || '');

          const vehicleObj: Partial<Vehicle> = {
            Owner_Name: owner,
            Owner_ID_Number: ownerId,
            Assigned_User_Name: finalUserName,
            User_ID_Number: finalUserId,
            Assigned_Employee_ID: matchedEmp ? (matchedEmp.EmployeeID || matchedEmp.EmployeeCode) : undefined,

            VIN_Chassis_Number: vin,
            VIN: vin,
            Serial_Number: serial,
            Plate_Number: plate,
            Brand: brand,
            Model: model,
            Manufacturing_Year: year,
            Year: year,
            Color: color,
            Registration_Type: regType,
            Load_Capacity: capacity,
            Vehicle_Weight: weight,

            Registration_Expiry: regExpiry || undefined,
            License_Expiry: regExpiry || undefined,
            Insurance_Expiry: insExpiry || undefined,
            Periodic_Inspection_Expiry: inspExpiry || undefined,
            Inspection_Expiry: inspExpiry || undefined,

            Operational_Status: operationalStatus,
            Current_Odometer: odometer,
            Notes: notes,
            Primary_Driver_ID: matchedEmp ? (matchedEmp.EmployeeID || matchedEmp.EmployeeCode) : undefined,
            Primary_Driver_Name: finalUserName,
          };

          parsed.push({
            rowIndex: r + 1,
            raw: row,
            vehicle: vehicleObj,
            employeeIdInput: empIdInput,
            matchedEmployee: matchedEmp,
            status: rowStatus,
            messages,
          });
        }

        setParsedRows(parsed);
      } catch (err: any) {
        console.error('Failed to parse file:', err);
        setErrorMessage('تعذر قراءة ملف Excel، يرجى التأكد من صحة تنسيق الملف.');
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  // ==========================================
  // 4. CONFIRM AND EXECUTE BULK IMPORT
  // ==========================================
  const handleExecuteImport = async () => {
    const validRowsToImport = parsedRows.filter(r => 
      r.status === 'VALID_MATCHED' || r.status === 'VALID_NO_EMPLOYEE' || r.status === 'WARNING_EMP_NOT_FOUND'
    );

    if (validRowsToImport.length === 0) {
      setErrorMessage('لا توجد سجلات صالحة للاستيراد. يرجى مراجعة وتصحيح الأخطاء أولاً.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    try {
      const vehiclesPayload = validRowsToImport.map(r => r.vehicle);
      
      const res = await fleetService.bulkImportVehicles(vehiclesPayload, companyId, {
        id: 'ADMIN_USER',
        name: 'مسؤول الأسطول',
        role: 'ADMIN'
      });

      if (!res.success || (res.data && res.data.inserted === 0)) {
        // Strict failure handling
        const errDetails = res.data?.errors?.map(e => e.error).join(' | ') || res.message || 'فشل حفظ سجلات المركبات في قاعدة البيانات المركزية';
        setErrorMessage(errDetails);
        setIsProcessing(false);
        return;
      }

      setImportSummary({
        imported: res.data.inserted,
        failed: res.data.failed,
        skipped: res.data.skipped,
        total: res.data.requested,
        errors: res.data.errors || [],
        message: res.message
      });

      // Reload fleet list from central database
      onImportSuccess();
    } catch (err: any) {
      console.error('Import execution error:', err);
      setErrorMessage('حدث خطأ أثناء حفظ السجلات في قاعدة البيانات: ' + (err.message || ''));
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter and stats counts
  const totalCount = parsedRows.length;
  const matchedCount = parsedRows.filter(r => r.status === 'VALID_MATCHED').length;
  const unlinkedCount = parsedRows.filter(r => r.status === 'VALID_NO_EMPLOYEE').length;
  const empNotFoundCount = parsedRows.filter(r => r.status === 'WARNING_EMP_NOT_FOUND').length;
  const errorCount = parsedRows.filter(r => r.status.startsWith('ERROR_')).length;
  const readyToImportCount = matchedCount + unlinkedCount + empNotFoundCount;

  const filteredRows = parsedRows.filter(r => {
    if (filterType === 'MATCHED' && r.status !== 'VALID_MATCHED') return false;
    if (filterType === 'UNLINKED' && r.status !== 'VALID_NO_EMPLOYEE') return false;
    if (filterType === 'WARNINGS' && r.status !== 'WARNING_EMP_NOT_FOUND') return false;
    if (filterType === 'ERRORS' && !r.status.startsWith('ERROR_')) return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const p = (r.vehicle.Plate_Number || '').toLowerCase();
      const b = (r.vehicle.Brand || '').toLowerCase();
      const m = (r.vehicle.Model || '').toLowerCase();
      const vin = (r.vehicle.VIN_Chassis_Number || '').toLowerCase();
      const u = (r.vehicle.Assigned_User_Name || '').toLowerCase();
      const emp = (r.employeeIdInput || '').toLowerCase();
      return p.includes(q) || b.includes(q) || m.includes(q) || vin.includes(q) || u.includes(q) || emp.includes(q);
    }

    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" dir="rtl">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                استيراد وتصدير بيانات المركبات (Vehicle Master)
              </h3>
              <p className="text-xs text-slate-500">
                قالب Excel متعدد الأوراق يدعم الربط المباشر بمرجع الموظفين وفحص الازدواجية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tabs */}
            <div className="flex bg-slate-200/70 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('IMPORT')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'IMPORT' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                استيراد المركبات
              </button>
              <button
                onClick={() => setActiveTab('EXPORT')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'EXPORT' 
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                تصدير الأسطول
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: IMPORT */}
          {activeTab === 'IMPORT' && (
            <div className="space-y-6">
              {/* Import Step 1 & 2 Cards */}
              {!importSummary && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Step 1: Download Template */}
                  <div className="p-5 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-950/10 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-black">
                          الخطوة 1
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          ملف Excel بـ ورقتين (.xlsx)
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        تحميل قالب Excel الرسمي المعتمد
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        يحتوي القالب على ورقة <strong>"المركبات"</strong> بكافة الحقول الـ 17 المطلوبة، وورقة <strong>"مرجع الموظفين"</strong> محملة ببيانات الموظفين الحالية لسهولة نسخ Employee_ID بدقة.
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadTemplate}
                      className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-2xs flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-4 h-4" />
                      تحميل قالب Excel (المركبات + مرجع الموظفين)
                    </button>
                  </div>

                  {/* Step 2: Upload File */}
                  <div className="p-5 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-black">
                          الخطوة 2
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">
                          يدعم .xlsx, .xls, .csv
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        رفع ملف المركبات للمعاينة والتحقق
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        سيقوم النظام تلقائياً بمطابقة معرفات الموظفين Employee_ID، وفحص أرقام الهيكل VIN واللوحات لمنع الازدواجية وعرض تقرير تفصيلي قبل الحفظ.
                      </p>
                    </div>

                    <label className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all">
                      <Upload className="w-4 h-4" />
                      <span>{file ? file.name : 'اختيار ورفع ملف Excel'}</span>
                      <input 
                        type="file" 
                        accept=".xlsx, .xls, .csv" 
                        onChange={handleFileUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Import Completed Confirmation Banner */}
              {importSummary && (
                <div className={`p-6 rounded-3xl border text-center space-y-4 ${
                  importSummary.failed === 0 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' 
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800'
                }`}>
                  <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center shadow-inner ${
                    importSummary.failed === 0 
                      ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400' 
                      : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
                  }`}>
                    {importSummary.failed === 0 ? <CheckCircle2 className="w-7 h-7" /> : <AlertTriangle className="w-7 h-7" />}
                  </div>

                  <div>
                    <h4 className={`text-base font-black ${
                      importSummary.failed === 0 ? 'text-emerald-900 dark:text-emerald-200' : 'text-amber-900 dark:text-amber-200'
                    }`}>
                      {importSummary.failed === 0 
                        ? `تم استيراد وحفظ ${importSummary.imported} مركبة بنجاح في قاعدة البيانات المركزية`
                        : `تم حفظ ${importSummary.imported} من أصل ${importSummary.total} مركبة. تعذر حفظ ${importSummary.failed} مركبة`}
                    </h4>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      importSummary.failed === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'
                    }`}>
                      تمت معالجة السجلات والتحقق من ارتباط الموظفين وتحديث سجل Vehicle Master بنجاح.
                    </p>
                  </div>

                  {/* Stats Badges */}
                  <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto pt-1">
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">تم الحفظ الفعلي</span>
                      <span className="text-lg font-black text-emerald-600">{importSummary.imported}</span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">فشل / مستبعد</span>
                      <span className={`text-lg font-black ${importSummary.failed > 0 ? 'text-rose-600' : 'text-slate-400'}`}>
                        {importSummary.failed}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 font-bold block">الإجمالي المطلوب</span>
                      <span className="text-lg font-black text-slate-700 dark:text-slate-300">{importSummary.total}</span>
                    </div>
                  </div>

                  {/* Backend Error Details if any */}
                  {importSummary.errors && importSummary.errors.length > 0 && (
                    <div className="text-right p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 space-y-2">
                      <span className="text-xs font-bold text-rose-800 dark:text-rose-200 block">تفاصيل السجلات غير المحفوظة وأسباب الاستبعاد:</span>
                      <ul className="text-xs text-rose-700 dark:text-rose-300 space-y-1 list-disc list-inside">
                        {importSummary.errors.map((err, idx) => (
                          <li key={idx}>
                            {err.row ? `الصف ${err.row}: ` : ''}{err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="pt-3 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setParsedRows([]);
                        setImportSummary(null);
                      }}
                      className="px-5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      استيراد ملف آخر
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                    >
                      إغلاق وعرض الأسطول
                    </button>
                  </div>
                </div>
              )}

              {/* Pre-Import Interactive Preview Dashboard */}
              {parsedRows.length > 0 && !importSummary && (
                <div className="space-y-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                  {/* Metric Status Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div 
                      onClick={() => setFilterType('ALL')}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                        filterType === 'ALL' 
                          ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-[11px] text-slate-500 font-semibold block">إجمالي الصفوف</span>
                      <span className="text-lg font-black text-slate-900 dark:text-white">{totalCount}</span>
                    </div>

                    <div 
                      onClick={() => setFilterType('MATCHED')}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                        filterType === 'MATCHED' 
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-[11px] text-emerald-600 font-semibold block">مطابقة لموظف</span>
                      <span className="text-lg font-black text-emerald-600">{matchedCount}</span>
                    </div>

                    <div 
                      onClick={() => setFilterType('UNLINKED')}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                        filterType === 'UNLINKED' 
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-[11px] text-blue-600 font-semibold block">بدون موظف</span>
                      <span className="text-lg font-black text-blue-600">{unlinkedCount}</span>
                    </div>

                    <div 
                      onClick={() => setFilterType('WARNINGS')}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                        filterType === 'WARNINGS' 
                          ? 'border-amber-600 bg-amber-50/50 dark:bg-amber-950/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-[11px] text-amber-600 font-semibold block">موظف غير موجود</span>
                      <span className="text-lg font-black text-amber-600">{empNotFoundCount}</span>
                    </div>

                    <div 
                      onClick={() => setFilterType('ERRORS')}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition-all ${
                        filterType === 'ERRORS' 
                          ? 'border-rose-600 bg-rose-50/50 dark:bg-rose-950/30' 
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <span className="text-[11px] text-rose-600 font-semibold block">أخطاء وتكرار</span>
                      <span className="text-lg font-black text-rose-600">{errorCount}</span>
                    </div>
                  </div>

                  {/* Filter / Search Bar */}
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[240px]">
                      <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="بحث باللوحة، رقم الهيكل، الماركة، أو الموظف..."
                        className="w-full pl-3 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">
                        الصفوف الجاهزة للحفظ: <strong className="text-indigo-600 font-bold">{readyToImportCount}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Table of Parsed Rows */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-2xs max-h-[320px] overflow-y-auto">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold sticky top-0 z-10">
                        <tr>
                          <th className="py-2.5 px-3">#</th>
                          <th className="py-2.5 px-3">رقم اللوحة</th>
                          <th className="py-2.5 px-3">الماركة والطراز</th>
                          <th className="py-2.5 px-3">رقم الهيكل VIN</th>
                          <th className="py-2.5 px-3">الموظف المدخل / المطابقة</th>
                          <th className="py-2.5 px-3">حالة الصف والتحقق</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredRows.map((row) => {
                          const v = row.vehicle;
                          return (
                            <tr key={row.rowIndex} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                              <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">
                                {row.rowIndex}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap font-bold text-slate-900 dark:text-white">
                                {v.Plate_Number || <span className="text-rose-500 italic">بدون لوحة</span>}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                <div>{v.Brand} {v.Model}</div>
                                <div className="text-[10px] text-slate-400">{v.Manufacturing_Year} • {v.Color}</div>
                              </td>

                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                {v.VIN_Chassis_Number || <span className="text-slate-300">-</span>}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {row.matchedEmployee ? (
                                  <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-semibold">
                                    <UserCheck className="w-3.5 h-3.5" />
                                    <span>{row.matchedEmployee.ArabicName || row.matchedEmployee.EnglishName}</span>
                                    <span className="text-[10px] text-emerald-600">[{row.matchedEmployee.EmployeeCode || row.matchedEmployee.EmployeeID}]</span>
                                  </div>
                                ) : row.employeeIdInput ? (
                                  <div className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">
                                    كود: {row.employeeIdInput} (غير موجود)
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">غير محدد</span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 whitespace-nowrap">
                                {row.status === 'VALID_MATCHED' && (
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                                    سليم ومطابق
                                  </span>
                                )}
                                {row.status === 'VALID_NO_EMPLOYEE' && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                                    سليم (بدون موظف)
                                  </span>
                                )}
                                {row.status === 'WARNING_EMP_NOT_FOUND' && (
                                  <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                                    <AlertTriangle className="w-3 h-3" />
                                    تحذير موظف
                                  </span>
                                )}
                                {row.status.startsWith('ERROR_') && (
                                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                                    <AlertCircle className="w-3 h-3" />
                                    {row.messages[0] || 'خطأ في البيانات'}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Actions Confirmation Bar */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      سيتم استيراد <strong className="text-emerald-600 font-bold">{readyToImportCount}</strong> سجل وحفظها في قاعدة بيانات الأسطول.
                      {errorCount > 0 && <span className="text-rose-500 block text-[11px]">سيتم استبعاد {errorCount} سجل يحتوي على أخطاء أو تكرار.</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setParsedRows([]);
                          setFile(null);
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      >
                        إلغاء المعاينة
                      </button>

                      <button
                        type="button"
                        onClick={handleExecuteImport}
                        disabled={isProcessing || readyToImportCount === 0}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2 transition-all"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-r-transparent rounded-full animate-spin" />
                            جاري حفظ البيانات...
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            تأكيد واستيراد المركبات ({readyToImportCount})
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EXPORT */}
          {activeTab === 'EXPORT' && (
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400">
                    <FileSpreadsheet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      تصدير كامل بيانات الأسطول إلى Excel
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      تصدير ملف مصنف جاهز للطباعة والتحليل يشتمل على بيانات المركبات الفعلية وتفاصيل الموظفين والوثائق
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold block">إجمالي المركبات</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white">{vehicles.length}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold block">المركبات النشطة</span>
                    <span className="text-xl font-black text-emerald-600">
                      {vehicles.filter(v => v.Operational_Status === 'ACTIVE').length}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[11px] text-slate-400 font-semibold block">المرتبطة بموظفين</span>
                    <span className="text-xl font-black text-indigo-600">
                      {vehicles.filter(v => v.Assigned_Employee_ID || v.Primary_Driver_ID).length}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExportVehicles}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    تصدير ملف الأسطول الكامل (.xlsx)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
