export type DocumentStatus = 'ACTIVE' | 'EXPIRED' | 'EXPIRING_SOON' | 'ARCHIVED' | 'PENDING_RENEWAL' | 'SUSPENDED';

export type ExpiryRiskLevel = 'SAFE' | 'ATTENTION' | 'WARNING' | 'CRITICAL' | 'EXPIRED' | 'NO_EXPIRY' | 'NOT_SET';

export interface DynamicFieldDefinition {
  id: string;
  labelAR: string;
  labelEN?: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'URL';
  placeholderAR?: string;
  required?: boolean;
  options?: string[];
  isPrimaryNumber?: boolean;
  isSecondaryNumber?: boolean;
  displayOnCard?: boolean;
}

export interface DocumentCategory {
  CategoryID: string;
  CompanyID: string;
  CategoryNameAR: string;
  CategoryNameEN: string;
  DisplayOrder: number;
  Status: 'ACTIVE' | 'INACTIVE';
  CreatedAt?: string;
  UpdatedAt?: string;
  IsDeleted?: boolean;
}

export interface DocumentType {
  Type_ID: string;
  CompanyID: string;
  Category_ID: string;
  TypeNameAR: string;
  TypeNameEN: string;
  IssuingAuthorityDefault: string;
  Code: string;
  Icon?: string;
  HasExpiry: boolean;
  DefaultReminderDays: number; // e.g. 60, 30, 90
  RequiredFields_JSON?: string; // stringified string[] of field keys
  CustomFieldsConfig_JSON?: string; // stringified DynamicFieldDefinition[]
  DisplayOrder: number;
  Status: 'ACTIVE' | 'INACTIVE';
  CreatedAt?: string;
  UpdatedAt?: string;
  IsDeleted?: boolean;
}

export interface DocumentRenewalRecord {
  Renewal_ID: string;
  CompanyID: string;
  Document_ID: string;
  Previous_Expiry_Date: string;
  Renewal_Date: string;
  New_Expiry_Date: string;
  Notes?: string;
  Attachment_File_ID?: string;
  Attachment_File_Name?: string;
  Attachment_URL?: string;
  Updated_By?: string;
  CreatedAt: string;
}

export interface CompanyDocument {
  Document_ID: string;
  CompanyID: string;
  Document_Type_ID: string;
  Category_ID: string;
  Document_Name: string;
  Issuing_Authority: string;
  Primary_Number: string;
  Secondary_Number?: string;
  Issue_Date?: string;
  Expiry_Date?: string;
  Last_Renewal_Date?: string;
  Next_Renewal_Date?: string;
  Status: DocumentStatus;
  Reminder_Days: number;
  Notes?: string;
  Attachment_File_ID?: string;
  Attachment_File_Name?: string;
  Attachment_URL?: string;
  Custom_Fields_JSON?: string; // stringified Record<string, any>
  Branch?: string;
  Created_By?: string;
  Created_At?: string;
  Updated_By?: string;
  Updated_At?: string;
  Is_Active?: boolean;
  Is_Archived?: boolean;
  Is_Deleted?: boolean;
  
  // Enriched frontend properties
  category?: DocumentCategory;
  documentType?: DocumentType;
  customData?: Record<string, any>;
  renewalHistory?: DocumentRenewalRecord[];
}

export interface ExpiryStatusResult {
  status: ExpiryRiskLevel;
  daysRemaining: number;
  isExpired: boolean;
  label: string; // e.g. "متبقي 42 يوم" or "منتهي منذ 5 أيام"
  badgeClass: string;
  borderClass: string;
  bgGlowClass: string;
  progressPercent: number; // 0 - 100
  urgencyRank: number; // For sorting (lower = more urgent: 0=Expired, 1=Critical, 2=Warning, etc.)
}

export interface DocumentKPIs {
  totalDocuments: number;
  safeCount: number;
  attentionCount: number;
  warningCount: number;
  criticalCount: number;
  expiredCount: number;
  noExpiryCount: number;
  archivedCount: number;
  nearestExpiringDoc?: {
    id: string;
    name: string;
    type: string;
    daysRemaining: number;
    expiryDate: string;
  } | null;
}

export interface DocumentSummary {
  totalActive: number;
  safeCount: number;
  expiringSoonCount: number;
  expiredCount: number;
  nearestExpiringDoc?: {
    id: string;
    name: string;
    daysRemaining: number;
    expiryDate: string;
  } | null;
}
