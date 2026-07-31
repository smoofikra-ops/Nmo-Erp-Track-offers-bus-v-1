import { ApiResponse } from '@/types';

// The URL of the Google Apps Script Web App. 
// This should be set in .env.local as VITE_GAS_WEBAPP_URL
const GAS_URL = (import.meta as any).env.VITE_GAS_WEBAPP_URL || '';

export class ApiClient {
  private static async request<T>(action: string, payload: any = {}): Promise<ApiResponse<T>> {
    if (!GAS_URL) {
      console.log('GAS_URL is not configured, running in mock mode for action:', action);
      return this.mockResponse<T>(action, payload);
    }

    try {
      const response = await fetch(GAS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // GAS requires this to avoid preflight issues in some cases
        },
        body: JSON.stringify({
          action,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const textResponse = await response.text();
      let data: ApiResponse<T>;
      try {
        data = JSON.parse(textResponse);
      } catch (jsonError) {
        throw new Error(`Invalid JSON response from Google Apps Script. Check VITE_GAS_WEBAPP_URL.`);
      }
      return data;
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: 'Network error or server unreachable.',
        error: {
          code: 'NETWORK_ERROR',
          details: error.message,
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async get<T>(action: string, params: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(action, params);
  }

  static async post<T>(action: string, data: any = {}): Promise<ApiResponse<T>> {
    return this.request<T>(action, data);
  }

  // --- Mock implementation for development without actual GAS backend ---
  
  // --- Stateful Mock Implementation ---
  private static getLocalData(key: string) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private static setLocalData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  private static mockResponse<T>(action: string, payload: any = {}): ApiResponse<T> {
    const timestamp = new Date().toISOString();
    let data: any = null;
    let message = 'Success (Mocked)';

    try {
      switch (action) {
        case 'GET_EMPLOYEES': {
          data = this.getLocalData('mock_employees');
          break;
        }
        case 'CREATE_EMPLOYEE': {
          const employees = this.getLocalData('mock_employees');
          const newEmp = { 
            ...payload, 
            EmployeeID: 'EMP-' + Date.now(),
            EmployeeCode: 'E' + Math.floor(Math.random() * 10000),
            Status: payload.Status || 'ACTIVE'
          };
          employees.push(newEmp);
          this.setLocalData('mock_employees', employees);
          data = newEmp;
          break;
        }
        case 'UPDATE_EMPLOYEE': {
          const employees = this.getLocalData('mock_employees');
          const index = employees.findIndex((e: any) => e.EmployeeID === payload.EmployeeID);
          if (index !== -1) {
            employees[index] = { ...employees[index], ...payload };
            this.setLocalData('mock_employees', employees);
            data = employees[index];
          }
          break;
        }
        case 'DELETE_EMPLOYEE': {
          const employees = this.getLocalData('mock_employees');
          // Hard delete for the demo
          const newEmployees = employees.filter((e: any) => e.EmployeeID !== payload.EmployeeID);
          this.setLocalData('mock_employees', newEmployees);
          data = { success: true };
          break;
        }
        case 'RESTORE_EMPLOYEE': {
          const employees = this.getLocalData('mock_employees');
          const index = employees.findIndex((e: any) => e.EmployeeID === payload.EmployeeID);
          if (index !== -1) {
            employees[index].IsDeleted = false;
            this.setLocalData('mock_employees', employees);
          }
          data = { success: true };
          break;
        }
        case 'GET_QUOTES': {
          data = this.getLocalData('mock_quotes') || [];
          break;
        }
        case 'CREATE_QUOTE': {
          const quotes = this.getLocalData('mock_quotes') || [];
          const newQuote = { ...payload, id: 'QT-' + Date.now() };
          quotes.push(newQuote);
          this.setLocalData('mock_quotes', quotes);
          data = newQuote;
          break;
        }
        case 'UPDATE_QUOTE': {
          const quotes = this.getLocalData('mock_quotes') || [];
          const index = quotes.findIndex((q: any) => q.id === payload.id);
          if (index !== -1) {
             quotes[index] = { ...quotes[index], ...payload };
             this.setLocalData('mock_quotes', quotes);
             data = quotes[index];
          } else {
             data = payload;
          }
          break;
        }
        case 'GET_COMMISSION_RECORDS':
        case 'GET_COMMISSION_RECEIPTS': {
          let records = this.getLocalData('mock_commission_records');
          if (!records || records.length === 0) {
            // Seed default records if empty
            records = [
              {
                id: 'REC-1001',
                transactionNo: 'TRX-2026-001',
                companyId: payload.CompanyID || 'COM-0001',
                createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
                formattedDate: '2026-07-29 09:30',
                employeeId: 'EMP-001',
                employeeName: 'أحمد محمود العتيبي',
                employeeCode: 'E1001',
                commissionType: 'PRODUCT_COMMISSION',
                commissionTypeLabel: 'عمولة منتجات',
                quantityOrOrdersCount: 15,
                grossCommission: 450,
                totalDiscount: 50,
                netCommission: 400,
                totalOrderValue: 2850,
                onlinePaidAmount: 1200,
                codRequiredAmount: 1600,
                remainingBalance: 0,
                notes: 'تسوية شحنة الرياض - تم خصم قطعة تالفة',
                items: [
                  { productId: 'P-1', sku: 'SKU-APP-1', productName: 'عصير برتقال طبيعي 1L', quantity: 10, unitCommission: 30, totalCommission: 300 },
                  { productId: 'P-2', sku: 'SKU-APP-2', productName: 'مياه غازية فاخرة', quantity: 5, unitCommission: 30, totalCommission: 150 }
                ],
                discounts: [
                  { id: 'd1', name: 'خصم تعويض عن منتج متضرر', amount: 50 }
                ]
              },
              {
                id: 'REC-1002',
                transactionNo: 'TRX-2026-002',
                companyId: payload.CompanyID || 'COM-0001',
                createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
                formattedDate: '2026-07-28 16:15',
                employeeId: 'EMP-002',
                employeeName: 'خالد عبد الله الشمري',
                employeeCode: 'E1002',
                commissionType: 'ORDER_COUNT_COMMISSION',
                commissionTypeLabel: 'عمولة عدد الطلبات',
                quantityOrOrdersCount: 45,
                grossCommission: 135,
                totalDiscount: 0,
                netCommission: 135,
                totalOrderValue: 4500,
                onlinePaidAmount: 2000,
                codRequiredAmount: 2500,
                remainingBalance: 0,
                notes: 'تسوية عدد طلبات الأسبوع الحالي',
                items: [],
                discounts: []
              }
            ];
            this.setLocalData('mock_commission_records', records);
          }
          data = records;
          break;
        }
        case 'CREATE_PRODUCT_COMMISSION':
        case 'CREATE_ORDER_COUNT_COMMISSION':
        case 'SAVE_COMMISSION_RECORD': {
          const records = this.getLocalData('mock_commission_records') || [];
          const recordToSave = payload.record || payload;
          const newRecord = {
            id: 'REC-' + Date.now(),
            transactionNo: recordToSave.transactionNo || 'TRX-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 900 + 100)),
            companyId: recordToSave.companyId || payload.CompanyID || 'COM-0001',
            createdAt: new Date().toISOString(),
            formattedDate: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Riyadh' }).replace('T', ' ').slice(0, 16),
            ...recordToSave
          };
          records.unshift(newRecord);
          this.setLocalData('mock_commission_records', records);
          data = { receipt: { ReceiptNumber: newRecord.transactionNo }, record: newRecord };
          break;
        }
        case 'DELETE_COMMISSION_RECORD': {
          let records = this.getLocalData('mock_commission_records') || [];
          records = records.filter((r: any) => r.id !== payload.id && r.transactionNo !== payload.id);
          this.setLocalData('mock_commission_records', records);
          data = { success: true };
          break;
        }
      default:
        console.warn(`[Mock] Unhandled action: \${action}`);
        data = payload;
        break;
    }
    
    return {
      success: true,
      error: undefined,
      data: data,
      message,
      timestamp,
    };
  } catch (error: any) {
    return {
      success: false,
      data: null as any,
      message: 'Mock execution failed.',
      error: { code: 'MOCK_ERROR', details: error.message },
      timestamp,
    };
  }
}
}
