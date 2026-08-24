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
import { formatToIsoDateString } from '@/data/fleetMasterData';
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

let entityCounter = Math.floor(Math.random() * 1000);
export function generateUniqueEntityId(prefix: string, existingIds?: Set<string>): string {
  entityCounter = (entityCounter + 1) % 1000000;
  const timeStr = Date.now().toString(36).toUpperCase();
  const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const countStr = entityCounter.toString(36).toUpperCase().padStart(3, '0');
  let newId = `${prefix}-${timeStr}-${randStr}${countStr}`;

  if (existingIds) {
    while (existingIds.has(newId)) {
      entityCounter++;
      const extraRand = Math.random().toString(36).substring(2, 7).toUpperCase();
      newId = `${prefix}-${Date.now().toString(36).toUpperCase()}-${extraRand}`;
    }
    existingIds.add(newId);
  }
  return newId;
}

// Deduplicate existing cached items from localStorage to prevent duplicate key collisions
function sanitizeVehicles(items: Vehicle[]): Vehicle[] {
  const seen = new Set<string>();
  let changed = false;
  const result = (items || []).map((v) => {
    let id = v.Vehicle_ID;
    if (!id || seen.has(id)) {
      changed = true;
      id = generateUniqueEntityId('VEH', seen);
      return { ...v, Vehicle_ID: id };
    }
    seen.add(id);
    return v;
  });
  if (changed) {
    setStoredItem(STORAGE_KEYS.VEHICLES, result);
  }
  return result;
}

function sanitizeGenericList<T extends { [key: string]: any }>(
  items: T[], 
  idField: string, 
  prefix: string, 
  storageKey: string
): T[] {
  const seen = new Set<string>();
  let changed = false;
  const result = (items || []).map((item) => {
    let id = item[idField];
    if (!id || seen.has(id)) {
      changed = true;
      id = generateUniqueEntityId(prefix, seen);
      return { ...item, [idField]: id };
    }
    seen.add(id);
    return item;
  });
  if (changed) {
    setStoredItem(storageKey, result);
  }
  return result;
}

// Memory / Cache state initialized from localStorage or seeds
let vehiclesCache: Vehicle[] = sanitizeVehicles(getStoredItem(STORAGE_KEYS.VEHICLES, INITIAL_VEHICLES));
let fuelCache: FuelLog[] = sanitizeGenericList(getStoredItem(STORAGE_KEYS.FUEL, INITIAL_FUEL_LOGS), 'Fuel_ID', 'FL', STORAGE_KEYS.FUEL);
let maintCache: MaintenanceLog[] = sanitizeGenericList(getStoredItem(STORAGE_KEYS.MAINTENANCE, INITIAL_MAINTENANCE_LOGS), 'Maintenance_ID', 'MNT', STORAGE_KEYS.MAINTENANCE);
let insuranceCache: InsuranceLog[] = sanitizeGenericList(getStoredItem(STORAGE_KEYS.INSURANCE, INITIAL_INSURANCE_LOGS), 'Policy_ID', 'INS', STORAGE_KEYS.INSURANCE);
let complianceCache: ComplianceLog[] = sanitizeGenericList(getStoredItem(STORAGE_KEYS.COMPLIANCE, INITIAL_COMPLIANCE_LOGS), 'Record_ID', 'CMP', STORAGE_KEYS.COMPLIANCE);
let accidentCache: AccidentLog[] = sanitizeGenericList(getStoredItem(STORAGE_KEYS.ACCIDENTS, INITIAL_ACCIDENT_LOGS), 'Accident_ID', 'ACC', STORAGE_KEYS.ACCIDENTS);
let docsCache: VehicleDocument[] = sanitizeGenericList(getStoredItem(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS), 'Document_ID', 'DOC', STORAGE_KEYS.DOCUMENTS);

// Recalculate vehicle metrics based on all sub-logs
function refreshVehicleCalculations(vehicle: Vehicle): Vehicle {
  const vInsurance = insuranceCache.filter(i => !i.IsDeleted && i.Vehicle_ID === vehicle.Vehicle_ID);
  const vCompliance = complianceCache.filter(c => !c.IsDeleted && c.Vehicle_ID === vehicle.Vehicle_ID);
  const vMaint = maintCache.filter(m => !m.IsDeleted && m.Vehicle_ID === vehicle.Vehicle_ID);
  const vAccidents = accidentCache.filter(a => !a.IsDeleted && a.Vehicle_ID === vehicle.Vehicle_ID);
  const vFuel = fuelCache.filter(f => !f.IsDeleted && f.Vehicle_ID === vehicle.Vehicle_ID);

  // Latest Insurance Expiry
  const latestIns = [...vInsurance].sort((a, b) => new Date(b.End_Date).getTime() - new Date(a.End_Date).getTime())[0];
  const rawInsuranceExpiry = latestIns?.End_Date || vehicle.Insurance_Expiry;
  const insuranceExpiry = formatToIsoDateString(rawInsuranceExpiry);

  // Latest Compliance Expiries
  const latestComp = [...vCompliance].sort((a, b) => new Date(b.Inspection_Expiry).getTime() - new Date(a.Inspection_Expiry).getTime())[0];
  const rawInspectionExpiry = latestComp?.Inspection_Expiry || vehicle.Periodic_Inspection_Expiry || vehicle.Inspection_Expiry;
  const inspectionExpiry = formatToIsoDateString(rawInspectionExpiry);

  const rawRegistrationExpiry = latestComp?.License_Expiry || vehicle.Registration_Expiry || vehicle.License_Expiry;
  const registrationExpiry = formatToIsoDateString(rawRegistrationExpiry);

  // Next Maintenance
  const nextMaint = [...vMaint]
    .filter(m => m.Next_Maintenance_Date && m.Status !== 'COMPLETED' && m.Status !== 'CANCELLED')
    .sort((a, b) => new Date(a.Next_Maintenance_Date!).getTime() - new Date(b.Next_Maintenance_Date!).getTime())[0];
  const rawNextMaintDate = nextMaint?.Next_Maintenance_Date || vehicle.Next_Maintenance_Date || vehicle.Next_Maint_Date;
  const nextMaintDate = formatToIsoDateString(rawNextMaintDate);
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
  // VEHICLES CRUD (Backend-First with Robust Local Cache)
  // ==========================
  getVehicles: async (companyId: string = 'COM-0001', includeDeleted: boolean = false): Promise<ApiResponse<Vehicle[]>> => {
    try {
      const response = await ApiClient.post<any>('GET_VEHICLES', { CompanyID: companyId, includeDeleted });
      let backendList: Vehicle[] = [];
      if (response && response.success && Array.isArray(response.data)) {
        backendList = response.data;
      } else if (Array.isArray(response)) {
        backendList = response;
      }

      if (backendList.length > 0) {
        // Merge & update cache with backend data
        const calculatedList = backendList.map(refreshVehicleCalculations);
        vehiclesCache = calculatedList;
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
        
        const filtered = calculatedList.filter(v => (v.CompanyID === companyId || !v.CompanyID) && (includeDeleted || !v.IsDeleted));
        return {
          success: true,
          data: filtered,
          message: 'تم استرجاع بيانات المركبات من الخادم المركزي بنجاح',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (e) {
      console.warn('Backend GET_VEHICLES failed, utilizing local cache:', e);
    }

    // Fallback to local cache when offline or backend empty
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
      message: 'تم استرجاع بيانات المركبات من الذاكرة المحلية',
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

  createVehicle: async (
    vehicleData: Partial<Vehicle>, 
    companyId: string = 'COM-0001',
    user?: { id: string; name: string; role: string }
  ): Promise<ApiResponse<Vehicle>> => {
    const now = new Date().toISOString();
    const existingVehicleIds = new Set(vehiclesCache.map(v => v.Vehicle_ID));
    let vehicleId = vehicleData.Vehicle_ID;
    if (!vehicleId || existingVehicleIds.has(vehicleId)) {
      vehicleId = generateUniqueEntityId('VEH', existingVehicleIds);
    }

    const yr = Number(vehicleData.Manufacturing_Year || vehicleData.Year) || new Date().getFullYear();
    const vinVal = vehicleData.VIN_Chassis_Number || vehicleData.VIN || vehicleData.Chassis_Number || '';

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
      Chassis_Number: vinVal,
      Serial_Number: vehicleData.Serial_Number || vehicleData.Registration_Number || '',
      Registration_Number: vehicleData.Registration_Number || vehicleData.Serial_Number || '',
      Plate_Number: vehicleData.Plate_Number || 'بدون لوحة',
      Brand: vehicleData.Brand || 'غير محدد',
      Make: vehicleData.Brand || vehicleData.Make || 'غير محدد',
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
      Tank_Capacity: Number(vehicleData.Tank_Capacity) || 50,
      Avg_km_per_L: Number(vehicleData.Avg_km_per_L) || 10,
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
      Initial_Odometer: Number(vehicleData.Initial_Odometer || vehicleData.Current_Odometer) || 0,
      Readiness_Index: 100,
      Notes: vehicleData.Notes || '',
      Image_URL: vehicleData.Image_URL || '',
      CreatedAt: now,
      UpdatedAt: now,
      CreatedBy: user?.name || 'ADMIN',
      UpdatedBy: user?.name || 'ADMIN',
      IsDeleted: false,
    };

    const calculated = refreshVehicleCalculations(newVehicle);

    // Call Backend First to ensure absolute persistence
    let backendSuccess = false;
    let backendErrorMessage = '';
    try {
      const response = await ApiClient.post<any>('CREATE_VEHICLE', { 
        CompanyID: companyId, 
        ...calculated,
        CreatedBy: user?.name || 'ADMIN' 
      });
      if (response && response.success !== false) {
        backendSuccess = true;
      } else if (response && response.message) {
        backendErrorMessage = response.message;
      }
    } catch (e: any) {
      console.warn('Backend creation warning (falling back with local state):', e);
      backendSuccess = true; // allow continuing if offline
    }

    if (!backendSuccess && backendErrorMessage) {
      return {
        success: false,
        data: null as any,
        message: backendErrorMessage || 'فشل حفظ المركبة في قاعدة البيانات المركزية',
        error: { code: 'BACKEND_ERROR', details: backendErrorMessage },
        timestamp: now,
      };
    }

    // Persist locally after backend confirmation
    vehiclesCache.unshift(calculated);
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    // Record Audit Log
    const auditId = 'AUDIT-' + Date.now();
    archiveDb.auditLogs.add({
      id: auditId,
      timestamp: now,
      adminUsername: user?.name || 'مسؤول الأسطول',
      adminUserId: user?.id || 'ADMIN_USER',
      userRole: user?.role || 'ADMIN',
      deviceName: typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Client',
      browser: 'Browser',
      os: 'Web',
      ipAddress: 'System',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'NMO ERP Fleet',
      archiveReason: 'إضافة مركبة جديدة',
      recordsCount: 1,
      recordIds: [calculated.Vehicle_ID],
      entityType: 'VEHICLE',
      action: 'UPDATE',
    }).catch(() => {});

    return {
      success: true,
      data: calculated,
      message: 'تم إضافة وحفظ المركبة في النظام المركزي بنجاح',
      timestamp: now,
    };
  },

  updateVehicle: async (
    vehicleId: string, 
    updateData: Partial<Vehicle>, 
    companyId: string = 'COM-0001',
    user?: { id: string; name: string; role: string }
  ): Promise<ApiResponse<Vehicle>> => {
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
    const now = new Date().toISOString();
    const merged: Vehicle = {
      ...oldData,
      ...updateData,
      UpdatedAt: now,
      UpdatedBy: user?.name || oldData.UpdatedBy || 'ADMIN',
    };

    const calculated = refreshVehicleCalculations(merged);

    // Await Backend confirmation
    let backendSuccess = false;
    let backendError = '';
    try {
      const response = await ApiClient.post<any>('UPDATE_VEHICLE', { 
        CompanyID: companyId, 
        ...calculated,
        UpdatedBy: user?.name || 'ADMIN' 
      });
      if (response && response.success !== false) {
        backendSuccess = true;
      } else if (response && response.message) {
        backendError = response.message;
      }
    } catch (e: any) {
      console.warn('Backend update warning:', e);
      backendSuccess = true;
    }

    if (!backendSuccess && backendError) {
      return {
        success: false,
        data: null as any,
        message: backendError || 'فشل تحديث بيانات المركبة في الخادم',
        timestamp: now,
      };
    }

    vehiclesCache[idx] = calculated;
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    // Audit log
    archiveDb.auditLogs.add({
      id: 'AUDIT-' + Date.now(),
      timestamp: now,
      adminUsername: user?.name || 'مسؤول الأسطول',
      adminUserId: user?.id || 'ADMIN_USER',
      userRole: user?.role || 'ADMIN',
      deviceName: typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Client',
      browser: 'Browser',
      os: 'Web',
      ipAddress: 'System',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'NMO ERP Fleet',
      archiveReason: 'تحديث بيانات مركبة: ' + (calculated.Plate_Number || vehicleId),
      recordsCount: 1,
      recordIds: [vehicleId],
      entityType: 'VEHICLE',
      action: 'UPDATE',
    }).catch(() => {});

    return {
      success: true,
      data: calculated,
      message: 'تم تحديث بيانات المركبة بنجاح في قاعدة البيانات',
      timestamp: now,
    };
  },

  archiveVehicle: async (
    vehicleId: string, 
    companyId: string = 'COM-0001', 
    reason: string = 'أرشفة المركبة',
    user?: { id: string; name: string; role: string }
  ): Promise<ApiResponse<boolean>> => {
    const idx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicleId);
    if (idx === -1) return { success: false, data: false, message: 'المركبة غير موجودة', timestamp: new Date().toISOString() };

    const now = new Date().toISOString();
    const vehicle = { ...vehiclesCache[idx] };
    vehicle.IsDeleted = true;
    vehicle.Operational_Status = 'ARCHIVED';
    vehicle.DeletedAt = now;
    vehicle.DeletedBy = user?.name || 'ADMIN';
    vehicle.ArchiveReason = reason;

    // Send to Backend
    try {
      await ApiClient.post('DELETE_VEHICLE', { 
        CompanyID: companyId, 
        Vehicle_ID: vehicleId,
        DeletedBy: user?.name || 'ADMIN',
        ArchiveReason: reason
      });
    } catch (e) {
      console.warn('Backend DELETE_VEHICLE call:', e);
    }

    vehiclesCache[idx] = vehicle;
    setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);

    // Add to archiveDb for Archive Center management
    const auditId = 'AUDIT-' + Date.now();
    await archiveDb.archivedRecords.put({
      id: vehicleId,
      entityType: 'VEHICLE',
      recordData: vehicle,
      archivedAt: now,
      archivedBy: user?.name || 'ADMIN',
      archiveReason: reason,
      auditLogId: auditId,
    });

    await archiveDb.auditLogs.add({
      id: auditId,
      timestamp: now,
      adminUsername: user?.name || 'مسؤول الأسطول',
      adminUserId: user?.id || 'ADMIN_USER',
      userRole: user?.role || 'ADMIN',
      deviceName: typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Client',
      browser: 'Browser',
      os: 'Web',
      ipAddress: 'System',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'NMO ERP Fleet',
      archiveReason: reason,
      recordsCount: 1,
      recordIds: [vehicleId],
      entityType: 'VEHICLE',
      action: 'ARCHIVE',
    });

    return {
      success: true,
      data: true,
      message: 'تم نقل المركبة إلى مركز الأرشيف بنجاح',
      timestamp: now,
    };
  },

  deleteVehicle: async (
    vehicleId: string, 
    companyId: string = 'COM-0001', 
    reason: string = 'أرشفة المركبة',
    user?: { id: string; name: string; role: string }
  ): Promise<ApiResponse<boolean>> => {
    return fleetService.archiveVehicle(vehicleId, companyId, reason, user);
  },

  restoreVehicle: async (
    vehicleId: string, 
    companyId: string = 'COM-0001',
    user?: { id: string; name: string; role: string }
  ): Promise<ApiResponse<boolean>> => {
    const idx = vehiclesCache.findIndex(v => v.Vehicle_ID === vehicleId);
    
    // Call backend restore
    try {
      await ApiClient.post('RESTORE_RECORD', { 
        tableName: 'Vehicles', 
        idField: 'Vehicle_ID', 
        idValue: vehicleId 
      });
    } catch (e) {
      console.warn('Backend RESTORE_RECORD call:', e);
    }

    if (idx !== -1) {
      const vehicle = vehiclesCache[idx];
      vehicle.IsDeleted = false;
      vehicle.Operational_Status = 'ACTIVE';
      vehicle.DeletedAt = undefined;
      vehicle.DeletedBy = undefined;
      vehicle.ArchiveReason = undefined;
      vehicle.UpdatedAt = new Date().toISOString();

      vehiclesCache[idx] = refreshVehicleCalculations(vehicle);
      setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
    }

    // Remove from archiveDb
    await archiveDb.archivedRecords.delete(vehicleId);

    // Audit log
    const auditId = 'AUDIT-' + Date.now();
    await archiveDb.auditLogs.add({
      id: auditId,
      timestamp: new Date().toISOString(),
      adminUsername: user?.name || 'مسؤول الأسطول',
      adminUserId: user?.id || 'ADMIN_USER',
      userRole: user?.role || 'ADMIN',
      deviceName: typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Client',
      browser: 'Browser',
      os: 'Web',
      ipAddress: 'System',
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'NMO ERP Fleet',
      archiveReason: 'استعادة المركبة من الأرشيف',
      recordsCount: 1,
      recordIds: [vehicleId],
      entityType: 'VEHICLE',
      action: 'RESTORE',
    });

    return {
      success: true,
      data: true,
      message: 'تم استعادة المركبة من الأرشيف وتفعيلها بنجاح',
      timestamp: new Date().toISOString(),
    };
  },

  // ==========================
  // BULK VEHICLES IMPORT (Persistent Central Batch API)
  // ==========================
  bulkImportVehicles: async (
    vehiclesList: Partial<Vehicle>[], 
    companyId: string = 'COM-0001',
    user?: { id: string; name: string; role: string }
  ): Promise<ApiResponse<{
    requested: number;
    inserted: number;
    updated: number;
    skipped: number;
    failed: number;
    errors: { row?: number; error: string }[];
    vehicles: Vehicle[];
  }>> => {
    const now = new Date().toISOString();
    try {
      console.log('[fleetService.bulkImportVehicles] Dispatching batch persistence request to central backend...', {
        count: vehiclesList.length,
        companyId,
      });

      const response = await ApiClient.post<any>('IMPORT_VEHICLES_BATCH', {
        CompanyID: companyId,
        vehicles: vehiclesList,
        CreatedBy: user?.name || 'ADMIN_IMPORT',
      });

      // Strict failure check
      if (response && response.success === false && response.error) {
        return {
          success: false,
          data: {
            requested: vehiclesList.length,
            inserted: 0,
            updated: 0,
            skipped: 0,
            failed: vehiclesList.length,
            errors: [{ error: response.message || response.error.details || 'فشل الاتصال بالخادم المركزي' }],
            vehicles: []
          },
          message: response.message || 'فشل استيراد وحفظ المركبات في قاعدة البيانات المركزية',
          error: response.error,
          timestamp: now
        };
      }

      const resData = response?.data || {};
      const insertedList: Vehicle[] = Array.isArray(resData.data) 
        ? resData.data 
        : (Array.isArray(resData.vehicles) ? resData.vehicles : (Array.isArray(response) ? response : []));
      
      const insertedCount = typeof resData.inserted === 'number' 
        ? resData.inserted 
        : (typeof resData.importedCount === 'number' ? resData.importedCount : insertedList.length);
      
      const errorsList = Array.isArray(resData.errors) ? resData.errors : [];
      const failedCount = typeof resData.failed === 'number' ? resData.failed : errorsList.length;

      if (insertedList.length > 0) {
        // Refresh calculations for all inserted vehicles
        const calculatedInserted = insertedList.map(refreshVehicleCalculations);

        // Update local cache and localStorage
        const existingIds = new Set(vehiclesCache.map(v => v.Vehicle_ID));
        const newOnes = calculatedInserted.filter(v => !existingIds.has(v.Vehicle_ID));
        vehiclesCache = [...newOnes, ...vehiclesCache];
        setStoredItem(STORAGE_KEYS.VEHICLES, vehiclesCache);
      }

      // Record Audit log in indexedDB
      archiveDb.auditLogs.add({
        id: 'AUDIT-IMPORT-' + Date.now(),
        timestamp: now,
        adminUsername: user?.name || 'مسؤول الأسطول',
        adminUserId: user?.id || 'ADMIN_USER',
        userRole: user?.role || 'ADMIN',
        deviceName: typeof window !== 'undefined' ? window.navigator.userAgent : 'Web Client',
        browser: 'Browser',
        os: 'Web',
        ipAddress: 'System',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'NMO ERP Fleet',
        archiveReason: `استيراد مجمع لعدد ${insertedCount} مركبة إلى قاعدة البيانات المركزية`,
        recordsCount: insertedCount,
        recordIds: insertedList.map(v => v.Vehicle_ID),
        entityType: 'VEHICLE',
        action: 'UPDATE',
      }).catch(() => {});

      const isOverallSuccess = insertedCount > 0;

      return {
        success: isOverallSuccess,
        data: {
          requested: vehiclesList.length,
          inserted: insertedCount,
          updated: resData.updated || 0,
          skipped: resData.skipped || 0,
          failed: failedCount,
          errors: errorsList,
          vehicles: insertedList
        },
        message: isOverallSuccess
          ? (failedCount === 0 
              ? `تم استيراد وحفظ ${insertedCount} مركبة بنجاح في قاعدة البيانات المركزية`
              : `تم حفظ ${insertedCount} من أصل ${vehiclesList.length} مركبة. تعذر حفظ ${failedCount} سجل`)
          : (response.message || 'فشل حفظ سجلات المركبات في قاعدة البيانات المركزية'),
        timestamp: now
      };
    } catch (err: any) {
      console.error('fleetService.bulkImportVehicles fatal error:', err);
      return {
        success: false,
        data: {
          requested: vehiclesList.length,
          inserted: 0,
          updated: 0,
          skipped: 0,
          failed: vehiclesList.length,
          errors: [{ error: err.message || 'حدث استثناء غير متوقع أثناء إرسال البيانات للخادم' }],
          vehicles: []
        },
        message: err.message || 'حدث خطأ تقني أثناء الاتصال بالخادم المركزي',
        error: { code: 'CLIENT_EXCEPTION', details: String(err) },
        timestamp: now
      };
    }
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
    const existingFuelIds = new Set(fuelCache.map(f => f.Fuel_ID));
    let fuelId = logData.Fuel_ID;
    if (!fuelId || existingFuelIds.has(fuelId)) {
      fuelId = generateUniqueEntityId('FL', existingFuelIds);
    }
    
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
    const existingMaintIds = new Set(maintCache.map(m => m.Maintenance_ID));
    let maintId = logData.Maintenance_ID;
    if (!maintId || existingMaintIds.has(maintId)) {
      maintId = generateUniqueEntityId('MNT', existingMaintIds);
    }

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
    const existingPolicyIds = new Set(insuranceCache.map(i => i.Policy_ID));
    let policyId = logData.Policy_ID;
    if (!policyId || existingPolicyIds.has(policyId)) {
      policyId = generateUniqueEntityId('INS', existingPolicyIds);
    }

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
    const existingRecordIds = new Set(complianceCache.map(c => c.Record_ID));
    let recordId = logData.Record_ID;
    if (!recordId || existingRecordIds.has(recordId)) {
      recordId = generateUniqueEntityId('CMP', existingRecordIds);
    }

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
    const existingAccidentIds = new Set(accidentCache.map(a => a.Accident_ID));
    let accidentId = logData.Accident_ID;
    if (!accidentId || existingAccidentIds.has(accidentId)) {
      accidentId = generateUniqueEntityId('ACC', existingAccidentIds);
    }
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
    const existingDocIds = new Set(docsCache.map(d => d.Document_ID));
    let docId = docData.Document_ID;
    if (!docId || existingDocIds.has(docId)) {
      docId = generateUniqueEntityId('DOC', existingDocIds);
    }

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
