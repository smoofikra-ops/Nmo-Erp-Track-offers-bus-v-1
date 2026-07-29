const fs = require('fs');
let code = fs.readFileSync('src/features/quotes/utils/quoteCalculator.ts', 'utf8');

code = code.replace(/product: QuoteProduct/g, 'product: any');
code = code.replace(/product\.vatRate/g, '(product.VATRate || product.vatRate || 15)');
code = code.replace(/product\.purchaseCostIncVat/g, '(product.PurchaseCostIncVAT || product.purchaseCostIncVat || 0)');
code = code.replace(/product\.suggestedPrice/g, '(product.SellingPriceIncVAT || product.suggestedPrice || 0)');
code = code.replace(/product\.id/g, '(product.ProductID || product.id)');
code = code.replace(/product\.sku/g, '(product.SKU || product.sku)');
code = code.replace(/product\.nameAr/g, '(product.ArabicName || product.nameAr)');
code = code.replace(/product\.unitType/g, '(product.UnitType || product.unitType || "unit")');

fs.writeFileSync('src/features/quotes/utils/quoteCalculator.ts', code);
