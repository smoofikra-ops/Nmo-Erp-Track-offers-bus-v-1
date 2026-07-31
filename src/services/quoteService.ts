import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types';
import { QuoteCatalogProduct, Quote } from '@/types/quotes';

export const quoteService = {
  getQuoteCatalog: async (companyId: string): Promise<QuoteCatalogProduct[]> => {
    const response = await ApiClient.post<{ products: QuoteCatalogProduct[], total: number }>('GET_QUOTE_CATALOG', { CompanyID: companyId });
    if (!response.success) {
      throw new Error(response.message || 'فشل تحميل كتالوج العروض');
    }
    const products = response.data?.products;
    if (!Array.isArray(products)) {
      throw new Error('استجابة GET_QUOTE_CATALOG لا تحتوي على products صحيحة');
    }
    return products;
  },
  
  getQuotes: (companyId: string): Promise<ApiResponse<Quote[]>> => {
    return ApiClient.post('GET_QUOTES', { CompanyID: companyId });
  },

  createQuote: (quoteData: any): Promise<ApiResponse<Quote>> => {
    return ApiClient.post('CREATE_QUOTE', quoteData);
  },

  updateQuote: (quoteData: any): Promise<ApiResponse<Quote>> => {
    return ApiClient.post('UPDATE_QUOTE', quoteData);
  },

  deleteQuote: (quoteId: string, companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('DELETE_QUOTE', { QuoteID: quoteId, CompanyID: companyId });
  },

  changeQuoteStatus: (quoteId: string, status: string, companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('CHANGE_QUOTE_STATUS', { QuoteID: quoteId, Status: status, CompanyID: companyId });
  }
};
