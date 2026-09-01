import { ApiClient } from './apiClient';
import { Product, ApiResponse, ProductStatus } from '@/types';

const STORAGE_KEY = 'erp_products_cache';

const defaultProducts: Product[] = [
  {
    ProductID: 'PROD-001',
    CompanyID: 'COM-0001',
    ProductCode: 'P-1001',
    SKU: 'SKU-001',
    Barcode: '6281001001',
    ArabicName: 'كرتون مياه نقي 330 مل (40 حبة)',
    EnglishName: 'Pure Water 330ml (40 Bottles)',
    Category: 'مشروبات',
    UnitType: 'CARTON',
    InventoryUnitName: 'كرتون',
    OfferUnitName: 'كرتون',
    OfferUnitsPerInventoryItem: 1,
    PiecesPerOfferUnit: 40,
    SellingPrice: 18.5,
    SellingPriceExVAT: 16.09,
    SellingPriceIncVAT: 18.5,
    PurchaseCostExVAT: 12.0,
    PurchaseCostIncVAT: 13.8,
    MarketPricePerOfferUnitIncVat: 20.0,
    SuggestedPricePerOfferUnitIncVat: 18.5,
    VATRate: 15,
    AvailableQuantity: 350,
    ProfitAmount: 4.7,
    ProfitMargin: 25.4,
    DefaultCommission: 1.5,
    ImageURL: '',
    Status: ProductStatus.ACTIVE,
    Notes: '',
    CreatedAt: '2023-01-01T00:00:00.000Z',
    UpdatedAt: '2023-01-01T00:00:00.000Z',
    IsDeleted: false
  },
  {
    ProductID: 'PROD-002',
    CompanyID: 'COM-0001',
    ProductCode: 'P-1002',
    SKU: 'SKU-002',
    Barcode: '6281001002',
    ArabicName: 'كرتون عصير برتقال طبيعي 250 مل (24 حبة)',
    EnglishName: 'Natural Orange Juice 250ml (24 Bottles)',
    Category: 'عصائر',
    UnitType: 'CARTON',
    InventoryUnitName: 'كرتون',
    OfferUnitName: 'كرتون',
    OfferUnitsPerInventoryItem: 1,
    PiecesPerOfferUnit: 24,
    SellingPrice: 32.0,
    SellingPriceExVAT: 27.83,
    SellingPriceIncVAT: 32.0,
    PurchaseCostExVAT: 22.0,
    PurchaseCostIncVAT: 25.3,
    MarketPricePerOfferUnitIncVat: 35.0,
    SuggestedPricePerOfferUnitIncVat: 32.0,
    VATRate: 15,
    AvailableQuantity: 180,
    ProfitAmount: 6.7,
    ProfitMargin: 20.9,
    DefaultCommission: 2.0,
    ImageURL: '',
    Status: ProductStatus.ACTIVE,
    Notes: '',
    CreatedAt: '2023-01-01T00:00:00.000Z',
    UpdatedAt: '2023-01-01T00:00:00.000Z',
    IsDeleted: false
  },
  {
    ProductID: 'PROD-003',
    CompanyID: 'COM-0001',
    ProductCode: 'P-1003',
    SKU: 'SKU-003',
    Barcode: '6281001003',
    ArabicName: 'زيت زيتون بكر ممتاز 1 لتر',
    EnglishName: 'Extra Virgin Olive Oil 1L',
    Category: 'زيوت ومواد غذائية',
    UnitType: 'PIECE',
    InventoryUnitName: 'حبة',
    OfferUnitName: 'حبة',
    OfferUnitsPerInventoryItem: 1,
    PiecesPerOfferUnit: 1,
    SellingPrice: 45.0,
    SellingPriceExVAT: 39.13,
    SellingPriceIncVAT: 45.0,
    PurchaseCostExVAT: 30.0,
    PurchaseCostIncVAT: 34.5,
    MarketPricePerOfferUnitIncVat: 50.0,
    SuggestedPricePerOfferUnitIncVat: 45.0,
    VATRate: 15,
    AvailableQuantity: 95,
    ProfitAmount: 10.5,
    ProfitMargin: 23.3,
    DefaultCommission: 3.0,
    ImageURL: '',
    Status: ProductStatus.ACTIVE,
    Notes: '',
    CreatedAt: '2023-01-01T00:00:00.000Z',
    UpdatedAt: '2023-01-01T00:00:00.000Z',
    IsDeleted: false
  }
];

function getStoredProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // Ignore error
  }
  return defaultProducts;
}

function setStoredProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (e) {
    // Ignore error
  }
}

export const productService = {
  getProducts: async (companyId: string = 'COM-0001'): Promise<ApiResponse<Product[]>> => {
    try {
      const res = await ApiClient.post<Product[]>('GET_PRODUCTS', { CompanyID: companyId });
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStoredProducts(res.data);
        return res;
      }
    } catch (e) {
      // Fallback
    }

    const cached = getStoredProducts().filter(p => !p.CompanyID || p.CompanyID === companyId);
    return {
      success: true,
      data: cached,
      message: 'تم استرجاع المنتجات بنجاح',
      timestamp: new Date().toISOString()
    };
  },
  
  createProduct: async (data: any): Promise<ApiResponse<Product>> => {
    try {
      const res = await ApiClient.post<Product>('CREATE_PRODUCT', data);
      if (res && res.success && res.data) {
        const current = getStoredProducts();
        const existingIdx = current.findIndex(p => p.ProductID === res.data.ProductID);
        if (existingIdx >= 0) {
          current[existingIdx] = res.data;
          setStoredProducts(current);
        } else {
          setStoredProducts([res.data, ...current]);
        }
        return res;
      }
      return {
        success: false,
        data: null as any,
        message: res?.message || 'فشل حفظ المنتج في الخادم. يرجى التحقق من الاتصال والمحاولة مجدداً.',
        error: res?.error,
        timestamp: new Date().toISOString()
      };
    } catch (e: any) {
      console.error('Failed to create product:', e);
      return {
        success: false,
        data: null as any,
        message: e?.message || 'حدث خطأ أثناء حفظ المنتج.',
        error: { code: 'NETWORK_ERROR', details: e?.message || '' },
        timestamp: new Date().toISOString()
      };
    }
  },

  updateProduct: async (data: any): Promise<ApiResponse<Product>> => {
    try {
      const res = await ApiClient.post<Product>('UPDATE_PRODUCT', data);
      if (res && res.success && res.data) {
        const current = getStoredProducts();
        const index = current.findIndex(p => p.ProductID === res.data.ProductID);
        if (index >= 0) {
          current[index] = { ...current[index], ...res.data, UpdatedAt: new Date().toISOString() };
          setStoredProducts([...current]);
        }
        return res;
      }
      return {
        success: false,
        data: null as any,
        message: res?.message || 'فشل تحديث المنتج في الخادم.',
        error: res?.error,
        timestamp: new Date().toISOString()
      };
    } catch (e: any) {
      console.error('Failed to update product:', e);
      return {
        success: false,
        data: null as any,
        message: e?.message || 'حدث خطأ أثناء تحديث المنتج.',
        error: { code: 'NETWORK_ERROR', details: e?.message || '' },
        timestamp: new Date().toISOString()
      };
    }
  },

  deleteProduct: async (productId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    const current = getStoredProducts();
    const updated = current.map(p => p.ProductID === productId ? { ...p, IsDeleted: true } : p);
    setStoredProducts(updated);

    ApiClient.post('DELETE_PRODUCT', { ProductID: productId, CompanyID: companyId }).catch(() => {});

    return {
      success: true,
      data: { ProductID: productId },
      message: 'تم حذف المنتج بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  seedDefaultProducts: async (companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    setStoredProducts(defaultProducts);
    ApiClient.post('SEED_DEFAULT_PRODUCTS', { CompanyID: companyId }).catch(() => {});
    return {
      success: true,
      data: defaultProducts,
      message: 'تمت تهيئة المنتجات الافتراضية بنجاح',
      timestamp: new Date().toISOString()
    };
  }
};

