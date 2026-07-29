const fs = require('fs');

let content = fs.readFileSync('src/services/apiClient.ts', 'utf8');

// We will inject a simple local storage mock implementation
const mockLogic = `
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
          message = \`Mocked action: \${action}\`;
      }
    } catch (e: any) {
       return { success: false, data: null, message: e.message, timestamp };
    }

    return {
      success: true,
      data,
      message,
      error: null,
      timestamp,
    };
  }
`;

content = content.replace(/private static mockResponse[\s\S]*\}\s*\}\s*$/m, mockLogic + '\n}');

fs.writeFileSync('src/services/apiClient.ts', content);
