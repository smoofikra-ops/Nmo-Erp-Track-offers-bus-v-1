const fs = require('fs');

// 1. Update imageUtils to log what it receives
let utilsCode = fs.readFileSync('src/utils/imageUtils.ts', 'utf8');
utilsCode = utilsCode.replace(
  /export const getProductImageUrl = \(sku\?: string, imageUrl\?: string\): string => \{/,
  `export const getProductImageUrl = (sku?: string, imageUrl?: string, productObj?: any): string => {
  console.log('🖼️ [TRACE] getProductImageUrl called with:', { sku, imageUrl, productObj });
  
  // Try to find any property that sounds like imageurl
  if (!imageUrl && productObj) {
    const keys = Object.keys(productObj);
    for (const k of keys) {
      if (k.toLowerCase().replace(/[^a-z0-z]/g, '') === 'imageurl') {
        imageUrl = productObj[k];
        console.log('🔍 [TRACE] Found hidden image URL property:', k, '=', imageUrl);
        break;
      }
    }
  }
`
);
fs.writeFileSync('src/utils/imageUtils.ts', utilsCode);

// 2. Update Products/index.tsx to pass the product object and log it
let productsCode = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');
productsCode = productsCode.replace(
  /const imgSource = getProductImageUrl\(p\.SKU, p\.ImageURL\);/,
  `if (i === 0) { console.log('📦 [TRACE] First Product Data:', p); }
                const imgSource = getProductImageUrl(p.SKU, p.ImageURL || (p as any).imageUrl || (p as any).ImageUrl, p);
                if (i === 0) { console.log('🎯 [TRACE] Final Image Source:', imgSource); }`
);
fs.writeFileSync('src/pages/Products/index.tsx', productsCode);

