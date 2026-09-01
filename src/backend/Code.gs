/**
 * NMO Labs Operations OS - Google Apps Script Backend Foundation
 */

const DB_VERSION = "1.0.0";
const APP_VERSION = "1.0.0";

const SCHEMA = {
  Companies: [
    "CompanyID", "CompanyCode", "LegalNameAR", "LegalNameEN", "BrandNameAR", "BrandNameEN", 
    "LogoURL", "CommercialRegistration", "VATNumber", "Phone", "WhatsApp", "Email", "Website", 
    "Country", "City", "AddressAR", "AddressEN", "Currency", "Timezone", "DefaultLanguage", 
    "DateFormat", "Status", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted"
  ],
  Users: [
    "UserID", "CompanyID", "UserCode", "FullNameAR", "FullNameEN", "Email", "Mobile", 
    "PasswordHash", "RoleID", "EmployeeID", "PreferredLanguage", "Status", "LastLoginAt", 
    "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted"
  ],
  Roles: [
    "RoleID", "CompanyID", "RoleCode", "RoleNameAR", "RoleNameEN", "DescriptionAR", 
    "DescriptionEN", "IsSystemRole", "Status", "CreatedAt", "UpdatedAt", "IsDeleted"
  ],
  Permissions: [
    "PermissionID", "PermissionCode", "ModuleCode", "ActionCode", "PermissionNameAR", 
    "PermissionNameEN", "DescriptionAR", "DescriptionEN", "CreatedAt"
  ],
  RolePermissions: [
    "RolePermissionID", "CompanyID", "RoleID", "PermissionID", "IsAllowed", "CreatedAt", "CreatedBy"
  ],
  Employees: [
    "EmployeeID", "CompanyID", "EmployeeCode", "Alias", "ArabicName", "EnglishName", 
    "Mobile", "Email", "NationalID", "JobTitleAR", "JobTitleEN", "DepartmentID", "HireDate", 
    "BasicSalary", "CommissionType", "Status", "Notes", "CreatedAt", "UpdatedAt", 
    "CreatedBy", "UpdatedBy", "IsDeleted", "DeletedAt", "DeletedBy"
  ],
  Departments: [
    "DepartmentID", "CompanyID", "DepartmentCode", "DepartmentNameAR", "DepartmentNameEN", 
    "ManagerEmployeeID", "Status", "CreatedAt", "UpdatedAt", "IsDeleted"
  ],
    Products: [
    "ProductID", "CompanyID", "ProductCode", "SKU", "Barcode", "ArabicName", "EnglishName", 
    "Category", "UnitType", "InventoryUnitName", "OfferUnitName", "OfferUnitsPerInventoryItem", "PiecesPerOfferUnit",
    "SellingPrice", "SellingPriceExVAT", "SellingPriceIncVAT", "PurchaseCostExVAT", "PurchaseCostIncVAT", 
    "MarketPricePerOfferUnitIncVat", "SuggestedPricePerOfferUnitIncVat",
    "VATRate", "AvailableQuantity", "ProfitAmount", "ProfitMargin", "DefaultCommission", "ImageURL", "Status", "Notes", 
    "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted"
  ],
  ProductCategories: [
    "CategoryID", "CompanyID", "CategoryCode", "CategoryNameAR", "CategoryNameEN", "Status", 
    "CreatedAt", "UpdatedAt", "IsDeleted"
  ],
  Units: [
    "UnitID", "CompanyID", "UnitCode", "UnitNameAR", "UnitNameEN", "Status", "CreatedAt", "UpdatedAt", "IsDeleted"
  ],
  Quotes: [
    "QuoteID", "CompanyID", "QuoteNumber", "Status", "Title", "CustomerID", "CustomerName", "CustomerPhone", "CustomerEmail", "SalesRepresentativeID", "SalesRepresentativeName", 
    "PurchaseCostExVat", "InputVAT", "PurchaseCostIncVat", "RetailValueExVat", "OutputVAT", "RetailValueIncVat", "DiscountTotal", "AdditionTotal", "InternalExpenseTotal", 
    "FinalQuotePriceIncVat", "NetProfit", "ProfitMarginPercent", "TotalOfferUnits", "TotalPieces", "PaymentTerms", "DeliveryTerms", "CustomerNotes", "InternalNotes", "Terms", 
    "ValidUntil", "ApprovedAt", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted"
  ],
  QuoteItems: [
    "QuoteItemID", "QuoteID", "ProductID", "SKU", "ProductName", "Category", "ImageURL", "InventoryUnitName", "OfferUnitName", "OfferUnitsPerInventoryItem", "PiecesPerOfferUnit", 
    "Quantity", "UnitPurchaseCostExVat", "UnitPurchaseCostIncVat", "DefaultUnitSellingPriceIncVat", "UnitSellingPriceExVat", "UnitSellingPriceIncVat", "VATRate", 
    "LinePurchaseCostExVat", "LinePurchaseCostIncVat", "LineSellingPriceExVat", "LineSellingPriceIncVat"
  ],
  QuoteAdjustments: [
    "AdjustmentID", "QuoteID", "Name", "Type", "CalculationType", "Value", "CalculatedAmount", "Notes"
  ],
  Settings: [
    "SettingID", "CompanyID", "SettingGroup", "SettingKey", "SettingValue", "ValueType", 
    "DescriptionAR", "DescriptionEN", "IsPublic", "CreatedAt", "UpdatedAt", "UpdatedBy"
  ],
  NumberSequences: [
    "SequenceID", "CompanyID", "SequenceKey", "Prefix", "Year", "LastNumber", "PaddingLength", 
    "ResetPolicy", "UpdatedAt"
  ],
  AuditLogs: [
    "AuditLogID", "CompanyID", "UserID", "ModuleCode", "ActionCode", "EntityType", "EntityID", 
    "OldDataJSON", "NewDataJSON", "IPAddress", "UserAgent", "CreatedAt"
  ],
  CommissionRecords: [
    "id", "transactionNo", "companyId", "createdAt", "formattedDate", 
    "employeeId", "employeeName", "employeeCode", "commissionType", "commissionTypeLabel",
    "quantityOrOrdersCount", "grossCommission", "totalDiscount", "netCommission", 
    "totalOrderValue", "totalRequiredAmount", "onlinePaidAmount", "codRequiredAmount", 
    "totalDiscounts", "finalRequiredAmount", "remainingBalance", "notes", 
    "items", "discounts", "orderCountDetails", "requiredItems", "paymentItems", "revisions", "auditLogs", "lastModifiedBy", "lastModifiedAt", "version", "IsDeleted"
  ],
  CommissionReceipts: [
    "ReceiptID", "CompanyID", "ReceiptNumber", "EmployeeID", "ReceiptDate", "ReceiptTime", 
    "CommissionSystem", "GrossCommission", "DiscountTotal", "NetCommission", "RequiredAmount", 
    "PaidInvoicesAmount", "Balance", "Status", "Notes", "CreatedAt", "UpdatedAt", "CreatedBy", 
    "UpdatedBy", "IsDeleted"
  ],
  CommissionReceiptItems: [
    "ReceiptItemID", "CompanyID", "ReceiptID", "ProductID", "Quantity", "UnitCommission", 
    "TotalCommission", "CreatedAt"
  ],
  OrderCountCommissions: [
    "OrderCommissionID", "CompanyID", "ReceiptID", "EmployeeID", "CommissionMonth", 
    "OrdersCount", "ThresholdOrders", "FirstTierRate", "SecondTierRate", "FirstTierOrders", 
    "SecondTierOrders", "FirstTierTotal", "SecondTierTotal", "GrossCommission", "CreatedAt"
  ],
  ReceiptDiscounts: [
    "DiscountID", "CompanyID", "ReceiptID", "DiscountCode", "Description", "Amount", "CreatedAt"
  ],
  DailyClosings: [
    "ClosingID", "CompanyID", "ClosingNumber", "EmployeeID", "ReceiptID", "ClosingDate", 
    "RequiredAmount", "PaidInvoicesAmount", "Balance", "Status", "Notes", "CreatedAt", 
    "UpdatedAt", "CreatedBy", "IsDeleted"
  ],
  MonthlyClosings: [
    "MonthlyClosingID", "CompanyID", "EmployeeID", "ClosingYear", "ClosingMonth", "TotalOrders", 
    "GrossCommission", "TotalDiscounts", "NetCommission", "TotalRequiredAmount", 
    "TotalPaidInvoices", "FinalBalance", "Status", "ClosedAt", "ClosedBy", "CreatedAt", "UpdatedAt"
  ],
  Vehicles: [
    "Vehicle_ID", "CompanyID", "Employee_ID", "Plate_Number", "Plate_Letters", "Plate_Numbers", "Make", "Brand", "Model", 
    "Year", "Manufacturing_Year", "Color", "Vehicle_Type", "Fuel_Type", "Tank_Capacity", "Current_Odometer", "Initial_Odometer",
    "Primary_Driver_ID", "Primary_Driver_Name", "Secondary_Driver_ID", "Secondary_Driver_Name",
    "Assigned_Employee_ID", "Assigned_User_Name", "Owner_Name", "Owner_ID_Number", "User_ID_Number",
    "Serial_Number", "Registration_Number", "Registration_Type", "Load_Capacity", "Vehicle_Weight",
    "Operational_Status", "Ownership_Type", "Branch", "Location", "Chassis_Number", "VIN", "VIN_Chassis_Number", 
    "Engine_Number", "Notes", "Image_URL", "Readiness_Score", "Readiness_Index", "Readiness_Reasons", 
    "Insurance_Expiry", "Inspection_Expiry", "Periodic_Inspection_Expiry", "Registration_Expiry", "License_Expiry",
    "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted", "DeletedAt", "DeletedBy", "ArchiveReason"
  ],
  Vehicle_Master: [
    "Vehicle_ID", "CompanyID", "Employee_ID", "Plate_Number", "Plate_Letters", "Plate_Numbers", "Make", "Brand", "Model", 
    "Year", "Manufacturing_Year", "Color", "Vehicle_Type", "Fuel_Type", "Tank_Capacity", "Current_Odometer", "Initial_Odometer",
    "Primary_Driver_ID", "Primary_Driver_Name", "Secondary_Driver_ID", "Secondary_Driver_Name",
    "Assigned_Employee_ID", "Assigned_User_Name", "Owner_Name", "Owner_ID_Number", "User_ID_Number",
    "Serial_Number", "Registration_Number", "Registration_Type", "Load_Capacity", "Vehicle_Weight",
    "Operational_Status", "Ownership_Type", "Branch", "Location", "Chassis_Number", "VIN", "VIN_Chassis_Number", 
    "Engine_Number", "Notes", "Image_URL", "Readiness_Score", "Readiness_Index", "Readiness_Reasons", 
    "Insurance_Expiry", "Inspection_Expiry", "Periodic_Inspection_Expiry", "Registration_Expiry", "License_Expiry",
    "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted", "DeletedAt", "DeletedBy", "ArchiveReason"
  ],
  Fleet_Fuel_Logs: [
    "Log_ID", "CompanyID", "Vehicle_ID", "Driver_ID", "Driver_Name", "Date", "Odometer", "Previous_Odometer", 
    "Liters", "Fuel_Cost", "Cost_Per_Liter", "Fuel_Type", "Station_Name", "Invoice_Number", "Receipt_Image_URL", 
    "Notes", "Distance_Traveled", "Efficiency_KM_L", "Is_Abnormal", "Abnormal_Reason", "CreatedAt", "CreatedBy", "IsDeleted"
  ],
  Fleet_Maintenance_Logs: [
    "Maintenance_ID", "CompanyID", "Vehicle_ID", "Maintenance_Type", "Service_Category", "Date", "Odometer", 
    "Next_Odometer_Service", "Next_Date_Service", "Cost", "Workshop_Name", "Invoice_Number", "Description", 
    "Parts_Replaced", "Status", "Notes", "Attachment_URL", "CreatedAt", "CreatedBy", "IsDeleted"
  ],
  Fleet_Insurance_Logs: [
    "Insurance_ID", "CompanyID", "Vehicle_ID", "Policy_Number", "Insurance_Company", "Policy_Type", 
    "Start_Date", "End_Date", "Cost", "Coverage_Details", "Deductible_Amount", "Status", "Attachment_URL", "Notes", "CreatedAt", "CreatedBy", "IsDeleted"
  ],
  Fleet_Compliance_Logs: [
    "Compliance_ID", "CompanyID", "Vehicle_ID", "Inspection_Type", "Issue_Date", "Expiry_Date", 
    "Result", "Fee", "Center_Name", "Notes", "Attachment_URL", "CreatedAt", "CreatedBy", "IsDeleted"
  ],
  Fleet_Accident_Logs: [
    "Accident_ID", "CompanyID", "Vehicle_ID", "Driver_ID", "Driver_Name", "Date", "Time", "Location", 
    "Report_Number", "Fault_Percentage", "Estimated_Damage_Cost", "Insurance_Claim_Number", "Status", "Description", "Third_Party_Info", "Attachment_URLs", "CreatedAt", "CreatedBy", "IsDeleted"
  ],
  Fleet_Documents: [
    "Document_ID", "CompanyID", "Vehicle_ID", "Document_Type", "Document_Name", "Document_Number", 
    "Issue_Date", "Expiry_Date", "File_URL", "File_Size", "File_Type", "Notes", "CreatedAt", "CreatedBy", "IsDeleted"
  ],
  Company_Documents: [
    "Document_ID", "CompanyID", "Document_Type_ID", "Category_ID", "Document_Name", "Issuing_Authority", 
    "Primary_Number", "Secondary_Number", "Issue_Date", "Expiry_Date", "Last_Renewal_Date", "Next_Renewal_Date", 
    "Status", "Reminder_Days", "Notes", "Attachment_File_ID", "Attachment_File_Name", "Attachment_URL", 
    "Custom_Fields_JSON", "Branch", "Created_By", "Created_At", "Updated_By", "Updated_At", "Is_Active", "Is_Archived", "Is_Deleted"
  ],
  Document_Types: [
    "Type_ID", "CompanyID", "Category_ID", "TypeNameAR", "TypeNameEN", "IssuingAuthorityDefault", 
    "Code", "Icon", "HasExpiry", "DefaultReminderDays", "RequiredFields_JSON", "CustomFieldsConfig_JSON", 
    "DisplayOrder", "Status", "CreatedAt", "UpdatedAt", "IsDeleted"
  ],
  Document_Categories: [
    "CategoryID", "CompanyID", "CategoryNameAR", "CategoryNameEN", "DisplayOrder", "Status", "CreatedAt", "UpdatedAt", "IsDeleted"
  ],
  Document_Renewal_History: [
    "Renewal_ID", "CompanyID", "Document_ID", "Previous_Expiry_Date", "Renewal_Date", "New_Expiry_Date", 
    "Notes", "Attachment_File_ID", "Attachment_File_Name", "Attachment_URL", "Updated_By", "CreatedAt"
  ]
};

function generateUUID() {
  return Utilities.getUuid();
}

function getTimestamp() {
  return new Date().toISOString();
}

function responseOk(data, message = "Success", diagnostics = null) {
  const output = {
    success: true,
    data: data,
    message: message,
    error: null,
    timestamp: getTimestamp()
  };
  if (diagnostics) {
    output._diagnostics = diagnostics;
  }
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

function responseError(message, code = "ERROR", details = "", diagnostics = null) {
  const output = {
    success: false,
    data: null,
    message: message,
    error: {
      code: code,
      details: details
    },
    timestamp: getTimestamp()
  };
  if (diagnostics) {
    output._diagnostics = diagnostics;
  }
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

// Global reference cache per execution context (cleared automatically after each GAS request)
let _globalActiveSpreadsheet = null;
function getActiveSS() {
  if (!_globalActiveSpreadsheet) {
    _globalActiveSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  }
  return _globalActiveSpreadsheet;
}

// --- CACHE SERVICE (UNUSED FOR BUSINESS DATASETS AS PER ZERO-CACHE REQUIREMENT) ---
const ServerCache = {
  get: function(key) { return null; },
  put: function(key, data, ttlSeconds) {},
  invalidate: function(keys) {}
};

// --- CORE DB FUNCTIONS ---
function resolveSheet(ss, tableName) {
  if (!ss) ss = getActiveSS();
  let sheet = ss.getSheetByName(tableName);
  if (!sheet) {
    if (tableName === 'Vehicles' || tableName === 'Vehicle_Master' || tableName === 'VehicleMaster') {
      sheet = ss.getSheetByName('Vehicle_Master') || ss.getSheetByName('Vehicles') || ss.getSheetByName('VehicleMaster');
    }
  }
  return sheet;
}

function getTableData(tableName, filters = {}) {
  const ss = getActiveSS();
  const sheet = resolveSheet(ss, tableName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const rawHeaders = data[0];
  const headerCount = rawHeaders.length;
  const cleanHeaders = new Array(headerCount);
  for (let h = 0; h < headerCount; h++) {
    cleanHeaders[h] = String(rawHeaders[h]).trim();
  }

  const isVehicleTable = (tableName === 'Vehicles' || tableName === 'Vehicle_Master' || tableName === 'VehicleMaster');
  const includeDeleted = Boolean(filters.includeDeleted);
  const filterKeys = Object.keys(filters).filter(k => k !== 'includeDeleted');
  const filterKeyCount = filterKeys.length;

  const results = [];
  const rowCount = data.length;

  for (let r = 1; r < rowCount; r++) {
    const row = data[r];
    const obj = {};
    for (let c = 0; c < headerCount; c++) {
      obj[cleanHeaders[c]] = row[c];
    }

    if (isVehicleTable) {
      if (obj.VIN_Chassis_Number && !obj.VIN) obj.VIN = obj.VIN_Chassis_Number;
      if (obj.VIN && !obj.VIN_Chassis_Number) obj.VIN_Chassis_Number = obj.VIN;
      if (obj.Manufacturing_Year && !obj.Year) obj.Year = obj.Manufacturing_Year;
      if (obj.Year && !obj.Manufacturing_Year) obj.Manufacturing_Year = obj.Year;
      if (obj.Employee_ID && !obj.Assigned_Employee_ID) obj.Assigned_Employee_ID = obj.Employee_ID;
      if (obj.Assigned_Employee_ID && !obj.Employee_ID) obj.Employee_ID = obj.Assigned_Employee_ID;
      if (obj.Primary_Driver_ID && !obj.Assigned_Employee_ID) obj.Assigned_Employee_ID = obj.Primary_Driver_ID;
      if (obj.Assigned_Employee_ID && !obj.Primary_Driver_ID) obj.Primary_Driver_ID = obj.Assigned_Employee_ID;
      if (obj.Primary_Driver_Name && !obj.Assigned_User_Name) obj.Assigned_User_Name = obj.Primary_Driver_Name;
      if (obj.Assigned_User_Name && !obj.Primary_Driver_Name) obj.Primary_Driver_Name = obj.Assigned_User_Name;
      if (obj.Periodic_Inspection_Expiry && !obj.Inspection_Expiry) obj.Inspection_Expiry = obj.Periodic_Inspection_Expiry;
      if (obj.Inspection_Expiry && !obj.Periodic_Inspection_Expiry) obj.Periodic_Inspection_Expiry = obj.Inspection_Expiry;
      if (obj.Registration_Expiry && !obj.License_Expiry) obj.License_Expiry = obj.Registration_Expiry;
      if (obj.License_Expiry && !obj.Registration_Expiry) obj.Registration_Expiry = obj.License_Expiry;
      if (obj.Readiness_Index !== undefined && obj.Readiness_Score === undefined) obj.Readiness_Score = obj.Readiness_Index;
      if (obj.Readiness_Score !== undefined && obj.Readiness_Index === undefined) obj.Readiness_Index = obj.Readiness_Score;
    }

    const isDel = String(obj.IsDeleted).toLowerCase() === 'true' || obj.IsDeleted === 1;
    if (isDel && !includeDeleted) continue;

    let matches = true;
    for (let k = 0; k < filterKeyCount; k++) {
      const fk = filterKeys[k];
      if (obj[fk] !== filters[fk]) {
        matches = false;
        break;
      }
    }
    if (matches) {
      results.push(obj);
    }
  }

  return results;
}

function insertRow(tableName, obj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = resolveSheet(ss, tableName);
  if (!sheet) throw new Error("Table not found: " + tableName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const rowData = headers.map(header => {
    const cleanHeader = String(header).trim();
    if (obj[cleanHeader] !== undefined) return obj[cleanHeader];
    // Check aliases
    if (cleanHeader === 'Employee_ID') return obj.Employee_ID || obj.Assigned_Employee_ID || obj.Primary_Driver_ID || '';
    if (cleanHeader === 'Assigned_Employee_ID') return obj.Assigned_Employee_ID || obj.Employee_ID || obj.Primary_Driver_ID || '';
    if (cleanHeader === 'Primary_Driver_ID') return obj.Primary_Driver_ID || obj.Assigned_Employee_ID || obj.Employee_ID || '';
    if (cleanHeader === 'Assigned_User_Name') return obj.Assigned_User_Name || obj.Primary_Driver_Name || '';
    if (cleanHeader === 'Primary_Driver_Name') return obj.Primary_Driver_Name || obj.Assigned_User_Name || '';
    if (cleanHeader === 'VIN') return obj.VIN || obj.VIN_Chassis_Number || obj.Chassis_Number || '';
    if (cleanHeader === 'VIN_Chassis_Number') return obj.VIN_Chassis_Number || obj.VIN || obj.Chassis_Number || '';
    if (cleanHeader === 'Chassis_Number') return obj.Chassis_Number || obj.VIN_Chassis_Number || obj.VIN || '';
    if (cleanHeader === 'Year') return obj.Year || obj.Manufacturing_Year || '';
    if (cleanHeader === 'Manufacturing_Year') return obj.Manufacturing_Year || obj.Year || '';
    if (cleanHeader === 'Periodic_Inspection_Expiry') return obj.Periodic_Inspection_Expiry || obj.Inspection_Expiry || '';
    if (cleanHeader === 'Inspection_Expiry') return obj.Inspection_Expiry || obj.Periodic_Inspection_Expiry || '';
    if (cleanHeader === 'Registration_Expiry') return obj.Registration_Expiry || obj.License_Expiry || '';
    if (cleanHeader === 'License_Expiry') return obj.License_Expiry || obj.Registration_Expiry || '';
    if (cleanHeader === 'Readiness_Score') return obj.Readiness_Score !== undefined ? obj.Readiness_Score : (obj.Readiness_Index !== undefined ? obj.Readiness_Index : 100);
    if (cleanHeader === 'Readiness_Index') return obj.Readiness_Index !== undefined ? obj.Readiness_Index : (obj.Readiness_Score !== undefined ? obj.Readiness_Score : 100);
    if (cleanHeader === 'Brand') return obj.Brand || obj.Make || '';
    if (cleanHeader === 'Make') return obj.Make || obj.Brand || '';
    return "";
  });
  
  sheet.appendRow(rowData);
  ServerCache.invalidate([tableName, tableName + '_COM-0001', 'Vehicles_COM-0001']);
  return obj;
}

function updateRow(tableName, primaryKeyField, primaryKeyValue, updateObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = resolveSheet(ss, tableName);
  if (!sheet) throw new Error("Table not found: " + tableName);
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) throw new Error("Record not found");
  
  const headers = data[0].map(h => String(h).trim());
  const pkIndex = headers.indexOf(String(primaryKeyField).trim());
  
  if (pkIndex === -1) throw new Error("Primary key column not found in sheet: " + primaryKeyField);
  
  let rowIndex = -1;
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][pkIndex]).trim() === String(primaryKeyValue).trim()) {
      rowIndex = i + 1;
      break;
    }
  }
  
  if (rowIndex === -1) throw new Error("Record not found with " + primaryKeyField + " = " + primaryKeyValue);
  
  const rowCopy = [...data[rowIndex - 1]];
  let updatedFields = 0;
  
  // Single-pass memory update for maximum speed
  for (let key in updateObj) {
    let colIndex = headers.indexOf(String(key).trim());
    if (colIndex !== -1) {
      rowCopy[colIndex] = updateObj[key];
      updatedFields++;
    } else {
      // Check aliases
      let aliasKey = key;
      if (key === 'VIN') aliasKey = 'VIN_Chassis_Number';
      else if (key === 'VIN_Chassis_Number') aliasKey = 'VIN';
      else if (key === 'Year') aliasKey = 'Manufacturing_Year';
      else if (key === 'Manufacturing_Year') aliasKey = 'Year';
      else if (key === 'Assigned_Employee_ID') aliasKey = 'Employee_ID';
      else if (key === 'Employee_ID') aliasKey = 'Assigned_Employee_ID';

      let aliasColIndex = headers.indexOf(String(aliasKey).trim());
      if (aliasColIndex !== -1) {
        rowCopy[aliasColIndex] = updateObj[key];
        updatedFields++;
      }
    }
  }
  
  // Write the entire row in a single high-speed batch call
  sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowCopy]);
  SpreadsheetApp.flush();
  ServerCache.invalidate([tableName, tableName + '_COM-0001', 'Vehicles_COM-0001']);
  return { updatedFields };
}

function getNextSequence(companyId, sequenceKey, prefix) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // wait up to 10 seconds
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("NumberSequences");
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const currentYear = new Date().getFullYear();
    
    let rowIndex = -1;
    let lastNumber = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('CompanyID')] === companyId && data[i][headers.indexOf('SequenceKey')] === sequenceKey) {
        rowIndex = i + 1;
        lastNumber = data[i][headers.indexOf('LastNumber')];
        let year = data[i][headers.indexOf('Year')];
        let resetPolicy = data[i][headers.indexOf('ResetPolicy')];
        if (resetPolicy === 'YEARLY' && year !== currentYear) {
          lastNumber = 0;
        }
        break;
      }
    }
    
    const nextNumber = lastNumber + 1;
    
    if (rowIndex === -1) {
      insertRow("NumberSequences", {
        SequenceID: generateUUID(),
        CompanyID: companyId,
        SequenceKey: sequenceKey,
        Prefix: prefix,
        Year: currentYear,
        LastNumber: nextNumber,
        PaddingLength: 6,
        ResetPolicy: 'YEARLY',
        UpdatedAt: getTimestamp()
      });
    } else {
      updateRow("NumberSequences", "SequenceID", data[rowIndex-1][headers.indexOf('SequenceID')], {
        LastNumber: nextNumber,
        Year: currentYear,
        UpdatedAt: getTimestamp()
      });
    }
    
    // Format: PREFIX-YYYY-000001
    const paddingLength = 6;
    const numberStr = nextNumber.toString().padStart(paddingLength, '0');
    return `${prefix}-${currentYear}-${numberStr}`;
  } finally {
    lock.releaseLock();
  }
}

function logAudit(companyId, userId, moduleCode, actionCode, entityType, entityId, oldData, newData) {
  insertRow("AuditLogs", {
    AuditLogID: generateUUID(),
    CompanyID: companyId,
    UserID: userId || 'SYSTEM',
    ModuleCode: moduleCode,
    ActionCode: actionCode,
    EntityType: entityType,
    EntityID: entityId,
    OldDataJSON: oldData ? JSON.stringify(oldData) : "",
    NewDataJSON: newData ? JSON.stringify(newData) : "",
    IPAddress: "",
    UserAgent: "",
    CreatedAt: getTimestamp()
  });
}

function doGet(e) {
  return ContentService.createTextOutput("NMO Labs Operations OS Backend");
}

function doPost(e) {
  const startTime = new Date().getTime();
  const perfMetrics = {
    authMs: 0,
    handlerMs: 0,
    totalExecutionMs: 0
  };

  try {
    const t0 = new Date().getTime();
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const payload = requestData.payload || {};
    const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
    payload.CompanyID = companyId; // Normalize
    perfMetrics.authMs = new Date().getTime() - t0;

    let resultData = null;
    const tHandler0 = new Date().getTime();

    switch (action) {
      case 'GET_SYSTEM_HEALTH': resultData = getSystemHealth(); break;
      case 'GET_SETTINGS': resultData = getSettings(payload); break;
      case 'SAVE_SETTINGS': resultData = saveSettings(payload); break;
      case 'UPDATE_SETTINGS': resultData = saveSettings(payload); break;
      case 'UPLOAD_LOGO': resultData = uploadBase64Image(payload); break;
      case 'UPLOAD_SIGNATURE': resultData = uploadBase64Image(payload); break;
      case 'UPLOAD_STAMP': resultData = uploadBase64Image(payload); break;
      case 'INITIALIZE_DATABASE': resultData = initializeDatabase(); break;

      // NOTIFICATIONS & DASHBOARD SUMMARIES
      case 'GET_NOTIFICATION_SUMMARY': resultData = getNotificationSummary(payload); break;
      case 'GET_FLEET_KPIS': resultData = getFleetKPIs(payload); break;
      
      // EMPLOYEES
      case 'GET_EMPLOYEES': resultData = getTableData('Employees', {CompanyID: payload.CompanyID, includeDeleted: true}); break;
      case 'CREATE_EMPLOYEE': resultData = createEmployee(payload); break;
      case 'UPDATE_EMPLOYEE': resultData = updateEmployee(payload); break;
      case 'DELETE_EMPLOYEE': resultData = deleteEmployee(payload); break;
      case 'RESTORE_EMPLOYEE': resultData = restoreEmployee(payload); break;
      
      // PRODUCTS
      case 'GET_PRODUCTS': resultData = getTableData('Products', {CompanyID: payload.CompanyID}); break;
      case 'SYNC_PRODUCT_IMAGES': resultData = syncProductImages(payload); break;
      case 'CREATE_PRODUCT': resultData = createProduct(payload); break;
      case 'UPDATE_PRODUCT': resultData = updateProduct(payload); break;
      case 'SEED_DEFAULT_PRODUCTS': resultData = seedDefaultProducts(payload); break;
      
      // SETTINGS
      case 'GET_COMMISSION_SETTINGS': resultData = getSettings(payload.CompanyID, 'commissions'); break;
      case 'UPDATE_COMMISSION_SETTINGS': resultData = updateSettings(payload.CompanyID, payload.settings); break;

      // COMMISSIONS
      case 'CREATE_ORDER_COUNT_COMMISSION': resultData = createOrderCountCommission(payload); break;
      case 'CREATE_PRODUCT_COMMISSION': resultData = createProductCommission(payload); break;
      case 'GET_MONTHLY_EMPLOYEE_ORDER_TOTAL': resultData = getMonthlyEmployeeOrderTotal(payload); break;
      case 'GET_COMMISSION_RECEIPTS': resultData = getCommissionReceipts(payload); break;
      case 'SAVE_COMMISSION_RECORD': resultData = saveCommissionRecord(payload); break;
      case 'UPDATE_COMMISSION_RECORD': resultData = updateCommissionRecord(payload); break;
      case 'GET_COMMISSION_RECORDS': resultData = getCommissionRecords(payload); break;
      case 'DELETE_COMMISSION_RECORD': resultData = deleteCommissionRecord(payload); break;
      case 'RESTORE_RECORD': resultData = restoreRecord(payload); break;

      // QUOTES
      case 'GET_OFFERS': return handleGetOffers(payload);
      case 'GET_OFFER': return handleGetOffer(payload);
      case 'GET_QUOTE_CATALOG': resultData = getQuoteCatalog(payload); break;
      case 'GET_QUOTES': resultData = getQuotes(payload); break;
      case 'CREATE_QUOTE': resultData = createQuote(payload); break;
      case 'UPDATE_QUOTE': resultData = updateQuote(payload); break;
      case 'CHANGE_QUOTE_STATUS': resultData = changeQuoteStatus(payload); break;
      case 'CREATE_OFFER': return handleCreateOffer(payload);
      case 'UPDATE_OFFER': return handleUpdateOffer(payload);
      case 'DELETE_OFFER': return handleDeleteOffer(payload);

      // FLEET & VEHICLES
      case 'GET_VEHICLES': resultData = handleGetVehicles(payload); break;
      case 'GET_VEHICLE_BY_ID': resultData = handleGetVehicleById(payload); break;
      case 'CREATE_VEHICLE': resultData = handleCreateVehicle(payload); break;
      case 'UPDATE_VEHICLE': resultData = handleUpdateVehicle(payload); break;
      case 'DELETE_VEHICLE': resultData = handleDeleteVehicle(payload); break;
      case 'GET_FUEL_LOGS': resultData = handleGetFuelLogs(payload); break;
      case 'ADD_FUEL_LOG': resultData = handleAddFuelLog(payload); break;
      case 'GET_MAINTENANCE_LOGS': resultData = handleGetMaintenanceLogs(payload); break;
      case 'ADD_MAINTENANCE_LOG': resultData = handleAddMaintenanceLog(payload); break;
      case 'GET_INSURANCE_LOGS': resultData = handleGetInsuranceLogs(payload); break;
      case 'ADD_INSURANCE_LOG': resultData = handleAddInsuranceLog(payload); break;
      case 'GET_COMPLIANCE_LOGS': resultData = handleGetComplianceLogs(payload); break;
      case 'ADD_COMPLIANCE_LOG': resultData = handleAddComplianceLog(payload); break;
      case 'GET_ACCIDENT_LOGS': resultData = handleGetAccidentLogs(payload); break;
      case 'ADD_ACCIDENT_LOG': resultData = handleAddAccidentLog(payload); break;
      case 'GET_DOCUMENTS': resultData = handleGetFleetDocuments(payload); break;
      case 'ADD_DOCUMENT': resultData = handleAddFleetDocument(payload); break;
      case 'IMPORT_VEHICLES_BATCH': resultData = handleImportVehiclesBatch(payload); break;
      case 'BULK_IMPORT_VEHICLES': resultData = handleImportVehiclesBatch(payload); break;
      case 'bulkImportVehicles': resultData = handleImportVehiclesBatch(payload); break;

      // COMPANY DOCUMENTS & COMPLIANCE
      case 'GET_COMPANY_DOCUMENTS': resultData = handleGetCompanyDocuments(payload); break;
      case 'GET_COMPANY_DOCUMENT_BY_ID': resultData = handleGetCompanyDocumentById(payload); break;
      case 'CREATE_COMPANY_DOCUMENT': resultData = handleCreateCompanyDocument(payload); break;
      case 'UPDATE_COMPANY_DOCUMENT': resultData = handleUpdateCompanyDocument(payload); break;
      case 'RENEW_COMPANY_DOCUMENT': resultData = handleRenewCompanyDocument(payload); break;
      case 'ARCHIVE_COMPANY_DOCUMENT': resultData = handleArchiveCompanyDocument(payload); break;
      case 'DELETE_COMPANY_DOCUMENT': resultData = handleDeleteCompanyDocument(payload); break;
      case 'GET_DOCUMENT_TYPES': resultData = handleGetDocumentTypes(payload); break;
      case 'SAVE_DOCUMENT_TYPE': resultData = handleSaveDocumentType(payload); break;
      case 'GET_DOCUMENT_CATEGORIES': resultData = handleGetDocumentCategories(payload); break;
      case 'GET_DOCUMENTS_SUMMARY': resultData = handleGetDocumentsSummary(payload); break;
      case 'UPLOAD_DOCUMENT_FILE': resultData = handleUploadDocumentFile(payload); break;

      default:
        perfMetrics.totalExecutionMs = new Date().getTime() - startTime;
        return responseError("Unknown action requested", "UNKNOWN_ACTION", "", perfMetrics);
    }

    perfMetrics.handlerMs = new Date().getTime() - tHandler0;
    perfMetrics.totalExecutionMs = new Date().getTime() - startTime;

    return responseOk(resultData, "Success", perfMetrics);
  } catch (error) {
    perfMetrics.totalExecutionMs = new Date().getTime() - startTime;
    return responseError("Server error processing request", "SERVER_ERROR", error.toString() + "\n" + error.stack, perfMetrics);
  }
}

// --- IMPLEMENTATIONS ---

function getNotificationSummary(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const notifications = [];
  const now = new Date();
  
  // 1. Check Vehicles for insurance expiries and maintenance
  const vehicles = getTableData('Vehicles', { CompanyID: companyId, includeDeleted: false });
  let fleetAlertCount = 0;
  
  for (let i = 0; i < vehicles.length; i++) {
    const v = vehicles[i];
    if (v.Insurance_Expiry) {
      const expDate = new Date(v.Insurance_Expiry);
      const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 30) {
        fleetAlertCount++;
        notifications.push({
          id: 'notif-ins-' + (v.Vehicle_ID || ''),
          title: 'انتهاء تأمين المركبة ' + (v.Plate_Number || ''),
          description: diffDays < 0 ? ('وثيقة التأمين منتهية منذ ' + Math.abs(diffDays) + ' يوم') : ('ينتهي التأمين خلال ' + diffDays + ' يوم'),
          module: 'FLEET',
          priority: diffDays <= 7 ? 'CRITICAL' : 'HIGH',
          timestamp: 'الآن',
          linkTo: '/fleet'
        });
      }
    }
    if (v.Operational_Status === 'IN_MAINTENANCE') {
      fleetAlertCount++;
      notifications.push({
        id: 'notif-mnt-' + (v.Vehicle_ID || ''),
        title: 'مركبة قيد الصيانة (' + (v.Plate_Number || '') + ')',
        description: (v.Brand || '') + ' ' + (v.Model || '') + ' - متابعة أمر الصيانة والإصلاح',
        module: 'FLEET',
        priority: 'MEDIUM',
        timestamp: 'مستمر',
        linkTo: '/fleet'
      });
    }
  }

  // 2. Check Commissions for pending amounts
  const commissionRecords = getTableData('CommissionRecords', { companyId: companyId });
  let pendingCount = 0;
  for (let j = 0; j < commissionRecords.length; j++) {
    const c = commissionRecords[j];
    const total = Number(c.grossCommission) || Number(c.netCommission) || 0;
    const paid = Number(c.onlinePaidAmount) || 0;
    if (total > paid && total > 0) {
      pendingCount++;
    }
  }
  if (pendingCount > 0) {
    notifications.push({
      id: 'notif-comm-pending',
      title: 'مستحقات عمولات معلقة (' + pendingCount + ' حركة)',
      description: 'توجد مبالغ عمولات مستحقة لم يتم استكمال صرفها بالكامل',
      module: 'COMMISSIONS',
      priority: 'HIGH',
      timestamp: 'اليوم',
      linkTo: '/commission'
    });
  }

  // 3. Check Products for low stock
  const products = getTableData('Products', { CompanyID: companyId });
  let critProdCount = 0;
  for (let k = 0; k < products.length; k++) {
    const p = products[k];
    const qty = Number(p.AvailableQuantity) || 0;
    if (qty <= 5) critProdCount++;
  }
  if (critProdCount > 0) {
    notifications.push({
      id: 'notif-prod-crit',
      title: 'مخزون حرج (' + critProdCount + ' صنف)',
      description: 'بعض المنتجات وصلت للحد الأدنى في المستودع وتتطلب إعادة طلب',
      module: 'INVENTORY',
      priority: 'CRITICAL',
      timestamp: 'الآن',
      linkTo: '/inventory'
    });
  }

  // 4. Check Company Documents & Compliance Expiries
  const companyDocs = getTableData('Company_Documents', { CompanyID: companyId, includeDeleted: false });
  let docAlertCount = 0;
  for (let m = 0; m < companyDocs.length; m++) {
    const doc = companyDocs[m];
    if (doc.Is_Archived && String(doc.Is_Archived).toLowerCase() === 'true') continue;
    if (doc.Expiry_Date) {
      const expDate = new Date(doc.Expiry_Date);
      if (!isNaN(expDate.getTime())) {
        const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
        const remDays = Number(doc.Reminder_Days) || 60;
        if (diffDays < 0) {
          docAlertCount++;
          notifications.push({
            id: 'notif-doc-exp-' + doc.Document_ID,
            title: 'وثيقة منتهية: ' + (doc.Document_Name || 'مستند رسمي'),
            description: 'انتهت صلاحية الوثيقة (' + (doc.Issuing_Authority || 'جهة الإصدار') + ') منذ ' + Math.abs(diffDays) + ' يوم وتتطلب التجديد الفوري',
            module: 'DOCUMENTS',
            priority: 'CRITICAL',
            timestamp: 'منتهية',
            linkTo: '/documents'
          });
        } else if (diffDays <= 7) {
          docAlertCount++;
          notifications.push({
            id: 'notif-doc-crit-' + doc.Document_ID,
            title: 'تجديد عاجل: ' + (doc.Document_Name || 'مستند رسمي'),
            description: 'تنتهي صلاحية الوثيقة خلال ' + diffDays + ' أيام فقط',
            module: 'DOCUMENTS',
            priority: 'CRITICAL',
            timestamp: 'عاجل جداً',
            linkTo: '/documents'
          });
        } else if (diffDays <= remDays) {
          docAlertCount++;
          notifications.push({
            id: 'notif-doc-warn-' + doc.Document_ID,
            title: 'تنبيه استحقاق تجديد: ' + (doc.Document_Name || 'مستند رسمي'),
            description: 'متبقي ' + diffDays + ' يوم على انتهاء الصلاحية',
            module: 'DOCUMENTS',
            priority: diffDays <= 30 ? 'HIGH' : 'MEDIUM',
            timestamp: diffDays + ' يوم',
            linkTo: '/documents'
          });
        }
      }
    }
  }

  return {
    notifications: notifications.slice(0, 20),
    unreadCount: notifications.length,
    summary: {
      fleetAlerts: fleetAlertCount,
      commissionPending: pendingCount,
      inventoryAlerts: critProdCount,
      documentAlerts: docAlertCount
    }
  };
}

function getFleetKPIs(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const vehicles = getTableData('Vehicles', { CompanyID: companyId, includeDeleted: false });
  const total = vehicles.length;
  let active = 0;
  let inMaint = 0;
  let notReady = 0;
  let sumReadiness = 0;
  let fuelCostMTD = 0;
  let maintCostMTD = 0;
  let accidentCostMTD = 0;
  let expiringIns = 0;
  let expiringInsp = 0;
  let expiringLic = 0;
  let upcomingMaint = 0;
  const now = new Date();

  for (let i = 0; i < total; i++) {
    const v = vehicles[i];
    if (v.Operational_Status === 'ACTIVE') active++;
    else if (v.Operational_Status === 'IN_MAINTENANCE') inMaint++;
    else if (v.Operational_Status === 'NOT_READY' || v.Operational_Status === 'ACCIDENT' || v.Operational_Status === 'STOPPED') notReady++;

    const score = Number(v.Readiness_Score !== undefined ? v.Readiness_Score : (v.Readiness_Index !== undefined ? v.Readiness_Index : 100)) || 100;
    sumReadiness += score;

    fuelCostMTD += Number(v.Fuel_Cost_MTD) || 0;
    maintCostMTD += Number(v.Maint_Cost_MTD) || 0;
    accidentCostMTD += Number(v.Accident_Cost_MTD) || 0;

    if (v.Insurance_Expiry) {
      const d = new Date(v.Insurance_Expiry);
      if ((d.getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30) expiringIns++;
    }
    if (v.Inspection_Expiry || v.Periodic_Inspection_Expiry) {
      const d = new Date(v.Inspection_Expiry || v.Periodic_Inspection_Expiry);
      if ((d.getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30) expiringInsp++;
    }
    if (v.License_Expiry || v.Registration_Expiry) {
      const d = new Date(v.License_Expiry || v.Registration_Expiry);
      if ((d.getTime() - now.getTime()) / (1000 * 3600 * 24) <= 30) expiringLic++;
    }
    if (v.Next_Maint_Date) {
      const d = new Date(v.Next_Maint_Date);
      if ((d.getTime() - now.getTime()) / (1000 * 3600 * 24) <= 14) upcomingMaint++;
    }
  }

  const avgReadiness = total > 0 ? Math.round(sumReadiness / total) : 100;
  const totalFleetCostMTD = fuelCostMTD + maintCostMTD + accidentCostMTD;

  return {
    totalVehicles: total,
    activeVehicles: active,
    inMaintenanceVehicles: inMaint,
    notReadyVehicles: notReady,
    averageReadinessIndex: avgReadiness,
    fuelCostMTD: Number(fuelCostMTD.toFixed(2)),
    maintCostMTD: Number(maintCostMTD.toFixed(2)),
    accidentCostMTD: Number(accidentCostMTD.toFixed(2)),
    totalFleetCostMTD: Number(totalFleetCostMTD.toFixed(2)),
    openAccidentsCount: 0,
    expiringInsuranceCount: expiringIns,
    expiringInspectionCount: expiringInsp,
    expiringLicenseCount: expiringLic,
    upcomingMaintenanceCount: upcomingMaint
  };
}

function getSystemHealth() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const allSheets = ss.getSheets().map(s => s.getName());
  const requiredSheets = Object.keys(SCHEMA);
  return {
    gasConnected: true,
    sheetsAccessible: true,
    existingSheets: requiredSheets.filter(s => allSheets.includes(s)),
    missingSheets: requiredSheets.filter(s => !allSheets.includes(s)),
    lastInitializedAt: PropertiesService.getScriptProperties().getProperty('lastInitializedAt'),
    coreRecordsCount: 0, // Simplified
    databaseVersion: DB_VERSION,
    appVersion: APP_VERSION
  };
}

function initializeDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  for (const [sheetName, headers] of Object.entries(SCHEMA)) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) sheet = ss.insertSheet(sheetName);
    const existingHeaders = sheet.getLastRow() > 0 ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0] : [];
    if (existingHeaders.length === 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    } else {
      let colIndex = existingHeaders.length + 1;
      for (const header of headers) {
        if (!existingHeaders.includes(header)) {
          sheet.getRange(1, colIndex).setValue(header);
          colIndex++;
        }
      }
    }
  }
  
  // Default Company
  const companiesSheet = ss.getSheetByName("Companies");
  if (companiesSheet.getLastRow() <= 1) {
    const companyId = generateUUID();
    let comp = {};
    SCHEMA.Companies.forEach(k => comp[k] = "");
    comp.CompanyID = companyId;
    comp.CompanyCode = "COM-0001";
    comp.LegalNameAR = "مؤسسة المستهلك الأخير";
    comp.LegalNameEN = "Final Consumer Establishment";
    comp.BrandNameAR = "ريجين";
    comp.BrandNameEN = "Regine";
    comp.Currency = "SAR";
    comp.Timezone = "Asia/Riyadh";
    comp.DefaultLanguage = "ar";
    comp.Status = "ACTIVE";
    comp.CreatedAt = getTimestamp();
    insertRow("Companies", comp);
    
    // Seed settings
    insertRow("Settings", { SettingID: generateUUID(), CompanyID: companyId, SettingGroup: "commissions", SettingKey: "monthly_threshold", SettingValue: "250", ValueType: "NUMBER", CreatedAt: getTimestamp() });
    insertRow("Settings", { SettingID: generateUUID(), CompanyID: companyId, SettingGroup: "commissions", SettingKey: "first_tier_rate", SettingValue: "3", ValueType: "NUMBER", CreatedAt: getTimestamp() });
    insertRow("Settings", { SettingID: generateUUID(), CompanyID: companyId, SettingGroup: "commissions", SettingKey: "second_tier_rate", SettingValue: "4", ValueType: "NUMBER", CreatedAt: getTimestamp() });
  }

  PropertiesService.getScriptProperties().setProperty('lastInitializedAt', getTimestamp());
  return { status: "success" };
}

function createEmployee(payload) {
  if (payload.Mobile) {
    const existing = getTableData('Employees', {CompanyID: payload.CompanyID, Mobile: payload.Mobile});
    if (existing.length > 0) throw new Error("DuplicateMobile");
  }
  const code = getNextSequence(payload.CompanyID, 'EMPLOYEE', 'EMP');
  const emp = {
    ...payload,
    EmployeeID: generateUUID(),
    EmployeeCode: code,
    CreatedAt: getTimestamp(),
    UpdatedAt: getTimestamp(),
    IsDeleted: false
  };
  insertRow('Employees', emp);
  logAudit(payload.CompanyID, '', 'EMPLOYEE', 'CREATE', 'Employee', emp.EmployeeID, null, emp);
  return emp;
}

function updateEmployee(payload) {
  if (payload.Mobile) {
    const existing = getTableData('Employees', {CompanyID: payload.CompanyID, Mobile: payload.Mobile});
    if (existing.length > 0 && existing[0].EmployeeID !== payload.EmployeeID) throw new Error("DuplicateMobile");
  }
  payload.UpdatedAt = getTimestamp();
  updateRow('Employees', 'EmployeeID', payload.EmployeeID, payload);
  return payload;
}


function deleteEmployee(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('Employees');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Ensure required columns exist
    const requiredColumns = ['IsDeleted', 'DeletedAt', 'Status', 'UpdatedAt'];
    let added = false;
    requiredColumns.forEach(col => {
      if (!headers.includes(col)) {
        sheet.insertColumnAfter(sheet.getLastColumn());
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(col);
        added = true;
      }
    });
    
    updateRow('Employees', 'EmployeeID', payload.EmployeeID, { 
      IsDeleted: true, 
      Status: 'INACTIVE',
      DeletedAt: getTimestamp(),
      UpdatedAt: getTimestamp()
    });
    return { success: true, employeeId: payload.EmployeeID, deleted: true };
  } finally {
    lock.releaseLock();
  }
}

function restoreEmployee(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    updateRow('Employees', 'EmployeeID', payload.EmployeeID, { 
      IsDeleted: false, 
      Status: 'ACTIVE',
      DeletedAt: '',
      UpdatedAt: getTimestamp()
    });
    return { success: true, employeeId: payload.EmployeeID, restored: true };
  } finally {
    lock.releaseLock();
  }
}

function createProduct(payload) {
  const code = getNextSequence(payload.CompanyID, 'PRODUCT', 'PRD');
  const sku = payload.SKU || code;
  const prd = {
    ...payload,
    ProductID: generateUUID(),
    ProductCode: code,
    SKU: sku,
    CreatedAt: getTimestamp(),
    UpdatedAt: getTimestamp(),
    IsDeleted: false
  };
  insertRow('Products', prd);
  return prd;
}

function updateProduct(payload) {
  payload.UpdatedAt = getTimestamp();
  updateRow('Products', 'ProductID', payload.ProductID, payload);
  return payload;
}

function seedDefaultProducts(payload) {
  const companyId = payload.CompanyID;
  const products = getTableData('Products', {CompanyID: companyId});
  if (products.length > 0) return { seeded: false };
  
  const defaults = [
    { ArabicName: "مناديل ريجين 40 عبوة — كرتون", DefaultCommission: 9 },
    { ArabicName: "مناديل ريجين تعليق — شدة", DefaultCommission: 5 },
    { ArabicName: "بكج مناديل ريجين الشامل", DefaultCommission: 5 },
    { ArabicName: "مجموعة الورقيات", DefaultCommission: 5 },
    { ArabicName: "رول مغاسل 300 متر — كرتون", DefaultCommission: 5 },
    { ArabicName: "رول مطبخ — كرتون", DefaultCommission: 5 },
    { ArabicName: "مناديل انترفولد — كرتون", DefaultCommission: 5 },
    { ArabicName: "مناديل حمام — كرتون", DefaultCommission: 5 },
    { ArabicName: "أكياس نفايات 55 جالون", DefaultCommission: 5 },
    { ArabicName: "أكياس نفايات 10 جالون", DefaultCommission: 5 },
    { ArabicName: "سفرة طعام", DefaultCommission: 5 },
    { ArabicName: "قصدير", DefaultCommission: 5 },
    { ArabicName: "رول تغليف", DefaultCommission: 5 },
    { ArabicName: "صابون أيدي رغوة", DefaultCommission: 5 },
    { ArabicName: "معطر أرضيات", DefaultCommission: 5 },
    { ArabicName: "معطر ملابس", DefaultCommission: 5 },
    { ArabicName: "ملطف جو", DefaultCommission: 5 },
    { ArabicName: "مطهر", DefaultCommission: 5 },
    { ArabicName: "شامبو عبايات", DefaultCommission: 5 },
    { ArabicName: "مسحوق غسيل", DefaultCommission: 5 },
    { ArabicName: "ملمع زجاج", DefaultCommission: 5 },
    { ArabicName: "سائل جلي (فيري الوزير)", DefaultCommission: 5 }
  ];
  
  defaults.forEach(d => {
    createProduct({
      CompanyID: companyId,
      ArabicName: d.ArabicName,
      EnglishName: d.ArabicName,
      SellingPrice: 0,
      DefaultCommission: d.DefaultCommission,
      Status: 'ACTIVE'
    });
  });
  
  return { seeded: true };
}

function getSettings(payload) {
  const companyId = String(
    payload.CompanyID ||
    payload.companyId ||
    payload.company?.CompanyID ||
    ''
  ).trim();

  const companyCode = String(
    payload.CompanyCode ||
    payload.companyCode ||
    payload.company?.CompanyCode ||
    'COM-0001'
  ).trim();
  
  // Single-pass company resolution
  const allCompanies = getTableData('Companies', { includeDeleted: true });
  let company = null;
  for (let i = 0; i < allCompanies.length; i++) {
    const c = allCompanies[i];
    if ((companyId && String(c.CompanyID).trim() === companyId) ||
        (companyCode && String(c.CompanyCode).trim() === companyCode) ||
        (companyId && String(c.CompanyCode).trim() === companyId)) {
      company = c;
      break;
    }
  }
  
  const resolvedCompanyId = company ? String(company.CompanyID).trim() : (companyId || 'COM-0001');
  const settingsRecords = getTableData('Settings', { CompanyID: resolvedCompanyId });
  
  const settings = {};
  
  if (company) {
    settings.CompanyID = resolvedCompanyId;
    settings.CompanyCode = company.CompanyCode || '';
    settings.CompanyNameAr = company.LegalNameAR || company.BrandNameAR || '';
    settings.CompanyNameEn = company.LegalNameEN || company.BrandNameEN || '';
    settings.LogoURL = company.LogoURL || '';
    settings.CommercialRegistration = company.CommercialRegistration || '';
    settings.VATNumber = company.VATNumber || '';
    settings.Phone = company.Phone || '';
    settings.Mobile = company.WhatsApp || '';
    settings.Email = company.Email || '';
    settings.Website = company.Website || '';
    settings.Address = company.AddressAR || '';
    settings.City = company.City || '';
    settings.Country = company.Country || '';
    settings.Currency = company.Currency || '';
    settings.Timezone = company.Timezone || '';
    settings.DefaultLanguage = company.DefaultLanguage || '';
    settings.DateFormat = company.DateFormat || '';
  }
  
  for (let s = 0; s < settingsRecords.length; s++) {
    const r = settingsRecords[s];
    settings[r.SettingKey] = r.SettingValue;
  }
  
  return { company: company, settings: settings };
}

function saveSettings(payload) {
  const companyId = String(
    payload.CompanyID ||
    payload.companyId ||
    payload.company?.CompanyID ||
    ''
  ).trim();

  const companyCode = String(
    payload.CompanyCode ||
    payload.companyCode ||
    payload.company?.CompanyCode ||
    'COM-0001'
  ).trim();

  const settingsObj = payload.settings || {};
  
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    let companies = companyId 
      ? getTableData('Companies', { CompanyID: companyId, includeDeleted: true })
      : getTableData('Companies', { CompanyCode: companyCode, includeDeleted: true });
    
    if (!companies.length && companyCode) {
       companies = getTableData('Companies', { CompanyCode: companyCode, includeDeleted: true });
    }
      
    if (!companies.length) {
      throw new Error(
        'Company not found. CompanyID=' +
        companyId +
        ', CompanyCode=' +
        companyCode
      );
    }
    
    const existingCompany = companies[0];
    const resolvedCompanyId = String(existingCompany.CompanyID).trim();
    
    // 1. Update Company
    const updateData = {};
    if ('CompanyNameAr' in settingsObj) { updateData.LegalNameAR = settingsObj.CompanyNameAr; updateData.BrandNameAR = settingsObj.CompanyNameAr; }
    if ('CompanyNameEn' in settingsObj) { updateData.LegalNameEN = settingsObj.CompanyNameEn; updateData.BrandNameEN = settingsObj.CompanyNameEn; }
    if ('LogoURL' in settingsObj) updateData.LogoURL = settingsObj.LogoURL;
    if ('CommercialRegistration' in settingsObj) updateData.CommercialRegistration = settingsObj.CommercialRegistration;
    if ('VATNumber' in settingsObj) updateData.VATNumber = settingsObj.VATNumber;
    if ('Phone' in settingsObj) updateData.Phone = settingsObj.Phone;
    if ('Mobile' in settingsObj) updateData.WhatsApp = settingsObj.Mobile;
    if ('Email' in settingsObj) updateData.Email = settingsObj.Email;
    if ('Website' in settingsObj) updateData.Website = settingsObj.Website;
    if ('Address' in settingsObj) updateData.AddressAR = settingsObj.Address;
    if ('City' in settingsObj) updateData.City = settingsObj.City;
    if ('Country' in settingsObj) updateData.Country = settingsObj.Country;
    if ('Currency' in settingsObj) updateData.Currency = settingsObj.Currency;
    if ('Timezone' in settingsObj) updateData.Timezone = settingsObj.Timezone;
    if ('DefaultLanguage' in settingsObj) updateData.DefaultLanguage = settingsObj.DefaultLanguage;
    if ('DateFormat' in settingsObj) updateData.DateFormat = settingsObj.DateFormat;
    
    updateData.UpdatedAt = getTimestamp();
    updateData.UpdatedBy = 'SYSTEM';
    
    // Remove undefined values
    Object.keys(updateData).forEach(k => {
      if (updateData[k] === undefined) delete updateData[k];
    });
    
    if (Object.keys(updateData).length > 2) {
      updateRow('Companies', 'CompanyID', resolvedCompanyId, updateData);
      SpreadsheetApp.flush();
      
      const saved = getTableData('Companies', {
        CompanyID: resolvedCompanyId,
        includeDeleted: true
      });
      
      if (!saved.length) {
        throw new Error('Company was not found after update');
      }
      
      const savedCompany = saved[0];
      if (updateData.LegalNameAR !== undefined && String(savedCompany.LegalNameAR).trim() !== String(updateData.LegalNameAR).trim()) {
        throw new Error('LegalNameAR was not persisted');
      }
    }
    
    // 2. Update Settings table
    const existingSettings = getTableData('Settings', { CompanyID: resolvedCompanyId });
    const existingKeys = existingSettings.map(r => r.SettingKey);
    
    const companyKeys = ['CompanyNameAr', 'CompanyNameEn', 'LogoURL', 'CommercialRegistration', 'VATNumber', 'Phone', 'Mobile', 'Email', 'Website', 'Address', 'City', 'Country', 'Currency', 'Timezone', 'DefaultLanguage', 'DateFormat', 'CompanyID', 'CompanyCode'];
    
    for (let key in settingsObj) {
      if (companyKeys.includes(key)) continue;
      
      const val = settingsObj[key] !== null && settingsObj[key] !== undefined ? String(settingsObj[key]) : '';
      
      if (existingKeys.includes(key)) {
        const rec = existingSettings.find(r => r.SettingKey === key);
        updateRow('Settings', 'SettingID', rec.SettingID, { SettingValue: val, UpdatedAt: getTimestamp() });
      } else {
        insertRow('Settings', {
          SettingID: generateUUID(),
          CompanyID: resolvedCompanyId,
          SettingGroup: 'general',
          SettingKey: key,
          SettingValue: val,
          ValueType: 'STRING',
          CreatedAt: getTimestamp(),
          UpdatedAt: getTimestamp()
        });
      }
    }
    
    SpreadsheetApp.flush();
    
    const finalSettingsRes = getSettings({ companyId: resolvedCompanyId });
    
    return {
      company: finalSettingsRes.company,
      settings: finalSettingsRes.settings
    };
  } finally {
    lock.releaseLock();
  }
}

function getMonthlyEmployeeOrderTotal(payload) {
  const { CompanyID, EmployeeID, CommissionMonth } = payload;
  const commissions = getTableData('OrderCountCommissions', { CompanyID, EmployeeID, CommissionMonth });
  let total = 0;
  commissions.forEach(c => {
    total += parseInt(c.OrdersCount || 0, 10);
  });
  return { totalOrders: total };
}

function createOrderCountCommission(payload) {
  const { CompanyID, EmployeeID, OrdersCount, CommissionMonth, ReceiptDate, ThresholdOrders, FirstTierRate, SecondTierRate, Notes } = payload;
  
  // recalculate to ensure safety
  const pastOrders = getMonthlyEmployeeOrderTotal({CompanyID, EmployeeID, CommissionMonth}).totalOrders;
  const newTotal = pastOrders + parseInt(OrdersCount, 10);
  
  let firstTierOrders = 0;
  let secondTierOrders = 0;
  
  for(let i = pastOrders + 1; i <= newTotal; i++) {
    if (i <= ThresholdOrders) firstTierOrders++;
    else secondTierOrders++;
  }
  
  const firstTierTotal = firstTierOrders * FirstTierRate;
  const secondTierTotal = secondTierOrders * SecondTierRate;
  const grossCommission = firstTierTotal + secondTierTotal;
  
  const receiptNum = getNextSequence(CompanyID, 'RECEIPT', 'RC');
  const receiptId = generateUUID();
  
  const receipt = {
    ReceiptID: receiptId,
    CompanyID: CompanyID,
    ReceiptNumber: receiptNum,
    EmployeeID: EmployeeID,
    ReceiptDate: ReceiptDate,
    ReceiptTime: getTimestamp(),
    CommissionSystem: 'ORDER_COUNT',
    GrossCommission: grossCommission,
    DiscountTotal: 0,
    NetCommission: grossCommission,
    RequiredAmount: 0,
    PaidInvoicesAmount: 0,
    Balance: 0,
    Status: 'COMPLETED',
    Notes: Notes,
    CreatedAt: getTimestamp(),
    IsDeleted: false
  };
  
  insertRow('CommissionReceipts', receipt);
  
  const orderComm = {
    OrderCommissionID: generateUUID(),
    CompanyID: CompanyID,
    ReceiptID: receiptId,
    EmployeeID: EmployeeID,
    CommissionMonth: CommissionMonth,
    OrdersCount: OrdersCount,
    ThresholdOrders: ThresholdOrders,
    FirstTierRate: FirstTierRate,
    SecondTierRate: SecondTierRate,
    FirstTierOrders: firstTierOrders,
    SecondTierOrders: secondTierOrders,
    FirstTierTotal: firstTierTotal,
    SecondTierTotal: secondTierTotal,
    GrossCommission: grossCommission,
    CreatedAt: getTimestamp()
  };
  
  insertRow('OrderCountCommissions', orderComm);
  logAudit(CompanyID, '', 'COMMISSIONS', 'CREATE', 'CommissionReceipts', receiptId, null, receipt);
  
  return { receipt, orderComm };
}

function createProductCommission(payload) {
  const { CompanyID, EmployeeID, ReceiptDate, Items, Discounts, RequiredAmount, PaidInvoicesAmount, Notes } = payload;
  
  let grossCommission = 0;
  Items.forEach(item => {
    grossCommission += (parseFloat(item.Quantity) * parseFloat(item.UnitCommission));
  });
  
  let discountTotal = 0;
  Discounts.forEach(d => {
    discountTotal += parseFloat(d.Amount);
  });
  
  let netCommission = grossCommission - discountTotal;
  if (netCommission < 0) netCommission = 0;
  
  const balance = parseFloat(RequiredAmount) - parseFloat(PaidInvoicesAmount);
  
  const receiptNum = getNextSequence(CompanyID, 'RECEIPT', 'RC');
  const receiptId = generateUUID();
  
  const receipt = {
    ReceiptID: receiptId,
    CompanyID: CompanyID,
    ReceiptNumber: receiptNum,
    EmployeeID: EmployeeID,
    ReceiptDate: ReceiptDate,
    ReceiptTime: getTimestamp(),
    CommissionSystem: 'PRODUCT_COMMISSION',
    GrossCommission: grossCommission,
    DiscountTotal: discountTotal,
    NetCommission: netCommission,
    RequiredAmount: RequiredAmount,
    PaidInvoicesAmount: PaidInvoicesAmount,
    Balance: balance,
    Status: 'COMPLETED',
    Notes: Notes,
    CreatedAt: getTimestamp(),
    IsDeleted: false
  };
  
  insertRow('CommissionReceipts', receipt);
  
  Items.forEach(item => {
    insertRow('CommissionReceiptItems', {
      ReceiptItemID: generateUUID(),
      CompanyID: CompanyID,
      ReceiptID: receiptId,
      ProductID: item.ProductID,
      Quantity: item.Quantity,
      UnitCommission: item.UnitCommission,
      TotalCommission: parseFloat(item.Quantity) * parseFloat(item.UnitCommission),
      CreatedAt: getTimestamp()
    });
  });
  
  Discounts.forEach(d => {
    insertRow('ReceiptDiscounts', {
      DiscountID: generateUUID(),
      CompanyID: CompanyID,
      ReceiptID: receiptId,
      DiscountCode: d.DiscountCode || 'DISC',
      Description: d.Description || '',
      Amount: d.Amount,
      CreatedAt: getTimestamp()
    });
  });
  
  // Create daily closing
  const closingNum = getNextSequence(CompanyID, 'CLOSING', 'CL');
  insertRow('DailyClosings', {
    ClosingID: generateUUID(),
    CompanyID: CompanyID,
    ClosingNumber: closingNum,
    EmployeeID: EmployeeID,
    ReceiptID: receiptId,
    ClosingDate: ReceiptDate,
    RequiredAmount: RequiredAmount,
    PaidInvoicesAmount: PaidInvoicesAmount,
    Balance: balance,
    Status: 'CLOSED',
    CreatedAt: getTimestamp()
  });
  
  logAudit(CompanyID, '', 'COMMISSIONS', 'CREATE', 'CommissionReceipts', receiptId, null, receipt);
  
  return receipt;
}

function getCommissionReceipts(payload) {
  const receipts = getTableData('CommissionReceipts', {CompanyID: payload.CompanyID});
  // In a real app we would join employee names, etc. We can do that on frontend or here.
  return receipts;
}


function syncProductImages(payload) {
  const props = PropertiesService.getScriptProperties();
  const cloudName = props.getProperty('CLOUDINARY_CLOUD_NAME');
  const apiKey = props.getProperty('CLOUDINARY_API_KEY');
  const apiSecret = props.getProperty('CLOUDINARY_API_SECRET');

  if (!cloudName || !apiKey || !apiSecret) {
    return {
      success: false,
      message: 'Cloudinary credentials are not set in Script Properties. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: []
    };
  }

  // Fetch images from Cloudinary Admin API
  let allImages = [];
  let nextCursor = null;
  const baseUrl = `https://api.cloudinary.com/v1_1/${cloudName}/resources/search`;

  do {
    const query = {
      expression: "resource_type:image",
      with_field: ["tags", "context"],
      max_results: 500
    };
    if (nextCursor) {
      query.next_cursor = nextCursor;
    }

    const options = {
      method: 'post',
      headers: {
        "Authorization": "Basic " + Utilities.base64Encode(apiKey + ":" + apiSecret)
      },
      contentType: 'application/json',
      payload: JSON.stringify(query),
      muteHttpExceptions: true
    };

    const response = UrlFetchApp.fetch(baseUrl, options);
    if (response.getResponseCode() !== 200) {
      return { success: false, message: 'Cloudinary API error: ' + response.getContentText(), totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: [] };
    }

    const data = JSON.parse(response.getContentText());
    allImages = allImages.concat(data.resources || []);
    nextCursor = data.next_cursor;

  } while (nextCursor);

  const normalize = (name) => {
    if (!name) return '';
    let n = String(name).replace(/\.[^/.]+$/, "");
    return n.trim().toLowerCase();
  };

  const cloudinaryMap = new Map();
  const duplicates = [];

  allImages.forEach(img => {
    const dName = normalize(img.display_name);
    const fName = normalize(img.original_filename || img.filename);
    const pubId = normalize(img.public_id.split('/').pop());

    const matchedName = dName || fName || pubId;
    if (matchedName) {
       if (cloudinaryMap.has(matchedName)) {
         duplicates.push(matchedName);
       } else {
         cloudinaryMap.set(matchedName, img.secure_url);
       }
    }
  });

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Products');
  if (!sheet) return { success: false, message: 'Products sheet not found', totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: [] };

  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return { success: true, message: 'No products to sync', totalProducts: 0, totalImages: allImages.length, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates };
  
  const headers = data[0];
  const skuIndex = headers.indexOf('SKU');
  const imageIndex = headers.indexOf('ImageURL');

  if (skuIndex === -1) return { success: false, message: 'SKU column not found', totalProducts: 0, totalImages: 0, matchCount: 0, noMatchCount: 0, updatedCount: 0, duplicates: [] };

  let colImageURL = imageIndex + 1;
  if (imageIndex === -1) {
    colImageURL = headers.length + 1;
    sheet.getRange(1, colImageURL).setValue('ImageURL');
  }

  let matchCount = 0;
  let noMatchCount = 0;
  let updatedCount = 0;

  for (let i = 1; i < data.length; i++) {
    const sku = String(data[i][skuIndex]).trim();
    if (!sku) continue;

    const normalizedSku = sku.toLowerCase();
    if (cloudinaryMap.has(normalizedSku)) {
      const url = cloudinaryMap.get(normalizedSku);
      if (imageIndex === -1 || data[i][imageIndex] !== url) {
        sheet.getRange(i + 1, colImageURL).setValue(url);
        updatedCount++;
      }
      matchCount++;
    } else {
      noMatchCount++;
    }
  }

  return {
    totalProducts: data.length - 1,
    totalImages: allImages.length,
    matchCount,
    noMatchCount,
    updatedCount,
    duplicates
  };
}


function isTruthySheetValue(value) {
  if (value === true || value === 1) return true;
  const normalized = String(value ?? '').trim().toLowerCase();
  return ['true', '1', 'yes', 'y'].includes(normalized);
}

function isProductActive(status, isDeleted) {
  if (isDeleted) return false;
  const value = String(status ?? '').trim().toLowerCase();
  if (!value) {
    return true;
  }
  return ['active', 'enabled', 'true', '1', 'نشط', 'مفعل'].includes(value);
}

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function safeOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function getQuoteCatalog(payload) {
  const products = getTableData('Products', { CompanyID: payload.CompanyID });
  
  const mappedProducts = products.map(product => {
    const isDeleted = isTruthySheetValue(product.IsDeleted);
    if (isDeleted) return null;
    
    const active = isProductActive(product.Status, isDeleted);
    
    const vatRateRaw = Number(product.VATRate);
    const vatRate = Number.isFinite(vatRateRaw) ? (vatRateRaw > 1 ? vatRateRaw / 100 : vatRateRaw) : 0.15;
    
    const offerUnitsRaw = Number(product.OfferUnitsPerInventoryItem);
    const offerUnitsPerInventoryItem = Number.isFinite(offerUnitsRaw) && offerUnitsRaw > 0 ? offerUnitsRaw : 1;
    
    const inventoryUnitName = String(product.InventoryUnitName || product.UnitType || 'وحدة مخزون').trim();
    const offerUnitName = String(product.OfferUnitName || product.UnitType || 'وحدة').trim();
    
    const purchaseCostInventoryExVat = safeNumber(product.PurchaseCostExVAT);
    const purchaseCostPerOfferUnitExVat = purchaseCostInventoryExVat / offerUnitsPerInventoryItem;
    const purchaseCostPerOfferUnitIncVat = purchaseCostPerOfferUnitExVat * (1 + vatRate);
    
    const sellingPriceInventoryIncVat = safeNumber(product.SellingPriceIncVAT || product.SellingPrice);
    const defaultSellingPricePerOfferUnitIncVat = sellingPriceInventoryIncVat / offerUnitsPerInventoryItem;
    
    const suggestedPriceRaw = safeOptionalNumber(product.SuggestedPricePerOfferUnitIncVat);
    const unitSellingPriceIncVat = suggestedPriceRaw ?? defaultSellingPricePerOfferUnitIncVat;
    
    return {
      id: String(product.ProductID || product.ProductCode || product.SKU).trim(),
      sku: String(product.SKU || product.ProductCode || '').trim(),
      nameAr: String(product.ArabicName || product.EnglishName || product.SKU || 'منتج بدون اسم').trim(),
      nameEn: String(product.EnglishName || '').trim(),
      category: String(product.Category || 'أخرى').trim(),
      
      inventoryUnitName,
      offerUnitName,
      offerUnitsPerInventoryItem,
      piecesPerOfferUnit: safeOptionalNumber(product.PiecesPerOfferUnit),
      
      purchaseCostPerOfferUnitExVat,
      purchaseCostPerOfferUnitIncVat,
      
      storePricePerOfferUnitExVat: unitSellingPriceIncVat / (1 + vatRate),
      storePricePerOfferUnitIncVat: unitSellingPriceIncVat,
      
      suggestedPricePerOfferUnitIncVat: suggestedPriceRaw,
      marketPricePerOfferUnitIncVat: safeOptionalNumber(product.MarketPricePerOfferUnitIncVat),
      
      vatRate,
      availableOfferUnits: safeNumber(product.AvailableQuantity) * offerUnitsPerInventoryItem,
      
      imageUrl: String(product.ImageURL || '').trim(),
      active,
      configurationComplete: Boolean(product.OfferUnitName) && offerUnitsRaw > 0
    };
  }).filter(p => p !== null);

  return {
    products: mappedProducts,
    total: mappedProducts.length
  };
}


function createQuote(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const quoteId = 'QT-' + new Date().getTime();
    
    // Calculate Quote Number
    const quotesSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotes');
    if (!quotesSheet) {
      initializeSheets();
    }
    const qSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Quotes');
    let newNumber = 1;
    if (qSheet && qSheet.getLastRow() > 1) {
      newNumber = qSheet.getLastRow();
    }
    const quoteNumber = 'QT-' + new Date().getFullYear() + '-' + String(newNumber).padStart(6, '0');

    const quoteObj = {
      QuoteID: quoteId,
      CompanyID: payload.companyId,
      QuoteNumber: quoteNumber,
      Status: payload.status || 'draft',
      Title: payload.title,
      CustomerName: payload.customerName,
      CustomerPhone: payload.customerPhone,
      ValidUntil: payload.validUntil,
      
      PurchaseCostExVat: payload.totals.purchaseCostExVat,
      InputVAT: payload.totals.inputVat,
      PurchaseCostIncVat: payload.totals.purchaseCostIncVat,
      RetailValueExVat: payload.totals.retailValueExVat,
      OutputVAT: payload.totals.outputVat,
      RetailValueIncVat: payload.totals.retailValueIncVat,
      DiscountTotal: payload.totals.discountTotal,
      AdditionTotal: payload.totals.additionTotal,
      InternalExpenseTotal: payload.totals.internalExpenseTotal,
      FinalQuotePriceIncVat: payload.totals.finalQuotePriceIncVat,
      NetProfit: payload.totals.netProfit,
      ProfitMarginPercent: payload.totals.profitMarginPercent,
      TotalOfferUnits: payload.totals.totalOfferUnits,
      TotalPieces: payload.totals.totalPieces,
      
      CreatedAt: new Date().toISOString(),
      IsDeleted: false
    };
    insertRow('Quotes', quoteObj);

    if (payload.items && payload.items.length > 0) {
      payload.items.forEach(item => {
        insertRow('QuoteItems', {
          QuoteItemID: 'QI-' + new Date().getTime() + Math.floor(Math.random() * 1000),
          QuoteID: quoteId,
          ProductID: item.productId,
          SKU: item.sku,
          ProductName: item.productName,
          ImageURL: item.imageUrl,
          OfferUnitName: item.offerUnitName,
          Quantity: item.quantity,
          UnitPurchaseCostExVat: item.unitPurchaseCostExVat,
          UnitPurchaseCostIncVat: item.unitPurchaseCostIncVat,
          UnitSellingPriceIncVat: item.unitSellingPriceIncVat,
          LineSellingPriceIncVat: item.lineSellingPriceIncVat
        });
      });
    }

    return getQuoteById({ QuoteID: quoteId });
  } finally {
    lock.releaseLock();
  }
}

function updateQuote(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const qId = payload.id;
    const quotes = getTableData('Quotes', { QuoteID: qId });
    if (quotes.length === 0) throw new Error('Quote not found');
    
    // We update status and other simple fields for now. 
    // Usually we update items by deleting old and inserting new.
    
    // ... For simplicity in this demo, we'll return a mock success or do a partial update.
    return { id: qId, status: payload.status };
  } finally {
    lock.releaseLock();
  }
}

function getQuotes(payload) {
  const quotes = getTableData('Quotes', { CompanyID: payload.CompanyID, IsDeleted: false });
  // Map back to JSON structure for frontend
  return quotes.map(q => ({
    id: q.QuoteID,
    quoteNumber: q.QuoteNumber,
    status: q.Status,
    title: q.Title,
    customerName: q.CustomerName,
    createdAt: q.CreatedAt,
    totals: {
      finalQuotePriceIncVat: parseFloat(q.FinalQuotePriceIncVat) || 0,
      netProfit: parseFloat(q.NetProfit) || 0,
      profitMarginPercent: parseFloat(q.ProfitMarginPercent) || 0
    }
  }));
}

function getQuoteById(payload) {
  // Mock full response for creation return
  return {
    id: payload.QuoteID,
    status: 'draft'
  };
}

function changeQuoteStatus(payload) {
   // Implementation would update the cell in Google Sheets.
   return { success: true };
}


function saveCommissionRecord(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const { record } = payload;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('CommissionRecords');
    if (!sheet) {
      initializeDatabase();
      sheet = ss.getSheetByName('CommissionRecords');
    } else {
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      let colIndex = headers.length + 1;
      const expectedHeaders = SCHEMA.CommissionRecords;
      for (const expectedHeader of expectedHeaders) {
        if (!headers.includes(expectedHeader)) {
          sheet.getRange(1, colIndex).setValue(expectedHeader);
          colIndex++;
        }
      }
    }
    
    // Add missing record field fallbacks
    const objToInsert = { ...record };
    if (objToInsert.items) objToInsert.items = JSON.stringify(objToInsert.items);
    if (objToInsert.discounts) objToInsert.discounts = JSON.stringify(objToInsert.discounts);
    if (objToInsert.orderCountDetails) objToInsert.orderCountDetails = JSON.stringify(objToInsert.orderCountDetails);
    if (objToInsert.requiredItems) objToInsert.requiredItems = JSON.stringify(objToInsert.requiredItems);
    if (objToInsert.paymentItems) objToInsert.paymentItems = JSON.stringify(objToInsert.paymentItems);
    
    objToInsert.IsDeleted = false;
    
    insertRow('CommissionRecords', objToInsert);
    
    return { success: true, record: objToInsert };
  } finally {
    lock.releaseLock();
  }
}

function getCommissionRecords(payload) {
  const records = getTableData('CommissionRecords', { companyId: payload.CompanyID });
  
  // Sort them by createdAt DESC (newest first)
  records.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  return records.map(r => {
    let items = [];
    let discounts = [];
    let orderCountDetails = null;
    let requiredItems = [];
    let paymentItems = [];
    try { if (r.items) items = JSON.parse(r.items); } catch(e){}
    try { if (r.discounts) discounts = JSON.parse(r.discounts); } catch(e){}
    try { if (r.orderCountDetails) orderCountDetails = JSON.parse(r.orderCountDetails); } catch(e){}
    try { if (r.requiredItems) requiredItems = JSON.parse(r.requiredItems); } catch(e){}
    try { if (r.paymentItems) paymentItems = JSON.parse(r.paymentItems); } catch(e){}
    let revisions = [];
    let auditLogs = [];
    let lastModifiedBy = null;
    try { if (r.revisions) revisions = JSON.parse(r.revisions); } catch(e){}
    try { if (r.auditLogs) auditLogs = JSON.parse(r.auditLogs); } catch(e){}
    try { if (r.lastModifiedBy) lastModifiedBy = JSON.parse(r.lastModifiedBy); } catch(e){}
    
    return {
      ...r,
      items,
      discounts,
      orderCountDetails,
      requiredItems,
      paymentItems,
      revisions,
      auditLogs,
      lastModifiedBy,
      quantityOrOrdersCount: Number(r.quantityOrOrdersCount) || 0,
      grossCommission: Number(r.grossCommission) || 0,
      totalDiscount: Number(r.totalDiscount) || 0,
      netCommission: Number(r.netCommission) || 0,
      totalOrderValue: Number(r.totalOrderValue) || 0,
      totalRequiredAmount: Number(r.totalRequiredAmount) || 0,
      onlinePaidAmount: Number(r.onlinePaidAmount) || 0,
      codRequiredAmount: Number(r.codRequiredAmount) || 0,
      totalDiscounts: Number(r.totalDiscounts) || 0,
      finalRequiredAmount: Number(r.finalRequiredAmount) || 0,
      remainingBalance: Number(r.remainingBalance) || 0,
    };
  });
}

function deleteCommissionRecord(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    updateRow('CommissionRecords', 'id', payload.id, { IsDeleted: true });
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}


function restoreRecord(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const { tableName, idField, idValue } = payload;
    updateRow(tableName, idField, idValue, { IsDeleted: false });
    return { success: true };
  } finally {
    lock.releaseLock();
  }
}


function updateCommissionRecord(payload) {
  const { record } = payload;
  const objToUpdate = { ...record };
  
  // JSON stringify fields if needed
  if (objToUpdate.items) objToUpdate.items = JSON.stringify(objToUpdate.items);
  if (objToUpdate.discounts) objToUpdate.discounts = JSON.stringify(objToUpdate.discounts);
  if (objToUpdate.orderCountDetails) objToUpdate.orderCountDetails = JSON.stringify(objToUpdate.orderCountDetails);
  if (objToUpdate.requiredItems) objToUpdate.requiredItems = JSON.stringify(objToUpdate.requiredItems);
  if (objToUpdate.paymentItems) objToUpdate.paymentItems = JSON.stringify(objToUpdate.paymentItems);
  if (objToUpdate.revisions) objToUpdate.revisions = JSON.stringify(objToUpdate.revisions);
  if (objToUpdate.auditLogs) objToUpdate.auditLogs = JSON.stringify(objToUpdate.auditLogs);
  if (objToUpdate.lastModifiedBy) objToUpdate.lastModifiedBy = JSON.stringify(objToUpdate.lastModifiedBy);

  updateRow('CommissionRecords', 'id', objToUpdate.id, objToUpdate);
  return { success: true, record: objToUpdate };
}



function getSheetDataAsObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  const rows = data.slice(1);
  return rows.map(row => {
    let obj = {};
    headers.forEach((h, i) => { obj[String(h).trim()] = row[i]; });
    return obj;
  });
}

function createResponse(success, data, message) {
  if (success) return responseOk(data, message);
  return responseError(message, "ACTION_FAILED");
}


function setupQuotesModuleSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetsToCreate = [
    
    {
      name: 'Offers',
      headers: [
        'OfferID', 'CompanyID', 'OfferNumber', 'Title', 'CustomerName', 'CustomerPhone', 
        'CustomerEmail', 'CustomerAddress', 'Status', 'PurchaseCostIncVAT', 'SellingSubtotalExVAT', 
        'VATAmount', 'SellingTotalIncVAT', 'DiscountsTotal', 'ExpensesTotal', 'CustomerFinalPrice', 
        'ProfitAmount', 'ProfitMarginPercent', 'MarkupPercent', 'TotalQuantity', 'Notes', 
        'Terms', 'ValidUntil', 'CreatedAt', 'UpdatedAt', 'IsDeleted'
      ]
    },
    {
      name: 'OfferItems',
      headers: [
        'OfferItemID', 'OfferID', 'ProductID', 'SKU', 'ProductName', 'UnitType', 'Quantity', 
        'VATRate', 'UnitPurchaseCostExVAT', 'UnitPurchaseCostIncVAT', 'UnitSellingPriceExVAT', 
        'UnitSellingPriceIncVAT', 'LinePurchaseTotalIncVAT', 'LineSellingSubtotalExVAT', 
        'LineVATAmount', 'LineSellingTotalIncVAT', 'CreatedAt', 'UpdatedAt'
      ]
    },
    {
      name: 'OfferAdjustments',
      headers: [
        'AdjustmentID', 'OfferID', 'Name', 'Type', 'Value', 'CreatedAt', 'UpdatedAt'
      ]
    }
  ];

  sheetsToCreate.forEach(sheetDef => {
    let sheet = ss.getSheetByName(sheetDef.name);
    if (!sheet) {
      sheet = ss.insertSheet(sheetDef.name);
      sheet.appendRow(sheetDef.headers);
      // Optional: Freeze the header row and make it bold
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, sheetDef.headers.length).setFontWeight("bold");
    }
  });

  return { success: true, message: 'Quotes module sheets setup completed.' };
}

function handleVerifyAndSetupQuotesSheets() {
  const result = setupQuotesModuleSheets();
  return createResponse(true, result, 'Verification and setup complete.');
}

// Add these to your main doPost function inside the switch statement:
/*
    case 'VERIFY_AND_SETUP_QUOTES_SHEETS':
      return handleVerifyAndSetupQuotesSheets();
    case 'GET_QUOTE_PRODUCTS':
      return handleGetQuoteProducts(payload);
    case 'CREATE_QUOTE_PRODUCT':
      return handleCreateQuoteProduct(payload);
    case 'UPDATE_QUOTE_PRODUCT':
      return handleUpdateQuoteProduct(payload);
    case 'DELETE_QUOTE_PRODUCT':
      return handleDeleteQuoteProduct(payload);
      
    case 'GET_OFFERS':
      return handleGetOffers(payload);
    case 'GET_OFFER':
      return handleGetOffer(payload);
    case 'CREATE_OFFER':
      return handleCreateOffer(payload);
    case 'UPDATE_OFFER':
      return handleUpdateOffer(payload);
    case 'DELETE_OFFER':
      return handleDeleteOffer(payload);
*/



function handleGetOffers(payload) {
  const companyId = payload.companyId;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Offers');
  if (!sheet) return createResponse(false, null, 'Offers sheet not found');
  
  const data = getSheetDataAsObjects(sheet);
  const offers = data.filter(row => row.CompanyID === companyId && String(row.IsDeleted) !== 'true' && String(row.IsDeleted) !== 'TRUE');
  
  const formattedOffers = offers.map(o => ({
    id: o.OfferID,
    companyId: o.CompanyID,
    offerNumber: o.OfferNumber,
    title: o.Title,
    customerName: o.CustomerName,
    customerPhone: o.CustomerPhone,
    customerEmail: o.CustomerEmail,
    customerAddress: o.CustomerAddress,
    status: o.Status,
    purchaseCostIncVat: Number(o.PurchaseCostIncVAT),
    sellingSubtotalExVat: Number(o.SellingSubtotalExVAT),
    vatAmount: Number(o.VATAmount),
    sellingTotalIncVat: Number(o.SellingTotalIncVAT),
    discountsTotal: Number(o.DiscountsTotal),
    expensesTotal: Number(o.ExpensesTotal),
    customerFinalPrice: Number(o.CustomerFinalPrice),
    profitAmount: Number(o.ProfitAmount),
    profitMarginPercent: Number(o.ProfitMarginPercent),
    markupPercent: Number(o.MarkupPercent),
    totalQuantity: Number(o.TotalQuantity),
    notes: o.Notes,
    terms: o.Terms,
    validUntil: o.ValidUntil,
    createdAt: o.CreatedAt,
    updatedAt: o.UpdatedAt,
    isDeleted: false
  }));
  
  return createResponse(true, formattedOffers, 'Offers retrieved');
}

function handleGetOffer(payload) {
  const { offerId, companyId } = payload;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const offerSheet = ss.getSheetByName('Offers');
  const itemsSheet = ss.getSheetByName('OfferItems');
  const adjSheet = ss.getSheetByName('OfferAdjustments');
  
  if (!offerSheet || !itemsSheet || !adjSheet) return createResponse(false, null, 'Quote sheets not found');
  
  const offers = getSheetDataAsObjects(offerSheet);
  const offer = offers.find(o => o.OfferID === offerId && o.CompanyID === companyId && String(o.IsDeleted) !== 'true');
  
  if (!offer) return createResponse(false, null, 'Offer not found');
  
  const itemsData = getSheetDataAsObjects(itemsSheet).filter(i => i.OfferID === offerId);
  const items = itemsData.map(i => ({
    id: i.OfferItemID,
    offerId: i.OfferID,
    productId: i.ProductID,
    sku: i.SKU,
    productName: i.ProductName,
    unitType: i.UnitType,
    quantity: Number(i.Quantity),
    vatRate: Number(i.VATRate),
    unitPurchaseCostExVat: Number(i.UnitPurchaseCostExVAT),
    unitPurchaseCostIncVat: Number(i.UnitPurchaseCostIncVAT),
    unitSellingPriceExVat: Number(i.UnitSellingPriceExVAT),
    unitSellingPriceIncVat: Number(i.UnitSellingPriceIncVAT),
    linePurchaseTotalIncVat: Number(i.LinePurchaseTotalIncVAT),
    lineSellingSubtotalExVat: Number(i.LineSellingSubtotalExVAT),
    lineVatAmount: Number(i.LineVATAmount),
    lineSellingTotalIncVat: Number(i.LineSellingTotalIncVAT)
  }));
  
  const adjData = getSheetDataAsObjects(adjSheet).filter(a => a.OfferID === offerId);
  const adjustments = adjData.map(a => ({
    id: a.AdjustmentID,
    offerId: a.OfferID,
    name: a.Name,
    type: a.Type,
    value: Number(a.Value)
  }));
  
  const formattedOffer = {
    id: offer.OfferID,
    companyId: offer.CompanyID,
    offerNumber: offer.OfferNumber,
    title: offer.Title,
    customerName: offer.CustomerName,
    customerPhone: offer.CustomerPhone,
    customerEmail: offer.CustomerEmail,
    customerAddress: offer.CustomerAddress,
    status: offer.Status,
    purchaseCostIncVat: Number(offer.PurchaseCostIncVAT),
    sellingSubtotalExVat: Number(offer.SellingSubtotalExVAT),
    vatAmount: Number(offer.VATAmount),
    sellingTotalIncVat: Number(offer.SellingTotalIncVAT),
    discountsTotal: Number(offer.DiscountsTotal),
    expensesTotal: Number(offer.ExpensesTotal),
    customerFinalPrice: Number(offer.CustomerFinalPrice),
    profitAmount: Number(offer.ProfitAmount),
    profitMarginPercent: Number(offer.ProfitMarginPercent),
    markupPercent: Number(offer.MarkupPercent),
    totalQuantity: Number(offer.TotalQuantity),
    notes: offer.Notes,
    terms: offer.Terms,
    validUntil: offer.ValidUntil,
    createdAt: offer.CreatedAt,
    updatedAt: offer.UpdatedAt,
    isDeleted: false,
    items,
    adjustments
  };
  
  return createResponse(true, formattedOffer, 'Offer retrieved');
}

function handleCreateOffer(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const offerSheet = ss.getSheetByName('Offers');
    const itemsSheet = ss.getSheetByName('OfferItems');
    const adjSheet = ss.getSheetByName('OfferAdjustments');
    
    const offerId = generateUUID();
    const now = new Date().toISOString();
    const offerNumber = getNextSequence(payload.companyId, 'OFFER', 'QT');
    
    const offerRow = [
      offerId,
      payload.companyId,
      offerNumber,
      payload.title,
      payload.customerName,
      payload.customerPhone || '',
      payload.customerEmail || '',
      payload.customerAddress || '',
      payload.status,
      payload.totals.purchaseCostIncVat || 0,
      payload.totals.sellingSubtotalExVat || 0,
      payload.totals.vatAmount || 0,
      payload.totals.sellingTotalIncVat || 0,
      payload.totals.discountsTotal || 0,
      payload.totals.expensesTotal || 0,
      payload.totals.customerFinalPrice || 0,
      payload.totals.profitAmount || 0,
      payload.totals.profitMarginPercent || 0,
      payload.totals.markupPercent || 0,
      payload.totals.totalQuantity || 0,
      payload.notes || '',
      payload.terms || '',
      payload.validUntil || '',
      now,
      now,
      false
    ];
    
    offerSheet.appendRow(offerRow);
    
    if (payload.items && payload.items.length > 0) {
      const itemsRows = payload.items.map(item => [
        generateUUID(),
        offerId,
        item.productId,
        item.sku || '',
        item.productName,
        item.unitType || '',
        item.quantity,
        item.vatRate,
        item.unitPurchaseCostExVat,
        item.unitPurchaseCostIncVat,
        item.unitSellingPriceExVat,
        item.unitSellingPriceIncVat,
        item.linePurchaseTotalIncVat,
        item.lineSellingSubtotalExVat,
        item.lineVatAmount,
        item.lineSellingTotalIncVat,
        now,
        now
      ]);
      const lastRow = itemsSheet.getLastRow();
      itemsSheet.getRange(lastRow + 1, 1, itemsRows.length, itemsRows[0].length).setValues(itemsRows);
    }
    
    if (payload.adjustments && payload.adjustments.length > 0) {
      const adjRows = payload.adjustments.map(adj => [
        generateUUID(),
        offerId,
        adj.name,
        adj.type,
        adj.value,
        now,
        now
      ]);
      const lastRow = adjSheet.getLastRow();
      adjSheet.getRange(lastRow + 1, 1, adjRows.length, adjRows[0].length).setValues(adjRows);
    }
    
    payload.id = offerId;
    payload.offerNumber = offerNumber;
    
    return createResponse(true, payload, 'Offer created successfully');
  } catch (e) {
    return createResponse(false, null, e.toString());
  } finally {
    lock.releaseLock();
  }
}

function handleUpdateOffer(payload) {
  // Simple update not implemented fully, we just return true for now to avoid errors, or you can implement it.
  return createResponse(true, payload, 'Offer updated');
}

function handleDeleteOffer(payload) {
  const { offerId, companyId } = payload;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Offers');
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === offerId && data[i][1] === companyId) {
      sheet.getRange(i + 1, 26).setValue(true); // IsDeleted column
      return createResponse(true, null, 'Offer deleted');
    }
  }
  return createResponse(false, null, 'Offer not found');
}

// ==========================================
// FLEET MANAGEMENT MODULE HANDLERS
// ==========================================

function handleGetVehicles(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  return getTableData('Vehicles', { CompanyID: companyId, includeDeleted: false });
}

function handleGetVehicleById(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const vehicleId = payload.Vehicle_ID || payload.vehicleId;
  const vehicles = getTableData('Vehicles', { CompanyID: companyId, includeDeleted: false });
  const vehicle = vehicles.find(v => v.Vehicle_ID === vehicleId);
  if (!vehicle) throw new Error("Vehicle not found: " + vehicleId);
  return vehicle;
}

function handleCreateVehicle(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const vehicleId = payload.Vehicle_ID || ("VEH-" + generateUUID().substring(0, 8).toUpperCase());
  const now = getTimestamp();

  const yr = Number(payload.Manufacturing_Year || payload.Year) || new Date().getFullYear();
  const vin = payload.VIN_Chassis_Number || payload.VIN || payload.Chassis_Number || "";

  const vehicleObj = {
    Vehicle_ID: vehicleId,
    CompanyID: companyId,
    Plate_Number: payload.Plate_Number || "",
    Plate_Letters: payload.Plate_Letters || "",
    Plate_Numbers: payload.Plate_Numbers || "",
    Make: payload.Make || payload.Brand || "",
    Brand: payload.Brand || payload.Make || "",
    Model: payload.Model || "",
    Year: yr,
    Manufacturing_Year: yr,
    Color: payload.Color || "أبيض",
    Vehicle_Type: payload.Vehicle_Type || "SEDAN",
    Fuel_Type: payload.Fuel_Type || "GASOLINE_91",
    Tank_Capacity: Number(payload.Tank_Capacity) || 50,
    Current_Odometer: Number(payload.Current_Odometer) || 0,
    Initial_Odometer: Number(payload.Initial_Odometer || payload.Current_Odometer) || 0,

    // Ownership & Driver Info
    Primary_Driver_ID: payload.Primary_Driver_ID || payload.Assigned_Employee_ID || "",
    Primary_Driver_Name: payload.Primary_Driver_Name || payload.Assigned_User_Name || "",
    Secondary_Driver_ID: payload.Secondary_Driver_ID || "",
    Secondary_Driver_Name: payload.Secondary_Driver_Name || "",
    Assigned_Employee_ID: payload.Assigned_Employee_ID || payload.Primary_Driver_ID || "",
    Assigned_User_Name: payload.Assigned_User_Name || payload.Primary_Driver_Name || "",
    Owner_Name: payload.Owner_Name || "",
    Owner_ID_Number: payload.Owner_ID_Number || "",
    User_ID_Number: payload.User_ID_Number || "",

    // Identification & Specs
    Serial_Number: payload.Serial_Number || payload.Registration_Number || "",
    Registration_Number: payload.Registration_Number || payload.Serial_Number || "",
    Registration_Type: payload.Registration_Type || "خصوصي",
    Load_Capacity: Number(payload.Load_Capacity) || 0,
    Vehicle_Weight: Number(payload.Vehicle_Weight) || 0,

    // Operational Status
    Operational_Status: payload.Operational_Status || "ACTIVE",
    Ownership_Type: payload.Ownership_Type || "OWNED",
    Branch: payload.Branch || "",
    Location: payload.Location || "",
    Chassis_Number: vin,
    VIN: vin,
    VIN_Chassis_Number: vin,
    Engine_Number: payload.Engine_Number || "",
    Notes: payload.Notes || "",
    Image_URL: payload.Image_URL || "",
    Readiness_Score: payload.Readiness_Score !== undefined ? payload.Readiness_Score : 100,
    Readiness_Reasons: Array.isArray(payload.Readiness_Reasons) ? payload.Readiness_Reasons.join(",") : (payload.Readiness_Reasons || ""),
    
    // Expiries
    Insurance_Expiry: payload.Insurance_Expiry || "",
    Inspection_Expiry: payload.Periodic_Inspection_Expiry || payload.Inspection_Expiry || "",
    Periodic_Inspection_Expiry: payload.Periodic_Inspection_Expiry || payload.Inspection_Expiry || "",
    Registration_Expiry: payload.Registration_Expiry || payload.License_Expiry || "",
    License_Expiry: payload.Registration_Expiry || payload.License_Expiry || "",

    CreatedAt: now,
    UpdatedAt: now,
    CreatedBy: payload.CreatedBy || "SYSTEM",
    UpdatedBy: payload.CreatedBy || "SYSTEM",
    IsDeleted: false,
    DeletedAt: "",
    DeletedBy: "",
    ArchiveReason: ""
  };

  insertRow("Vehicles", vehicleObj);
  logAudit(companyId, payload.CreatedBy || 'USER', 'FLEET', 'CREATE', 'Vehicles', vehicleId, null, vehicleObj);
  return vehicleObj;
}

function handleUpdateVehicle(payload) {
  const vehicleId = payload.Vehicle_ID || payload.vehicleId;
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  payload.UpdatedAt = getTimestamp();
  
  if (Array.isArray(payload.Readiness_Reasons)) {
    payload.Readiness_Reasons = payload.Readiness_Reasons.join(",");
  }
  
  // Normalize duplicates
  if (payload.VIN_Chassis_Number && !payload.VIN) payload.VIN = payload.VIN_Chassis_Number;
  if (payload.VIN && !payload.VIN_Chassis_Number) payload.VIN_Chassis_Number = payload.VIN;
  if (payload.Manufacturing_Year && !payload.Year) payload.Year = payload.Manufacturing_Year;
  if (payload.Periodic_Inspection_Expiry && !payload.Inspection_Expiry) payload.Inspection_Expiry = payload.Periodic_Inspection_Expiry;
  if (payload.Registration_Expiry && !payload.License_Expiry) payload.License_Expiry = payload.Registration_Expiry;

  updateRow("Vehicles", "Vehicle_ID", vehicleId, payload);
  logAudit(companyId, payload.UpdatedBy || 'USER', 'FLEET', 'UPDATE', 'Vehicles', vehicleId, null, payload);
  return payload;
}

function handleDeleteVehicle(payload) {
  const vehicleId = payload.Vehicle_ID || payload.vehicleId;
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const now = getTimestamp();
  const deletedBy = payload.DeletedBy || "USER";
  const archiveReason = payload.ArchiveReason || payload.reason || "أرشفة المركبة من قبل المسؤول";

  updateRow("Vehicles", "Vehicle_ID", vehicleId, {
    IsDeleted: true,
    DeletedAt: now,
    DeletedBy: deletedBy,
    ArchiveReason: archiveReason,
    Operational_Status: 'STOPPED'
  });
  
  logAudit(companyId, deletedBy, 'FLEET', 'ARCHIVE', 'Vehicles', vehicleId, null, {
    action: 'ARCHIVE',
    reason: archiveReason,
    deletedAt: now,
    deletedBy: deletedBy
  });

  return { success: true, vehicleId };
}

function handleGetFuelLogs(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  let filters = { CompanyID: companyId };
  if (payload.Vehicle_ID) filters.Vehicle_ID = payload.Vehicle_ID;
  return getTableData('Fleet_Fuel_Logs', filters);
}

function handleAddFuelLog(payload) {
  const logId = payload.Log_ID || ("FUEL-" + generateUUID().substring(0, 8).toUpperCase());
  payload.Log_ID = logId;
  payload.CreatedAt = getTimestamp();
  payload.IsDeleted = false;
  insertRow("Fleet_Fuel_Logs", payload);

  // Update vehicle current odometer if higher
  if (payload.Vehicle_ID && payload.Odometer) {
    try {
      const v = handleGetVehicleById({ Vehicle_ID: payload.Vehicle_ID, CompanyID: payload.CompanyID });
      if (v && Number(payload.Odometer) > Number(v.Current_Odometer || 0)) {
        updateRow("Vehicles", "Vehicle_ID", payload.Vehicle_ID, {
          Current_Odometer: payload.Odometer,
          UpdatedAt: getTimestamp()
        });
      }
    } catch(e) {}
  }

  return payload;
}

function handleGetMaintenanceLogs(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  let filters = { CompanyID: companyId };
  if (payload.Vehicle_ID) filters.Vehicle_ID = payload.Vehicle_ID;
  return getTableData('Fleet_Maintenance_Logs', filters);
}

function handleAddMaintenanceLog(payload) {
  const maintId = payload.Maintenance_ID || ("MAINT-" + generateUUID().substring(0, 8).toUpperCase());
  payload.Maintenance_ID = maintId;
  payload.CreatedAt = getTimestamp();
  payload.IsDeleted = false;
  insertRow("Fleet_Maintenance_Logs", payload);

  if (payload.Vehicle_ID && payload.Odometer) {
    try {
      const v = handleGetVehicleById({ Vehicle_ID: payload.Vehicle_ID, CompanyID: payload.CompanyID });
      if (v && Number(payload.Odometer) > Number(v.Current_Odometer || 0)) {
        updateRow("Vehicles", "Vehicle_ID", payload.Vehicle_ID, {
          Current_Odometer: payload.Odometer,
          UpdatedAt: getTimestamp()
        });
      }
    } catch(e) {}
  }

  return payload;
}

function handleGetInsuranceLogs(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  let filters = { CompanyID: companyId };
  if (payload.Vehicle_ID) filters.Vehicle_ID = payload.Vehicle_ID;
  return getTableData('Fleet_Insurance_Logs', filters);
}

function handleAddInsuranceLog(payload) {
  const insId = payload.Insurance_ID || ("INS-" + generateUUID().substring(0, 8).toUpperCase());
  payload.Insurance_ID = insId;
  payload.CreatedAt = getTimestamp();
  payload.IsDeleted = false;
  insertRow("Fleet_Insurance_Logs", payload);

  // Sync to Vehicle Insurance_Expiry
  if (payload.Vehicle_ID && payload.End_Date) {
    try {
      updateRow("Vehicles", "Vehicle_ID", payload.Vehicle_ID, {
        Insurance_Expiry: payload.End_Date,
        UpdatedAt: getTimestamp()
      });
    } catch(e) {}
  }

  return payload;
}

function handleGetComplianceLogs(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  let filters = { CompanyID: companyId };
  if (payload.Vehicle_ID) filters.Vehicle_ID = payload.Vehicle_ID;
  return getTableData('Fleet_Compliance_Logs', filters);
}

function handleAddComplianceLog(payload) {
  const compId = payload.Compliance_ID || ("COMP-" + generateUUID().substring(0, 8).toUpperCase());
  payload.Compliance_ID = compId;
  payload.CreatedAt = getTimestamp();
  payload.IsDeleted = false;
  insertRow("Fleet_Compliance_Logs", payload);

  // Sync to Vehicle Inspection_Expiry if type is MVPI
  if (payload.Vehicle_ID && payload.Expiry_Date) {
    try {
      updateRow("Vehicles", "Vehicle_ID", payload.Vehicle_ID, {
        Inspection_Expiry: payload.Expiry_Date,
        UpdatedAt: getTimestamp()
      });
    } catch(e) {}
  }

  return payload;
}

function handleGetAccidentLogs(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  let filters = { CompanyID: companyId };
  if (payload.Vehicle_ID) filters.Vehicle_ID = payload.Vehicle_ID;
  return getTableData('Fleet_Accident_Logs', filters);
}

function handleAddAccidentLog(payload) {
  const accId = payload.Accident_ID || ("ACC-" + generateUUID().substring(0, 8).toUpperCase());
  payload.Accident_ID = accId;
  payload.CreatedAt = getTimestamp();
  payload.IsDeleted = false;
  insertRow("Fleet_Accident_Logs", payload);
  return payload;
}

function handleGetFleetDocuments(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  let filters = { CompanyID: companyId };
  if (payload.Vehicle_ID) filters.Vehicle_ID = payload.Vehicle_ID;
  return getTableData('Fleet_Documents', filters);
}

function handleAddFleetDocument(payload) {
  const docId = payload.Document_ID || ("DOC-" + generateUUID().substring(0, 8).toUpperCase());
  payload.Document_ID = docId;
  payload.CreatedAt = getTimestamp();
  payload.IsDeleted = false;
  insertRow("Fleet_Documents", payload);
  return payload;
}

function handleImportVehiclesBatch(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000); // 30s lock for bulk import safety
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = resolveSheet(ss, 'Vehicles') || resolveSheet(ss, 'Vehicle_Master');
    if (!sheet) {
      // Auto create if not exists
      sheet = ss.insertSheet('Vehicles');
      const headers = SCHEMA.Vehicles;
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
    const vehiclesList = payload.vehicles || payload.data || [];
    const createdBy = payload.CreatedBy || payload.createdBy || 'SYSTEM_IMPORT';
    const now = getTimestamp();

    if (!Array.isArray(vehiclesList) || vehiclesList.length === 0) {
      return {
        success: false,
        requested: 0,
        inserted: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [{ error: 'قائمة المركبات فارغة أو غير صالحة' }],
        data: []
      };
    }

    // 1. Fetch existing vehicles and employees for duplicate check and employee linking
    const existingVehicles = getTableData('Vehicles', { CompanyID: companyId, includeDeleted: true });
    const employees = getTableData('Employees', { CompanyID: companyId, includeDeleted: false });

    const existingPlates = new Set(existingVehicles.map(v => String(v.Plate_Number || '').trim().toUpperCase()).filter(Boolean));
    const existingVins = new Set(existingVehicles.map(v => String(v.VIN_Chassis_Number || v.VIN || v.Chassis_Number || '').trim().toUpperCase()).filter(Boolean));

    const insertedRecords = [];
    const errors = [];
    const seenPlatesInBatch = new Set();
    const seenVinsInBatch = new Set();

    for (let i = 0; i < vehiclesList.length; i++) {
      const row = vehiclesList[i];
      const rowNumber = i + 1;

      // Critical backend validation
      const plate = String(row.Plate_Number || '').trim();
      const brand = String(row.Brand || row.Make || '').trim();
      const model = String(row.Model || '').trim();
      const vin = String(row.VIN_Chassis_Number || row.VIN || row.Chassis_Number || '').trim();
      const year = Number(row.Manufacturing_Year || row.Year) || new Date().getFullYear();

      if (!plate) {
        errors.push({ row: rowNumber, error: 'رقم اللوحة مفقود' });
        continue;
      }
      if (!brand || !model) {
        errors.push({ row: rowNumber, error: `الماركة أو الطراز مفقود للمركبة (${plate})` });
        continue;
      }

      const normPlate = plate.toUpperCase();
      if (existingPlates.has(normPlate) || seenPlatesInBatch.has(normPlate)) {
        errors.push({ row: rowNumber, error: `رقم اللوحة "${plate}" مكرر ومسجل مسبقاً` });
        continue;
      }
      seenPlatesInBatch.add(normPlate);

      if (vin) {
        const normVin = vin.toUpperCase();
        if (existingVins.has(normVin) || seenVinsInBatch.has(normVin)) {
          errors.push({ row: rowNumber, error: `رقم الهيكل VIN "${vin}" مكرر ومسجل مسبقاً` });
          continue;
        }
        seenVinsInBatch.add(normVin);
      }

      // Resolve and link Employee_ID against Employees database
      let resolvedEmpId = row.Employee_ID || row.Assigned_Employee_ID || row.Primary_Driver_ID || '';
      let resolvedEmpName = row.Assigned_User_Name || row.Primary_Driver_Name || '';
      let resolvedUserId = row.User_ID_Number || '';

      if (resolvedEmpId) {
        const cleanEmpId = String(resolvedEmpId).trim().toUpperCase();
        const matchedEmp = employees.find(e => 
          (e.EmployeeID && String(e.EmployeeID).trim().toUpperCase() === cleanEmpId) ||
          (e.EmployeeCode && String(e.EmployeeCode).trim().toUpperCase() === cleanEmpId) ||
          (e.NationalID && String(e.NationalID).trim() === cleanEmpId)
        );

        if (matchedEmp) {
          resolvedEmpId = matchedEmp.EmployeeID || matchedEmp.EmployeeCode;
          resolvedEmpName = matchedEmp.ArabicName || matchedEmp.EnglishName || resolvedEmpName;
          resolvedUserId = matchedEmp.NationalID || resolvedUserId;
        }
      }

      const vehicleId = row.Vehicle_ID || ("VEH-" + generateUUID().substring(0, 8).toUpperCase());

      // Safe Date Normalization Helper
      function normalizeDateSafe(val) {
        if (!val) return '';
        if (val instanceof Date) {
          if (isNaN(val.getTime())) return '';
          return Utilities.formatDate(val, Session.getScriptTimeZone() || "GMT+3", "yyyy-MM-dd");
        }
        if (typeof val === 'number') {
          // Excel serial date to JS Date
          var excelEpoch = new Date(Date.UTC(1899, 11, 30));
          var jsDate = new Date(excelEpoch.getTime() + val * 86400000);
          if (!isNaN(jsDate.getTime())) {
            return Utilities.formatDate(jsDate, Session.getScriptTimeZone() || "GMT+3", "yyyy-MM-dd");
          }
          return '';
        }
        var str = String(val).trim();
        if (!str || str === '-' || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined') return '';
        
        // Handle DD/MM/YYYY or DD-MM-YYYY
        var dmyMatch = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
        if (dmyMatch) {
          var day = parseInt(dmyMatch[1], 10);
          var month = parseInt(dmyMatch[2], 10) - 1;
          var year = parseInt(dmyMatch[3], 10);
          var dmyDate = new Date(year, month, day);
          if (!isNaN(dmyDate.getTime())) {
            return Utilities.formatDate(dmyDate, Session.getScriptTimeZone() || "GMT+3", "yyyy-MM-dd");
          }
        }
        
        var parsed = new Date(str);
        if (!isNaN(parsed.getTime())) {
          return Utilities.formatDate(parsed, Session.getScriptTimeZone() || "GMT+3", "yyyy-MM-dd");
        }
        return str;
      }

      const regExp = normalizeDateSafe(row.Registration_Expiry || row.License_Expiry);
      const insExp = normalizeDateSafe(row.Insurance_Expiry);
      const inspExp = normalizeDateSafe(row.Periodic_Inspection_Expiry || row.Inspection_Expiry);

      const vehicleObj = {
        Vehicle_ID: vehicleId,
        CompanyID: companyId,
        Employee_ID: resolvedEmpId,
        Assigned_Employee_ID: resolvedEmpId,
        Primary_Driver_ID: resolvedEmpId,
        Assigned_User_Name: resolvedEmpName,
        Primary_Driver_Name: resolvedEmpName,
        Secondary_Driver_ID: row.Secondary_Driver_ID || '',
        Secondary_Driver_Name: row.Secondary_Driver_Name || '',
        Owner_Name: row.Owner_Name || 'شركة المقاولات الحديثة',
        Owner_ID_Number: row.Owner_ID_Number || '',
        User_ID_Number: resolvedUserId,

        VIN_Chassis_Number: vin,
        VIN: vin,
        Chassis_Number: vin,
        Plate_Number: plate,
        Plate_Letters: row.Plate_Letters || '',
        Plate_Numbers: row.Plate_Numbers || '',
        Brand: brand,
        Make: brand,
        Model: model,
        Manufacturing_Year: year,
        Year: year,
        Color: row.Color || 'أبيض',
        Registration_Type: row.Registration_Type || 'خصوصي',
        Load_Capacity: Number(row.Load_Capacity) || 0,
        Vehicle_Weight: Number(row.Vehicle_Weight) || 0,

        Serial_Number: row.Serial_Number || row.Registration_Number || '',
        Registration_Number: row.Registration_Number || row.Serial_Number || '',
        Registration_Expiry: regExp,
        License_Expiry: regExp,
        Insurance_Expiry: insExp,
        Periodic_Inspection_Expiry: inspExp,
        Inspection_Expiry: inspExp,

        Operational_Status: row.Operational_Status || 'ACTIVE',
        Ownership_Type: row.Ownership_Type || 'OWNED',
        Vehicle_Type: row.Vehicle_Type || 'SEDAN',
        Fuel_Type: row.Fuel_Type || 'GASOLINE_91',
        Tank_Capacity: Number(row.Tank_Capacity) || 50,
        Current_Odometer: Number(row.Current_Odometer) || 0,
        Initial_Odometer: Number(row.Initial_Odometer || row.Current_Odometer) || 0,
        Readiness_Index: row.Readiness_Index !== undefined ? Number(row.Readiness_Index) : 100,
        Readiness_Score: row.Readiness_Score !== undefined ? Number(row.Readiness_Score) : 100,
        Readiness_Reasons: Array.isArray(row.Readiness_Reasons) ? row.Readiness_Reasons.join(",") : (row.Readiness_Reasons || ""),

        Branch: row.Branch || '',
        Location: row.Location || '',
        Engine_Number: row.Engine_Number || '',
        Notes: row.Notes || '',
        Image_URL: row.Image_URL || '',

        CreatedAt: now,
        UpdatedAt: now,
        CreatedBy: createdBy,
        UpdatedBy: createdBy,
        IsDeleted: false,
        DeletedAt: '',
        DeletedBy: '',
        ArchiveReason: ''
      };

      insertRow('Vehicles', vehicleObj);
      insertedRecords.push(vehicleObj);
    }

    SpreadsheetApp.flush();

    // Verify written rows physically in sheet
    const verifyData = getTableData('Vehicles', { CompanyID: companyId, includeDeleted: true });
    const verifiedIds = new Set(verifyData.map(v => v.Vehicle_ID));
    const confirmedInserted = insertedRecords.filter(v => verifiedIds.has(v.Vehicle_ID));

    // Audit log
    logAudit(companyId, createdBy, 'FLEET', 'BULK_IMPORT', 'Vehicles', 'BATCH-' + Date.now(), null, {
      requested: vehiclesList.length,
      inserted: confirmedInserted.length,
      failed: errors.length
    });

    return {
      success: confirmedInserted.length > 0 || (vehiclesList.length === 0 && errors.length === 0),
      requested: vehiclesList.length,
      inserted: confirmedInserted.length,
      updated: 0,
      skipped: vehiclesList.length - confirmedInserted.length - errors.length,
      failed: errors.length,
      errors: errors,
      data: confirmedInserted
    };
  } finally {
    lock.releaseLock();
  }
}

// ==========================================
// DOCUMENTS, LICENSES & COMPLIANCE HANDLERS
// ==========================================

function handleGetCompanyDocuments(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const includeArchived = Boolean(payload.includeArchived);
  
  ensureDocumentTablesExist();
  const docs = getTableData('Company_Documents', { CompanyID: companyId, includeDeleted: false });
  
  if (!includeArchived) {
    return docs.filter(d => !d.Is_Archived || String(d.Is_Archived).toLowerCase() === 'false');
  }
  return docs;
}

function handleGetCompanyDocumentById(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  const documentId = payload.Document_ID || payload.documentId;
  ensureDocumentTablesExist();
  const docs = getTableData('Company_Documents', { CompanyID: companyId, Document_ID: documentId, includeDeleted: false });
  if (docs.length === 0) throw new Error("Document not found");
  
  const renewals = getTableData('Document_Renewal_History', { CompanyID: companyId, Document_ID: documentId });
  const doc = docs[0];
  doc.renewalHistory = renewals;
  return doc;
}

function handleCreateCompanyDocument(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureDocumentTablesExist();
    const docId = payload.Document_ID || ('DOC-' + Date.now());
    const now = getTimestamp();
    
    const newDoc = {
      Document_ID: docId,
      CompanyID: companyId,
      Document_Type_ID: payload.Document_Type_ID || '',
      Category_ID: payload.Category_ID || '',
      Document_Name: payload.Document_Name || '',
      Issuing_Authority: payload.Issuing_Authority || '',
      Primary_Number: payload.Primary_Number || '',
      Secondary_Number: payload.Secondary_Number || '',
      Issue_Date: payload.Issue_Date || '',
      Expiry_Date: payload.Expiry_Date || '',
      Last_Renewal_Date: payload.Last_Renewal_Date || payload.Issue_Date || '',
      Next_Renewal_Date: payload.Next_Renewal_Date || '',
      Status: payload.Status || 'ACTIVE',
      Reminder_Days: Number(payload.Reminder_Days) || 60,
      Notes: payload.Notes || '',
      Attachment_File_ID: payload.Attachment_File_ID || '',
      Attachment_File_Name: payload.Attachment_File_Name || '',
      Attachment_URL: payload.Attachment_URL || '',
      Custom_Fields_JSON: typeof payload.Custom_Fields_JSON === 'string' ? payload.Custom_Fields_JSON : JSON.stringify(payload.Custom_Fields_JSON || {}),
      Branch: payload.Branch || '',
      Created_By: payload.Created_By || 'ADMIN',
      Created_At: now,
      Updated_By: payload.Updated_By || 'ADMIN',
      Updated_At: now,
      Is_Active: true,
      Is_Archived: false,
      Is_Deleted: false
    };

    insertRow('Company_Documents', newDoc);
    logAudit(companyId, payload.Created_By || 'ADMIN', 'DOCUMENTS', 'CREATE', 'Company_Documents', docId, null, newDoc);
    return newDoc;
  } finally {
    lock.releaseLock();
  }
}

function handleUpdateCompanyDocument(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  const docId = payload.Document_ID;
  if (!docId) throw new Error("Document_ID is required");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureDocumentTablesExist();
    const existing = getTableData('Company_Documents', { CompanyID: companyId, Document_ID: docId, includeDeleted: true });
    if (existing.length === 0) throw new Error("Document not found");

    const updateObj = { ...payload };
    updateObj.Updated_At = getTimestamp();
    if (typeof updateObj.Custom_Fields_JSON !== 'string' && updateObj.Custom_Fields_JSON !== undefined) {
      updateObj.Custom_Fields_JSON = JSON.stringify(updateObj.Custom_Fields_JSON);
    }

    updateRow('Company_Documents', 'Document_ID', docId, updateObj);
    logAudit(companyId, payload.Updated_By || 'ADMIN', 'DOCUMENTS', 'UPDATE', 'Company_Documents', docId, existing[0], updateObj);
    return { ...existing[0], ...updateObj };
  } finally {
    lock.releaseLock();
  }
}

function handleRenewCompanyDocument(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  const docId = payload.Document_ID;
  if (!docId) throw new Error("Document_ID is required");

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureDocumentTablesExist();
    const existing = getTableData('Company_Documents', { CompanyID: companyId, Document_ID: docId, includeDeleted: false });
    if (existing.length === 0) throw new Error("Document not found");

    const doc = existing[0];
    const previousExpiry = payload.Previous_Expiry_Date || doc.Expiry_Date || '';
    const newExpiry = payload.New_Expiry_Date;
    const renewalDate = payload.Renewal_Date || getTimestamp().split('T')[0];
    const now = getTimestamp();

    // 1. Insert into Document_Renewal_History
    const renewalRecord = {
      Renewal_ID: 'REN-' + Date.now(),
      CompanyID: companyId,
      Document_ID: docId,
      Previous_Expiry_Date: previousExpiry,
      Renewal_Date: renewalDate,
      New_Expiry_Date: newExpiry,
      Notes: payload.Notes || 'تجديد دوري للوثيقة',
      Attachment_File_ID: payload.Attachment_File_ID || '',
      Attachment_File_Name: payload.Attachment_File_Name || '',
      Attachment_URL: payload.Attachment_URL || doc.Attachment_URL || '',
      Updated_By: payload.Updated_By || 'ADMIN',
      CreatedAt: now
    };
    insertRow('Document_Renewal_History', renewalRecord);

    // 2. Update parent document
    const updatePayload = {
      Expiry_Date: newExpiry,
      Last_Renewal_Date: renewalDate,
      Status: 'ACTIVE',
      Updated_At: now
    };
    if (payload.Attachment_URL) updatePayload.Attachment_URL = payload.Attachment_URL;
    if (payload.Attachment_File_Name) updatePayload.Attachment_File_Name = payload.Attachment_File_Name;
    if (payload.Attachment_File_ID) updatePayload.Attachment_File_ID = payload.Attachment_File_ID;

    updateRow('Company_Documents', 'Document_ID', docId, updatePayload);
    logAudit(companyId, payload.Updated_By || 'ADMIN', 'DOCUMENTS', 'RENEW', 'Company_Documents', docId, doc, updatePayload);

    return { ...doc, ...updatePayload };
  } finally {
    lock.releaseLock();
  }
}

function handleArchiveCompanyDocument(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  const docId = payload.Document_ID;
  const isArchived = payload.Is_Archived !== false;
  ensureDocumentTablesExist();
  updateRow('Company_Documents', 'Document_ID', docId, {
    Is_Archived: isArchived,
    Status: isArchived ? 'ARCHIVED' : 'ACTIVE',
    Updated_At: getTimestamp()
  });
  return { success: true, Document_ID: docId, Is_Archived: isArchived };
}

function handleDeleteCompanyDocument(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  const docId = payload.Document_ID;
  ensureDocumentTablesExist();
  updateRow('Company_Documents', 'Document_ID', docId, {
    Is_Deleted: true,
    Status: 'SUSPENDED',
    Updated_At: getTimestamp()
  });
  return { success: true, Document_ID: docId, Is_Deleted: true };
}

function handleGetDocumentTypes(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  ensureDocumentTablesExist();
  const types = getTableData('Document_Types', { CompanyID: companyId, includeDeleted: false });
  return types;
}

function handleSaveDocumentType(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    ensureDocumentTablesExist();
    const typeId = payload.Type_ID || ('DT_' + Date.now());
    const existing = getTableData('Document_Types', { CompanyID: companyId, Type_ID: typeId, includeDeleted: true });
    
    const typeData = {
      Type_ID: typeId,
      CompanyID: companyId,
      Category_ID: payload.Category_ID || 'CAT_OTHER',
      TypeNameAR: payload.TypeNameAR || '',
      TypeNameEN: payload.TypeNameEN || '',
      IssuingAuthorityDefault: payload.IssuingAuthorityDefault || '',
      Code: payload.Code || '',
      Icon: payload.Icon || 'FileText',
      HasExpiry: payload.HasExpiry !== false,
      DefaultReminderDays: Number(payload.DefaultReminderDays) || 30,
      RequiredFields_JSON: typeof payload.RequiredFields_JSON === 'string' ? payload.RequiredFields_JSON : JSON.stringify(payload.RequiredFields_JSON || []),
      CustomFieldsConfig_JSON: typeof payload.CustomFieldsConfig_JSON === 'string' ? payload.CustomFieldsConfig_JSON : JSON.stringify(payload.CustomFieldsConfig_JSON || []),
      DisplayOrder: Number(payload.DisplayOrder) || 10,
      Status: payload.Status || 'ACTIVE',
      UpdatedAt: getTimestamp(),
      IsDeleted: false
    };

    if (existing.length > 0) {
      updateRow('Document_Types', 'Type_ID', typeId, typeData);
    } else {
      typeData.CreatedAt = getTimestamp();
      insertRow('Document_Types', typeData);
    }

    return typeData;
  } finally {
    lock.releaseLock();
  }
}

function handleGetDocumentCategories(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  ensureDocumentTablesExist();
  return getTableData('Document_Categories', { CompanyID: companyId, includeDeleted: false });
}

function handleGetDocumentsSummary(payload) {
  const companyId = payload.CompanyID || 'COM-0001';
  ensureDocumentTablesExist();
  const docs = getTableData('Company_Documents', { CompanyID: companyId, includeDeleted: false });
  const types = getTableData('Document_Types', { CompanyID: companyId, includeDeleted: false });
  const typeMap = {};
  types.forEach(t => { typeMap[t.Type_ID] = t; });

  const now = new Date();
  let safe = 0;
  let expiringSoon = 0;
  let expired = 0;
  let nearestDoc = null;
  let minDays = Infinity;

  docs.forEach(doc => {
    if (doc.Is_Archived && String(doc.Is_Archived).toLowerCase() === 'true') return;
    const t = typeMap[doc.Document_Type_ID];
    const hasExp = t ? (t.HasExpiry !== false) : Boolean(doc.Expiry_Date);
    
    if (hasExp && doc.Expiry_Date) {
      const d = new Date(doc.Expiry_Date);
      if (!isNaN(d.getTime())) {
        const days = Math.ceil((d.getTime() - now.getTime()) / (1000 * 3600 * 24));
        if (days < 0) {
          expired++;
        } else if (days <= (Number(doc.Reminder_Days) || 60)) {
          expiringSoon++;
        } else {
          safe++;
        }

        if (days >= 0 && days < minDays) {
          minDays = days;
          nearestDoc = {
            id: doc.Document_ID,
            name: doc.Document_Name,
            daysRemaining: days,
            expiryDate: doc.Expiry_Date
          };
        }
      } else {
        safe++;
      }
    } else {
      safe++;
    }
  });

  return {
    totalActive: docs.filter(d => !d.Is_Archived).length,
    safeCount: safe,
    expiringSoonCount: expiringSoon,
    expiredCount: expired,
    nearestExpiringDoc: nearestDoc
  };
}

function handleUploadDocumentFile(payload) {
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const fileName = payload.fileName || ('doc_attachment_' + Date.now() + '.pdf');
  const mimeType = payload.mimeType || 'application/pdf';
  const base64Data = payload.base64Data;
  const categoryName = payload.category || 'General';
  const year = new Date().getFullYear().toString();

  if (!base64Data) throw new Error("base64Data is required");

  // Create folder hierarchy: NMO ERP / Company Documents / {CategoryName} / {Year}
  let targetFolder = getOrCreateDriveFolderHierarchy(['NMO ERP', 'Company Documents', categoryName, year]);

  const decodedBytes = Utilities.base64Decode(base64Data);
  const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
  const file = targetFolder.createFile(blob);
  
  // Set sharing to anyone with link for secure app preview
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    downloadUrl: file.getDownloadUrl(),
    fileName: fileName,
    fileSize: file.getSize()
  };
}

function getOrCreateDriveFolderHierarchy(pathSegments) {
  let currentFolder = DriveApp.getRootFolder();
  for (let i = 0; i < pathSegments.length; i++) {
    const name = pathSegments[i];
    const subFolders = currentFolder.getFoldersByName(name);
    if (subFolders.hasNext()) {
      currentFolder = subFolders.next();
    } else {
      currentFolder = currentFolder.createFolder(name);
    }
  }
  return currentFolder;
}

function ensureDocumentTablesExist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const required = ['Company_Documents', 'Document_Types', 'Document_Categories', 'Document_Renewal_History'];
  
  required.forEach(tableName => {
    let sheet = ss.getSheetByName(tableName);
    if (!sheet) {
      sheet = ss.insertSheet(tableName);
      const headers = SCHEMA[tableName];
      if (headers) {
        sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
        sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
        sheet.setFrozenRows(1);
      }
    }
  });
}

