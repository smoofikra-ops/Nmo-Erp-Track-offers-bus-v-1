const fs = require('fs');
let code = fs.readFileSync('src/pages/Products/index.tsx', 'utf8');

code = code.replace(/const imgSource = p\.ImageURL \|\| getProductImageUrl\(p\.SKU\);/g, 'const imgSource = getProductImageUrl(p.SKU, p.ImageURL);');

fs.writeFileSync('src/pages/Products/index.tsx', code);
