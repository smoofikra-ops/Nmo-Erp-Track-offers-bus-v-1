const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');

code = code.replace(/onUpdateItemPrice\(item.productId, val\);/, "onUpdateItem(item.productId, { unitSellingPriceExVat: val, unitSellingPriceIncVat: val * (1 + item.vatRate) });");

fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', code);
