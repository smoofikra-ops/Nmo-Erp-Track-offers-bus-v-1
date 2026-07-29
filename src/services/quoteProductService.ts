import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types';
import { QuoteProduct } from '@/types/quotes';

export const quoteProductService = {
  getQuoteProducts: (companyId: string): Promise<ApiResponse<QuoteProduct[]>> => {
    return ApiClient.post('GET_QUOTE_PRODUCTS', { companyId });
  },
  
  createQuoteProduct: (payload: Partial<QuoteProduct>): Promise<ApiResponse<QuoteProduct>> => {
    return ApiClient.post('CREATE_QUOTE_PRODUCT', payload);
  },

  updateQuoteProduct: (payload: Partial<QuoteProduct>): Promise<ApiResponse<QuoteProduct>> => {
    return ApiClient.post('UPDATE_QUOTE_PRODUCT', payload);
  },

  deleteQuoteProduct: (productId: string, companyId: string): Promise<ApiResponse<void>> => {
    return ApiClient.post('DELETE_QUOTE_PRODUCT', { productId, companyId });
  }
};
