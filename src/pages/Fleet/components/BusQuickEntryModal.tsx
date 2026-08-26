import React, { useState, useEffect, useMemo } from 'react';
import { Vehicle } from '@/types/fleet';
import { Employee } from '@/types/models';
import { BusServiceCategory, BusServiceType, BusServiceLog } from '@/types/busOperations';
import { busOperationsService } from '@/services/busOperationsService';
import { employeeService } from '@/services/employeeService';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  X, Truck, User, Fuel, Wrench, Disc, ShieldAlert,
  Gauge, Zap, Wind, Car, HelpCircle, Upload, CheckCircle2,
  Calendar, DollarSign, FileText, AlertCircle, Sparkles,
  ArrowRight, ArrowLeft, Building, CreditCard, ChevronRight,
  Clock, Plus, Info, RefreshCw, Eye, Paperclip, Check
} from 'lucide-react';

interface BusQuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicles: Vehicle[];
  initialVehicleId?: string | null;
  defaultVehicleId?: string | null;
  onSuccess: () => void;
}

export function BusQuickEntryModal({
  isOpen,
  onClose,
  vehicles,
  initialVehicleId,
  defaultVehicleId,
  onSuccess,
}: BusQuickEntryModalProps) {
  const effectiveInitialVehicleId = initialVehicleId || defaultVehicleId || '';
  const { user } = useAuth();
  const companyId = user?.currentCompanyId || 'COM-0001';

  // Catalog State
  const [categories, setCategories] = useState<BusServiceCategory[]>([]);
  const [serviceTypes, setServiceTypes] = useState<BusServiceType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);

  // Form Steps: 1: Bus & Driver, 2: Category & Service, 3: Operation Details & Costs, 4: Invoice & Confirmation
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Selection state
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(effectiveInitialVehicleId);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [serviceSearchTerm, setServiceSearchTerm] = useState<string>('');

  // Form Fields
  const [operationDate, setOperationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number | ''>('');
  
  // Cost breakdown
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [unit, setUnit] = useState<string>('لتر');
  const [partsCost, setPartsCost] = useState<number | ''>('');
  const [laborCost, setLaborCost] = useState<number | ''>('');
  const [additionalCost, setAdditionalCost] = useState<number | ''>('');
  const [totalCost, setTotalCost] = useState<number>(0);

  // Location & Invoicing
  const [workshop, setWorkshop] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<BusServiceLog['Payment_Method']>('CASH');

  // Reminders & Diagnostics
  const [nextServiceDate, setNextServiceDate] = useState<string>('');
  const [nextServiceOdometer, setNextServiceOdometer] = useState<number | ''>('');
  const [issueDescription, setIssueDescription] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Dynamic Specifics
  const [oilBrand, setOilBrand] = useState<string>('بترومين 15W-40');
  const [oilFilterReplaced, setOilFilterReplaced] = useState<boolean>(true);
  const [tirePosition, setTirePosition] = useState<string>('أمامي يمين');
  const [tireSize, setTireSize] = useState<string>('295/80R22.5');
  const [tireBrand, setTireBrand] = useState<string>('بريدجستون (Bridgestone)');
  const [fuelType, setFuelType] = useState<string>('ديزل');
  const [gasStation, setGasStation] = useState<string>('محطة ساسكو');
  const [freonType, setFreonType] = useState<string>('R134a');

  // Invoice Upload State
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [invoicePreviewUrl, setInvoicePreviewUrl] = useState<string | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);
  const [uploadedDriveData, setUploadedDriveData] = useState<{ fileId: string; driveUrl: string; fileName: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load catalog on open
  useEffect(() => {
    if (isOpen) {
      loadCatalog();
      if (initialVehicleId) {
        setSelectedVehicleId(initialVehicleId);
      }
    }
  }, [isOpen, initialVehicleId]);

  // Set default odometer and employee when vehicle changes
  useEffect(() => {
    if (selectedVehicleId && vehicles.length > 0) {
      const v = vehicles.find(veh => veh.Vehicle_ID === selectedVehicleId);
      if (v) {
        if (!odometer || odometer === 0) {
          setOdometer(v.Current_Odometer || 0);
        }
        if (!selectedEmployeeId && (v.Assigned_Employee_ID || v.Primary_Driver_ID)) {
          setSelectedEmployeeId(v.Assigned_Employee_ID || v.Primary_Driver_ID || '');
        }
      }
    }
  }, [selectedVehicleId, vehicles]);

  const loadCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      const [catsRes, typesRes, empsRes] = await Promise.all([
        busOperationsService.getCategories(companyId),
        busOperationsService.getServiceTypes(companyId),
        employeeService.getEmployees(companyId),
      ]);

      if (catsRes.success) setCategories(catsRes.data);
      if (typesRes.success) setServiceTypes(typesRes.data);
      if (empsRes.success) setEmployees(empsRes.data);
    } catch (e) {
      console.error('Failed to load bus catalog', e);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  const selectedVehicle = useMemo(() => {
    return vehicles.find(v => v.Vehicle_ID === selectedVehicleId) || null;
  }, [vehicles, selectedVehicleId]);

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.Category_ID === selectedCategoryId) || null;
  }, [categories, selectedCategoryId]);

  const selectedType = useMemo(() => {
    return serviceTypes.find(t => t.Service_Type_ID === selectedTypeId) || null;
  }, [serviceTypes, selectedTypeId]);

  const filteredServiceTypes = useMemo(() => {
    let list = serviceTypes.filter(t => t.Is_Active !== false);
    if (selectedCategoryId) {
      list = list.filter(t => t.Category_ID === selectedCategoryId);
    }
    if (serviceSearchTerm.trim()) {
      const term = serviceSearchTerm.toLowerCase();
      list = list.filter(t => 
        t.Service_Name_AR.toLowerCase().includes(term) ||
        t.Service_Name_EN.toLowerCase().includes(term)
      );
    }
    return list;
  }, [serviceTypes, selectedCategoryId, serviceSearchTerm]);

  // Frequent quick picks
  const frequentServices = useMemo(() => {
    return serviceTypes.filter(t => t.Is_Frequent && t.Is_Active !== false);
  }, [serviceTypes]);

  // Dynamic automatic calculation of Total Cost
  useEffect(() => {
    const config = selectedType?.fieldConfig;
    let computedTotal = 0;

    if (config?.hasQuantityPrice && quantity && unitPrice) {
      computedTotal += Number(quantity) * Number(unitPrice);
    }

    if (config?.hasPartsLabor) {
      const p = Number(partsCost) || 0;
      const l = Number(laborCost) || 0;
      const a = Number(additionalCost) || 0;
      computedTotal += p + l + a;
    }

    if (!config?.hasQuantityPrice && !config?.hasPartsLabor) {
      const p = Number(partsCost) || 0;
      const l = Number(laborCost) || 0;
      const a = Number(additionalCost) || 0;
      if (p || l || a) {
        computedTotal = p + l + a;
      } else if (unitPrice && quantity) {
        computedTotal = Number(unitPrice) * Number(quantity);
      }
    }

    setTotalCost(computedTotal);
  }, [quantity, unitPrice, partsCost, laborCost, additionalCost, selectedType]);

  // Handle file select
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        toast.error('حجم الملف كبير جداً. الحد الأقصى 15 ميجابايت.');
        return;
      }
      setInvoiceFile(file);
      if (file.type.startsWith('image/')) {
        setInvoicePreviewUrl(URL.createObjectURL(file));
      } else {
        setInvoicePreviewUrl(null);
      }
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Fuel': return <Fuel className="w-5 h-5" />;
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Disc': return <Disc className="w-5 h-5" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5" />;
      case 'Gauge': return <Gauge className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      case 'Wind': return <Wind className="w-5 h-5" />;
      case 'Car': return <Car className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  const handleSelectFrequent = (type: BusServiceType) => {
    setSelectedCategoryId(type.Category_ID);
    setSelectedTypeId(type.Service_Type_ID);
    setStep(3);
  };

  const validateStep = (currentStep: number): boolean => {
    if (currentStep === 1) {
      if (!selectedVehicleId) {
        toast.error('يرجى اختيار الباص للمتابعة');
        return false;
      }
      if (!odometer || Number(odometer) < 0) {
        toast.error('يرجى إدخال قراءة عداد الكيلومترات الحالية');
        return false;
      }
      return true;
    }

    if (currentStep === 2) {
      if (!selectedTypeId) {
        toast.error('يرجى تحديد نوع العملية أو الصيانة');
        return false;
      }
      return true;
    }

    if (currentStep === 3) {
      if (totalCost < 0) {
        toast.error('المبلغ الإجمالي غير صالح');
        return false;
      }
      return true;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => (Math.min(prev + 1, 4) as any));
    }
  };

  const handleBack = () => {
    setStep((prev) => (Math.max(prev - 1, 1) as any));
  };

  const handleSubmit = async () => {
    if (!selectedVehicleId || !selectedTypeId) {
      toast.error('بيانات الإدخال غير مكتملة');
      return;
    }

    setIsSubmitting(true);
    let driveFileResult: any = null;

    // Upload to Google Drive if file is attached
    if (invoiceFile) {
      setIsUploadingFile(true);
      try {
        const fileData = await busOperationsService.fileToBase64(invoiceFile);
        const emp = employees.find(e => e.EmployeeID === selectedEmployeeId || e.EmployeeCode === selectedEmployeeId);
        
        const professionalFileName = busOperationsService.generateInvoiceFileName({
          date: operationDate,
          employeeCode: emp?.EmployeeCode,
          employeeName: emp?.NameAR || emp?.NameEN,
          busPlateOrId: selectedVehicle?.Plate_Number || selectedVehicleId,
          serviceName: selectedType?.Service_Name_AR || 'عملية_باص',
          invoiceNo: invoiceNo || undefined,
          extension: invoiceFile.name.split('.').pop() || 'pdf',
        });

        const uploadRes = await busOperationsService.uploadInvoiceToDrive({
          fileBase64: fileData.base64,
          fileName: professionalFileName,
          mimeType: fileData.mimeType,
          Vehicle_ID: selectedVehicleId,
          CompanyID: companyId,
          metadata: {
            employeeNumber: emp?.EmployeeCode || selectedEmployeeId,
            employeeName: emp?.NameAR || emp?.NameEN || selectedVehicle?.Primary_Driver_Name,
            busIdentifier: selectedVehicleId,
            plateNumber: selectedVehicle?.Plate_Number,
            serviceType: selectedType?.Service_Name_AR,
            invoiceNumber: invoiceNo,
            operationDate: operationDate,
            amount: totalCost,
            workshop: workshop || supplier,
          },
        });

        if (uploadRes.success && uploadRes.data) {
          driveFileResult = uploadRes.data;
          setUploadedDriveData(driveFileResult);
        }
      } catch (err) {
        console.error('Invoice upload error:', err);
        toast.error('حدث تحذير أثناء رفع الفاتورة، سيتم حفظ العملية محلياً');
      } finally {
        setIsUploadingFile(false);
      }
    }

    // Dynamic fields summary
    const dynamicFieldsData: Record<string, any> = {};
    if (selectedType?.fieldConfig?.hasOilDetails) {
      dynamicFieldsData.oilBrand = oilBrand;
      dynamicFieldsData.oilFilterReplaced = oilFilterReplaced;
    }
    if (selectedType?.fieldConfig?.hasTireDetails) {
      dynamicFieldsData.tirePosition = tirePosition;
      dynamicFieldsData.tireSize = tireSize;
      dynamicFieldsData.tireBrand = tireBrand;
    }
    if (selectedType?.fieldConfig?.hasFuelDetails) {
      dynamicFieldsData.fuelType = fuelType;
      dynamicFieldsData.gasStation = gasStation;
    }
    if (selectedType?.fieldConfig?.hasAirConditioning) {
      dynamicFieldsData.freonType = freonType;
    }

    const empObj = employees.find(e => e.EmployeeID === selectedEmployeeId || e.EmployeeCode === selectedEmployeeId);

    const logPayload: Partial<BusServiceLog> = {
      CompanyID: companyId,
      Vehicle_ID: selectedVehicleId,
      Employee_ID: selectedEmployeeId || selectedVehicle?.Assigned_Employee_ID || '',
      Employee_Name: empObj?.NameAR || empObj?.NameEN || selectedVehicle?.Primary_Driver_Name || '',
      Category_ID: selectedCategoryId,
      Category_Name: selectedCategory?.Category_Name_AR || '',
      Service_Type_ID: selectedTypeId,
      Service_Name: selectedType?.Service_Name_AR || '',
      Operation_Date: operationDate,
      Odometer: Number(odometer) || 0,
      Quantity: Number(quantity) || 0,
      Unit: unit,
      Unit_Price: Number(unitPrice) || 0,
      Parts_Cost: Number(partsCost) || 0,
      Labor_Cost: Number(laborCost) || 0,
      Additional_Cost: Number(additionalCost) || 0,
      Total_Cost: Number(totalCost) || 0,
      Workshop: workshop,
      Supplier: supplier,
      Invoice_No: invoiceNo,
      Payment_Method: paymentMethod,
      Next_Service_Date: nextServiceDate,
      Next_Service_Odometer: nextServiceOdometer ? Number(nextServiceOdometer) : undefined,
      Issue_Description: issueDescription,
      Action_Taken: actionTaken,
      Notes: notes,
      dynamicFields: dynamicFieldsData,
      Invoice_File_ID: driveFileResult?.fileId || '',
      Invoice_File_Name: driveFileResult?.fileName || (invoiceFile ? invoiceFile.name : ''),
      Invoice_Drive_URL: driveFileResult?.driveUrl || '',
      Invoice_Mime_Type: driveFileResult?.mimeType || (invoiceFile ? invoiceFile.type : ''),
      Created_By: user?.name || user?.email || 'USER',
    };

    try {
      const res = await busOperationsService.addServiceLog(logPayload);
      if (res.success) {
        toast.success(res.message || 'تم تسجيل وأرشفة عملية الباص بنجاح');
        onSuccess();
        onClose();
      } else {
        toast.error('حدث خطأ أثناء حفظ العملية');
      }
    } catch (err: any) {
      toast.error(err?.message || 'فشل في حفظ العملية');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 shadow-inner">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">الإدخال السريع لعمليات الباصات</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Dynamic Catalog & Drive
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                تسجيل ومتابعة صيانة، وقود، إطارات، وخدمات الباصات وأرشفة الفواتير تلقائياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Indicator */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 1 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>1</span>
            <span className={step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : ''}>الباص والعداد</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 rotate-180" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 2 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>2</span>
            <span className={step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : ''}>نوع العملية</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 rotate-180" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 3 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>3</span>
            <span className={step >= 3 ? 'text-indigo-600 dark:text-indigo-400' : ''}>تفاصيل التكاليف</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300 rotate-180" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${step >= 4 ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>4</span>
            <span className={step >= 4 ? 'text-indigo-600 dark:text-indigo-400' : ''}>أرشفة الفاتورة والتأكيد</span>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* ===================================================
              STEP 1: SELECT BUS, DRIVER & ODOMETER
             =================================================== */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Bus Selection Grid / Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  اختر الباص <span className="text-rose-500">*</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {vehicles.map((v) => {
                    const isSelected = v.Vehicle_ID === selectedVehicleId;
                    return (
                      <button
                        key={v.Vehicle_ID}
                        type="button"
                        onClick={() => setSelectedVehicleId(v.Vehicle_ID)}
                        className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono font-black text-sm text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                            {v.Plate_Number || 'بدون لوحة'}
                          </span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                            {v.Brand || v.Make} {v.Model} {v.Year ? `(${v.Year})` : ''}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                            <span>السائق: {v.Primary_Driver_Name || v.Assigned_User_Name || 'غير معين'}</span>
                            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
                              {(v.Current_Odometer || 0).toLocaleString()} كم
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Bus Overview Card */}
              {selectedVehicle && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500">الباص المختار</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      {selectedVehicle.Brand} {selectedVehicle.Model} ({selectedVehicle.Plate_Number})
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500">نوع الوقود / السعة</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {selectedVehicle.Fuel_Type || 'ديزل'} / {selectedVehicle.Tank_Capacity || 0} لتر
                    </span>
                  </div>
                  <div>
                    <span className="block text-[11px] font-medium text-slate-500">آخر قراءة للعداد</span>
                    <span className="text-xs font-bold text-indigo-600 font-mono">
                      {(selectedVehicle.Current_Odometer || 0).toLocaleString()} كم
                    </span>
                  </div>
                </div>
              )}

              {/* Operation Date & Odometer & Driver Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    تاريخ العملية <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={operationDate}
                    onChange={(e) => setOperationDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                    قراءة العداد الحالية (كم) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={odometer}
                    onChange={(e) => setOdometer(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 145200"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    السائق / الموظف المنفذ
                  </label>
                  <select
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">سائق الباص الافتراضي / غير محدد</option>
                    {employees.map((emp) => (
                      <option key={emp.EmployeeID} value={emp.EmployeeID}>
                        {emp.NameAR || emp.NameEN} ({emp.EmployeeCode || 'EMP'}) - {emp.JobTitle || 'سائق'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quick Picks for Frequent Operations */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  اختصارات العمليات الأكثر تكراراً (اختيار فوري)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {frequentServices.map((freq) => (
                    <button
                      key={freq.Service_Type_ID}
                      type="button"
                      onClick={() => handleSelectFrequent(freq)}
                      className="p-3 rounded-xl border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 text-right transition-all group"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                          سريع
                        </span>
                        <ArrowLeft className="w-3.5 h-3.5 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {freq.Service_Name_AR}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              STEP 2: CATEGORY & SERVICE TYPE SELECTION
             =================================================== */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Category Selection Cards */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                  1. حدد التصنيف الرئيسي للعملية:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {categories.map((cat) => {
                    const isSelected = cat.Category_ID === selectedCategoryId;
                    return (
                      <button
                        key={cat.Category_ID}
                        type="button"
                        onClick={() => {
                          setSelectedCategoryId(cat.Category_ID);
                          // If current type doesn't belong to this category, reset type
                          if (selectedType && selectedType.Category_ID !== cat.Category_ID) {
                            setSelectedTypeId('');
                          }
                        }}
                        className={`p-3.5 rounded-2xl border text-right transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-indigo-200 dark:hover:border-indigo-900'
                        }`}
                      >
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-indigo-600'}`}>
                          {getCategoryIcon(cat.Icon)}
                        </div>
                        <span className="text-xs font-bold leading-tight">
                          {cat.Category_Name_AR}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Service Subtypes List */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    2. اختر العملية الفرعية المحددة:
                  </label>
                  <input
                    type="text"
                    placeholder="بحث سريع في العمليات..."
                    value={serviceSearchTerm}
                    onChange={(e) => setServiceSearchTerm(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs w-full sm:w-64"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-64 overflow-y-auto p-1">
                  {filteredServiceTypes.map((type) => {
                    const isSelected = type.Service_Type_ID === selectedTypeId;
                    return (
                      <button
                        key={type.Service_Type_ID}
                        type="button"
                        onClick={() => setSelectedTypeId(type.Service_Type_ID)}
                        className={`p-3 rounded-xl border text-right transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500/20 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                          <span className="text-xs font-semibold">{type.Service_Name_AR}</span>
                        </div>
                        {type.Is_Frequent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            شائع
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              STEP 3: DYNAMIC FORM FIELDS & COST BREAKDOWN
             =================================================== */}
          {step === 3 && selectedType && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Selected Operation Header Tag */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white">
                    {getCategoryIcon(selectedCategory?.Icon || 'Wrench')}
                  </div>
                  <div>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
                      {selectedCategory?.Category_Name_AR}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      {selectedType.Service_Name_AR}
                    </h4>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                >
                  تغيير العملية
                </button>
              </div>

              {/* DYNAMIC FIELD SECTION: OIL CHANGE */}
              {selectedType.fieldConfig?.hasOilDetails && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-500" />
                    مواصفات زيت الباص والفلتر
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        نوع وماركة الزيت
                      </label>
                      <select
                        value={oilBrand}
                        onChange={(e) => setOilBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        <option value="بترومين 15W-40 ديزل ثقيل">بترومين 15W-40 ديزل ثقيل</option>
                        <option value="سوبر جي تي (Super GT) 20W-50">سوبر جي تي 20W-50</option>
                        <option value="كاسترول ماجناتيك ديزل 10W-40">كاسترول ماجناتيك ديزل 10W-40</option>
                        <option value="موبيل دلفاك 15W-40">موبيل دلفاك 15W-40</option>
                        <option value="شل ريميولا R4 15W-40">شل ريميولا R4 15W-40</option>
                        <option value="فوكس تيتان ديزل 15W-40">فوكس تيتان ديزل 15W-40</option>
                        <option value="تويوتا أصلي 15W-40">تويوتا أصلي 15W-40</option>
                        <option value="نوع آخر">نوع آخر</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الكمية (باللتر)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                        placeholder="مثال: 8.5"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        سعر اللتر (ر.س)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="مثال: 22"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                      <input
                        type="checkbox"
                        checked={oilFilterReplaced}
                        onChange={(e) => setOilFilterReplaced(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      تم تغيير فلتر الزيت (السيفون) مع التبديل
                    </label>
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELD SECTION: TIRES */}
              {selectedType.fieldConfig?.hasTireDetails && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Disc className="w-4 h-4 text-emerald-500" />
                    بيانات ومواصفات الإطارات
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        موقع الإطار في الباص
                      </label>
                      <select
                        value={tirePosition}
                        onChange={(e) => setTirePosition(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        <option value="أمامي يمين">أمامي يمين (Front Right)</option>
                        <option value="أمامي يسار">أمامي يسار (Front Left)</option>
                        <option value="خلفي يمين خارجي">خلفي يمين خارجي (Rear Right Outer)</option>
                        <option value="خلفي يمين داخلي">خلفي يمين داخلي (Rear Right Inner)</option>
                        <option value="خلفي يسار خارجي">خلفي يسار خارجي (Rear Left Outer)</option>
                        <option value="خلفي يسار داخلي">خلفي يسار داخلي (Rear Left Inner)</option>
                        <option value="الإطار الاحتياطي (سبير)">الإطار الاحتياطي (سبير)</option>
                        <option value="طقم كامل (4 إطارات)">طقم كامل (4 إطارات)</option>
                        <option value="طقم كامل (6 إطارات)">طقم كامل (6 إطارات)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        مقاس الإطار
                      </label>
                      <input
                        type="text"
                        value={tireSize}
                        onChange={(e) => setTireSize(e.target.value)}
                        placeholder="مثال: 295/80R22.5"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        الماركة / الشركة المصنعة
                      </label>
                      <select
                        value={tireBrand}
                        onChange={(e) => setTireBrand(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        <option value="بريدجستون (Bridgestone)">بريدجستون (Bridgestone)</option>
                        <option value="ميشلان (Michelin)">ميشلان (Michelin)</option>
                        <option value="هانكوك (Hankook)">هانكوك (Hankook)</option>
                        <option value="يوكوهاما (Yokohama)">يوكوهاما (Yokohama)</option>
                        <option value="دنلوب (Dunlop)">دنلوب (Dunlop)</option>
                        <option value="جينيو (Jinyu)">جينيو (Jinyu)</option>
                        <option value="دبل كوين (Double Coin)">دبل كوين (Double Coin)</option>
                        <option value="أخرى">أخرى</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* DYNAMIC FIELD SECTION: FUEL REFILL */}
              {selectedType.fieldConfig?.hasFuelDetails && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Fuel className="w-4 h-4 text-amber-500" />
                    بيانات محطة وتعبئة الوقود
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        نوع الوقود
                      </label>
                      <select
                        value={fuelType}
                        onChange={(e) => setFuelType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                      >
                        <option value="ديزل">ديزل (Diesel)</option>
                        <option value="بنزين 91">بنزين 91</option>
                        <option value="بنزين 95">بنزين 95</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        كمية اللترات
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                        placeholder="مثال: 85"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        سعر اللتر (ر.س)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={unitPrice}
                        onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="مثال: 1.15"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                        اسم المحطة / المورد
                      </label>
                      <input
                        type="text"
                        value={gasStation}
                        onChange={(e) => setGasStation(e.target.value)}
                        placeholder="مثال: ساسكو، الدريس..."
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* COST BREAKDOWN (PARTS + LABOR + TOTAL) */}
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                    هيكل التكاليف والمبلغ الإجمالي
                  </h5>
                  <span className="text-xs text-slate-400 font-medium">العملة: ر.س (SAR)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      قيمة قطع الغيار / المواد
                    </label>
                    <input
                      type="number"
                      value={partsCost}
                      onChange={(e) => setPartsCost(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      أجرة اليد / شغل الورشة
                    </label>
                    <input
                      type="number"
                      value={laborCost}
                      onChange={(e) => setLaborCost(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                      تكاليف إضافية / ضريبة
                    </label>
                    <input
                      type="number"
                      value={additionalCost}
                      onChange={(e) => setAdditionalCost(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                      الإجمالي النهائي المحسوب
                    </span>
                    <div className="flex items-baseline gap-1 text-emerald-800 dark:text-emerald-200">
                      <span className="text-xl font-black font-mono">{totalCost.toLocaleString()}</span>
                      <span className="text-[10px] font-bold">ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Invoicing, Workshop & Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      اسم الورشة أو المركز
                    </label>
                    <input
                      type="text"
                      value={workshop}
                      onChange={(e) => setWorkshop(e.target.value)}
                      placeholder="مثال: ورشة الأمانة المركزية"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      رقم الفاتورة الورقية / الضريبية
                    </label>
                    <input
                      type="text"
                      value={invoiceNo}
                      onChange={(e) => setInvoiceNo(e.target.value)}
                      placeholder="مثال: INV-9842"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      طريقة السداد
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    >
                      <option value="CASH">نقداً (كاش)</option>
                      <option value="CARD">شبكة / بطاقة مدى</option>
                      <option value="COMPANY_ACCOUNT">عهدة الشركة / بطاقة البنزين</option>
                      <option value="BANK_TRANSFER">تحويل بنكي</option>
                      <option value="CREDIT">آجل / حساب الورشة</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* NEXT SERVICE REMINDER & DIAGNOSTIC NOTES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 space-y-3">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    تذكير الصيانة الدورية القادمة
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">عند قراءة عداد (كم)</label>
                      <input
                        type="number"
                        value={nextServiceOdometer}
                        onChange={(e) => setNextServiceOdometer(e.target.value ? Number(e.target.value) : '')}
                        placeholder={odometer ? String(Number(odometer) + 5000) : 'مثال: 150000'}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 font-bold mb-1">أو بحلول تاريخ</label>
                      <input
                        type="date"
                        value={nextServiceDate}
                        onChange={(e) => setNextServiceDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  </div>
                  {odometer && (
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setNextServiceOdometer(Number(odometer) + 5000)}
                        className="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold"
                      >
                        + 5,000 كم
                      </button>
                      <button
                        type="button"
                        onClick={() => setNextServiceOdometer(Number(odometer) + 10000)}
                        className="px-2 py-1 rounded-md bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold"
                      >
                        + 10,000 كم
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    وصف العطل أو الملاحظات الفنية
                  </label>
                  <textarea
                    rows={4}
                    value={notes || issueDescription}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      setIssueDescription(e.target.value);
                    }}
                    placeholder="اكتب أي تفاصيل إضافية عن حالة الباص، أسباب العطل، أو توصيات الورشة..."
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ===================================================
              STEP 4: INVOICE ARCHIVING TO DRIVE & FINAL CONFIRMATION
             =================================================== */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary of record */}
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-700 pb-2">
                  <span className="text-xs font-bold text-slate-500">ملخص العملية قبل الأرشفة</span>
                  <span className="text-xs font-bold text-indigo-600 font-mono">
                    {operationDate}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">الباص</span>
                    <strong className="text-slate-900 dark:text-white">
                      {selectedVehicle?.Plate_Number} ({selectedVehicle?.Brand})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">العملية</span>
                    <strong className="text-indigo-600 dark:text-indigo-400">
                      {selectedType?.Service_Name_AR}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">عداد الكيلومترات</span>
                    <strong className="font-mono text-slate-800 dark:text-slate-200">
                      {Number(odometer).toLocaleString()} كم
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">المبلغ الإجمالي</span>
                    <strong className="text-emerald-600 font-mono font-black text-sm">
                      {totalCost.toLocaleString()} ر.س
                    </strong>
                  </div>
                </div>
              </div>

              {/* GOOGLE DRIVE INVOICE UPLOAD BOX */}
              <div className="p-5 rounded-3xl border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>

                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">
                    أرشفة الفاتورة أو الإيصال في Google Drive
                  </h4>
                  <p className="text-xs text-slate-500">
                    سيتم حفظ الملف وتسميته برقم الباص والتاريخ واسم السائق تلقائياً في مجلد:
                    <span className="block font-mono text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                      NMO ERP / Bus Invoices / {new Date().getFullYear()} / {String(new Date().getMonth() + 1).padStart(2, '0')}
                    </span>
                  </p>
                </div>

                {invoiceFile ? (
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg mx-auto flex items-center justify-between gap-3 text-right">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 shrink-0">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {invoiceFile.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {(invoiceFile.size / 1024).toFixed(1)} KB • {invoiceFile.type || 'ملف'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setInvoiceFile(null);
                        setInvoicePreviewUrl(null);
                      }}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                      title="إلغاء الملف"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all">
                      <Upload className="w-4 h-4" />
                      اختيار ملف الفاتورة (PDF / صورة)
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    <span className="block text-[11px] text-slate-400 mt-2">
                      يمكنك التقاط صورة الفاتورة بكاميرا الهاتف أو رفع ملف PDF (اختياري)
                    </span>
                  </div>
                )}

                {invoicePreviewUrl && (
                  <div className="mt-3 max-w-xs mx-auto">
                    <img
                      src={invoicePreviewUrl}
                      alt="معاينة الفاتورة"
                      className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting || isUploadingFile}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
                السابق
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isUploadingFile}
              className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 text-xs font-bold transition-colors disabled:opacity-50"
            >
              إلغاء
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition-all"
              >
                التالي
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isUploadingFile}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isSubmitting || isUploadingFile ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري الحفظ والأرشفة...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    حفظ وأرشفة العملية
                  </>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
