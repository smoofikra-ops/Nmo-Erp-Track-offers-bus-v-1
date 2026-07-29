const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/CatalogTab.tsx', 'utf8');

code = code.replace(/import defaultProductImage from '@\/assets\/images\/regenerated_image_1785281720906\.jpg';/, "import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';");

const imgRegex = /\{product\.ImageURL \? \([\s\S]*?\) : \([\s\S]*?\)\}/;
code = code.replace(imgRegex, `<img src={getProductImageUrl(product.SKU, product.ImageURL)} alt={product.ArabicName} className="object-cover w-full h-full" onError={handleImageError} />`);

fs.writeFileSync('src/pages/Quotes/CatalogTab.tsx', code);
