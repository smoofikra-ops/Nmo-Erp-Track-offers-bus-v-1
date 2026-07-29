const fs = require('fs');
let code = fs.readFileSync('src/backend/Code.gs', 'utf8');

const newProductsSchema = `"ProductID", "CompanyID", "ProductCode", "SKU", "Barcode", "ArabicName", "EnglishName", 
    "Category", "UnitType", "SellingPrice", "SellingPriceExVAT", "SellingPriceIncVAT", "PurchaseCostExVAT", "PurchaseCostIncVAT", "VATRate", "AvailableQuantity", "ProfitAmount", "ProfitMargin", "DefaultCommission", "ImageURL", "Status", "Notes", 
    "CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted"`;

code = code.replace(/"ProductID", "CompanyID", "ProductCode", "SKU", "Barcode", "ArabicName", "EnglishName",\s*"CategoryID", "UnitID", "SellingPrice", "DefaultCommission", "Status", "Notes",\s*"CreatedAt", "UpdatedAt", "CreatedBy", "UpdatedBy", "IsDeleted"/, newProductsSchema);

fs.writeFileSync('src/backend/Code.gs', code);
