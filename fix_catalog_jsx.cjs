const fs = require('fs');
let file = fs.readFileSync('src/pages/Quotes/CatalogTab.tsx', 'utf8');

file = file.replace(/p\.id/g, 'p.ProductID');
file = file.replace(/p\.imageUrl/g, 'p.ImageURL');
file = file.replace(/p\.nameAr/g, 'p.ArabicName');
file = file.replace(/p\.sku/g, 'p.SKU');
file = file.replace(/p\.category/g, 'p.Category');
file = file.replace(/p\.purchaseCostIncVat/g, 'p.PurchaseCostIncVAT');
file = file.replace(/p\.suggestedPrice/g, 'p.SellingPriceIncVAT');
file = file.replace(/p\.availableQuantity/g, 'p.AvailableQuantity');

fs.writeFileSync('src/pages/Quotes/CatalogTab.tsx', file);
