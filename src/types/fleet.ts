export type OperationalStatus = 
  | 'ACTIVE'          // نشطة
  | 'STOPPED'         // متوقفة
  | 'IN_MAINTENANCE'   // في الصيانة
  | 'NOT_READY'       // غير جاهزة
  | 'ACCIDENT'        // حادث
  | 'RESERVE'         // احتياط
  | 'SOLD'            // مباعة
  | 'ARCHIVED';       // مؤرشفة

export type VehicleType = 
  | 'SEDAN'           // سيارة صغيرة / سيدان
  | 'SUV'             // جيب / دفع رباعي
  | 'PICKUP'          // ونيت / بيك آب
  | 'VAN'             // فان بضائع
  | 'BUS'             // باص ركاب
  | 'TRUCK'           // شاحنة / دينا
  | 'MOTORCYCLE'      // دراجة نارية
  | 'OTHER';          // أخرى

export type FuelType = 
  | 'GASOLINE_91'     // بنزين 91
  | 'GASOLINE_95'     // بنزين 95
  | 'DIESEL'          // ديزل
  | 'ELECTRIC'        // كهرباء
  | 'HYBRID';         // هجين

export type OwnershipType = 
  | 'OWNED'           // ملك الشركة
  | 'LEASED'          // إيجار منتهي بالتمليك
  | 'RENTED'          // مستأجرة
  | 'CONTRACT';       // عقد تشغيل

export type MaintenanceStatus = 
  | 'OPEN'            // مفتوحة
  | 'SCHEDULED'       // مجدولة
  | 'IN_PROGRESS'     // قيد التنفيذ
  | 'WAITING_PARTS'   // بانتظار قطعة
  | 'COMPLETED'       // مكتملة
  | 'CANCELLED';      // ملغاة

export type AccidentSeverity = 
  | 'MINOR'           // خفيف
  | 'MODERATE'        // متوسط
  | 'SEVERE'          // شديد
  | 'CRITICAL';       // جسيم

export type AccidentStatus = 
  | 'OPEN'            // مفتوح
  | 'IN_PROGRESS'     // تحت المعالجة
  | 'WAITING_INSURANCE' // بانتظار التأمين
  | 'WAITING_REPAIR'  // بانتظار الإصلاح
  | 'CLOSED';         // مغلق

export type InsuranceStatus = 
  | 'VALID'           // ساري
  | 'EXPIRING_SOON'   // قريب الانتهاء
  | 'EXPIRED';        // منتهي

export type DocumentType = 
  | 'REGISTRATION'    // استمارة
  | 'INSURANCE'       // تأمين
  | 'INSPECTION'      // فحص دوري
  | 'CONTRACT'        // عقود
  | 'INVOICE'         // فواتير
  | 'PHOTO'           // صور
  | 'ACCIDENT_REPORT' // تقارير حوادث
  | 'MAINT_REPORT'    // مستندات صيانة
  | 'OTHER';          // أخرى

export type AlertPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface DriverAssignment {
  assignmentId: string;
  driverId: string;
  driverName?: string;
  role: 'PRIMARY' | 'BACKUP' | 'SUPERVISOR';
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'ENDED';
  notes?: string;
}

export interface Vehicle {
  // Primary Keys & Multi-tenancy
  Vehicle_ID: string;
  CompanyID: string;

  // 1. Ownership & Usage (بيانات الملكية والاستخدام)
  Owner_Name?: string;             // المالك
  Assigned_User_Name?: string;     // المستخدم
  Owner_ID_Number?: string;        // هوية المالك
  User_ID_Number?: string;         // هوية المستخدم
  Assigned_Employee_ID?: string;   // الموظف المرتبط من نظام الموظفين (Employees.EmployeeID)

  // 2. Vehicle Identification & Specs (بيانات تعريف المركبة)
  VIN_Chassis_Number?: string;     // رقم الهيكل
  VIN?: string;                    // Alias for VIN_Chassis_Number
  Serial_Number?: string;          // الرقم التسلسلي
  Plate_Number: string;            // رقم اللوحة
  Brand: string;                   // الماركة
  Model: string;                   // الطراز
  Manufacturing_Year?: number;     // سنة الصنع
  Year: number;                    // Alias for backward compatibility
  Color: string;                   // اللون
  Registration_Type?: string;      // نوع التسجيل (خصوصي، نقل عام، نقل خاص، إلخ)
  Load_Capacity?: number;          // الحمولة (كجم / طن)
  Vehicle_Weight?: number;         // الوزن (كجم)
  
  // Legacy / Additional Specs
  Vehicle_Type?: VehicleType;
  Fuel_Type?: FuelType;
  Avg_km_per_L?: number;
  Registration_Number?: string;
  Contract_Company?: string;
  Ownership_Type?: OwnershipType;

  // 3. Document Expiries (تواريخ الوثائق)
  Registration_Expiry?: string;           // انتهاء الاستمارة
  License_Expiry?: string;                // Alias for Registration_Expiry
  Insurance_Expiry?: string;              // انتهاء التأمين
  Periodic_Inspection_Expiry?: string;   // انتهاء الفحص الدوري
  Inspection_Expiry?: string;             // Alias for Periodic_Inspection_Expiry

  // 4. Operational & ERP Status (البيانات التشغيلية)
  Operational_Status: OperationalStatus;
  Current_Odometer: number;
  Initial_Odometer?: number;
  Readiness_Index: number; // 0 - 100
  Readiness_Score?: number;
  Readiness_Reasons?: string[];

  // Drivers & Assignments
  Primary_Driver_ID?: string;
  Primary_Driver_Name?: string;
  Backup_Driver_ID?: string;
  Backup_Driver_Name?: string;
  Supervisor_ID?: string;
  Supervisor_Name?: string;
  Assignment_Start_Date?: string;
  Assignment_End_Date?: string;
  Assignment_History?: DriverAssignment[];

  // Derived Fields & Cost Metrics
  Next_Maintenance_Date?: string;
  Next_Maint_Date?: string;
  Next_Maint_Odometer?: number;
  Open_Incidents?: number;
  Fuel_Cost_MTD?: number;
  Maint_Cost_MTD?: number;
  Maintenance_Cost_MTD?: number;
  Accident_Cost_MTD?: number;
  Other_Cost_MTD?: number;
  Total_Cost_MTD?: number;

  Notes?: string;
  Image_URL?: string;
  CreatedAt: string;
  CreatedBy?: string;
  UpdatedAt: string;
  UpdatedBy?: string;
  ArchivedAt?: string;
  ArchivedBy?: string;
  IsDeleted?: boolean;
  DeletedAt?: string;
  DeletedBy?: string;
}

export interface FuelLog {
  Fuel_ID: string;
  Vehicle_ID: string;
  CompanyID: string;
  Driver_Employee_ID?: string;
  Driver_Name?: string;
  Date: string;
  Odometer: number;
  Liters: number;
  Cost: number;
  Price_Per_Liter: number;
  Station?: string;
  Invoice_No?: string;
  Payment_Method?: 'CASH' | 'CARD' | 'PETROL_CARD' | 'COMPANY_ACCOUNT';
  Notes?: string;
  Attachment?: string;

  // Computed fields
  Km_Since_Last?: number;
  Cost_Per_Km?: number;
  Actual_Km_Per_Liter?: number;
  Fuel_Efficiency_Variance?: number; // % variance from vehicle average

  CreatedAt: string;
  CreatedBy?: string;
  IsDeleted?: boolean;
}

export interface MaintenanceLog {
  Maintenance_ID: string;
  Vehicle_ID: string;
  CompanyID: string;
  Maintenance_Type: string;
  Date: string;
  Odometer: number;
  Cost: number;
  Next_Maintenance_Date?: string;
  Next_Maintenance_Odometer?: number;
  Status: MaintenanceStatus;
  Workshop?: string;
  Technician?: string;
  Invoice_No?: string;
  Notes?: string;
  Attachments?: string[];
  CreatedAt: string;
  CreatedBy?: string;
  UpdatedAt?: string;
  UpdatedBy?: string;
  IsDeleted?: boolean;
}

export interface InsuranceLog {
  Policy_ID: string;
  Vehicle_ID: string;
  CompanyID: string;
  Insurance_Company: string;
  Policy_Number: string;
  Insurance_Type: 'COMPREHENSIVE' | 'THIRD_PARTY'; // شامل / ضد الغير
  Start_Date: string;
  End_Date: string;
  Premium_Cost: number;
  Deductible?: number;
  Status: InsuranceStatus;
  Notes?: string;
  Attachments?: string[];
  CreatedAt: string;
  CreatedBy?: string;
  IsDeleted?: boolean;
}

export interface ComplianceLog {
  Record_ID: string;
  Vehicle_ID: string;
  CompanyID: string;
  Inspection_Date: string;
  Inspection_Expiry: string;
  Inspection_Result: 'PASSED' | 'FAILED' | 'CONDITIONAL';
  License_Start: string;
  License_Expiry: string;
  Registration_Number?: string;
  Cost?: number;
  Notes?: string;
  Attachments?: string[];
  CreatedAt: string;
  CreatedBy?: string;
  IsDeleted?: boolean;
}

export interface AccidentLog {
  Accident_ID: string;
  Vehicle_ID: string;
  CompanyID: string;
  Driver_Employee_ID?: string;
  Driver_Name?: string;
  Date: string;
  Time?: string;
  Location?: string;
  Severity: AccidentSeverity;
  Cost?: number;
  Status: AccidentStatus;
  Description: string;
  Police_Report_No?: string;
  Insurance_Claim_No?: string;
  Other_Party_Details?: string;
  Responsibility_Percentage?: number; // 0 - 100%
  Notes?: string;
  Attachments?: string[];
  CreatedAt: string;
  CreatedBy?: string;
  IsDeleted?: boolean;
}

export interface VehicleDocument {
  Document_ID: string;
  Vehicle_ID: string;
  CompanyID: string;
  Document_Type: DocumentType;
  File_Name: string;
  File_URL: string;
  Issue_Date?: string;
  Expiry_Date?: string;
  Notes?: string;
  UploadedBy?: string;
  UploadedAt: string;
  IsDeleted?: boolean;
}

export interface FleetNotification {
  id: string;
  vehicleId: string;
  plateNumber: string;
  type: 'INSURANCE' | 'INSPECTION' | 'LICENSE' | 'MAINTENANCE' | 'DOCUMENT' | 'ACCIDENT' | 'READINESS' | 'DRIVER_INACTIVE';
  title: string;
  description: string;
  severity: AlertPriority;
  dueDate?: string;
  daysRemaining?: number;
  isRead: boolean;
  createdAt: string;
}

export interface FleetKPIs {
  totalVehicles: number;
  activeVehicles: number;
  inMaintenanceVehicles: number;
  notReadyVehicles: number;
  averageReadinessIndex: number;
  fuelCostMTD: number;
  maintCostMTD: number;
  accidentCostMTD: number;
  totalFleetCostMTD: number;
  openAccidentsCount: number;
  expiringInsuranceCount: number;
  expiringInspectionCount: number;
  expiringLicenseCount: number;
  upcomingMaintenanceCount: number;
}
