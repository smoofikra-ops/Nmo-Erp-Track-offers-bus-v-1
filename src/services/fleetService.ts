import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types/responses';
import { 
  Vehicle, 
  FuelLog, 
  MaintenanceLog, 
  InsuranceLog, 
  ComplianceLog, 
  AccidentLog, 
  VehicleDocument,
  FleetKPIs,
  FleetNotification
} from '@/types/fleet';
import { 
  INITIAL_VEHICLES, 
  INITIAL_FUEL_LOGS, 
  INITIAL_MAINTENANCE_LOGS, 
  INITIAL_INSURANCE_LOGS, 
  INITIAL_COMPLIANCE_LOGS, 
  INITIAL_ACCIDENT_LOGS, 
  INITIAL_DOCUMENTS 
} from '@/data/initialFleetData';
import { 
  calculateReadinessIndex, 
  calculateMonthlyCosts, 
  calculateFuelMetrics, 
  generateFleetNotifications 
} from '@/utils/fleetCalculations';
import { archiveDb } from '@/db/archiveDb';

const STORAGE_KEYS = {
  VEHICLES: 'nmo_fleet_vehicles',
  FUEL: 'nmo_fleet_fuel_logs',
  MAINTENANCE: 'nmo_fleet_maintenance_logs',
  INSURANCE: 'nmo_fleet_insurance_logs',
  COMPLIANCE: 'nmo_fleet_compliance_logs',
  ACCIDENTS: 'nmo_fleet_accident_logs',
  DOCUMENTS: 'nmo_fleet_documents',
};

const CLEANUP_DEMO_KEY = 'nmo_fleet_demo_cleared_v1';
if (typeof window !== 'undefined') {
  if (!localStorage.getItem(CLEANUP_DEMO_KEY)) {
    localStorage.removeItem(STORAGE_KEYS.VEHICLES);
    localStorage.removeItem(STORAGE_KEYS.FUEL);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
    localStorage.removeItem(STORAGE_KEYS.INSURANCE);
    localStorage.removeItem(STORAGE_KEYS.COMPLIANCE);
    localStorage.removeItem(STORAGE_KEYS.ACCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
    localStorage.setItem(CLEANUP_DEMO_KEY, 'true');
  }
}

// Safe local storage helpers
function getStoredItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to persist to localStorage [${key}]:`, err);
  }
}

// Memory / Cache state initialized from localStorage or seeds
let vehiclesCache: Vehicle[] = getStoredItem(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES);
let fuelCache: FuelLog[] = getStoredItem(STORAGE_KEYS.FUEL, INITIAL_FUEL_LOGS);
let maintCache: MaintenanceLog[] = getStoredItem(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_LOGS);
let insuranceCache: InsuranceLog[] = getStoredItem(STORAGE_KEYS.INSURANCE, INITIAL_INSURANCE_LOGS);
let complianceCache: ComplianceLog[] = getStoredItem(STORAGE_KEYS.COMPLIANCE, INITIAL_COMPLIANCE_LOGS);
let accidentCache: AccidentLog[] = getStoredItem(STORAGE_KEYS.ACCIDENTS, INITIAL_ACCIDENT_LOGS);
let docsCache: VehicleDocument[] = getStoredItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);

// Recalculate vehicle metrics based on all sub-logs
function refreshVehicleCalculations(vehicle: Vehicle): Vehicle {
  const vInsurance = insuranceCache.filter(i => !i.IsDeleted && i.Vehicle_ID === vehicle.Vehicle_ID);
  const vCompliance = complianceCache.filter(c => !c.IsDeleted && c.Vehicle_ID === vehicle.Vehicle_ID);
  const vMaint = maintCache.filter(m => !m.IsDeleted && m.Vehicle_ID === vehicle.Vehicle_ID);
  const vAccidents = accidentCache.filter(a => !a.IsDeleted && a.Vehicle_ID === vehicle.Vehicle_ID);
  const vFuel = fuelCache.filter(f => !f.IsDeleted && f.Vehicle_ID === vehicle.Vehicle_ID);

  // Latest Insurance Expiry
  const latestIns = [...vInsurance].sort((a, b) => new Date(b.End_Date).getTime() - new Date(a.End_Date).getTime())[0];
  const insuranceExpiry = latestIns?.End_Date || vehicle.Insurance_Expiry;

  // Latest Compliance Expiries
  const latestComp = [...vCompliance].sort((a, b) => new Date(b.Inspection_Expiry).getTime() - new Date(a.Inspection_Expiry).getTime())[0];
  const inspectionExpiry = latestComp?.Inspection_Expiry || vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry;
  const registrationExpiry = latestComp?.License_Expiry || vehicle.Registration_Expiry || vehicle.License_Expiry;

  // Next Maintenance
  const nextMaint = [...vMaint]
    .filter(m => m.Next_Maintenance_Date && m.Status !== 'COMPLETED' && m.Status !== 'CANCELLED')
    .sort((a, b) => new Date(a.Next_Maintenance_Date!).getTime() - new Date(b.Next_Maintenance_Date!).getTime())[0];
  const nextMaintDate = nextMaint?.Next_Maintenance_Date || vehicle.Next_Maintenance_Date || vehicle.Next_Maint_Date;
  const nextMaintOdometer = nextMaint?.Next_Maintenance_Odometer || vehicle.Next_Maint_Odometer;

  // Max Odometer
  const odometers = [
    vehicle.Initial_Odometer || 0,
    vehicle.Current_Odometer || 0,
    ...vFuel.map(f => Number(f.Odometer) || 0),
    ...vMaint.map(m => Number(m.Odometer) || 0),
  ];
  const currentOdometer = Math.max(...odometers);

  // Open Incidents
  const openAccidents = vAccidents.filter(a => a.Status !== 'CLOSED');

  // Readiness Index
  const readiness = calculateReadinessIndex(
    { 
      ...vehicle, 
      Insurance_Expiry: insuranceExpiry, 
      Inspection_Expiry: inspectionExpiry, 
      Periodic_Inspection_Expiry: inspectionExpiry,
      Registration_Expiry: registrationExpiry,
      License_Expiry: registrationExpiry, 
      Next_Maint_Date: nextMaintDate,
      Next_Maintenance_Date: nextMaintDate,
    },
    vInsurance,
    vCompliance,
    vMaint,
    vAccidents
  );

  // Monthly Costs
  const costs = calculateMonthlyCosts(vehicle.Vehicle_ID, vFuel, vMaint, vAccidents);

  return {
    ...vehicle,
    Manufacturing_Year: vehicle.Manufacturing_Year || vehicle.Year,
    Year: vehicle.Year || vehicle.Manufacturing_Year || new Date().getFullYear(),
    VIN_Chassis_Number: vehicle.VIN_Chassis_Number || vehicle.VIN || '',
    VIN: vehicle.VIN || vehicle.VIN_Chassis_Number || '',
    Registration_Expiry: registrationExpiry,
    License_Expiry: registrationExpiry,
    Insurance_Expiry: insuranceExpiry,
    Periodic_Inspection_Expiry: inspectionExpiry,
    Inspection_Expiry: inspectionExpiry,
    Current_Odometer: currentOdometer,
    Next_Maintenance_Date: nextMaintDate,
    Next_Maint_Date: nextMaintDate,
    Next_Maint_Odometer: nextMaintOdometer,
    Open_Incidents: openAccidents.length,
    Readiness_Index: readiness.score,
    Readiness_Score: readiness.score,
    Readiness_Reasons: readiness.reasons,
    Fuel_Cost_MTD: costs.fuelCostMTD,
    Maint_Cost_MTD: costs.maintCostMTD,
    Maintenance_Cost_MTD: costs.maintCostMTD,
    Accident_Cost_MTD: costs.accidentCostMTD,
    Total_Cost_MTD: costs.totalCostMTD,
    UpdatedAt: new Date().toISOString(),
  };
}

export const fleetService = {
  // ==========================
  // VEHICLES CRUD
  // ==========================
  getVehicles: async (companyId: string = 'COM-0001', includeDeleted: boolean = false): Promise<ApiResponse<Vehicle[]>> => {
    // Attempt backend sync in parallel, fallback gracefully to cached records
    try {
      ApiClient.post('GET_VEHICLES', { CompanyID: companyId }).catch(() => {
        // Backend optional fallback
      });
    } catch {}

    const list = vehiclesCache
      .filter(v => (v.CompanyID === companyId || !v.CompanyID) && (includeDeleted || !v.IsDeleted))
      .map(refreshVehicleCalculations);

    // Save updated calculated state
    vehiclesCache = vehiclesCache.map(v => {
      const match = list.find(l => l.Vehicle_ID === v.Vehicle_ID);
      return match || v;
    });
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    return {
      success: true,
      data: list,
      message: 'Vehicles retrieved successfully',
      timestamp: new Date().toISOString(),
    };
  },

  getVehicleById: async (vehicleId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<Vehicle>> => {
    const list = await fleetService.getVehicles(companyId, true);
    const vehicle = list.data?.find(v => v.Vehicle_ID === vehicleId);
    if (!vehicle) {
      return {
        success: false,
        data: null as any,
        message: 'المركبة غير موجودة',
        error: { code: 'NOT_FOUND', details: 'Vehicle ID not found' },
        timestamp: new Date().toISOString(),
      };
    }
    return {
      success: true,
      data: vehicle,
      message: 'Vehicle retrieved',
      timestamp: new Date().toISOString(),
    };
  },

  createVehicle: async (vehicleData: Partial<Vehicle>, companyId: string = 'COM-0001'): Promise<ApiResponse<Vehicle>> => {
    const now = new Date().toISOString();
    const vehicleId = vehicleData.Vehicle_ID || `VEH-${String(Date.now()).slice(-4)}`;

    const yr = Number(vehicleData.Manufacturing_Year || vehicleData.Year) || new Date().getFullYear();
    const vinVal = vehicleData.VIN_Chassis_Number || vehicleData.VIN || '';

    const newVehicle: Vehicle = {
      Vehicle_ID: vehicleId,
      CompanyID: companyId,
      
      // Ownership & Usage
      Owner_Name: vehicleData.Owner_Name || '',
      Assigned_User_Name: vehicleData.Assigned_User_Name || vehicleData.Primary_Driver_Name || '',
      Owner_ID_Number: vehicleData.Owner_ID_Number || '',
      User_ID_Number: vehicleData.User_ID_Number || '',
      Assigned_Employee_ID: vehicleData.Assigned_Employee_ID || vehicleData.Primary_Driver_ID || '',

      // Identification & Specs
      VIN_Chassis_Number: vinVal,
      VIN: vinVal,
      Serial_Number: vehicleData.Serial_Number || '',
      Plate_Number: vehicleData.Plate_Number || 'بدون لوحة',
      Brand: vehicleData.Brand || 'غير محدد',
      Model: vehicleData.Model || 'غير محدد',
      Manufacturing_Year: yr,
      Year: yr,
      Color: vehicleData.Color || 'أبيض',
      Registration_Type: vehicleData.Registration_Type || 'خصوصي',
      Load_Capacity: Number(vehicleData.Load_Capacity) || 0,
      Vehicle_Weight: Number(vehicleData.Vehicle_Weight) || 0,

      // Expiries
      Registration_Expiry: vehicleData.Registration_Expiry || vehicleData.License_Expiry || '',
      License_Expiry: vehicleData.Registration_Expiry || vehicleData.License_Expiry || '',
      Insurance_Expiry: vehicleData.Insurance_Expiry || '',
      Periodic_Inspection_Expiry: vehicleData.Periodic_Inspection_Expiry || vehicleData.Inspection_Expiry || '',
      Inspection_Expiry: vehicleData.Periodic_Inspection_Expiry || vehicleData.Inspection_Expiry || '',

      // Operational & Status
      Vehicle_Type: vehicleData.Vehicle_Type || 'SEDAN',
      Fuel_Type: vehicleData.Fuel_Type || 'GASOLINE_91',
      Avg_km_per_L: Number(vehicleData.Avg_km_per_L) || 10,
      Registration_Number: vehicleData.Registration_Number || vehicleData.Serial_Number || '',
      Contract_Company: vehicleData.Contract_Company || '',
      Ownership_Type: vehicleData.Ownership_Type || 'OWNED',
      Operational_Status: vehicleData.Operational_Status || 'ACTIVE',
      Primary_Driver_ID: vehicleData.Assigned_Employee_ID || vehicleData.Primary_Driver_ID || '',
      Primary_Driver_Name: vehicleData.Assigned_User_Name || vehicleData.Primary_Driver_Name || '',
      Backup_Driver_ID: vehicleData.Backup_Driver_ID || '',
      Backup_Driver_Name: vehicleData.Backup_Driver_Name || '',
      Supervisor_ID: vehicleData.Supervisor_ID || '',
      Supervisor_Name: vehicleData.Supervisor_Name || '',
      Assignment_Start_Date: vehicleData.Assignment_Start_Date || (vehicleData.Primary_Driver_ID || vehicleData.Assigned_Employee_ID ? now.split('T')[0] : ''),
      Current_Odometer: Number(vehicleData.Current_Odometer) || 0,
      Initial_Odometer: Number(vehicleData.Current_Odometer) || 0,
      Readiness_Index: 100,
      Notes: vehicleData.Notes || '',
      Image_URL: vehicleData.Image_URL || '',
      CreatedAt: now,
      UpdatedAt: now,
      IsDeleted: false,
    };

    const calculated = refreshVehicleCalculations(newVehicle);
    vehiclesCache.unshift(calculated);
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    // Audit log
    archiveDb.auditLogs.add({
      id: 'AUDIT-' + Date.now(),
      timestamp: now,
      adminUsername: 'Current Admin',
      adminUserId: 'CURRENT_USER',
      userRole: 'ADMIN',
      deviceName: 'Web App',
      browser: 'Browser',
      os: 'Web',
      ipAddress: '127.0.0.1',
      userAgent: 'FleetManager',
      archiveReason: 'إضافة مركبة جديدة',
      recordsCount: 1,
      recordIds: [calculated.Vehicle_ID],
      entityType: 'OTHER',
      action: 'UPDATE',
    }).catch(() => {});

    // Try backend
    ApiClient.post('CREATE_VEHICLE', { CompanyID: companyId, vehicle: calculated }).catch(() => {});

    return {
      success: true,
      data: calculated,
      message: 'تم إضافة المركبة بنجاح',
      timestamp: now,
    };
  },

  updateVehicle: async (vehicleId: string, updateData: Partial<Vehicle>, companyId: string = 'COM-0001'): Promise<ApiResponse<Vehicle>> => {
    const idx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicleId);
    if (idx === -1) {
      return {
        success: false,
        data: null as any,
        message: 'المركبة غير موجودة للتعديل',
        error: { code: 'NOT_FOUND', details: 'Vehicle not found' },
        timestamp: new Date().toISOString(),
      };
    }

    const oldData = { ...vehiclesCache[idx] };
    const merged: Vehicle = {
      ...oldData,
      ...updateData,
      UpdatedAt: new Date().toISOString(),
    };

    const calculated = refreshVehicleCalculations(merged);
    vehiclesCache[idx] = calculated;
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    // Audit
    archiveDb.auditLogs.add({
      id: 'AUDIT-' + Date.now(),
      timestamp: new Date().toISOString(),
      adminUsername: 'Current Admin',
      adminUserId: 'CURRENT_USER',
      userRole: 'ADMIN',
      deviceName: 'Web App',
      browser: 'Browser',
      os: 'Web',
      ipAddress: '127.0.0.1',
      userAgent: 'FleetManager',
      archiveReason: 'تحديث بيانات مركبة',
      recordsCount: 1,
      recordIds: [vehicleId],
      entityType: 'OTHER',
      action: 'UPDATE',
    }).catch(() => {});

    ApiClient.post('UPDATE_VEHICLE', { CompanyID: companyId, vehicle: calculated }).catch(() => {});

    return {
      success: true,
      data: calculated,
      message: 'تم تحديث بيانات المركبة بنجاح',
      timestamp: new Date().toISOString(),
    };
  },

  archiveVehicle: async (vehicleId: string, companyId: string = 'COM-0001', reason: string = 'أرشفة يدوية'): Promise<ApiResponse<boolean>> => {
    const idx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicleId);
    if (idx === -1) return { success: false, data: false, message: 'المركبة غير موجودة', timestamp: new Date().toISOString() };

    const now = new Date().toISOString();
    const vehicle = vehiclesCache[idx];
    vehicle.IsDeleted = true;
    vehicle.Operational_Status = 'ARCHIVED';
    vehicle.DeletedAt = now;
    vehicle.DeletedBy = 'CURRENT_USER';

    vehiclesCache[idx] = vehicle;
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    // Add to archiveDb
    const auditId = 'AUDIT-' + Date.now();
    archiveDb.archivedRecords.add({
      id: 'ARCHIVE-' + vehicleId,
      entityType: 'OTHER',
      recordData: vehicle,
      archivedAt: now,
      archivedBy: 'CURRENT_USER',
      archiveReason: reason,
      auditLogId: auditId,
    }).catch(() => {});

    archiveDb.auditLogs.add({
      id: auditId,
      timestamp: now,
      adminUsername: 'Current Admin',
      adminUserId: 'CURRENT_USER',
      userRole: 'ADMIN',
      deviceName: 'Web App',
      browser: 'Browser',
      os: 'Web',
      ipAddress: '127.0.0.1',
      userAgent: 'FleetManager',
      archiveReason: reason,
      recordsCount: 1,
      recordIds: [vehicleId],
      entityType: 'OTHER',
      action: 'ARCHIVE',
    }).catch(() => {});

    ApiClient.post('DELETE_VEHICLE', { CompanyID: companyId, Vehicle_ID: vehicleId }).catch(() => {});

    return {
      success: true,
      data: true,
      message: 'تم أرشفة المركبة بنجاح',
      timestamp: now,
    };
  },

  deleteVehicle: async (vehicleId: string, companyId: string = 'COM-0001', reason: string = 'أرشفة يدوية'): Promise<ApiResponse<boolean>> => {
    return fleetService.archiveVehicle(vehicleId, companyId, reason);
  },

  restoreVehicle: async (vehicleId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<boolean>> => {
    const idx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicleId);
    if (idx === -1) return { success: false, data: false, message: 'المركبة غير موجودة', timestamp: new Date().toISOString() };

    const vehicle = vehiclesCache[idx];
    vehicle.IsDeleted = false;
    vehicle.Operational_Status = 'ACTIVE';
    vehicle.DeletedAt = undefined;
    vehicle.DeletedBy = undefined;
    vehicle.UpdatedAt = new Date().toISOString();

    vehiclesCache[idx] = refreshVehicleCalculations(vehicle);
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    return {
      success: true,
      data: true,
      message: 'تم استعادة المركبة من الأرشيف بنجاح',
      timestamp: new Date().toISOString(),
    };
  },

  clearAllVehicles: async (companyId: string = 'COM-0001'): Promise<ApiResponse<boolean>> => {
    // Clear in-memory caches
    vehiclesCache = [];
    fuelCache = [];
    maintCache = [];
    insuranceCache = [];
    complianceCache = [];
    accidentCache = [];
    docsCache = [];

    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.FUEL, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.INSURANCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.COMPLIANCE, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.ACCIDENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    }

    try {
      ApiClient.post('CLEAR_ALL_FLEET', { CompanyID: companyId }).catch(() => {});
    } catch {}

    return {
      success: true,
      data: true,
      message: 'تم حذف وتفريغ كافة بيانات المركبات بنجاح',
      timestamp: new Date().toISOString(),
    };
  },

  // ==========================
  // FUEL LOGS
  // ==========================
  getFuelLogs: async (vehicleId?: string, companyId: string = 'COM-0001'): Promise<ApiResponse<FuelLog[]>> => {
    let logs = fuelCache.filter(f => (f.CompanyID === companyId || !f.CompanyID) && !f.IsDeleted);
    if (vehicleId) {
      logs = logs.filter(f => f.Vehicle_ID === vehicleId);
    }
    logs.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    return { success: true, data: logs, message: 'Fuel logs retrieved', timestamp: new Date().toISOString() };
  },

  addFuelLog: async (logData: Partial<FuelLog>, companyId: string = 'COM-0001'): Promise<ApiResponse<FuelLog>> => {
    const now = new Date().toISOString();
    const fuelId = logData.Fuel_ID || `FL-${String(Date.now()).slice(-4)}`;
    
    // Find previous odometer for this vehicle
    const existingLogs = fuelCache
      .filter(f => f.Vehicle_ID === logData.Vehicle_ID && !f.IsDeleted)
      .sort((a, b) => (Number(b.Odometer) || 0) - (Number(a.Odometer) || 0));
    
    const prevOdometer = existingLogs[0]?.Odometer || 0;
    const vehicle = vehiclesCache.find(v => v.Vehicle_ID === logData.Vehicle_ID);
    const expectedAvg = vehicle?.Avg_km_per_L || 10;

    const currentOdometer = Number(logData.Odometer) || prevOdometer;
    const liters = Number(logData.Liters) || 0;
    const cost = Number(logData.Cost) || (liters * (Number(logData.Price_Per_Liter) || 2.18));
    const pricePerLiter = Number(logData.Price_Per_Liter) || (liters > 0 ? Number((cost / liters).toFixed(2)) : 2.18);

    const metrics = calculateFuelMetrics(currentOdometer, liters, cost, prevOdometer, expectedAvg);

    const newLog: FuelLog = {
      Fuel_ID: fuelId,
      Vehicle_ID: logData.Vehicle_ID || '',
      CompanyID: companyId,
      Driver_Employee_ID: logData.Driver_Employee_ID || vehicle?.Primary_Driver_ID,
      Driver_Name: logData.Driver_Name || vehicle?.Primary_Driver_Name,
      Date: logData.Date || now.split('T')[0],
      Odometer: currentOdometer,
      Liters: liters,
      Cost: cost,
      Price_Per_Liter: pricePerLiter,
      Station: logData.Station || '',
      Invoice_No: logData.Invoice_No || '',
      Payment_Method: logData.Payment_Method || 'PETROL_CARD',
      Notes: logData.Notes || '',
      Attachment: logData.Attachment || '',
      Km_Since_Last: metrics.kmSinceLast,
      Cost_Per_Km: metrics.costPerKm,
      Actual_Km_Per_Liter: metrics.actualKmPerLiter,
      Fuel_Efficiency_Variance: metrics.variancePercentage,
      CreatedAt: now,
      CreatedBy: 'CURRENT_USER',
      IsDeleted: false,
    };

    fuelCache.unshift(newLog);
    setStoredItem(STORAGE_KEYS.FUEL, fuelCache);

    // Refresh Vehicle
    if (vehicle) {
      const updatedVehicle = refreshVehicleCalculations(vehicle);
      const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicle.Vehicle_ID);
      if (vIdx !== -1) {
        vehiclesCache[vIdx] = updatedVehicle;
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }

    return { success: true, data: newLog, message: 'تم تسجيل عملية التزود بالوقود بنجاح', timestamp: now };
  },

  deleteFuelLog: async (fuelId: string): Promise<ApiResponse<boolean>> => {
    const idx = fuelCache.findIndex(f => f.Fuel_ID === fuelId);
    if (idx !== -1) {
      fuelCache[idx].IsDeleted = true;
      setStoredItem(STORAGE_KEYS.FUEL, fuelCache);
      const vId = fuelCache[idx].Vehicle_ID;
      const vehicle = vehiclesCache.find(v => v.Vehicle_ID === vId);
      if (vehicle) {
        const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vId);
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }
    return { success: true, data: true, message: 'تم حذف سجل الوقود', timestamp: new Date().toISOString() };
  },

  // ==========================
  // MAINTENANCE LOGS
  // ==========================
  getMaintenanceLogs: async (vehicleId?: string, companyId: string = 'COM-0001'): Promise<ApiResponse<MaintenanceLog[]>> => {
    let logs = maintCache.filter(m => (m.CompanyID === companyId || !m.CompanyID) && !m.IsDeleted);
    if (vehicleId) logs = logs.filter(m => m.Vehicle_ID === vehicleId);
    logs.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    return { success: true, data: logs, message: 'Maintenance logs retrieved', timestamp: new Date().toISOString() };
  },

  addMaintenanceLog: async (logData: Partial<MaintenanceLog>, companyId: string = 'COM-0001'): Promise<ApiResponse<MaintenanceLog>> => {
    const now = new Date().toISOString();
    const maintId = logData.Maintenance_ID || `MNT-${String(Date.now()).slice(-4)}`;

    const newLog: MaintenanceLog = {
      Maintenance_ID: maintId,
      Vehicle_ID: logData.Vehicle_ID || '',
      CompanyID: companyId,
      Maintenance_Type: logData.Maintenance_Type || 'صيانة عامة',
      Date: logData.Date || now.split('T')[0],
      Odometer: Number(logData.Odometer) || 0,
      Cost: Number(logData.Cost) || 0,
      Next_Maintenance_Date: logData.Next_Maintenance_Date || '',
      Next_Maintenance_Odometer: Number(logData.Next_Maintenance_Odometer) || undefined,
      Status: logData.Status || 'COMPLETED',
      Workshop: logData.Workshop || '',
      Technician: logData.Technician || '',
      Invoice_No: logData.Invoice_No || '',
      Notes: logData.Notes || '',
      Attachments: logData.Attachments || [],
      CreatedAt: now,
      CreatedBy: 'CURRENT_USER',
      IsDeleted: false,
    };

    maintCache.unshift(newLog);
    setStoredItem(STORAGE_KEYS.MAINTENANCE, maintCache);

    const vehicle = vehiclesCache.find(v => v.Vehicle_ID === logData.Vehicle_ID);
    if (vehicle) {
      if (newLog.Status === 'IN_PROGRESS' || newLog.Status === 'OPEN' || newLog.Status === 'WAITING_PARTS') {
        vehicle.Operational_Status = 'IN_MAINTENANCE';
      } else if (vehicle.Operational_Status === 'IN_MAINTENANCE' && newLog.Status === 'COMPLETED') {
        vehicle.Operational_Status = 'ACTIVE';
      }
      const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicle.Vehicle_ID);
      if (vIdx !== -1) {
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }

    return { success: true, data: newLog, message: 'تم حفظ سجل الصيانة بنجاح', timestamp: now };
  },

  updateMaintenanceStatus: async (maintId: string, status: MaintenanceLog['Status']): Promise<ApiResponse<MaintenanceLog>> => {
    const idx = maintCache.findIndex(m => m.Maintenance_ID === maintId);
    if (idx === -1) return { success: false, data: null as any, message: 'السجل غير موجود', timestamp: new Date().toISOString() };

    maintCache[idx].Status = status;
    maintCache[idx].UpdatedAt = new Date().toISOString();
    setStoredItem(STORAGE_KEYS.MAINTENANCE, maintCache);

    const vId = maintCache[idx].Vehicle_ID;
    const vehicle = vehiclesCache.find(v => v.Vehicle_ID === vId);
    if (vehicle) {
      const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vId);
      vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
      setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
    }

    return { success: true, data: maintCache[idx], message: 'تم تحديث حالة الصيانة', timestamp: new Date().toISOString() };
  },

  deleteMaintenanceLog: async (maintId: string): Promise<ApiResponse<boolean>> => {
    const idx = maintCache.findIndex(m => m.Maintenance_ID === maintId);
    if (idx !== -1) {
      maintCache[idx].IsDeleted = true;
      setStoredItem(STORAGE_KEYS.MAINTENANCE, maintCache);
      const vId = maintCache[idx].Vehicle_ID;
      const vehicle = vehiclesCache.find(v => v.Vehicle_ID === vId);
      if (vehicle) {
        const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vId);
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }
    return { success: true, data: true, message: 'تم حذف سجل الصيانة', timestamp: new Date().toISOString() };
  },

  // ==========================
  // INSURANCE LOGS
  // ==========================
  getInsuranceLogs: async (vehicleId?: string, companyId: string = 'COM-0001'): Promise<ApiResponse<InsuranceLog[]>> => {
    let logs = insuranceCache.filter(i => (i.CompanyID === companyId || !i.CompanyID) && !i.IsDeleted);
    if (vehicleId) logs = logs.filter(i => i.Vehicle_ID === vehicleId);
    logs.sort((a, b) => new Date(b.End_Date).getTime() - new Date(a.End_Date).getTime());
    return { success: true, data: logs, message: 'Insurance logs retrieved', timestamp: new Date().toISOString() };
  },

  addInsuranceLog: async (logData: Partial<InsuranceLog>, companyId: string = 'COM-0001'): Promise<ApiResponse<InsuranceLog>> => {
    const now = new Date().toISOString();
    const policyId = logData.Policy_ID || `INS-${String(Date.now()).slice(-4)}`;

    const newLog: InsuranceLog = {
      Policy_ID: policyId,
      Vehicle_ID: logData.Vehicle_ID || '',
      CompanyID: companyId,
      Insurance_Company: logData.Insurance_Company || 'شركة التأمين',
      Policy_Number: logData.Policy_Number || '',
      Insurance_Type: logData.Insurance_Type || 'COMPREHENSIVE',
      Start_Date: logData.Start_Date || now.split('T')[0],
      End_Date: logData.End_Date || '',
      Premium_Cost: Number(logData.Premium_Cost) || 0,
      Deductible: Number(logData.Deductible) || 0,
      Status: logData.Status || 'VALID',
      Notes: logData.Notes || '',
      Attachments: logData.Attachments || [],
      CreatedAt: now,
      CreatedBy: 'CURRENT_USER',
      IsDeleted: false,
    };

    insuranceCache.unshift(newLog);
    setStoredItem(STORAGE_KEYS.INSURANCE, insuranceCache);

    const vehicle = vehiclesCache.find(v => v.Vehicle_ID === logData.Vehicle_ID);
    if (vehicle) {
      const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicle.Vehicle_ID);
      if (vIdx !== -1) {
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }

    return { success: true, data: newLog, message: 'تم حفظ وثيقة التأمين بنجاح', timestamp: now };
  },

  deleteInsuranceLog: async (policyId: string): Promise<ApiResponse<boolean>> => {
    const idx = insuranceCache.findIndex(i => i.Policy_ID === policyId);
    if (idx !== -1) {
      insuranceCache[idx].IsDeleted = true;
      setStoredItem(STORAGE_KEYS.INSURANCE, insuranceCache);
      const vId = insuranceCache[idx].Vehicle_ID;
      const vehicle = vehiclesCache.find(v => v.Vehicle_ID === vId);
      if (vehicle) {
        const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vId);
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }
    return { success: true, data: true, message: 'تم حذف سجل التأمين', timestamp: new Date().toISOString() };
  },

  // ==========================
  // COMPLIANCE & INSPECTION LOGS
  // ==========================
  getComplianceLogs: async (vehicleId?: string, companyId: string = 'COM-0001'): Promise<ApiResponse<ComplianceLog[]>> => {
    let logs = complianceCache.filter(c => (c.CompanyID === companyId || !c.CompanyID) && !c.IsDeleted);
    if (vehicleId) logs = logs.filter(c => c.Vehicle_ID === vehicleId);
    logs.sort((a, b) => new Date(b.Inspection_Expiry).getTime() - new Date(a.Inspection_Expiry).getTime());
    return { success: true, data: logs, message: 'Compliance records retrieved', timestamp: new Date().toISOString() };
  },

  addComplianceLog: async (logData: Partial<ComplianceLog>, companyId: string = 'COM-0001'): Promise<ApiResponse<ComplianceLog>> => {
    const now = new Date().toISOString();
    const recordId = logData.Record_ID || `CMP-${String(Date.now()).slice(-4)}`;

    const newLog: ComplianceLog = {
      Record_ID: recordId,
      Vehicle_ID: logData.Vehicle_ID || '',
      CompanyID: companyId,
      Inspection_Date: logData.Inspection_Date || now.split('T')[0],
      Inspection_Expiry: logData.Inspection_Expiry || '',
      Inspection_Result: logData.Inspection_Result || 'PASSED',
      License_Start: logData.License_Start || '',
      License_Expiry: logData.License_Expiry || '',
      Registration_Number: logData.Registration_Number || '',
      Cost: Number(logData.Cost) || 0,
      Notes: logData.Notes || '',
      Attachments: logData.Attachments || [],
      CreatedAt: now,
      CreatedBy: 'CURRENT_USER',
      IsDeleted: false,
    };

    complianceCache.unshift(newLog);
    setStoredItem(STORAGE_KEYS.COMPLIANCE, complianceCache);

    const vehicle = vehiclesCache.find(v => v.Vehicle_ID === logData.Vehicle_ID);
    if (vehicle) {
      const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicle.Vehicle_ID);
      if (vIdx !== -1) {
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }

    return { success: true, data: newLog, message: 'تم حفظ بيانات الفحص والرخصة بنجاح', timestamp: now };
  },

  deleteComplianceLog: async (recordId: string): Promise<ApiResponse<boolean>> => {
    const idx = complianceCache.findIndex(c => c.Record_ID === recordId);
    if (idx !== -1) {
      complianceCache[idx].IsDeleted = true;
      setStoredItem(STORAGE_KEYS.COMPLIANCE, complianceCache);
      const vId = complianceCache[idx].Vehicle_ID;
      const vehicle = vehiclesCache.find(v => v.Vehicle_ID === vId);
      if (vehicle) {
        const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vId);
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }
    return { success: true, data: true, message: 'تم حذف سجل الفحص والرخصة', timestamp: new Date().toISOString() };
  },

  // ==========================
  // ACCIDENT LOGS
  // ==========================
  getAccidentLogs: async (vehicleId?: string, companyId: string = 'COM-0001'): Promise<ApiResponse<AccidentLog[]>> => {
    let logs = accidentCache.filter(a => (a.CompanyID === companyId || !a.CompanyID) && !a.IsDeleted);
    if (vehicleId) logs = logs.filter(a => a.Vehicle_ID === vehicleId);
    logs.sort((a, b) => new Date(b.Date).getTime() - new Date(a.Date).getTime());
    return { success: true, data: logs, message: 'Accident logs retrieved', timestamp: new Date().toISOString() };
  },

  addAccidentLog: async (logData: Partial<AccidentLog>, companyId: string = 'COM-0001'): Promise<ApiResponse<AccidentLog>> => {
    const now = new Date().toISOString();
    const accidentId = logData.Accident_ID || `ACC-${String(Date.now()).slice(-4)}`;
    const vehicle = vehiclesCache.find(v => v.Vehicle_ID === logData.Vehicle_ID);

    const newLog: AccidentLog = {
      Accident_ID: accidentId,
      Vehicle_ID: logData.Vehicle_ID || '',
      CompanyID: companyId,
      Driver_Employee_ID: logData.Driver_Employee_ID || vehicle?.Primary_Driver_ID,
      Driver_Name: logData.Driver_Name || vehicle?.Primary_Driver_Name,
      Date: logData.Date || now.split('T')[0],
      Time: logData.Time || '12:00',
      Location: logData.Location || '',
      Severity: logData.Severity || 'MINOR',
      Cost: Number(logData.Cost) || 0,
      Status: logData.Status || 'OPEN',
      Description: logData.Description || '',
      Police_Report_No: logData.Police_Report_No || '',
      Insurance_Claim_No: logData.Insurance_Claim_No || '',
      Other_Party_Details: logData.Other_Party_Details || '',
      Responsibility_Percentage: Number(logData.Responsibility_Percentage) || 0,
      Notes: logData.Notes || '',
      Attachments: logData.Attachments || [],
      CreatedAt: now,
      CreatedBy: 'CURRENT_USER',
      IsDeleted: false,
    };

    accidentCache.unshift(newLog);
    setStoredItem(STORAGE_KEYS.ACCIDENTS, accidentCache);

    if (vehicle) {
      if (newLog.Severity === 'CRITICAL' || newLog.Severity === 'SEVERE') {
        vehicle.Operational_Status = 'ACCIDENT';
      }
      const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicle.Vehicle_ID);
      if (vIdx !== -1) {
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }

    return { success: true, data: newLog, message: 'تم تسجيل تقرير الحادث بنجاح', timestamp: now };
  },

  updateAccidentStatus: async (accidentId: string, status: AccidentLog['Status']): Promise<ApiResponse<AccidentLog>> => {
    const idx = accidentCache.findIndex(a => a.Accident_ID === accidentId);
    if (idx === -1) return { success: false, data: null as any, message: 'السجل غير موجود', timestamp: new Date().toISOString() };

    accidentCache[idx].Status = status;
    setStoredItem(STORAGE_KEYS.ACCIDENTS, accidentCache);

    const vId = accidentCache[idx].Vehicle_ID;
    const vehicle = vehiclesCache.find(v => v.Vehicle_ID === vId);
    if (vehicle) {
      if (status === 'CLOSED' && vehicle.Operational_Status === 'ACCIDENT') {
        vehicle.Operational_Status = 'ACTIVE';
      }
      const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vId);
      vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
      setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
    }

    return { success: true, data: accidentCache[idx], message: 'تم تحديث حالة معالجة الحادث', timestamp: new Date().toISOString() };
  },

  deleteAccidentLog: async (accidentId: string): Promise<ApiResponse<boolean>> => {
    const idx = accidentCache.findIndex(a => a.Accident_ID === accidentId);
    if (idx !== -1) {
      accidentCache[idx].IsDeleted = true;
      setStoredItem(STORAGE_KEYS.ACCIDENTS, accidentCache);
      const vId = accidentCache[idx].Vehicle_ID;
      const vehicle = vehiclesCache.find(v => v.Vehicle_ID === vId);
      if (vehicle) {
        const vIdx = vehiclesCache.findIndex(v => v.Vehicle_ID === vId);
        vehiclesCache[vIdx] = refreshVehicleCalculations(vehicle);
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }
    }
    return { success: true, data: true, message: 'تم حذف سجل الحادث', timestamp: new Date().toISOString() };
  },

  // ==========================
  // DOCUMENTS
  // ==========================
  getDocuments: async (vehicleId?: string, companyId: string = 'COM-0001'): Promise<ApiResponse<VehicleDocument[]>> => {
    let list = docsCache.filter(d => (d.CompanyID === companyId || !d.CompanyID) && !d.IsDeleted);
    if (vehicleId) list = list.filter(d => d.Vehicle_ID === vehicleId);
    list.sort((a, b) => new Date(b.UploadedAt).getTime() - new Date(a.UploadedAt).getTime());
    return { success: true, data: list, message: 'Documents retrieved', timestamp: new Date().toISOString() };
  },

  addDocument: async (docData: Partial<VehicleDocument>, companyId: string = 'COM-0001'): Promise<ApiResponse<VehicleDocument>> => {
    const now = new Date().toISOString();
    const docId = docData.Document_ID || `DOC-${String(Date.now()).slice(-4)}`;

    const newDoc: VehicleDocument = {
      Document_ID: docId,
      Vehicle_ID: docData.Vehicle_ID || '',
      CompanyID: companyId,
      Document_Type: docData.Document_Type || 'OTHER',
      File_Name: docData.File_Name || 'مستند_جديد.pdf',
      File_URL: docData.File_URL || '',
      Issue_Date: docData.Issue_Date,
      Expiry_Date: docData.Expiry_Date,
      Notes: docData.Notes || '',
      UploadedBy: 'CURRENT_USER',
      UploadedAt: now,
      IsDeleted: false,
    };

    docsCache.unshift(newDoc);
    setStoredItem(STORAGE_KEYS.DOCUMENTS, docsCache);

    return { success: true, data: newDoc, message: 'تم حفظ المستند بنجاح', timestamp: now };
  },

  deleteDocument: async (docId: string): Promise<ApiResponse<boolean>> => {
    const idx = docsCache.findIndex(d => d.Document_ID === docId);
    if (idx !== -1) {
      docsCache[idx].IsDeleted = true;
      setStoredItem(STORAGE_KEYS.DOCUMENTS, docsCache);
    }
    return { success: true, data: true, message: 'تم حذف المستند', timestamp: new Date().toISOString() };
  },

  // ==========================
  // FLEET KPIS & NOTIFICATIONS
  // ==========================
  getFleetKPIs: async (companyId: string = 'COM-0001'): Promise<ApiResponse<FleetKPIs>> => {
    const res = await fleetService.getVehicles(companyId);
    const vehicles = res.data || [];

    const total = vehicles.length;
    const active = vehicles.filter(v => v.Operational_Status === 'ACTIVE').length;
    const inMaint = vehicles.filter(v => v.Operational_Status === 'IN_MAINTENANCE').length;
    const notReady = vehicles.filter(v => v.Operational_Status === 'NOT_READY' || v.Operational_Status === 'ACCIDENT' || v.Operational_Status === 'STOPPED').length;

    const avgReadiness = total > 0 
      ? Math.round(vehicles.reduce((sum, v) => sum + (v.Readiness_Index || 0), 0) / total)
      : 100;

    const fuelCostMTD = vehicles.reduce((sum, v) => sum + (v.Fuel_Cost_MTD || 0), 0);
    const maintCostMTD = vehicles.reduce((sum, v) => sum + (v.Maint_Cost_MTD || 0), 0);
    const accidentCostMTD = vehicles.reduce((sum, v) => sum + (v.Accident_Cost_MTD || 0), 0);
    const totalFleetCostMTD = fuelCostMTD + maintCostMTD + accidentCostMTD;

    const openAccidents = accidentCache.filter(a => (a.CompanyID === companyId || !a.CompanyID) && !a.IsDeleted && a.Status !== 'CLOSED').length;

    const now = new Date();
    const expiringIns = vehicles.filter(v => {
      if (!v.Insurance_Expiry) return false;
      const d = new Date(v.Insurance_Expiry);
      const days = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return days <= 30;
    }).length;

    const expiringInsp = vehicles.filter(v => {
      if (!v.Inspection_Expiry) return false;
      const d = new Date(v.Inspection_Expiry);
      const days = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return days <= 30;
    }).length;

    const expiringLic = vehicles.filter(v => {
      if (!v.License_Expiry) return false;
      const d = new Date(v.License_Expiry);
      const days = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return days <= 30;
    }).length;

    const upcomingMaint = vehicles.filter(v => {
      if (!v.Next_Maint_Date) return false;
      const d = new Date(v.Next_Maint_Date);
      const days = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return days <= 14;
    }).length;

    const kpis: FleetKPIs = {
      totalVehicles: total,
      activeVehicles: active,
      inMaintenanceVehicles: inMaint,
      notReadyVehicles: notReady,
      averageReadinessIndex: avgReadiness,
      fuelCostMTD: Number(fuelCostMTD.toFixed(2)),
      maintCostMTD: Number(maintCostMTD.toFixed(2)),
      accidentCostMTD: Number(accidentCostMTD.toFixed(2)),
      totalFleetCostMTD: Number(totalFleetCostMTD.toFixed(2)),
      openAccidentsCount: openAccidents,
      expiringInsuranceCount: expiringIns,
      expiringInspectionCount: expiringInsp,
      expiringLicenseCount: expiringLic,
      upcomingMaintenanceCount: upcomingMaint,
    };

    return {
      success: true,
      data: kpis,
      message: 'Fleet KPIs calculated',
      timestamp: new Date().toISOString(),
    };
  },

  getNotifications: async (companyId: string = 'COM-0001'): Promise<ApiResponse<FleetNotification[]>> => {
    const vRes = await fleetService.getVehicles(companyId);
    const notifications = generateFleetNotifications(
      vRes.data || [],
      insuranceCache.filter(i => !i.IsDeleted),
      complianceCache.filter(c => !c.IsDeleted),
      maintCache.filter(m => !m.IsDeleted),
      accidentCache.filter(a => !a.IsDeleted)
    );

    return {
      success: true,
      data: notifications,
      message: 'Fleet notifications compiled',
      timestamp: new Date().toISOString(),
    };
  },
};
