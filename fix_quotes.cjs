const fs = require('fs');

let builder = fs.readFileSync('src/pages/Quotes/BuilderTab.tsx', 'utf8');

// Fix OfferStatus.DRAFT etc
builder = builder.replace(/'DRAFT'/g, 'OfferStatus.Draft');
builder = builder.replace(/'SENT'/g, 'OfferStatus.Approved'); // assuming SENT isn't in OfferStatus

// Fix item properties
builder = builder.replace(/item\.purchaseCostIncVat/g, 'item.unitPurchaseCostIncVat');
builder = builder.replace(/item\.unitPrice/g, 'item.unitSellingPriceIncVat');
builder = builder.replace(/unitPrice:/g, 'unitSellingPriceIncVat:');
builder = builder.replace(/item\.totalPriceIncVat/g, 'item.lineSellingTotalIncVat');
builder = builder.replace(/item\.nameAr/g, 'item.productName');

// Fix totals properties
builder = builder.replace(/totals\.totalPurchaseCost/g, 'totals.purchaseCostIncVat');
builder = builder.replace(/totals\.subtotal/g, 'totals.sellingSubtotalExVat');
builder = builder.replace(/totals\.totalVat/g, 'totals.vatAmount');
builder = builder.replace(/totals\.finalPrice/g, 'totals.customerFinalPrice');
builder = builder.replace(/totals\.totalProfit/g, 'totals.profitAmount');
builder = builder.replace(/totals\.profitMargin/g, 'totals.profitMarginPercent');
builder = builder.replace(/totals\.markupPercentage/g, 'totals.markupPercent');

fs.writeFileSync('src/pages/Quotes/BuilderTab.tsx', builder);


let history = fs.readFileSync('src/pages/Quotes/HistoryTab.tsx', 'utf8');
history = history.replace(/'DRAFT'/g, 'OfferStatus.Draft');
history = history.replace(/'SENT'/g, 'OfferStatus.Draft');
history = history.replace(/'APPROVED'/g, 'OfferStatus.Approved');

history = history.replace(/totals\.finalPrice/g, 'totals.customerFinalPrice');
history = history.replace(/totals\.totalProfit/g, 'totals.profitAmount');
history = history.replace(/totals\.profitMargin/g, 'totals.profitMarginPercent');

fs.writeFileSync('src/pages/Quotes/HistoryTab.tsx', history);
