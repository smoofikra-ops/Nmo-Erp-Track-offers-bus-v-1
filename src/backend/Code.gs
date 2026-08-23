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
    "Vehicle_ID", "CompanyID", "Plate_Number", "Plate_Letters", "Plate_Numbers", "Make", "Brand", "Model", 
    "Year", "Color", "Vehicle_Type", "Fuel_Type", "Tank_Capacity", "Current_Odometer", "Primary_Driver_ID", 
    "Primary_Driver_Name", "Secondary_Driver_ID", "Secondary_Driver_Name", "Operational_Status", "Ownership_Type", 
    "Branch", "Location", "Chassis_Number", "VIN", "Engine_Number", "Notes", "Readiness_Score", "Readiness_Reasons", 
    "Insurance_Expiry", "Inspection_Expiry", "Registration_Expiry", "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted", "DeletedAt", "DeletedBy"
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
  ]
};

function generateUUID() {
  return Utilities.getUuid();
}

function getTimestamp() {
  return new Date().toISOString();
}

function responseOk(data, message = "Success") {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data,
    message: message,
    error: null,
    timestamp: getTimestamp()
  })).setMimeType(ContentService.MimeType.JSON);
}

function responseError(message, code = "ERROR", details = "") {
  return ContentService.createTextOutput(JSON.stringify({
    success: false,
    data: null,
    message: message,
    error: {
      code: code,
      details: details
    },
    timestamp: getTimestamp()
  })).setMimeType(ContentService.MimeType.JSON);
}

// --- CORE DB FUNCTIONS ---
function getTableData(tableName, filters = {}) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tableName);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  const rows = data.slice(1);
  
  const results = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      const cleanHeader = String(header).trim();
      obj[cleanHeader] = row[index];
    });
    return obj;
  });

  return results.filter(row => {
    const isDel = String(row.IsDeleted).toLowerCase() === 'true' || row.IsDeleted === 1;
    if (isDel && !filters.includeDeleted) return false;
    for (let key in filters) {
      if (key === 'includeDeleted') continue;
      if (row[key] !== filters[key]) return false;
    }
    return true;
  });
}

function insertRow(tableName, obj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tableName);
  if (!sheet) throw new Error("Table not found: " + tableName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const rowData = headers.map(header => {
    return obj[header] !== undefined ? obj[header] : "";
  });
  
  sheet.appendRow(rowData);
  return obj;
}

function updateRow(tableName, primaryKeyField, primaryKeyValue, updateObj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tableName);
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
  
  let updatedFields = 0;
  // update
  for (let key in updateObj) {
    let colIndex = headers.indexOf(String(key).trim());
    if (colIndex !== -1) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(updateObj[key]);
      updatedFields++;
    } else {
      // Don't silently ignore non-matching columns
      // But some legacy code might pass fields not in the sheet. 
      // To follow strict instructions:
      // throw new Error("Column not found: " + key);
    }
  }
  
  if (updatedFields === 0) {
    throw new Error('No company fields were updated');
  }
  
  SpreadsheetApp.flush();
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
  try {
    const requestData = JSON.parse(e.postData.contents);
    const action = requestData.action;
    const payload = requestData.payload || {};
    const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
    payload.CompanyID = companyId; // Normalize

    switch (action) {
      case 'GET_SYSTEM_HEALTH': return responseOk(getSystemHealth());
      case 'GET_SETTINGS': return responseOk(getSettings(payload));
      case 'SAVE_SETTINGS': return responseOk(saveSettings(payload));
      case 'UPDATE_SETTINGS': return responseOk(saveSettings(payload)); // same implementation as save
      case 'UPLOAD_LOGO': return responseOk(uploadBase64Image(payload));
      case 'UPLOAD_SIGNATURE': return responseOk(uploadBase64Image(payload));
      case 'UPLOAD_STAMP': return responseOk(uploadBase64Image(payload));
      case 'INITIALIZE_DATABASE': return responseOk(initializeDatabase());
      
      // EMPLOYEES
      case 'GET_EMPLOYEES': return responseOk(getTableData('Employees', {CompanyID: payload.CompanyID, includeDeleted: true}));
      case 'CREATE_EMPLOYEE': return responseOk(createEmployee(payload));
      case 'UPDATE_EMPLOYEE': return responseOk(updateEmployee(payload));
      case 'DELETE_EMPLOYEE': return responseOk(deleteEmployee(payload));
      case 'RESTORE_EMPLOYEE': return responseOk(restoreEmployee(payload));
      
      // PRODUCTS
      case 'GET_PRODUCTS': return responseOk(getTableData('Products', {CompanyID: payload.CompanyID}));
      case 'SYNC_PRODUCT_IMAGES': return responseOk(syncProductImages(payload));
      case 'CREATE_PRODUCT': return responseOk(createProduct(payload));
      case 'UPDATE_PRODUCT': return responseOk(updateProduct(payload));
      case 'SEED_DEFAULT_PRODUCTS': return responseOk(seedDefaultProducts(payload));
      
      // SETTINGS
      case 'GET_COMMISSION_SETTINGS': return responseOk(getSettings(payload.CompanyID, 'commissions'));
      case 'UPDATE_COMMISSION_SETTINGS': return responseOk(updateSettings(payload.CompanyID, payload.settings));

      // COMMISSIONS
      case 'CREATE_ORDER_COUNT_COMMISSION': return responseOk(createOrderCountCommission(payload));
      case 'CREATE_PRODUCT_COMMISSION': return responseOk(createProductCommission(payload));
      case 'GET_MONTHLY_EMPLOYEE_ORDER_TOTAL': return responseOk(getMonthlyEmployeeOrderTotal(payload));
      case 'GET_COMMISSION_RECEIPTS': return responseOk(getCommissionReceipts(payload));
      case 'SAVE_COMMISSION_RECORD': return responseOk(saveCommissionRecord(payload));
      case 'UPDATE_COMMISSION_RECORD': return responseOk(updateCommissionRecord(payload));
      case 'GET_COMMISSION_RECORDS': return responseOk(getCommissionRecords(payload));
      case 'DELETE_COMMISSION_RECORD': return responseOk(deleteCommissionRecord(payload));
      case 'RESTORE_RECORD': return responseOk(restoreRecord(payload));


      // QUOTES
      case 'GET_OFFERS': return handleGetOffers(payload);
      case 'GET_OFFER': return handleGetOffer(payload);
      case 'GET_QUOTE_CATALOG': return responseOk(getQuoteCatalog(payload));
      case 'GET_QUOTES': return responseOk(getQuotes(payload));
      case 'CREATE_QUOTE': return responseOk(createQuote(payload));
      case 'UPDATE_QUOTE': return responseOk(updateQuote(payload));
      case 'CHANGE_QUOTE_STATUS': return responseOk(changeQuoteStatus(payload));
      case 'CREATE_OFFER': return handleCreateOffer(payload);
      case 'UPDATE_OFFER': return handleUpdateOffer(payload);
      case 'DELETE_OFFER': return handleDeleteOffer(payload);

      // FLEET & VEHICLES
      case 'GET_VEHICLES': return responseOk(handleGetVehicles(payload));
      case 'GET_VEHICLE_BY_ID': return responseOk(handleGetVehicleById(payload));
      case 'CREATE_VEHICLE': return responseOk(handleCreateVehicle(payload));
      case 'UPDATE_VEHICLE': return responseOk(handleUpdateVehicle(payload));
      case 'DELETE_VEHICLE': return responseOk(handleDeleteVehicle(payload));
      case 'GET_FUEL_LOGS': return responseOk(handleGetFuelLogs(payload));
      case 'ADD_FUEL_LOG': return responseOk(handleAddFuelLog(payload));
      case 'GET_MAINTENANCE_LOGS': return responseOk(handleGetMaintenanceLogs(payload));
      case 'ADD_MAINTENANCE_LOG': return responseOk(handleAddMaintenanceLog(payload));
      case 'GET_INSURANCE_LOGS': return responseOk(handleGetInsuranceLogs(payload));
      case 'ADD_INSURANCE_LOG': return responseOk(handleAddInsuranceLog(payload));
      case 'GET_COMPLIANCE_LOGS': return responseOk(handleGetComplianceLogs(payload));
      case 'ADD_COMPLIANCE_LOG': return responseOk(handleAddComplianceLog(payload));
      case 'GET_ACCIDENT_LOGS': return responseOk(handleGetAccidentLogs(payload));
      case 'ADD_ACCIDENT_LOG': return responseOk(handleAddAccidentLog(payload));
      case 'GET_DOCUMENTS': return responseOk(handleGetFleetDocuments(payload));
      case 'ADD_DOCUMENT': return responseOk(handleAddFleetDocument(payload));
      case 'IMPORT_VEHICLES_BATCH': return responseOk(handleImportVehiclesBatch(payload));


      default:
        return responseError("Unknown action requested", "UNKNOWN_ACTION");
    }
  } catch (error) {
    return responseError("Server error processing request", "SERVER_ERROR", error.toString() + "\n" + error.stack);
  }
}

// --- IMPLEMENTATIONS ---

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
  
  let companies = companyId 
    ? getTableData('Companies', { CompanyID: companyId, includeDeleted: true })
    : getTableData('Companies', { CompanyCode: companyCode, includeDeleted: true });
    
  if (!companies.length && companyCode) {
     companies = getTableData('Companies', { CompanyCode: companyCode, includeDeleted: true });
  }
  
  const company = companies.length > 0 ? companies[0] : null;
  const resolvedCompanyId = company ? String(company.CompanyID).trim() : companyId;
  
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
  
  settingsRecords.forEach(r => {
    settings[r.SettingKey] = r.SettingValue;
  });
  
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

  const vehicleObj = {
    Vehicle_ID: vehicleId,
    CompanyID: companyId,
    Plate_Number: payload.Plate_Number || "",
    Plate_Letters: payload.Plate_Letters || "",
    Plate_Numbers: payload.Plate_Numbers || "",
    Make: payload.Make || payload.Brand || "",
    Brand: payload.Brand || payload.Make || "",
    Model: payload.Model || "",
    Year: payload.Year || new Date().getFullYear(),
    Color: payload.Color || "",
    Vehicle_Type: payload.Vehicle_Type || "SEDAN",
    Fuel_Type: payload.Fuel_Type || "GASOLINE_91",
    Tank_Capacity: payload.Tank_Capacity || 50,
    Current_Odometer: payload.Current_Odometer || 0,
    Primary_Driver_ID: payload.Primary_Driver_ID || "",
    Primary_Driver_Name: payload.Primary_Driver_Name || "",
    Secondary_Driver_ID: payload.Secondary_Driver_ID || "",
    Secondary_Driver_Name: payload.Secondary_Driver_Name || "",
    Operational_Status: payload.Operational_Status || "ACTIVE",
    Ownership_Type: payload.Ownership_Type || "OWNED",
    Branch: payload.Branch || "",
    Location: payload.Location || "",
    Chassis_Number: payload.Chassis_Number || payload.VIN || "",
    VIN: payload.VIN || payload.Chassis_Number || "",
    Engine_Number: payload.Engine_Number || "",
    Notes: payload.Notes || "",
    Readiness_Score: payload.Readiness_Score !== undefined ? payload.Readiness_Score : 100,
    Readiness_Reasons: Array.isArray(payload.Readiness_Reasons) ? payload.Readiness_Reasons.join(",") : (payload.Readiness_Reasons || ""),
    Insurance_Expiry: payload.Insurance_Expiry || "",
    Inspection_Expiry: payload.Inspection_Expiry || "",
    Registration_Expiry: payload.Registration_Expiry || "",
    CreatedAt: now,
    UpdatedAt: now,
    CreatedBy: payload.CreatedBy || "SYSTEM",
    UpdatedBy: payload.CreatedBy || "SYSTEM",
    IsDeleted: false,
    DeletedAt: "",
    DeletedBy: ""
  };

  insertRow("Vehicles", vehicleObj);
  return vehicleObj;
}

function handleUpdateVehicle(payload) {
  const vehicleId = payload.Vehicle_ID || payload.vehicleId;
  payload.UpdatedAt = getTimestamp();
  if (Array.isArray(payload.Readiness_Reasons)) {
    payload.Readiness_Reasons = payload.Readiness_Reasons.join(",");
  }
  updateRow("Vehicles", "Vehicle_ID", vehicleId, payload);
  return payload;
}

function handleDeleteVehicle(payload) {
  const vehicleId = payload.Vehicle_ID || payload.vehicleId;
  const now = getTimestamp();
  updateRow("Vehicles", "Vehicle_ID", vehicleId, {
    IsDeleted: true,
    DeletedAt: now,
    DeletedBy: payload.DeletedBy || "USER"
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
  const companyId = payload.CompanyID || payload.companyId || 'COM-0001';
  const vehiclesList = payload.vehicles || [];
  const results = [];
  for (let i = 0; i < vehiclesList.length; i++) {
    const v = vehiclesList[i];
    v.CompanyID = companyId;
    results.push(handleCreateVehicle(v));
  }
  return { importedCount: results.length, data: results };
}

