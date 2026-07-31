const fs = require('fs');

const files = [
  'src/pages/Commissions/ProductCommission.tsx',
  'src/pages/Quotes/CatalogTab.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    let code = fs.readFileSync(file, 'utf8');
    code = code.replace(
      /getProductImageUrl\(product\.SKU,\s*product\.ImageURL\)/g,
      'getProductImageUrl(product.SKU, product.ImageURL, product)'
    );
    code = code.replace(
      /getProductImageUrl\(p\.SKU,\s*p\.ImageURL\)/g,
      'getProductImageUrl(p.SKU, p.ImageURL, p)'
    );
    fs.writeFileSync(file, code);
  }
}
