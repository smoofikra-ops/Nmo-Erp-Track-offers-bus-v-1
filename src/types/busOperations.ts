export interface DynamicFieldConfig {
  hasQuantityPrice?: boolean;      // Liters/Units * Unit Price = Total
  hasPartsLabor?: boolean;          // Parts Cost + Labor Cost + Additional = Total
  hasTireDetails?: boolean;         // Tire Position, Tire Size, Brand, Quantity
  hasOilDetails?: boolean;          // Oil Brand/Type, Quantity, Unit Price
  hasFuelDetails?: boolean;         // Liters, Fuel Type, Price Per Liter, Gas Station
  hasRepairDetails?: boolean;       // Issue Description, Action Taken, Parts Replaced
  hasAirConditioning?: boolean;     // Freon, Compressor, Refrigerant leak, etc.
  hasOdometerDueReminder?: boolean; // Next Service Date & Next Service Odometer
  requiredFields?: string[];        // Array of field names required for this operation
  customFields?: { key: string; label: string; type: 'text' | 'number' | 'select' | 'date'; options?: string[] }[];
}

export interface BusServiceCategory {
  Category_ID: string;
  CompanyID?: string;
  Category_Name_AR: string;
  Category_Name_EN: string;
  Display_Order: number;
  Icon: string;                     // Lucide icon identifier
  Color?: string;
  Is_Active: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface BusServiceType {
  Service_Type_ID: string;
  Category_ID: string;
  CompanyID?: string;
  Service_Name_AR: string;
  Service_Name_EN: string;
  Display_Order: number;
  Is_Frequent: boolean;             // Quick priority badge / top of list
  Is_Active: boolean;
  Field_Config_JSON?: string;       // JSON string or parsed object
  fieldConfig?: DynamicFieldConfig; // Parsed representation
  Default_Cost?: number;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface BusServiceLog {
  Service_Log_ID: string;
  CompanyID: string;
  Vehicle_ID: string;
  Employee_ID?: string;
  Employee_Name?: string;
  
  Category_ID: string;
  Category_Name?: string;
  Service_Type_ID: string;
  Service_Name: string;

  Operation_Date: string;
  Odometer: number;

  // Quantity & Units
  Quantity?: number;
  Unit?: string;
  Unit_Price?: number;

  // Cost Structure
  Parts_Cost?: number;
  Labor_Cost?: number;
  Additional_Cost?: number;
  Total_Cost: number;

  // Location & Provider
  Workshop?: string;
  Supplier?: string;

  // Billing & Payment
  Invoice_No?: string;
  Payment_Method?: 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'COMPANY_ACCOUNT' | 'PETROL_CARD' | 'OTHER';

  // Future Maintenance Reminder
  Next_Service_Date?: string;
  Next_Service_Odometer?: number;

  // Diagnostics & Actions
  Issue_Description?: string;
  Action_Taken?: string;
  Notes?: string;

  // Dynamic Specifics (Tire position, oil grade, etc.)
  Dynamic_Fields_JSON?: string;
  dynamicFields?: Record<string, any>;

  // Google Drive Invoice Linkage
  Invoice_File_ID?: string;
  Invoice_File_Name?: string;
  Invoice_Drive_URL?: string;
  Invoice_Mime_Type?: string;

  // Audit Fields
  Created_By?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  IsDeleted?: boolean;
}

export interface DriveInvoiceUploadPayload {
  fileBase64: string;
  fileName: string;
  mimeType: string;
  Service_Log_ID?: string;
  Vehicle_ID: string;
  CompanyID: string;
  metadata?: {
    employeeNumber?: string;
    employeeName?: string;
    busIdentifier?: string;
    plateNumber?: string;
    serviceType?: string;
    invoiceNumber?: string;
    operationDate?: string;
    amount?: number | string;
    workshop?: string;
  };
}

export interface DriveUploadResponse {
  fileId: string;
  fileName: string;
  driveUrl: string;
  mimeType: string;
  folderPath?: string;
}
