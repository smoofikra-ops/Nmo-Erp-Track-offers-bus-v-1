import { ApiResponse } from '@/types';

// The URL of the Google Apps Script Web App. 
// This should be set in .env.local as VITE_GAS_WEBAPP_URL
const GAS_URL = (import.meta as any).env.VITE_GAS_WEBAPP_URL || '';

export class ApiClient {
  private static async request<T>(action: string, payload: any = {}): Promise<ApiResponse<T>> {
    if (!GAS_URL) {
      console.error('GAS_URL is not configured for action:', action);
      return {
        success: false,
        data: null as any,
        message: 'Google Apps Script URL is not configured. Please set VITE_GAS_WEBAPP_URL.',
        error: {
          code: 'MISSING_CONFIG',
          details: 'VITE_GAS_WEBAPP_URL is not set in the environment variables.',
        },
        timestamp: new Date().toISOString(),
      };
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
        case 'GET_PRODUCTS': {
          data = this.getLocalData('mock_products');
          break;
        }
        case 'CREATE_PRODUCT': {
          const products = this.getLocalData('mock_products');
          const newProd = { 
            ...payload, 
            ProductID: 'PRD-' + Date.now(),
            ProductCode: 'P' + Math.floor(Math.random() * 10000),
            Status: payload.Status || 'ACTIVE'
          };
          products.push(newProd);
          this.setLocalData('mock_products', products);
          data = newProd;
          break;
        }
        case 'UPDATE_PRODUCT': {
          const products = this.getLocalData('mock_products');
          const index = products.findIndex((p: any) => p.ProductID === payload.ProductID);
          if (index !== -1) {
            products[index] = { ...products[index], ...payload };
            this.setLocalData('mock_products', products);
            data = products[index];
          }
          break;
        }
        case 'DELETE_PRODUCT': {
          const products = this.getLocalData('mock_products');
          const newProducts = products.filter((p: any) => p.ProductID !== payload.ProductID);
          this.setLocalData('mock_products', newProducts);
          data = { success: true };
          break;
        }
        case 'SYNC_PRODUCT_IMAGES': {
          const products = this.getLocalData('mock_products');
          data = { success: true, data: { totalProducts: products.length, totalImages: 10, matchCount: 5, noMatchCount: 5, updatedCount: 5, duplicates: [] } };
          break;
        }
        case 'SEED_DEFAULT_PRODUCTS': {
          const products = this.getLocalData('mock_products');
          if (products.length === 0) {
             const defaultProds = [
               { ProductID: 'PRD-1', SKU: 'SKU-001', ArabicName: 'منتج 1', EnglishName: 'Product 1', DefaultCommission: 10, SellingPrice: 100, Status: 'ACTIVE' },
               { ProductID: 'PRD-2', SKU: 'SKU-002', ArabicName: 'منتج 2', EnglishName: 'Product 2', DefaultCommission: 15, SellingPrice: 150, Status: 'ACTIVE' }
             ];
             this.setLocalData('mock_products', defaultProds);
          }
          data = { success: true };
          break;
        }
        
        case 'GET_QUOTE_PRODUCTS': {
          data = this.getLocalData('mock_quote_products');
          break;
        }
        case 'CREATE_QUOTE_PRODUCT': {
          const products = this.getLocalData('mock_quote_products');
          const newProd = { 
            ...payload, 
            id: 'QPRD-' + Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          products.push(newProd);
          this.setLocalData('mock_quote_products', products);
          data = newProd;
          break;
        }
        case 'GET_QUOTE_OFFERS': {
          data = this.getLocalData('mock_quote_offers');
          break;
        }
        case 'CREATE_QUOTE_OFFER': {
          const offers = this.getLocalData('mock_quote_offers');
          const newOffer = {
            ...payload,
            id: 'QOFF-' + Date.now(),
            offerNumber: 'OFF-' + Math.floor(Math.random() * 10000),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          offers.push(newOffer);
          this.setLocalData('mock_quote_offers', offers);
          data = newOffer;
          break;
        }

        case 'GET_SYSTEM_HEALTH':
          data = {
            gasConnected: false,
            sheetsAccessible: false,
            existingSheets: ['Companies', 'Users', 'Roles'],
            missingSheets: ['Employees', 'Products'],
            lastInitializedAt: null,
            coreRecordsCount: 3,
            databaseVersion: '1.0.0',
            appVersion: '1.0.0',
          };
          message = 'Mock health data';
          break;
        case 'INITIALIZE_DATABASE':
          data = {
            sheetsCreated: ['Employees', 'Products', 'Settings', 'NumberSequences', 'AuditLogs'],
            status: 'success'
          };
          message = 'Database initialized successfully (Mocked)';
          break;
        default:
          data = null;
          message = `Mocked action: ${action}`;
      }
    } catch (e: any) {
       return { success: false, data: null, message: e.message, timestamp, error: { code: "ERROR", details: e.message } };
    }

    return {
      success: true,
      data,
      message,
      error: null,
      timestamp,
    };
  }

}