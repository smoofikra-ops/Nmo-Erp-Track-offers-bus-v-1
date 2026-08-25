import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types';
import { QuoteCatalogProduct, Quote } from '@/types/quotes';
import { productService } from './productService';

const QUOTES_STORAGE_KEY = 'erp_quotes_cache';

function getStoredQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(QUOTES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

function setStoredQuotes(quotes: Quote[]): void {
  try {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
  } catch (e) {}
}

export const quoteService = {
  getQuoteCatalog: async (companyId: string = 'COM-0001'): Promise<QuoteCatalogProduct[]> => {
    try {
      const response = await ApiClient.post<{ products: QuoteCatalogProduct[], total: number }>('GET_QUOTE_CATALOG', { CompanyID: companyId });
      if (response && response.success && Array.isArray(response.data?.products) && response.data.products.length > 0) {
        return response.data.products;
      }
    } catch (e) {}

    // Fallback: derive catalog from productService products
    const productsRes = await productService.getProducts(companyId);
    const products = productsRes.data || [];

    return products.map(p => {
      const vatRate = (p.VATRate || 15) / 100;
      const costEx = p.PurchaseCostExVAT || 0;
      const costInc = p.PurchaseCostIncVAT || costEx * (1 + vatRate);
      const sellInc = p.SellingPriceIncVAT || p.SellingPrice || 0;
      const sellEx = p.SellingPriceExVAT || (sellInc / (1 + vatRate));

      return {
        id: p.ProductID,
        sku: p.SKU || p.ProductCode,
        nameAr: p.ArabicName || '',
        nameEn: p.EnglishName || '',
        category: p.Category || 'عام',
        inventoryUnitName: p.InventoryUnitName || 'قطعة',
        offerUnitName: p.OfferUnitName || 'قطعة',
        offerUnitsPerInventoryItem: p.OfferUnitsPerInventoryItem || 1,
        piecesPerOfferUnit: p.PiecesPerOfferUnit || 1,
        purchaseCostPerOfferUnitExVat: costEx,
        purchaseCostPerOfferUnitIncVat: costInc,
        storePricePerOfferUnitExVat: sellEx,
        storePricePerOfferUnitIncVat: sellInc,
        suggestedPricePerOfferUnitExVat: sellEx,
        suggestedPricePerOfferUnitIncVat: p.SuggestedPricePerOfferUnitIncVat || sellInc,
        marketPricePerOfferUnitIncVat: p.MarketPricePerOfferUnitIncVat || sellInc,
        vatRate: vatRate,
        availableOfferUnits: p.AvailableQuantity || 0,
        imageUrl: p.ImageURL || '',
        active: true,
        configurationComplete: true
      };
    });
  },
  
  getQuotes: async (companyId: string = 'COM-0001'): Promise<ApiResponse<Quote[]>> => {
    try {
      const res = await ApiClient.post<Quote[]>('GET_QUOTES', { CompanyID: companyId });
      if (res && res.success && Array.isArray(res.data)) {
        setStoredQuotes(res.data);
        return res;
      }
    } catch (e) {}

    const cached = getStoredQuotes();
    return {
      success: true,
      data: cached,
      message: 'تم استرجاع عروض الأسعار بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  createQuote: async (quoteData: any): Promise<ApiResponse<Quote>> => {
    const newQuote: Quote = {
      ...quoteData,
      id: quoteData.id || quoteData.QuoteID || `QTE-${Date.now().toString().slice(-6)}`,
      quoteNumber: quoteData.quoteNumber || quoteData.QuoteNumber || `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: quoteData.status || 'draft',
      title: quoteData.title || 'عرض سعر جديد',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      items: quoteData.items || [],
      adjustments: quoteData.adjustments || [],
      totals: quoteData.totals || {
        purchaseCostExVat: 0,
        inputVat: 0,
        purchaseCostIncVat: 0,
        retailValueExVat: 0,
        outputVat: 0,
        retailValueIncVat: 0
      }
    };

    const current = getStoredQuotes();
    setStoredQuotes([newQuote, ...current]);

    ApiClient.post('CREATE_QUOTE', quoteData).catch(() => {});

    return {
      success: true,
      data: newQuote,
      message: 'تم إنشاء عرض السعر بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  updateQuote: async (quoteData: any): Promise<ApiResponse<Quote>> => {
    const current = getStoredQuotes();
    const targetId = quoteData.id || quoteData.QuoteID;
    const index = current.findIndex(q => q.id === targetId);
    let updated = quoteData;
    if (index >= 0) {
      updated = { ...current[index], ...quoteData, updatedAt: new Date().toISOString() };
      current[index] = updated;
      setStoredQuotes([...current]);
    }

    ApiClient.post('UPDATE_QUOTE', quoteData).catch(() => {});

    return {
      success: true,
      data: updated,
      message: 'تم تحديث عرض السعر بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  deleteQuote: async (quoteId: string, companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    const current = getStoredQuotes();
    const updated = current.filter(q => q.id !== quoteId);
    setStoredQuotes(updated);

    ApiClient.post('DELETE_QUOTE', { QuoteID: quoteId, CompanyID: companyId }).catch(() => {});

    return {
      success: true,
      data: { id: quoteId },
      message: 'تم حذف عرض السعر بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  changeQuoteStatus: async (quoteId: string, status: string, companyId: string = 'COM-0001'): Promise<ApiResponse<any>> => {
    const current = getStoredQuotes();
    const updated = current.map(q => q.id === quoteId ? { ...q, status: status as any, updatedAt: new Date().toISOString() } : q);
    setStoredQuotes(updated);

    ApiClient.post('CHANGE_QUOTE_STATUS', { QuoteID: quoteId, Status: status, CompanyID: companyId }).catch(() => {});

    return {
      success: true,
      data: { id: quoteId, status },
      message: 'تم تحديث حالة عرض السعر بنجاح',
      timestamp: new Date().toISOString()
    };
  }
};


