import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types';

export const commissionService = {
  getSettings: (companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('GET_COMMISSION_SETTINGS', { CompanyID: companyId });
  },
  
  updateSettings: (companyId: string, settings: any): Promise<ApiResponse<any>> => {
    return ApiClient.post('UPDATE_COMMISSION_SETTINGS', { CompanyID: companyId, settings });
  },

  getMonthlyEmployeeOrderTotal: (companyId: string, employeeId: string, commissionMonth: string): Promise<ApiResponse<{totalOrders: number}>> => {
    return ApiClient.post('GET_MONTHLY_EMPLOYEE_ORDER_TOTAL', { CompanyID: companyId, EmployeeID: employeeId, CommissionMonth: commissionMonth });
  },

  createOrderCountCommission: (data: any): Promise<ApiResponse<any>> => {
    return ApiClient.post('CREATE_ORDER_COUNT_COMMISSION', data);
  },

  createProductCommission: (data: any): Promise<ApiResponse<any>> => {
    return ApiClient.post('CREATE_PRODUCT_COMMISSION', data);
  },

  getCommissionReceipts: (companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('GET_COMMISSION_RECEIPTS', { CompanyID: companyId });
  },

  getCommissionRecords: (companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('GET_COMMISSION_RECORDS', { CompanyID: companyId });
  },

  saveCommissionRecord: (record: any): Promise<ApiResponse<any>> => {
    return ApiClient.post('SAVE_COMMISSION_RECORD', { record });
  },
  updateCommissionRecord: (record: any): Promise<ApiResponse<any>> => {
    return ApiClient.post('UPDATE_COMMISSION_RECORD', { record });
  },

  deleteCommissionRecord: (id: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('DELETE_COMMISSION_RECORD', { id });
  }
};
