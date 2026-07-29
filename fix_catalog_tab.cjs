const fs = require('fs');
let code = fs.readFileSync('src/pages/Quotes/CatalogTab.tsx', 'utf8');

code = code.replace(
  /<Package className="h-16 w-16 text-slate-300" \/>/g,
  `<img src={defaultProductImage} alt="Placeholder" className="object-cover w-full h-full opacity-50" />`
);

fs.writeFileSync('src/pages/Quotes/CatalogTab.tsx', code);
