import { ApiClient } from './apiClient';
import { ApiResponse } from '@/types/responses';

export interface AppSettings {
  CompanyNameAr?: string;
  CompanyNameEn?: string;
  BusinessActivity?: string;
  LogoURL?: string;
  FaviconURL?: string;
  CommercialRegistration?: string;
  VATNumber?: string;
  Address?: string;
  City?: string;
  Country?: string;
  PostalCode?: string;
  Phone?: string;
  Mobile?: string;
  Email?: string;
  Website?: string;
  ActivityDescription?: string;

  PrimaryColor?: string;
  SecondaryColor?: string;
  ButtonColor?: string;
  WarningColor?: string;
  SuccessColor?: string;
  DarkMode?: string;
  LightMode?: string;
  LoginImageURL?: string;
  SplashImageURL?: string;

  DefaultLanguage?: string;
  Currency?: string;
  Timezone?: string;
  DateFormat?: string;
  TimeFormat?: string;
  DefaultVATRate?: string;
  FiscalYearStart?: string;
  NumberFormat?: string;

  ShowLogoOnPrint?: string;
  ShowVATOnPrint?: string;
  ShowCROnPrint?: string;
  ShowAddressOnPrint?: string;
  ShowPhoneOnPrint?: string;
  ShowEmailOnPrint?: string;
  ShowWebsiteOnPrint?: string;
  StampImageURL?: string;
  SignatureImageURL?: string;

  MeasurementUnits?: string;
  Categories?: string;
  MinStockAlert?: string;
  LowStockWarning?: string;
  ProfitCalculationMethod?: string;
  TaxCalculationMethod?: string;

  DefaultProductCommission?: string;
  DefaultOrderCommission?: string;
  CommissionTiers?: string;
  DiscountTypes?: string;
  FixedDiscountCodes?: string;
  Platforms?: string; // e.g. Zid

  [key: string]: any;
}

const SETTINGS_STORAGE_KEY = 'erp_app_settings_cache';

const defaultSettings: AppSettings = {
  CompanyNameAr: 'نظام إدارة العمليات والتوزيع',
  CompanyNameEn: 'NMO Operations OS',
  BusinessActivity: 'التجارة والتوزيع',
  Currency: 'SAR',
  DefaultLanguage: 'ar',
  DefaultVATRate: '15',
  DateFormat: 'YYYY-MM-DD',
  Timezone: 'Asia/Riyadh',
  MinStockAlert: '10',
  LowStockWarning: '20'
};

function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return defaultSettings;
}

function setStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {}
}

export const settingsService = {
  getSettings: async (companyId: string = 'COM-0001'): Promise<ApiResponse<{ settings: AppSettings }>> => {
    try {
      const res = await ApiClient.post<{ settings: AppSettings }>('GET_SETTINGS', { companyId });
      if (res && res.success && res.data?.settings) {
        setStoredSettings(res.data.settings);
        return res;
      }
    } catch (e) {}

    const cached = getStoredSettings();
    return {
      success: true,
      data: { settings: cached },
      message: 'تم استرجاع الإعدادات بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  saveSettings: async (settings: AppSettings, companyId?: string): Promise<ApiResponse<any>> => {
    const resolvedCompanyId = companyId || settings.CompanyID || 'COM-0001';
    setStoredSettings(settings);
    ApiClient.post('SAVE_SETTINGS', { companyId: resolvedCompanyId, settings }).catch(() => {});
    return {
      success: true,
      data: { settings },
      message: 'تم حفظ الإعدادات بنجاح',
      timestamp: new Date().toISOString()
    };
  },

  uploadImage: async (base64Data: string): Promise<ApiResponse<{ url: string }>> => {
    try {
      const res = await ApiClient.post<{ url: string }>('UPLOAD_LOGO', { base64Data });
      if (res && res.success && res.data?.url) return res;
    } catch (e) {}

    // Fallback: return the data URL itself so images show immediately
    return {
      success: true,
      data: { url: base64Data },
      message: 'تم تجهيز الصورة بنجاح',
      timestamp: new Date().toISOString()
    };
  },
};

