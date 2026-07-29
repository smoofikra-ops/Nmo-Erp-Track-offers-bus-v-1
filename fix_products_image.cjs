const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

code = code.replace(/import defaultProductImage from '@\/assets\/images\/regenerated_image_1785281720906\.jpg';/, "import { getProductImageUrl, handleImageError, getDefaultProductImage } from '@/utils/imageUtils';");

// Replace getCloudinaryUrl
code = code.replace(/const getCloudinaryUrl = [^;]+;/g, '');
code = code.replace(/getCloudinaryUrl\(sku\)/g, 'getProductImageUrl(sku)');
code = code.replace(/getCloudinaryUrl\(p\.SKU\)/g, 'getProductImageUrl(p.SKU)');

// Replace onError
code = code.replace(/onError=\{\(e\) => \{\s*\(e\.target as HTMLImageElement\)\.src = defaultProductImage;\s*\}\}/g, 'onError={handleImageError}');

// Replace any leftover defaultProductImage usages
code = code.replace(/defaultProductImage/g, 'getDefaultProductImage()');

fs.writeFileSync('src/pages/Products/index.tsx', code);
