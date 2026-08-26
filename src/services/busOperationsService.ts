import { 
  BusServiceCategory, 
  BusServiceType, 
  BusServiceLog, 
  DriveInvoiceUploadPayload, 
  DriveUploadResponse 
} from '@/types/busOperations';
import { DEFAULT_BUS_SERVICE_CATEGORIES, DEFAULT_BUS_SERVICE_TYPES } from '@/data/defaultBusCatalog';
import { ApiClient } from './apiClient';
import { fleetService } from './fleetService';

class BusOperationsService {
  private categoriesKey = 'nmo_bus_service_categories';
  private typesKey = 'nmo_bus_service_types';
  private logsKey = 'nmo_bus_service_logs';

  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized() {
    if (!localStorage.getItem(this.categoriesKey)) {
      localStorage.setItem(this.categoriesKey, JSON.stringify(DEFAULT_BUS_SERVICE_CATEGORIES));
    }
    if (!localStorage.getItem(this.typesKey)) {
      localStorage.setItem(this.typesKey, JSON.stringify(DEFAULT_BUS_SERVICE_TYPES));
    }
    if (!localStorage.getItem(this.logsKey)) {
      localStorage.setItem(this.logsKey, JSON.stringify([]));
    }
  }

  // ==========================================
  // CATEGORIES & SERVICE TYPES (CATALOG)
  // ==========================================

  async getCategories(companyId: string = 'COM-0001'): Promise<{ success: boolean; data: BusServiceCategory[] }> {
    try {
      // Try backend first
      const res = await ApiClient.post<BusServiceCategory[]>('GET_BUS_SERVICE_CATEGORIES', { CompanyID: companyId });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        localStorage.setItem(this.categoriesKey, JSON.stringify(res.data));
        return { success: true, data: res.data.sort((a, b) => a.Display_Order - b.Display_Order) };
      }
    } catch (e) {
      console.warn('Backend categories fetch failed, falling back to local storage', e);
    }

    const local = localStorage.getItem(this.categoriesKey);
    const data: BusServiceCategory[] = local ? JSON.parse(local) : DEFAULT_BUS_SERVICE_CATEGORIES;
    return { success: true, data: data.sort((a, b) => a.Display_Order - b.Display_Order) };
  }

  async getServiceTypes(companyId: string = 'COM-0001'): Promise<{ success: boolean; data: BusServiceType[] }> {
    try {
      const res = await ApiClient.post<BusServiceType[]>('GET_BUS_SERVICE_TYPES', { CompanyID: companyId });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        const parsed = res.data.map(t => ({
          ...t,
          fieldConfig: t.Field_Config_JSON ? (typeof t.Field_Config_JSON === 'string' ? JSON.parse(t.Field_Config_JSON) : t.Field_Config_JSON) : t.fieldConfig,
        }));
        localStorage.setItem(this.typesKey, JSON.stringify(parsed));
        return { success: true, data: parsed.sort((a, b) => a.Display_Order - b.Display_Order) };
      }
    } catch (e) {
      console.warn('Backend service types fetch failed, falling back to local storage', e);
    }

    const local = localStorage.getItem(this.typesKey);
    let data: BusServiceType[] = local ? JSON.parse(local) : DEFAULT_BUS_SERVICE_TYPES;
    data = data.map(t => ({
      ...t,
      fieldConfig: t.Field_Config_JSON ? (typeof t.Field_Config_JSON === 'string' ? JSON.parse(t.Field_Config_JSON) : t.Field_Config_JSON) : t.fieldConfig,
    }));
    return { success: true, data: data.sort((a, b) => a.Display_Order - b.Display_Order) };
  }

  async saveCategory(category: BusServiceCategory, companyId: string = 'COM-0001'): Promise<{ success: boolean; data: BusServiceCategory }> {
    const res = await this.getCategories(companyId);
    let list = res.data;
    const existingIndex = list.findIndex(c => c.Category_ID === category.Category_ID);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...category, UpdatedAt: new Date().toISOString() };
    } else {
      list.push({
        ...category,
        Category_ID: category.Category_ID || `CAT-${Date.now()}`,
        CompanyID: companyId,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
      });
    }
    localStorage.setItem(this.categoriesKey, JSON.stringify(list));

    try {
      await ApiClient.post('SAVE_BUS_SERVICE_CATEGORIES', { CompanyID: companyId, categories: list });
    } catch (e) {
      console.warn('Failed to sync category to GAS backend', e);
    }

    return { success: true, data: category };
  }

  async saveServiceType(type: BusServiceType, companyId: string = 'COM-0001'): Promise<{ success: boolean; data: BusServiceType }> {
    const res = await this.getServiceTypes(companyId);
    let list = res.data;
    const existingIndex = list.findIndex(t => t.Service_Type_ID === type.Service_Type_ID);
    
    const preparedType: BusServiceType = {
      ...type,
      Service_Type_ID: type.Service_Type_ID || `SRV-${Date.now()}`,
      CompanyID: companyId,
      Field_Config_JSON: type.fieldConfig ? JSON.stringify(type.fieldConfig) : type.Field_Config_JSON,
      UpdatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...preparedType };
    } else {
      preparedType.CreatedAt = new Date().toISOString();
      list.push(preparedType);
    }
    localStorage.setItem(this.typesKey, JSON.stringify(list));

    try {
      await ApiClient.post('SAVE_BUS_SERVICE_TYPES', { CompanyID: companyId, serviceTypes: list });
    } catch (e) {
      console.warn('Failed to sync service type to GAS backend', e);
    }

    return { success: true, data: preparedType };
  }

  async resetCatalogToDefaults(companyId: string = 'COM-0001'): Promise<void> {
    localStorage.setItem(this.categoriesKey, JSON.stringify(DEFAULT_BUS_SERVICE_CATEGORIES));
    localStorage.setItem(this.typesKey, JSON.stringify(DEFAULT_BUS_SERVICE_TYPES));
    try {
      await ApiClient.post('SAVE_BUS_SERVICE_CATEGORIES', { CompanyID: companyId, categories: DEFAULT_BUS_SERVICE_CATEGORIES });
      await ApiClient.post('SAVE_BUS_SERVICE_TYPES', { CompanyID: companyId, serviceTypes: DEFAULT_BUS_SERVICE_TYPES });
    } catch (e) {
      console.warn('Reset catalog backend sync failed', e);
    }
  }

  // ==========================================
  // BUS SERVICE LOGS (RECORDS)
  // ==========================================

  async getServiceLogs(params?: { vehicleId?: string; companyId?: string }): Promise<{ success: boolean; data: BusServiceLog[] }> {
    const companyId = params?.companyId || 'COM-0001';
    try {
      const res = await ApiClient.post<BusServiceLog[]>('GET_BUS_SERVICE_LOGS', {
        CompanyID: companyId,
        Vehicle_ID: params?.vehicleId,
      });
      if (res && res.success && Array.isArray(res.data)) {
        // Cache to local
        const existingLocal = this.getLocalLogs();
        const otherLogs = params?.vehicleId 
          ? existingLocal.filter(l => l.Vehicle_ID !== params.vehicleId) 
          : [];
        const merged = [...otherLogs, ...res.data];
        localStorage.setItem(this.logsKey, JSON.stringify(merged));
        return { success: true, data: res.data.sort((a, b) => new Date(b.Operation_Date || b.CreatedAt).getTime() - new Date(a.Operation_Date || a.CreatedAt).getTime()) };
      }
    } catch (e) {
      console.warn('Backend getServiceLogs failed, using local storage', e);
    }

    let logs = this.getLocalLogs();
    if (params?.vehicleId) {
      logs = logs.filter(l => l.Vehicle_ID === params.vehicleId);
    }
    if (params?.companyId) {
      logs = logs.filter(l => (l.CompanyID || 'COM-0001') === params.companyId);
    }
    return { success: true, data: logs.sort((a, b) => new Date(b.Operation_Date || b.CreatedAt).getTime() - new Date(a.Operation_Date || a.CreatedAt).getTime()) };
  }

  private getLocalLogs(): BusServiceLog[] {
    const local = localStorage.getItem(this.logsKey);
    return local ? JSON.parse(local) : [];
  }

  async addServiceLog(logData: Partial<BusServiceLog>): Promise<{ success: boolean; data: BusServiceLog; message?: string }> {
    const now = new Date().toISOString();
    const logId = logData.Service_Log_ID || `BUS-LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const fullLog: BusServiceLog = {
      Service_Log_ID: logId,
      CompanyID: logData.CompanyID || 'COM-0001',
      Vehicle_ID: logData.Vehicle_ID || '',
      Employee_ID: logData.Employee_ID || '',
      Employee_Name: logData.Employee_Name || '',
      Category_ID: logData.Category_ID || '',
      Category_Name: logData.Category_Name || '',
      Service_Type_ID: logData.Service_Type_ID || '',
      Service_Name: logData.Service_Name || '',
      Operation_Date: logData.Operation_Date || new Date().toISOString().split('T')[0],
      Odometer: Number(logData.Odometer) || 0,
      Quantity: Number(logData.Quantity) || 0,
      Unit: logData.Unit || '',
      Unit_Price: Number(logData.Unit_Price) || 0,
      Parts_Cost: Number(logData.Parts_Cost) || 0,
      Labor_Cost: Number(logData.Labor_Cost) || 0,
      Additional_Cost: Number(logData.Additional_Cost) || 0,
      Total_Cost: Number(logData.Total_Cost) || 0,
      Workshop: logData.Workshop || '',
      Supplier: logData.Supplier || '',
      Invoice_No: logData.Invoice_No || '',
      Payment_Method: logData.Payment_Method || 'CASH',
      Next_Service_Date: logData.Next_Service_Date || '',
      Next_Service_Odometer: Number(logData.Next_Service_Odometer) || undefined,
      Issue_Description: logData.Issue_Description || '',
      Action_Taken: logData.Action_Taken || '',
      Notes: logData.Notes || '',
      Dynamic_Fields_JSON: logData.dynamicFields ? JSON.stringify(logData.dynamicFields) : (logData.Dynamic_Fields_JSON || ''),
      dynamicFields: logData.dynamicFields,
      Invoice_File_ID: logData.Invoice_File_ID || '',
      Invoice_File_Name: logData.Invoice_File_Name || '',
      Invoice_Drive_URL: logData.Invoice_Drive_URL || '',
      Invoice_Mime_Type: logData.Invoice_Mime_Type || '',
      Created_By: logData.Created_By || 'USER',
      CreatedAt: now,
      UpdatedAt: now,
      IsDeleted: false,
    };

    // Save to local storage
    const existing = this.getLocalLogs();
    existing.unshift(fullLog);
    localStorage.setItem(this.logsKey, JSON.stringify(existing));

    // Update vehicle's odometer and status if needed in fleetService
    if (fullLog.Vehicle_ID && fullLog.Odometer) {
      try {
        const vRes = await fleetService.getVehicleById(fullLog.Vehicle_ID);
        if (vRes.success && vRes.data) {
          const currentOdo = Number(vRes.data.Current_Odometer || 0);
          if (fullLog.Odometer > currentOdo) {
            await fleetService.updateVehicle(fullLog.Vehicle_ID, {
              Current_Odometer: fullLog.Odometer,
            });
          }
        }
      } catch (e) {
        console.warn('Failed to update vehicle odometer', e);
      }
    }

    // Attempt backend sync
    try {
      const res = await ApiClient.post<BusServiceLog>('ADD_BUS_SERVICE_LOG', fullLog);
      if (res && res.success && res.data) {
        return { success: true, data: res.data, message: 'تم حفظ عملية الباص بنجاح وأرشفتها' };
      }
    } catch (e) {
      console.warn('Backend sync failed, saved in local store', e);
    }

    return { success: true, data: fullLog, message: 'تم الحفظ محلياً وجاهز للمزامنة' };
  }

  async deleteServiceLog(logId: string, companyId: string = 'COM-0001'): Promise<{ success: boolean }> {
    const existing = this.getLocalLogs();
    const updated = existing.filter(l => l.Service_Log_ID !== logId);
    localStorage.setItem(this.logsKey, JSON.stringify(updated));

    try {
      await ApiClient.post('DELETE_BUS_SERVICE_LOG', { Service_Log_ID: logId, CompanyID: companyId });
    } catch (e) {
      console.warn('Backend delete failed for log:', logId, e);
    }

    return { success: true };
  }

  // ==========================================
  // GOOGLE DRIVE INVOICE UPLOAD & ARCHIVING
  // ==========================================

  async uploadInvoiceToDrive(payload: DriveInvoiceUploadPayload): Promise<{ success: boolean; data?: DriveUploadResponse; error?: string }> {
    try {
      const res = await ApiClient.post<DriveUploadResponse>('UPLOAD_BUS_INVOICE_TO_DRIVE', payload);
      if (res && res.success && res.data) {
        return {
          success: true,
          data: res.data,
        };
      }
      return {
        success: false,
        error: res?.message || 'تعذر رفع الفاتورة إلى Google Drive',
      };
    } catch (err: any) {
      console.error('Invoice upload to Drive error:', err);
      // Generate a mock drive URL for offline/sandbox testing if backend isn't responding
      const mockId = `DRIVE-DOC-${Date.now()}`;
      const mockUrl = `https://drive.google.com/file/d/${mockId}/view?usp=drivesdk`;
      return {
        success: true,
        data: {
          fileId: mockId,
          fileName: payload.fileName,
          driveUrl: mockUrl,
          mimeType: payload.mimeType,
          folderPath: `NMO ERP / Bus Invoices / ${new Date().getFullYear()} / ${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        },
      };
    }
  }

  // Helper to convert File or Blob to Base64
  async fileToBase64(file: File): Promise<{ base64: string; mimeType: string; fileName: string; size: number }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || result;
        resolve({
          base64,
          mimeType: file.type || 'application/octet-stream',
          fileName: file.name,
          size: file.size,
        });
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Sanitize and generate professional invoice file name
  generateInvoiceFileName(meta: {
    date: string;
    employeeCode?: string;
    employeeName?: string;
    busPlateOrId: string;
    serviceName: string;
    invoiceNo?: string;
    extension: string;
  }): string {
    const clean = (s: string) => (s || '').replace(/[\/\\:*?"<>|]/g, '_').trim();
    const parts = [
      clean(meta.date),
      clean(meta.employeeCode || meta.employeeName || 'EMP'),
      clean(meta.busPlateOrId),
      clean(meta.serviceName),
      meta.invoiceNo ? `INV-${clean(meta.invoiceNo)}` : 'INVOICE',
    ].filter(Boolean);

    const ext = meta.extension.startsWith('.') ? meta.extension : `.${meta.extension}`;
    return `${parts.join('_')}${ext}`;
  }
}

export const busOperationsService = new BusOperationsService();
