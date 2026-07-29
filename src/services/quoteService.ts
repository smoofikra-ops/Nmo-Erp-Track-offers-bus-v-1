import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types';
import { QuoteOffer } from '@/types/quotes';

export const quoteService = {
  getOffers: (companyId: string): Promise<ApiResponse<QuoteOffer[]>> => {
    return ApiClient.post('GET_OFFERS', { companyId });
  },

  getOffer: (offerId: string, companyId: string): Promise<ApiResponse<QuoteOffer>> => {
    return ApiClient.post('GET_OFFER', { offerId, companyId });
  },

  createOffer: (payload: Partial<QuoteOffer>): Promise<ApiResponse<QuoteOffer>> => {
    return ApiClient.post('CREATE_OFFER', payload);
  },

  updateOffer: (payload: Partial<QuoteOffer>): Promise<ApiResponse<QuoteOffer>> => {
    return ApiClient.post('UPDATE_OFFER', payload);
  },

  deleteOffer: (offerId: string, companyId: string): Promise<ApiResponse<void>> => {
    return ApiClient.post('DELETE_OFFER', { offerId, companyId });
  },

  verifyAndSetupSheets: (): Promise<ApiResponse<{ success: boolean; message: string; sheetsCreated?: string[] }>> => {
    return ApiClient.post('VERIFY_AND_SETUP_QUOTES_SHEETS', {});
  }
};
