import { ApiClient } from './apiClient';
import { Employee, ApiResponse } from '@/types';

export const employeeService = {
  getEmployees: (companyId: string): Promise<ApiResponse<Employee[]>> => {
    return ApiClient.post('GET_EMPLOYEES', { CompanyID: companyId });
  },
  
  createEmployee: (data: any): Promise<ApiResponse<Employee>> => {
    return ApiClient.post('CREATE_EMPLOYEE', data);
  },

  updateEmployee: (data: any): Promise<ApiResponse<Employee>> => {
    return ApiClient.post('UPDATE_EMPLOYEE', data);
  },

  deleteEmployee: (employeeId: string, companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('DELETE_EMPLOYEE', { EmployeeID: employeeId, CompanyID: companyId });
  },

  restoreEmployee: (employeeId: string, companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('RESTORE_EMPLOYEE', { EmployeeID: employeeId, CompanyID: companyId });
  }
};
