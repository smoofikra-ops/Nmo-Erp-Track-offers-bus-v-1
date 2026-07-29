const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

// Add import
code = code.replace(
  /import \{ cn \} from '@\/utils\/cn';/,
  `import { cn } from '@/utils/cn';\nimport defaultProductImage from '@/assets/images/regenerated_image_1785281720906.jpg';`
);

// Fix fallback in table row
code = code.replace(
  /\(e\.target as HTMLImageElement\)\.src = 'data:image\/svg\+xml;utf8[^]*?\}'/g,
  `(e.target as HTMLImageElement).src = defaultProductImage;\n                               (e.target as HTMLImageElement).className = "object-contain max-h-full";\n                               (e.target as HTMLImageElement).onerror = null;`
);

// Fix the else branch (no ImageURL and no SKU)
code = code.replace(
  /<ImageIcon className="h-4 w-4 text-slate-400" \/>\s*<\/div>/g,
  `<img src={defaultProductImage} alt="Default Product" className="object-cover w-full h-full" />\n                         </div>`
);

fs.writeFileSync('src/pages/Products/index.tsx', code);
