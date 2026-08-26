import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types';
import { CommissionRecord } from '@/types/commissions';

const STORAGE_KEY = 'erp_commission_records_cache_v2';
const LEGACY_STORAGE_KEY = 'erp_commission_records_cache';
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

/**
 * Normalizes any commission data structure (ApiResponse, raw array, nested objects, stringified JSON)
 * into a strictly typed and validated CommissionRecord[] array.
 */
export function normalizeCommissionRecords(rawInput: any): CommissionRecord[] {
  if (!rawInput) return [];

  let candidates: any = rawInput;

  // 1. If string, attempt JSON parse
  if (typeof candidates === 'string') {
    const trimmed = candidates.trim();
    if (!trimmed) return [];
    try {
      candidates = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  // 2. If wrapped in an ApiResponse object: e.g. { success: true, data: [...] }
  if (candidates && typeof candidates === 'object' && !Array.isArray(candidates)) {
    if (candidates.data !== undefined) {
      candidates = candidates.data;
      if (typeof candidates === 'string') {
        try {
          candidates = JSON.parse(candidates);
        } catch {
          candidates = [];
        }
      }
      if (candidates && typeof candidates === 'object' && !Array.isArray(candidates)) {
        if (Array.isArray(candidates.records)) {
          candidates = candidates.records;
        } else if (Array.isArray(candidates.CommissionRecords)) {
          candidates = candidates.CommissionRecords;
        } else if (Array.isArray(candidates.items)) {
          candidates = candidates.items;
        }
      }
    } else if (Array.isArray(candidates.records)) {
      candidates = candidates.records;
    } else if (Array.isArray(candidates.CommissionRecords)) {
      candidates = candidates.CommissionRecords;
    } else if (Array.isArray(candidates.items)) {
      candidates = candidates.items;
    } else {
      // Single record object check
      if (candidates.id && (candidates.transactionNo || candidates.employeeName || candidates.netCommission !== undefined)) {
        candidates = [candidates];
      } else {
        return [];
      }
    }
  }

  if (!Array.isArray(candidates)) {
    return [];
  }

  const parseArrayField = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim()) {
      try {
        const p = JSON.parse(val);
        if (Array.isArray(p)) return p;
      } catch {}
    }
    return [];
  };

  return candidates
    .filter((r: any) => r && typeof r === 'object' && !r.IsDeleted)
    .map((r: any, idx: number): CommissionRecord => {
      const id = String(r.id || r.ID || r.RecordID || `REC-${Date.now()}-${idx}`);
      const gross = Number(r.grossCommission || r.GrossCommission || r.totalCommission || 0) || 0;
      const discount = Number(r.totalDiscount || r.totalDiscounts || r.TotalDiscount || r.discount || 0) || 0;
      const net = Number(r.netCommission || r.NetCommission || r.netAmount || (gross - discount)) || 0;

      return {
        id,
        transactionNo: String(r.transactionNo || r.TransactionNo || r.trxNo || `COM-${id}`),
        companyId: String(r.companyId || r.CompanyID || 'COM-0001'),
        createdAt: String(r.createdAt || r.CreatedAt || r.timestamp || new Date().toISOString()),
        formattedDate: String(r.formattedDate || r.FormattedDate || r.date || (r.createdAt ? String(r.createdAt).slice(0, 16).replace('T', ' ') : '')),
        employeeId: String(r.employeeId || r.EmployeeID || r.empId || ''),
        employeeName: String(r.employeeName || r.EmployeeName || r.name || 'موظف غير محدد'),
        employeeCode: String(r.employeeCode || r.EmployeeCode || r.code || ''),
        commissionType: (r.commissionType || r.CommissionType || 'PRODUCT_COMMISSION') as any,
        commissionTypeLabel: String(r.commissionTypeLabel || r.CommissionTypeLabel || (r.commissionType === 'ORDER_COUNT_COMMISSION' ? 'عمولة عدد الطلبات' : 'عمولة منتجات')),
        quantityOrOrdersCount: Number(r.quantityOrOrdersCount || r.QuantityOrOrdersCount || r.ordersCount || r.quantity || 0) || 0,
        grossCommission: gross,
        totalDiscount: discount,
        netCommission: net,
        totalOrderValue: Number(r.totalOrderValue || r.TotalOrderValue || 0) || 0,
        totalRequiredAmount: Number(r.totalRequiredAmount || r.TotalRequiredAmount || 0) || 0,
        onlinePaidAmount: Number(r.onlinePaidAmount || r.OnlinePaidAmount || 0) || 0,
        codRequiredAmount: Number(r.codRequiredAmount || r.CodRequiredAmount || 0) || 0,
        totalDiscounts: discount,
        finalRequiredAmount: Number(r.finalRequiredAmount || r.FinalRequiredAmount || 0) || 0,
        remainingBalance: Number(r.remainingBalance || r.RemainingBalance || 0) || 0,
        notes: String(r.notes || r.Notes || ''),
        items: parseArrayField(r.items || r.Items),
        discounts: parseArrayField(r.discounts || r.Discounts),
        requiredItems: parseArrayField(r.requiredItems || r.RequiredItems),
        paymentItems: parseArrayField(r.paymentItems || r.PaymentItems),
        revisions: parseArrayField(r.revisions || r.Revisions),
        auditLogs: parseArrayField(r.auditLogs || r.AuditLogs),
        orderCountDetails: typeof r.orderCountDetails === 'string' ? (() => { try { return JSON.parse(r.orderCountDetails); } catch { return undefined; } })() : r.orderCountDetails,
        version: Number(r.version || 1) || 1,
        IsDeleted: Boolean(r.IsDeleted),
      };
    });
}

function getStoredRecords(): CommissionRecord[] {
  try {
    // Check v2 cache first
    const rawV2 = localStorage.getItem(STORAGE_KEY);
    if (rawV2) {
      const normalized = normalizeCommissionRecords(rawV2);
      if (normalized.length > 0) return normalized;
    }

    // Check and migrate legacy cache if present
    const rawLegacy = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (rawLegacy) {
      const normalized = normalizeCommissionRecords(rawLegacy);
      if (normalized.length > 0) {
        setStoredRecords(normalized);
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        return normalized;
      }
    }
  } catch (e) {
    // Ignore storage parse errors
  }
  return defaultCommissionRecords;
}

function setStoredRecords(records: CommissionRecord[]): void {
  try {
    const clean = normalizeCommissionRecords(records);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
  } catch (e) {
    // Ignore storage write errors
  }
}

export const commissionService = {
  normalizeCommissionRecords,

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
      const res = await ApiClient.post<any>('GET_COMMISSION_RECORDS', { CompanyID: companyId });
      const normalized = normalizeCommissionRecords(res);

      if ((import.meta as any).env?.DEV) {
        console.debug('[CommissionService] GET_COMMISSION_RECORDS diagnostics:', {
          action: 'GET_COMMISSION_RECORDS',
          success: res?.success,
          typeofData: typeof res?.data,
          isArrayData: Array.isArray(res?.data),
          keys: res?.data && typeof res?.data === 'object' ? Object.keys(res.data) : [],
          recordCount: normalized.length
        });
      }

      if (res && res.success) {
        setStoredRecords(normalized);
        return {
          success: true,
          data: normalized,
          message: res.message || 'تم استرجاع سجلات العمولات بنجاح',
          timestamp: res.timestamp || new Date().toISOString()
        };
      }

      if (res && !res.success && res.error) {
        const cached = getStoredRecords().filter(r => !r.companyId || r.companyId === companyId);
        return {
          success: false,
          data: cached,
          message: res.message || 'تعذر جلب سجلات العمولات من الخادم',
          error: res.error,
          timestamp: new Date().toISOString()
        };
      }
    } catch (e: any) {
      if ((import.meta as any).env?.DEV) {
        console.warn('[CommissionService] GET_COMMISSION_RECORDS error, falling back to cache:', e);
      }
    }

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

