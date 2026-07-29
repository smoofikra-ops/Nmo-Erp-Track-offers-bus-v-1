const fs = require('fs');
let file = fs.readFileSync('src/pages/Quotes/CatalogTab.tsx', 'utf8');

file = file.replace(/product\.PurchaseCostIncVAT\.toFixed/g, '(product.PurchaseCostIncVAT || 0).toFixed');
file = file.replace(/product\.SellingPriceIncVAT\.toFixed/g, '(product.SellingPriceIncVAT || 0).toFixed');

fs.writeFileSync('src/pages/Quotes/CatalogTab.tsx', file);
