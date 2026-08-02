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

export const settingsService = {
  getSettings: (companyId: string = 'COM-0001'): Promise<ApiResponse<{ settings: AppSettings }>> => {
    return ApiClient.post('GET_SETTINGS', { companyId });
  },

  saveSettings: (settings: AppSettings, companyId?: string): Promise<ApiResponse<any>> => {
    const resolvedCompanyId = companyId || settings.CompanyID || 'COM-0001';
    console.log({ saveCompanyId: settings.CompanyID, saveCompanyCode: settings.CompanyCode, resolvedCompanyId });
    return ApiClient.post('SAVE_SETTINGS', { companyId: resolvedCompanyId, settings });
  },

  uploadImage: (base64Data: string): Promise<ApiResponse<{ url: string }>> => {
    return ApiClient.post('UPLOAD_LOGO', { base64Data }); // Use UPLOAD_LOGO or others for base64 generic
  },
};
