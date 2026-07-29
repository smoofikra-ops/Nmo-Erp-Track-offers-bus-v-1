const fs = require('fs');
let file = fs.readFileSync('src/pages/Quotes/CatalogTab.tsx', 'utf8');

file = file.replace(/product\.id/g, 'product.ProductID');
file = file.replace(/product\.imageUrl/g, 'product.ImageURL');
file = file.replace(/product\.nameAr/g, 'product.ArabicName');
file = file.replace(/product\.sku/g, 'product.SKU');
file = file.replace(/product\.category/g, 'product.Category');
file = file.replace(/product\.purchaseCostIncVat/g, 'product.PurchaseCostIncVAT');
file = file.replace(/product\.suggestedPrice/g, 'product.SellingPriceIncVAT');
file = file.replace(/product\.availableQuantity/g, 'product.AvailableQuantity');

fs.writeFileSync('src/pages/Quotes/CatalogTab.tsx', file);
