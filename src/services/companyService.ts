import { ApiClient } from './apiClient';
import { Company, ApiResponse } from '@/types';

export const companyService = {
  getCurrentCompany: (companyId: string): Promise<ApiResponse<Company>> => {
    return ApiClient.get('GET_CURRENT_COMPANY', { companyId });
  },
  
  updateCompany: (companyId: string, data: Partial<Company>): Promise<ApiResponse<Company>> => {
    return ApiClient.post('UPDATE_COMPANY', { companyId, ...data });
  }
};
