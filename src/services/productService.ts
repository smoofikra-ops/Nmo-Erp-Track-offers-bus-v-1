import { ApiClient } from './apiClient';
import { Product, ApiResponse } from '@/types';

export const productService = {
  getProducts: (companyId: string): Promise<ApiResponse<Product[]>> => {
    return ApiClient.post('GET_PRODUCTS', { CompanyID: companyId });
  },
  
  createProduct: (data: any): Promise<ApiResponse<Product>> => {
    return ApiClient.post('CREATE_PRODUCT', data);
  },

  updateProduct: (data: any): Promise<ApiResponse<Product>> => {
    return ApiClient.post('UPDATE_PRODUCT', data);
  },

  deleteProduct: (productId: string, companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('DELETE_PRODUCT', { ProductID: productId, CompanyID: companyId });
  },
  seedDefaultProducts: (companyId: string): Promise<ApiResponse<any>> => {
    return ApiClient.post('SEED_DEFAULT_PRODUCTS', { CompanyID: companyId });
  }
};
