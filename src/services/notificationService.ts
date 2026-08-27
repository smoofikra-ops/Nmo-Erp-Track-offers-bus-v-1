import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types/responses';

export interface ERPNotification {
  id: string;
  title: string;
  description: string;
  module: 'FLEET' | 'COMMISSIONS' | 'INVENTORY';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  linkTo: string;
}

export interface NotificationSummaryResponse {
  notifications: ERPNotification[];
  unreadCount: number;
  summary: {
    fleetAlerts: number;
    commissionPending: number;
    inventoryAlerts: number;
  };
}

export const notificationService = {
  getSummary: async (companyId: string = 'COM-0001'): Promise<ApiResponse<NotificationSummaryResponse>> => {
    return ApiClient.post<NotificationSummaryResponse>('GET_NOTIFICATION_SUMMARY', { CompanyID: companyId });
  },
};
