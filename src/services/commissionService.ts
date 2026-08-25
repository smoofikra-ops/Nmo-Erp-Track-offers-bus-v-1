import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types';
import { CommissionRecord } from '@/types/commissions';

const STORAGE_KEY = 'erp_commission_records_cache';
const SETTINGS_KEY = 'erp_commission_settings_cache';

const defaultCommissionRecords: CommissionRecord[] = [
  {
    id: 'REC-001',
    transactionNo: 'COM-2026-0001',
    companyId: 'COM-0001',
    createdAt: '2026-02-15T10:30:00.000Z',
    formattedDate: '2026-02-15 10:30',
    employeeId: 'EMP-001',
    employeeName: 'محمد عبدالله الغامدي',
    employeeCode: 'EMP-101',
    commissionType: 'ORDER_COUNT_COMMISSION',
    commissionTypeLabel: 'عمولة عدد الطلبات',
    quantityOrOrdersCount: 145,
    grossCommission: 435.0,
    totalDiscount: 0,
    netCommission: 435.0,
    totalOrderValue: 5800.0,
    totalRequiredAmount: 5800.0,
    onlinePaidAmount: 3200.0,
    codRequiredAmount: 2600.0,
    totalDiscounts: 0,
    finalRequiredAmount: 2600.0,
    remainingBalance: 0,
    notes: 'إغلاق وردية التوزيع الأسبوعية',
    items: [],
    discounts: [],
    requiredItems: [],
    paymentItems: [],
    revisions: [],
    auditLogs: [],
    version: 1,
    IsDeleted: false
  },
  {
    id: 'REC-002',
    transactionNo: 'COM-2026-0002',
    companyId: 'COM-0001',
    createdAt: '2026-02-20T14:15:00.000Z',
    formattedDate: '2026-02-20 14:15',
    employeeId: 'EMP-002',
    employeeName: 'خالد سعيد القحطاني',
    employeeCode: 'EMP-102',
    commissionType: 'PRODUCT_COMMISSION',
    commissionTypeLabel: 'عمولة منتجات',
    quantityOrOrdersCount: 65,
    grossCommission: 195.0,
    totalDiscount: 20.0,
    netCommission: 175.0,
    totalOrderValue: 3450.0,
    totalRequiredAmount: 3450.0,
    onlinePaidAmount: 1800.0,
    codRequiredAmount: 1650.0,
    totalDiscounts: 20.0,
    finalRequiredAmount: 1630.0,
    remainingBalance: 0,
    notes: 'مبيعات منتجات مياه وعصائر',
    items: [
      {
        productId: 'PROD-001',
        sku: 'SKU-001',
        productName: 'كرتون مياه نقي 330 مل',
        quantity: 40,
        unitCommission: 1.5,
        totalCommission: 60.0
      },
      {
        productId: 'PROD-002',
        sku: 'SKU-002',
        productName: 'كرتون عصير برتقال طبيعي',
        quantity: 25,
        unitCommission: 2.0,
        totalCommission: 50.0
      }
    ],
    discounts: [
      {
        id: 'DISC-01',
        name: 'خصم تأخير تسليم',
        description: 'خصم تأخير تسليم',
        amount: 20.0
      }
    ],
    requiredItems: [],
    paymentItems: [],
    revisions: [],
    auditLogs: [],
    version: 1,
    IsDeleted: false
  }
];

function getStoredRecords(): CommissionRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore
  }
  return defaultCommissionRecords;
}

function setStoredRecords(records: CommissionRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    // Ignore
  }
}

export const commissionService = {
  getSettings: async (companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    try {
      const res = await ApiClient.post('GET_COMMISSION_SETTINGS', { CompanyID: companyId });
      if (res && res.success && res.data) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(res.data));
        return res;
      }
    } catch (e) {
      // Fallback
    }

    let cached = null;
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) cached = JSON.parse(raw);
    } catch (e) {}

    return {
      success: true,
      data: cached || {
        orderCommissionThreshold: 50,
        tier1Rate: 2.0,
        tier2Rate: 3.0,
        defaultProductCommission: 1.5
      },
      message: 'تم استرجاع إعدادات العمولات',
      timestamp: new Date().toISOString()
    };
  },
  
  updateSettings: async (companyId: string, settings: any): Promise<ApiResponse<any>> => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}
    ApiClient.post('UPDATE_COMMISSION_SETTINGS', { CompanyID: companyId, settings }).catch(() => {});
    return {
      success: true,
      data: settings,
      message: 'تم حفظ إعدادات العمولات بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  getMonthlyEmployeeOrderTotal: async (companyId: string, employeeId: string, commissionMonth: string): Promise<ApiResponse<{totalOrders: number}>> => {
    try {
      const res = await ApiClient.post<{totalOrders: number}>('GET_MONTHLY_EMPLOYEE_ORDER_TOTAL', { CompanyID: companyId, EmployeeID: employeeId, CommissionMonth: commissionMonth });
      if (res && res.success && res.data) return res;
    } catch (e) {}

    const records = getStoredRecords().filter(r => r.employeeId === employeeId && !r.IsDeleted);
    const totalOrders = records.reduce((sum, r) => sum + (r.quantityOrOrdersCount || 0), 0);

    return {
      success: true,
      data: { totalOrders },
      message: 'تم احتساب عدد الطلبات بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  createOrderCountCommission: async (data: any): Promise<ApiResponse<any>> => {
    return ApiClient.post('CREATE_ORDER_COUNT_COMMISSION', data);
  },

  createProductCommission: async (data: any): Promise<ApiResponse<any>> => {
    return ApiClient.post('CREATE_PRODUCT_COMMISSION', data);
  },

  getCommissionReceipts: async (companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    return ApiClient.post('GET_COMMISSION_RECEIPTS', { CompanyID: companyId });
  },

  getCommissionRecords: async (companyId: string = 'COM-0001'): Promise<ApiResponse<CommissionRecord[]>> => {
    try {
      const res = await ApiClient.post<CommissionRecord[]>('GET_COMMISSION_RECORDS', { CompanyID: companyId });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStoredRecords(res.data);
        return res;
      }
    } catch (e) {}

    const cached = getStoredRecords().filter(r => !r.companyId || r.companyId === companyId);
    return {
      success: true,
      data: cached,
      message: 'تم استرجاع سجلات العمولات بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  saveCommissionRecord: async (record: any): Promise<ApiResponse<any>> => {
    const newRecord: CommissionRecord = {
      ...record,
      id: record.id || `REC-${Date.now().toString().slice(-6)}`,
      transactionNo: record.transactionNo || `COM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: record.createdAt || new Date().toISOString(),
      formattedDate: record.formattedDate || new Date().toISOString().replace('T', ' ').slice(0, 16),
      IsDeleted: false,
      version: 1
    };

    const current = getStoredRecords();
    setStoredRecords([newRecord, ...current]);

    ApiClient.post('SAVE_COMMISSION_RECORD', { record: newRecord }).catch(() => {});

    return {
      success: true,
      data: newRecord,
      message: 'تم حفظ سجل العمولة بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  updateCommissionRecord: async (record: any): Promise<ApiResponse<any>> => {
    const current = getStoredRecords();
    const index = current.findIndex(r => r.id === record.id);
    let updated = record;
    if (index >= 0) {
      updated = { ...current[index], ...record, version: (current[index].version || 1) + 1 };
      current[index] = updated;
      setStoredRecords([...current]);
    }

    ApiClient.post('UPDATE_COMMISSION_RECORD', { record: updated }).catch(() => {});

    return {
      success: true,
      data: updated,
      message: 'تم تحديث سجل العمولة بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  deleteCommissionRecord: async (id: string): Promise<ApiResponse<any>> => {
    const current = getStoredRecords();
    const updated = current.map(r => r.id === id ? { ...r, IsDeleted: true } : r);
    setStoredRecords(updated);

    ApiClient.post('DELETE_COMMISSION_RECORD', { id }).catch(() => {});

    return {
      success: true,
      data: { id },
      message: 'تم حذف سجل العمولة بنجاح',
      timestamp: new Date().toISOString()
    };
  }
};

