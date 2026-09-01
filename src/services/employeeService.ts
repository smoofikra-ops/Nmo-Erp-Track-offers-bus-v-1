import { ApiClient } from './apiClient';
import { Employee, ApiResponse, CommissionType, EmployeeStatus } from '@/types';

const STORAGE_KEY = 'erp_employees_cache';

const defaultEmployees: Employee[] = [
  {
    EmployeeID: 'EMP-001',
    CompanyID: 'COM-0001',
    EmployeeCode: 'EMP-101',
    ArabicName: 'محمد عبدالله الغامدي',
    EnglishName: 'Mohammed Al-Ghamdi',
    Alias: 'محمد الغامدي',
    Mobile: '0501234567',
    Email: 'mohammed@example.com',
    NationalID: '1098765432',
    JobTitleAR: 'سائق توزيع أول',
    JobTitleEN: 'Senior Delivery Driver',
    DepartmentID: 'DEP-LOGISTICS',
    HireDate: '2023-01-15',
    BasicSalary: 4500,
    CommissionType: CommissionType.SALARY_AND_COMMISSION,
    Status: EmployeeStatus.ACTIVE,
    Notes: 'سائق نشط ومتميز',
    CreatedAt: '2023-01-15T08:00:00.000Z',
    UpdatedAt: '2023-01-15T08:00:00.000Z',
    IsDeleted: false
  },
  {
    EmployeeID: 'EMP-002',
    CompanyID: 'COM-0001',
    EmployeeCode: 'EMP-102',
    ArabicName: 'خالد سعيد القحطاني',
    EnglishName: 'Khaled Al-Qahtani',
    Alias: 'خالد القحطاني',
    Mobile: '0559876543',
    Email: 'khaled@example.com',
    NationalID: '1087654321',
    JobTitleAR: 'مندوب مبيعات ميداني',
    JobTitleEN: 'Field Sales Rep',
    DepartmentID: 'DEP-SALES',
    HireDate: '2023-03-01',
    BasicSalary: 5000,
    CommissionType: CommissionType.PRODUCT_COMMISSION_ONLY,
    Status: EmployeeStatus.ACTIVE,
    Notes: '',
    CreatedAt: '2023-03-01T08:00:00.000Z',
    UpdatedAt: '2023-03-01T08:00:00.000Z',
    IsDeleted: false
  },
  {
    EmployeeID: 'EMP-003',
    CompanyID: 'COM-0001',
    EmployeeCode: 'EMP-103',
    ArabicName: 'سعد فهد الشمري',
    EnglishName: 'Saad Al-Shammari',
    Alias: 'سعد الشمري',
    Mobile: '0543219876',
    Email: 'saad@example.com',
    NationalID: '1076543210',
    JobTitleAR: 'مشرف أسطول ونقليات',
    JobTitleEN: 'Fleet Supervisor',
    DepartmentID: 'DEP-LOGISTICS',
    HireDate: '2022-11-10',
    BasicSalary: 6500,
    CommissionType: CommissionType.NONE,
    Status: EmployeeStatus.ACTIVE,
    Notes: '',
    CreatedAt: '2022-11-10T08:00:00.000Z',
    UpdatedAt: '2022-11-10T08:00:00.000Z',
    IsDeleted: false
  }
];

function getStoredEmployees(): Employee[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore error
  }
  return defaultEmployees;
}

function setStoredEmployees(employees: Employee[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
  } catch (e) {
    // Ignore error
  }
}

export const employeeService = {
  getEmployees: async (companyId: string = 'COM-0001'): Promise<ApiResponse<Employee[]>> => {
    try {
      const res = await ApiClient.post<Employee[]>('GET_EMPLOYEES', { CompanyID: companyId });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStoredEmployees(res.data);
        return res;
      }
    } catch (e) {
      // Fallback to cache
    }

    const cached = getStoredEmployees().filter(e => !e.CompanyID || e.CompanyID === companyId);
    return {
      success: true,
      data: cached,
      message: 'تم استرجاع بيانات الموظفين بنجاح',
      timestamp: new Date().toISOString()
    };
  },
  
  createEmployee: async (data: any): Promise<ApiResponse<Employee>> => {
    try {
      const res = await ApiClient.post<Employee>('CREATE_EMPLOYEE', data);
      if (res && res.success && res.data) {
        const current = getStoredEmployees();
        const existingIdx = current.findIndex(e => e.EmployeeID === res.data.EmployeeID);
        if (existingIdx >= 0) {
          current[existingIdx] = res.data;
          setStoredEmployees(current);
        } else {
          setStoredEmployees([res.data, ...current]);
        }
        return res;
      }
      return {
        success: false,
        data: null as any,
        message: res?.message || 'فشل حفظ بيانات الموظف في الخادم.',
        error: res?.error,
        timestamp: new Date().toISOString()
      };
    } catch (e: any) {
      console.error('Failed to create employee:', e);
      return {
        success: false,
        data: null as any,
        message: e?.message || 'حدث خطأ أثناء حفظ بيانات الموظف.',
        error: { code: 'NETWORK_ERROR', details: e?.message || '' },
        timestamp: new Date().toISOString()
      };
    }
  },

  updateEmployee: async (data: any): Promise<ApiResponse<Employee>> => {
    try {
      const res = await ApiClient.post<Employee>('UPDATE_EMPLOYEE', data);
      if (res && res.success && res.data) {
        const current = getStoredEmployees();
        const index = current.findIndex(e => e.EmployeeID === res.data.EmployeeID);
        if (index >= 0) {
          current[index] = { ...current[index], ...res.data, UpdatedAt: new Date().toISOString() };
          setStoredEmployees([...current]);
        }
        return res;
      }
      return {
        success: false,
        data: null as any,
        message: res?.message || 'فشل تحديث بيانات الموظف في الخادم.',
        error: res?.error,
        timestamp: new Date().toISOString()
      };
    } catch (e: any) {
      console.error('Failed to update employee:', e);
      return {
        success: false,
        data: null as any,
        message: e?.message || 'حدث خطأ أثناء تحديث بيانات الموظف.',
        error: { code: 'NETWORK_ERROR', details: e?.message || '' },
        timestamp: new Date().toISOString()
      };
    }
  },

  deleteEmployee: async (employeeId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    const current = getStoredEmployees();
    const updated = current.map(e => e.EmployeeID === employeeId ? { ...e, IsDeleted: true, DeletedAt: new Date().toISOString() } : e);
    setStoredEmployees(updated);

    ApiClient.post('DELETE_EMPLOYEE', { EmployeeID: employeeId, CompanyID: companyId }).catch(() => {});

    return {
      success: true,
      data: { EmployeeID: employeeId },
      message: 'تم حذف الموظف بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  restoreEmployee: async (employeeId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    const current = getStoredEmployees();
    const updated = current.map(e => e.EmployeeID === employeeId ? { ...e, IsDeleted: false, DeletedAt: undefined } : e);
    setStoredEmployees(updated);

    ApiClient.post('RESTORE_EMPLOYEE', { EmployeeID: employeeId, CompanyID: companyId }).catch(() => {});

    return {
      success: true,
      data: { EmployeeID: employeeId },
      message: 'تم استعادة الموظف بنجاح',
      timestamp: new Date().toISOString()
    };
  }
};


