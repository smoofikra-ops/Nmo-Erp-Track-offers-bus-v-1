const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/CatalogTab.tsx', 'utf8');

const regex = /onAddToCart\(\{(.*?)\}\);/s;

code = code.replace(regex, (match, p1) => {
  return `const pieces = p.piecesPerOfferUnit || 1;
    onAddToCart({
      productId: p.id,
      sku: p.sku,
      productName: p.nameAr,
      imageUrl: p.imageUrl,
      offerUnitName: 'وحدة/حبة', // Changed from p.offerUnitName to reflect it's per piece
      piecesPerOfferUnit: 1, // It's already 1 piece
      quantity: 1, // 1 piece
      unitPurchaseCostExVat: p.purchaseCostPerOfferUnitExVat / pieces,
      unitPurchaseCostIncVat: p.purchaseCostPerOfferUnitIncVat / pieces,
      unitSellingPriceExVat: p.storePricePerOfferUnitExVat / pieces,
      unitSellingPriceIncVat: p.storePricePerOfferUnitIncVat / pieces,
      defaultUnitSellingPriceIncVat: p.storePricePerOfferUnitIncVat / pieces,
      marketPricePerOfferUnitIncVat: p.marketPricePerOfferUnitIncVat ? p.marketPricePerOfferUnitIncVat / pieces : undefined,
      vatRate: p.vatRate,
      availableOfferUnits: p.availableOfferUnits ? p.availableOfferUnits * pieces : undefined
    });`;
});

fs.writeFileSync('src/pages/Quotes/CatalogTab.tsx', code);
