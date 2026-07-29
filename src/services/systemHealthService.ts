import { ApiClient } from './apiClient';
import { SystemHealthData, ApiResponse } from '@/types';

export const systemHealthService = {
  getHealth: (): Promise<ApiResponse<SystemHealthData>> => {
    return ApiClient.get('GET_SYSTEM_HEALTH');
  },
  
  initializeDatabase: (): Promise<ApiResponse<any>> => {
    return ApiClient.post('INITIALIZE_DATABASE');
  }
};
