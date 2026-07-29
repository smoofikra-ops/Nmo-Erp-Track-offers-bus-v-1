const fs = require('fs');
let code = fs.readFileSync('src/services/apiClient.ts', 'utf8');

if (!code.includes("case 'SYNC_PRODUCT_IMAGES':")) {
  code = code.replace(/case 'SEED_DEFAULT_PRODUCTS':/, 
    "case 'SYNC_PRODUCT_IMAGES': {\n          const products = this.getLocalData('mock_products');\n          data = { success: true, data: { totalProducts: products.length, totalImages: 10, matchCount: 5, noMatchCount: 5, updatedCount: 5, duplicates: [] } };\n          break;\n        }\n        case 'SEED_DEFAULT_PRODUCTS':");
  fs.writeFileSync('src/services/apiClient.ts', code);
}
