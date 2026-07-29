const fs = require('fs');

const updateFile = (path) => {
  let code = fs.readFileSync(path, 'utf8');
  if (code.includes('defaultProductImage')) return;

  code = code.replace(
    /import \{ cn \} from '@\/utils\/cn';/,
    `import { cn } from '@/utils/cn';\n// @ts-ignore\nimport defaultProductImage from '@/assets/images/regenerated_image_1785281720906.jpg';`
  );

  code = code.replace(
    /\(e\.target as HTMLImageElement\)\.src = 'data:image\/svg\+xml;utf8[^]*?\}'/g,
    `(e.target as HTMLImageElement).src = defaultProductImage;\n                               (e.target as HTMLImageElement).onerror = null;`
  );

  fs.writeFileSync(path, code);
};

try {
  updateFile('src/pages/Quotes/CatalogTab.tsx');
} catch (e) {}
try {
  updateFile('src/pages/Commissions/ProductCommission.tsx');
} catch (e) {}

