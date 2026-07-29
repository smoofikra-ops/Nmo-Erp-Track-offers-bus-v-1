const fs = require('fs');
let code = fs.readFileSync('src/pages/Commissions/ProductCommission.tsx', 'utf8');
code = code.replace(/UnitPrice: p\.SellingPrice,/g, 'UnitPrice: p.SellingPriceIncVAT || 0,');
fs.writeFileSync('src/pages/Commissions/ProductCommission.tsx', code);
