const fs = require('fs');
let code = fs.readFileSync('src/pages/Commissions/ProductCommission.tsx', 'utf8');

code = code.replace(/import defaultProductImage from '@\/assets\/images\/regenerated_image_1785281720906\.jpg';/, "import { getProductImageUrl, handleImageError } from '@/utils/imageUtils';");

// Replace img tag src and onError
code = code.replace(/<img\s+src=\{p\.ImageURL \|\| `https:\/\/res\.cloudinary\.com\/x6mkqvcj\/image\/upload\/f_auto,q_auto\/\$\{p\.SKU\}`\}\s+alt=\{p\.ArabicName \|\| p\.EnglishName\}\s+className="object-cover w-full h-full"\s+onError=\{\(e\) => \{\s*\(e\.target as HTMLImageElement\).src = '[^']+';\s*\(e\.target as HTMLImageElement\).className = "[^"]+";\s*\}\}/g, 
`<img 
  src={getProductImageUrl(p.SKU, p.ImageURL)} 
  alt={p.ArabicName || p.EnglishName} 
  className="object-cover w-full h-full"
  onError={handleImageError}`);

// In case the exact regex above failed due to formatting, let's just do a string replacement targeting the known block
const imgBlockRegex = /<img\s*src=\{p\.ImageURL[^}]+\}\s*alt=\{p\.ArabicName \|\| p\.EnglishName\}\s*className="object-cover w-full h-full"\s*onError=\{\(e\) => \{\s*\(e\.target as HTMLImageElement\)\.src = [^}]+?\}\}/m;
code = code.replace(imgBlockRegex, `<img \n                          src={getProductImageUrl(p.SKU, p.ImageURL)} \n                          alt={p.ArabicName || p.EnglishName} \n                          className="object-cover w-full h-full"\n                          onError={handleImageError}`);

fs.writeFileSync('src/pages/Commissions/ProductCommission.tsx', code);
