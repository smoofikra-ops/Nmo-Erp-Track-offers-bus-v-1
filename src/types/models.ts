import { z } from 'zod';

// --- Enums & Constants ---
export enum EmployeeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum CommissionType {
  SALARY_AND_COMMISSION = 'SALARY_AND_COMMISSION',
  PRODUCT_COMMISSION_ONLY = 'PRODUCT_COMMISSION_ONLY',
  NONE = 'NONE',
}

export enum CommissionSystem {
  ORDER_COUNT = 'ORDER_COUNT',
  PRODUCT_COMMISSION = 'PRODUCT_COMMISSION',
}

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ClosingStatus {
  DRAFT = 'DRAFT',
  CLOSED = 'CLOSED',
}

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  COMPANY_ADMIN = 'Company Admin',
  ACCOUNTANT = 'Accountant',
  EMPLOYEE = 'Employee',
}

export enum SupportedLanguage {
  AR = 'ar',
  EN = 'en',
}

export enum SupportedCurrency {
  SAR = 'SAR',
  USD = 'USD',
}

// --- Base Models (Types) ---

export interface BaseEntity {
  CompanyID: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  CreatedBy?: string;
  UpdatedBy?: string;
  IsDeleted?: boolean;
  DeletedAt?: string;
  DeletedBy?: string;
}

export interface Company {
  CompanyID: string;
  CompanyCode: string;
  LegalNameAR: string;
  LegalNameEN: string;
  BrandNameAR: string;
  BrandNameEN: string;
  LogoURL: string;
  CommercialRegistration: string;
  VATNumber: string;
  Phone: string;
  WhatsApp: string;
  Email: string;
  Website: string;
  Country: string;
  City: string;
  AddressAR: string;
  AddressEN: string;
  Currency: SupportedCurrency;
  Timezone: string;
  DefaultLanguage: SupportedLanguage;
  DateFormat: string;
  Status: string;
  CreatedAt?: string;
  UpdatedAt?: string;
  CreatedBy?: string;
  UpdatedBy?: string;
}

export interface User extends BaseEntity {
  UserID: string;
  UserCode: string;
  FullNameAR: string;
  FullNameEN: string;
  Email: string;
  Mobile: string;
  PasswordHash?: string;
  RoleID: string;
  EmployeeID?: string;
  PreferredLanguage: SupportedLanguage;
  Status: string;
  LastLoginAt?: string;
}

export interface Employee extends BaseEntity {
  EmployeeID: string;
  EmployeeCode: string;
  Alias: string;
  ArabicName: string;
  EnglishName: string;
  Mobile: string;
  Email: string;
  NationalID: string;
  JobTitleAR: string;
  JobTitleEN: string;
  DepartmentID?: string;
  HireDate: string;
  BasicSalary: number;
  CommissionType: CommissionType;
  Status: EmployeeStatus;
  Notes?: string;
  ImageURL?: string;
  DrivingLicenseNumber?: string;
  DrivingLicenseType?: string;
  DrivingLicenseIssueDate?: string;
  DrivingLicenseExpiryDate?: string;
  DrivingLicenseStatus?: string;
}

export interface Product extends BaseEntity {
  ProductID: string;
  ProductCode: string;
  SKU: string;
  Barcode?: string;
  ArabicName: string;
  EnglishName: string;
  CategoryID?: string;
  Category?: string;
  UnitID?: string;
  UnitType?: string;
  InventoryUnitName?: string;
  OfferUnitName?: string;
  OfferUnitsPerInventoryItem?: number;
  SellingPrice?: number;
  MarketPricePerOfferUnitIncVat?: number;
  SuggestedPricePerOfferUnitIncVat?: number;
  DefaultCommission: number;
  Status: ProductStatus;
  Notes?: string;
  ImageURL?: string;
  AvailableQuantity?: number;
  PurchaseCostExVAT?: number;
  PiecesPerOfferUnit?: number;
  VATRate?: number;
  PurchaseCostIncVAT?: number;
  SellingPriceExVAT?: number;
  SellingPriceIncVAT?: number;
  ProfitAmount?: number;
  ProfitMargin?: number;
}

// --- Zod Validation Schemas ---

export const CompanySchema = z.object({
  LegalNameAR: z.string().min(2),
  LegalNameEN: z.string().min(2),
  BrandNameAR: z.string().min(2),
  BrandNameEN: z.string().min(2),
  Currency: z.nativeEnum(SupportedCurrency),
  Timezone: z.string(),
  DefaultLanguage: z.nativeEnum(SupportedLanguage),
});

export const EmployeeSchema = z.object({
  ArabicName: z.string().min(2),
  EnglishName: z.string().min(2),
  Mobile: z.string().min(9),
  NationalID: z.string(),
  BasicSalary: z.number().min(0),
  CommissionType: z.nativeEnum(CommissionType),
  Status: z.nativeEnum(EmployeeStatus),
});

export const ProductSchema = z.object({
  SKU: z.string(),
  ArabicName: z.string().min(2),
  EnglishName: z.string().min(2),
  SellingPrice: z.number().min(0),
  DefaultCommission: z.number().min(0),
  Status: z.nativeEnum(ProductStatus),
});
